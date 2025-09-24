import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import * as jose from 'jose';

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, address, items, deliveryType, amount, callbackUrl } = body;

  if (!userId || !address?.id || !items?.length || !deliveryType || !amount || !callbackUrl) {
    return NextResponse.json({ error: 'داده‌های ورودی نامعتبر است' }, { status: 400 });
  }

  const validDeliveryTypes = ['normal', 'express'];
  if (!validDeliveryTypes.includes(deliveryType)) {
    return NextResponse.json({ error: 'روش ارسال نامعتبر است' }, { status: 400 });
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
    return NextResponse.json({ error: 'مبلغ سفارش با آیتم‌ها مطابقت ندارد' }, { status: 400 });
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
      const [existing]: any = await conn.query('SELECT id FROM orders WHERE order_code = ?', [orderCode]);
      if (existing.length === 0) {
        isUnique = true;
      } else {
        orderCode = Math.floor(100000 + Math.random() * 900000).toString();
        attempts++;
      }
    }

    if (!isUnique) {
      throw new Error('ناتوانی در تولید کد سفارش منحصربه‌فرد');
    }

    const [orderResult]: any = await conn.execute(
      `INSERT INTO orders (user_id, address_id, total_amount, shipping_method, status, payment_status, order_code)
       VALUES (?, ?, ?, ?, 'pending', 'pending', ?)`,
      [userId, address.id, amount, deliveryType, orderCode]
    );
    const orderId = orderResult.insertId;

    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.price || !item.price_type) {
        throw new Error('آیتم‌های سفارش نامعتبر است');
      }
      await conn.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price, price_type)
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price, item.price_type]
      );
    }

    // Create notification
    const notificationMessage = `سفارش جدید با کد ${orderCode} ثبت شد`;
    await conn.query(
      'INSERT INTO notifications (type, message, related_id) VALUES (?, ?, ?)',
      ['order', notificationMessage, orderId]
    );

    const merchantKey = process.env.ZIBAL_MERCHANT;
    if (!merchantKey) {
      throw new Error('کلید درگاه پرداخت تنظیم نشده است');
    }

    const res = await fetch('https://gateway.zibal.ir/request/lazy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت سفارش', details: error.message },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return NextResponse.json({ error: 'لطفاً توکن را ارائه دهید' }, { status: 401 });
  }

  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    console.error('JWT_SECRET is not set');
    return NextResponse.json({ error: 'خطای سرور: تنظیمات نادرست' }, { status: 500 });
  }

  let userId;
  try {
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jose.jwtVerify(token, secret);
    userId = payload.userId;
  } catch (error: any) {
    console.error('JWT verification error:', error.message);
    return NextResponse.json({ error: 'توکن نامعتبر است', details: error.message }, { status: 401 });
  }

  const conn = await pool.getConnection();

  try {
    const [orders]: any = await conn.query(
      `SELECT o.*, a.province, a.city, a.street, a.building_number, a.alley, a.unit, a.postal_code
       FROM orders o 
       JOIN addresses a ON o.address_id = a.id 
       WHERE o.user_id = ?`,
      [userId]
    );

    for (let order of orders) {
      const [items]: any = await conn.query(
        `SELECT oi.*, p.title, p.image
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اطلاعات سفارشات', details: error.message },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}