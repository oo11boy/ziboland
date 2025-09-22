import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, address, items, deliveryType, amount, callbackUrl } = body;

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  });

  try {
    // 1. ذخیره سفارش
    const [orderResult]: any = await conn.execute(
      "INSERT INTO orders (user_id, address_id, total_amount, shipping_method, status, payment_status) VALUES (?, ?, ?, ?, 'pending', 'pending')",
      [userId, address.id, amount, deliveryType]
    );
    const orderId = orderResult.insertId;

    // 2. ذخیره آیتم‌ها
    for (const item of items) {
      await conn.execute(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    // 3. درخواست به زیبال
    const res = await fetch("https://gateway.zibal.ir/v1/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: process.env.ZIBAL_MERCHANT || "zibal",
        amount,
        callbackUrl: `${callbackUrl}?orderId=${orderId}`,
        description: "پرداخت سفارش فروشگاه",
      }),
    });

    const data = await res.json();

    if (data.result === 100) {
      // ذخیره پرداخت
      await conn.execute(
        "INSERT INTO payments (order_id, track_id, amount, status) VALUES (?, ?, ?, 'pending')",
        [orderId, data.trackId, amount]
      );

      return NextResponse.json({
        paymentUrl: `https://gateway.zibal.ir/start/${data.trackId}`,
      });
    } else {
      return NextResponse.json({ error: data.message }, { status: 400 });
    }
  } finally {
    conn.end();
  }
}
