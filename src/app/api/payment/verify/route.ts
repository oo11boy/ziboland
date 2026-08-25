import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

const ZIBAL_MERCHANT = process.env.ZIBAL_MERCHANT || "zibal";
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get("trackId");
  const success = searchParams.get("success");
  const status = searchParams.get("status");
  const orderIdParam = searchParams.get("orderId");

  if (!trackId || success !== "1" || status !== "2") {
    const failedUrl = `${BASE_URL}/paymentfailed?orderId=${orderIdParam || ""}&error=${encodeURIComponent(
      "پرداخت لغو شده یا ناموفق",
    )}`;
    return NextResponse.redirect(failedUrl);
  }

  const conn = await pool.getConnection();

  try {
    const [orders]: any = await conn.query(
      "SELECT id, order_code, payment_status FROM orders WHERE track_id = ?",
      [trackId],
    );

    if (orders.length === 0) {
      return NextResponse.redirect(
        `${BASE_URL}/paymentfailed?error=سفارش%20یافت%20نشد`,
      );
    }

    const order = orders[0];

    if (order.payment_status === "paid") {
      return NextResponse.redirect(
        `${BASE_URL}/paymentdone?orderId=${order.order_code}`,
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
      const failedUrl = `${BASE_URL}/paymentfailed?orderId=${order.order_code}&error=${encodeURIComponent("تراکنش توسط بانک تأیید نشد")}`;
      return NextResponse.redirect(failedUrl);
    }

    await conn.beginTransaction();

    // 🔥 دریافت آیتم‌های سفارش با variant_id
    const [orderItems]: any = await conn.query(
      `SELECT product_id, quantity, color_json, variant_id 
       FROM order_items 
       WHERE order_id = ?`,
      [order.id],
    );

    // چک موجودی برای هر آیتم
    for (const item of orderItems) {
      if (item.variant_id) {
        const [variant]: any = await conn.query(
          `SELECT stock_quantity FROM product_variants WHERE id = ?`,
          [item.variant_id],
        );

        if (variant.length === 0 || variant[0].stock_quantity < item.quantity) {
          await conn.rollback();
          return NextResponse.redirect(
            `${BASE_URL}/paymentfailed?orderId=${order.order_code}&error=${encodeURIComponent("موجودی کافی نیست")}`,
          );
        }
      }
    }

    // 🔥 کاهش موجودی با استفاده از variant_id
    for (const item of orderItems) {
      if (item.variant_id) {
        const [updateResult]: any = await conn.query(
          `UPDATE product_variants 
           SET stock_quantity = stock_quantity - ? 
           WHERE id = ? AND stock_quantity >= ?`,
          [item.quantity, item.variant_id, item.quantity],
        );

        if (updateResult.affectedRows === 0) {
          await conn.rollback();
          return NextResponse.redirect(
            `${BASE_URL}/paymentfailed?orderId=${order.order_code}&error=${encodeURIComponent("موجودی کافی نیست")}`,
          );
        }
      }
    }

    // بروزرسانی وضعیت سفارش و پرداخت
    await conn.query(
      `UPDATE orders SET payment_status = 'paid', status = 'processing', updated_at = NOW() WHERE id = ?`,
      [order.id],
    );

    await conn.query(
      `INSERT INTO payments (order_id, track_id, amount, status, ref_number, paid_at)
       VALUES (?, ?, ?, 'paid', ?, NOW())
       ON DUPLICATE KEY UPDATE status = 'paid', ref_number = VALUES(ref_number)`,
      [order.id, trackId, verifyData.amount, verifyData.refNumber || null],
    );

    await conn.commit();

    return NextResponse.redirect(
      `${BASE_URL}/paymentdone?orderId=${order.order_code}`,
    );
  } catch (error: any) {
    if (conn) await conn.rollback();
    console.error("Verify Error:", error);
    return NextResponse.redirect(
      `${BASE_URL}/paymentfailed?orderId=${orderIdParam || ""}&error=خطای%20سرور`,
    );
  } finally {
    if (conn) conn.release();
  }
}