import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, address, items, deliveryType, amount, callbackUrl } = body;

  if (!userId || !address?.id || !items?.length || !deliveryType || !amount || !callbackUrl) {
    return NextResponse.json({ error: "داده‌های ورودی نامعتبر است" }, { status: 400 });
  }

  const validDeliveryTypes = ["normal", "express"];
  if (!validDeliveryTypes.includes(deliveryType)) {
    return NextResponse.json({ error: "روش ارسال نامعتبر است" }, { status: 400 });
  }

  const deliveryCosts: { [key: string]: number } = {
    normal: 0,
    express: 129900,
  };
  const itemsTotal = items.reduce(
    (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
    0
  );
  const expectedAmount = (itemsTotal + deliveryCosts[deliveryType]) * 10;
  if (amount !== expectedAmount) {
    return NextResponse.json({ error: "مبلغ سفارش با آیتم‌ها مطابقت ندارد" }, { status: 400 });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // Generate a 6-digit numeric order code
    let orderCode = Math.floor(100000 + Math.random() * 900000).toString();
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!isUnique && attempts < maxAttempts) {
      const [existing]: any = await conn.query(
        "SELECT id FROM orders WHERE order_code = ?",
        [orderCode]
      );
      if (existing.length === 0) {
        isUnique = true;
      } else {
        orderCode = Math.floor(100000 + Math.random() * 900000).toString();
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error("ناتوانی در تولید کد سفارش منحصربه‌فرد");
    }

    const [orderResult]: any = await conn.execute(
      `INSERT INTO orders (user_id, address_id, total_amount, shipping_method, status, payment_status, order_code)
       VALUES (?, ?, ?, ?, 'pending', 'pending', ?)`,
      [userId, address.id, amount, deliveryType, orderCode]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.price || !item.price_type) {
        throw new Error("آیتم‌های سفارش نامعتبر است");
      }
      await conn.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, price_type)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price, item.price_type]
      );
    }

    const merchantKey = process.env.ZIBAL_MERCHANT;
    if (!merchantKey) {
      throw new Error("کلید درگاه پرداخت تنظیم نشده است");
    }

    const res = await fetch("https://gateway.zibal.ir/request/lazy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: merchantKey,
        amount,
        callbackUrl: `${callbackUrl}?orderId=${orderId}`,
        description: `پرداخت سفارش ${orderCode}`,
        orderId: orderCode,
      }),
    });

    const data = await res.json();

    if (data.result === 100) {
      await conn.execute(
        `INSERT INTO payments (order_id, track_id, amount, status)
         VALUES (?, ?, ?, 'pending')`,
        [orderId, data.trackId, amount]
      );

      await conn.commit();

      return NextResponse.json({
        paymentUrl: `https://gateway.zibal.ir/start/${data.trackId}`,
        orderCode,
        orderId,
      });
    } else {
      await conn.rollback();
      return NextResponse.json({ error: data.message, result: data.result }, { status: 400 });
    }
  } catch (error: any) {
    await conn.rollback();
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "خطا در ثبت سفارش", details: error.message },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}