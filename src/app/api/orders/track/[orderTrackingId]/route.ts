import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import * as jose from "jose";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderTrackingId: string }> },
) {
  const { orderTrackingId } = await params;

  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      { error: "لطفاً توکن را ارائه دهید" },
      { status: 401 },
    );
  }

  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    return NextResponse.json(
      { error: "خطای سرور: تنظیمات نادرست" },
      { status: 500 },
    );
  }
  // eslint-disable-next-line prefer-const
  let userId;
  try {
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jose.jwtVerify(token, secret);
    // eslint-disable-next-line  @typescript-eslint/no-unused-vars
    userId = payload.id;
  } catch (error: any) {
    console.error("JWT verification error:", error.message);
    return NextResponse.json({ error: "توکن نامعتبر است" }, { status: 401 });
  }

  const conn = await pool.getConnection();

  try {
    const [orders]: any = await conn.query(
      `SELECT id, order_code, status, payment_status, created_at, total_amount, shipping_method 
       FROM orders 
       WHERE order_code = ? `,
      [orderTrackingId],
    );

    if (!orders.length) {
      return NextResponse.json(
        { error: "سفارش با این شماره یافت نشد" },
        { status: 404 },
      );
    }

    const order = orders[0];
    return NextResponse.json({
      id: order.id,
      order_code: order.order_code,
      status: order.status,
      payment_status: order.payment_status,
      created_at: order.created_at,
      total_amount: order.total_amount,
      shipping_method: order.shipping_method,
    });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات سفارش", details: error.message },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}
