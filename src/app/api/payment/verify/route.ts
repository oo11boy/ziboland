// src\app\api\payment\verify\route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

async function verifyPayment(trackId: string, orderId: string) {
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const merchantKey = process.env.ZIBAL_MERCHANT;
    if (!merchantKey) {
      throw new Error("کلید درگاه پرداخت تنظیم نشده است");
    }

    const res = await fetch("https://gateway.zibal.ir/v1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: merchantKey,
        trackId,
      }),
    });

    const data = await res.json();

    if (data.result === 100 && data.status === 1) {
      // Update only the payments table; the trigger will handle orders table
      await conn.execute(
        `UPDATE payments SET status = 'paid', ref_number = ?, card_number = ?, paid_at = NOW() WHERE track_id = ?`,
        [data.refNumber, data.cardNumber, trackId]
      );
      await conn.commit();
      return {
        success: true,
        redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/paymentdone?orderId=${orderId}`,
      };
    } else {
      // Update only the payments table; the trigger will handle orders table
      await conn.execute(
        `UPDATE payments SET status = 'failed' WHERE track_id = ?`,
        [trackId]
      );
      await conn.commit();
      return {
        success: false,
        redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/paymentfailed?orderId=${orderId}&error=${encodeURIComponent(
          data.message || `خطای زیبال: کد ${data.result}`
        )}`,
      };
    }
  } catch (error: any) {
    await conn.rollback();
    console.error("Error verifying payment:", error);
    // Update only the payments table; the trigger will handle orders table
    await conn.execute(
      `UPDATE payments SET status = 'failed' WHERE track_id = ?`,
      [trackId]
    );
    await conn.commit();
    return {
      success: false,
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/paymentfailed?orderId=${orderId}&error=${encodeURIComponent(
        "خطای سرور"
      )}`,
    };
  } finally {
    conn.release();
  }
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const trackId = searchParams.get("trackId");
  const orderId = searchParams.get("orderId");

  if (!trackId || !orderId) {
    return NextResponse.json(
      { error: "پارامترهای مورد نیاز یافت نشد" },
      { status: 400 }
    );
  }

  const result = await verifyPayment(trackId, orderId);
  return NextResponse.redirect(result.redirectUrl);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trackId = searchParams.get("trackId");
  const orderId = searchParams.get("orderId");
  const success = searchParams.get("success");
  const status = searchParams.get("status");

  if (!trackId || !orderId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/paymentfailed?error=${encodeURIComponent("پارامترهای مورد نیاز یافت نشد")}`
    );
  }

  console.log("Zibal callback received:", { trackId, orderId, success, status });

  if (success !== "1") {
    const errorMessage = "پرداخت ناموفق بود";
    console.error("Payment failed:", { trackId, orderId, success, status });
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      // Update only the payments table; the trigger will handle orders table
      await conn.execute(`UPDATE payments SET status = 'failed' WHERE track_id = ?`, [trackId]);
      await conn.commit();
    } catch (error) {
      await conn.rollback();
      console.error("Error updating failed payment:", error);
    } finally {
      conn.release();
    }
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/paymentfailed?orderId=${orderId}&error=${encodeURIComponent(errorMessage)}`
    );
  }

  const result = await verifyPayment(trackId, orderId);
  return NextResponse.redirect(result.redirectUrl);
}