// app/api/payment/verify/route.ts — نسخه نهایی و هماهنگ با کامپوننت‌هات
import { NextResponse } from "next/server";
import pool from "@/lib/db";

const ZIBAL_MERCHANT = process.env.ZIBAL_MERCHANT || "zibal";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get("trackId");
  const success = searchParams.get("success");
  const status = searchParams.get("status");

  // اگر پرداخت موفق نبود → برو به صفحه ناموفق با orderId
  if (!trackId || success !== "1" || status !== "2") {
    const orderId = searchParams.get("orderId") || "";
    const failedUrl = `${BASE_URL}/paymentfailed?orderId=${orderId}&error=${encodeURIComponent(
      "پرداخت لغو شده توسط کاربر"
    )}`;
    return NextResponse.redirect(failedUrl);
  }

  const conn = await pool.getConnection();

  try {
    const [orders]: any = await conn.query(
      "SELECT id, order_code FROM orders WHERE track_id = ?",
      [trackId]
    );

    if (orders.length === 0) {
      return NextResponse.redirect(
        `${BASE_URL}/paymentfailed?error=سفارش%20یافت%20نشد`
      );
    }

    const order = orders[0];

    if (order.payment_status === "paid") {
      return NextResponse.redirect(
        `${BASE_URL}/paymentdone?orderId=${order.order_code}`
      );
    }

    const verifyRes = await fetch("https://gateway.zibal.ir/v1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: ZIBAL_MERCHANT,
        trackId: Number(trackId),
      }),
    });

    const verifyData = await verifyRes.json();

    if (verifyData.result !== 100) {
      const failedUrl = `${BASE_URL}/paymentfailed?orderId=${
        order.order_code
      }&error=${encodeURIComponent("تراکنش توسط بانک تأیید نشد")}`;
      return NextResponse.redirect(failedUrl);
    }

    await conn.beginTransaction();

    await conn.query(
      `UPDATE orders SET payment_status = 'paid', status = 'processing', updated_at = NOW() WHERE id = ?`,
      [order.id]
    );

    await conn.query(
      `INSERT INTO payments (order_id, track_id, amount, status, ref_number, paid_at)
       VALUES (?, ?, ?, 'paid', ?, NOW())
       ON DUPLICATE KEY UPDATE status = 'paid', ref_number = VALUES(ref_number)`,
      [order.id, trackId, verifyData.amount, verifyData.refNumber || null]
    );

    await conn.commit();

    // موفقیت → برو به صفحه پرداخت موفق با orderId
    return NextResponse.redirect(
      `${BASE_URL}/paymentdone?orderId=${order.order_code}`
    );
  } catch (error: any) {
    console.error("Verify Error:", error);
    const orderId = searchParams.get("orderId") || "";
    return NextResponse.redirect(
      `${BASE_URL}/paymentfailed?orderId=${orderId}&error=خطای%20سرور`
    );
  } finally {
    conn.release();
  }
}
