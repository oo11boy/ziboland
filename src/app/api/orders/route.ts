import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import * as jose from "jose";

const ZIBAL_MERCHANT = process.env.ZIBAL_MERCHANT || "zibal";
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, address, items, deliveryType, amount, extraDetails } = body;

  if (!userId || !address?.id || !items?.length || !deliveryType || !amount) {
    return NextResponse.json(
      { error: "داده‌های ورودی نامعتبر است" },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();

  try {
    // 1. دریافت روش‌های ارسال از دیتابیس
    const [shippingMethods]: any = await conn.query(
      `SELECT id, name, cost, \`key\` FROM shipping_methods WHERE is_active = 1`
    );
    
    // 2. پیدا کردن روش ارسال انتخاب شده
    const selectedMethod = shippingMethods.find(
      (m: any) => m.key === deliveryType || m.id.toString() === deliveryType || m.name === deliveryType
    );

    if (!selectedMethod) {
      await conn.release();
      return NextResponse.json(
        { error: "روش ارسال نامعتبر است" },
        { status: 400 },
      );
    }

    // 3. محاسبه هزینه ارسال
    const deliveryCost = selectedMethod.cost || 0;
    const shippingMethodName = selectedMethod.name;

    // 4. محاسبه مبلغ کل
    const itemsTotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0,
    );
    
    const expectedAmount = (itemsTotal + deliveryCost) * 10;
    
    if (amount !== expectedAmount) {
      await conn.release();
      return NextResponse.json(
        { error: "مبلغ سفارش با آیتم‌ها مطابقت ندارد" },
        { status: 400 },
      );
    }

    await conn.beginTransaction();

    // 🔥 چک موجودی و دریافت variant_id برای هر آیتم
    for (const item of items) {
      if (item.color?.hexCode && item.color?.englishName) {
        const [variantRows]: any = await conn.query(
          `SELECT id, stock_quantity, price_single, price_wholesale, 
                  discount_percent, discount_wholesale_percent, min_wholesale
           FROM product_variants 
           WHERE product_id = ? AND color_englishName = ? AND color_hexCode = ?`,
          [item.product_id, item.color.englishName, item.color.hexCode],
        );

        if (variantRows.length === 0) {
          await conn.rollback();
          await conn.release();
          return NextResponse.json(
            {
              error: `رنگ مورد نظر برای محصول یافت نشد`,
            },
            { status: 400 },
          );
        }

        if (variantRows[0].stock_quantity < item.quantity) {
          await conn.rollback();
          await conn.release();
          return NextResponse.json(
            {
              error: `موجودی کافی برای محصول با رنگ ${item.color.persianName || item.color.englishName} وجود ندارد. موجودی: ${variantRows[0].stock_quantity} عدد`,
            },
            { status: 400 },
          );
        }

        // 🔥 ذخیره variant_id برای استفاده در پرداخت
        item.variant_id = variantRows[0].id;
      }
    }

    // تولید کد سفارش منحصر به فرد
    let orderCode = Math.floor(100000 + Math.random() * 900000).toString();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const [existing]: any = await conn.query(
        "SELECT 1 FROM orders WHERE order_code = ?",
        [orderCode],
      );
      if (existing.length === 0) isUnique = true;
      else orderCode = Math.floor(100000 + Math.random() * 900000).toString();
      attempts++;
    }
    if (!isUnique) throw new Error("ناتوانی در تولید کد سفارش");

    // ثبت سفارش
    const [orderResult]: any = await conn.execute(
      `INSERT INTO orders 
       (user_id, address_id, total_amount, shipping_method, status, payment_status, order_code, extra_details)
       VALUES (?, ?, ?, ?, 'pending', 'pending', ?, ?)`,
      [userId, address.id, amount, shippingMethodName, orderCode, extraDetails || null],
    );
    const orderId = orderResult.insertId;

    // 🔥 درج آیتم‌ها با variant_id
    for (const item of items) {
      // اطمینان از وجود englishName در color_json
      const colorData = item.color ? {
        englishName: item.color.englishName,
        persianName: item.color.persianName || null,
        hexCode: item.color.hexCode,
      } : null;

      await conn.execute(
        `INSERT INTO order_items 
         (order_id, product_id, variant_id, quantity, unit_price, price_type, color_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.variant_id || null, // 🔥 اینجا variant_id ذخیره میشه
          item.quantity,
          item.price,
          item.price_type || "single",
          colorData ? JSON.stringify(colorData) : null,
        ],
      );
    }

    // نوتیفیکیشن ادمین
    await conn.query(
      "INSERT INTO notifications (type, message, related_id) VALUES ('order', ?, ?)",
      [`سفارش جدید با کد ${orderCode} ثبت شد`, orderId],
    );

    // درخواست پرداخت زیبال
    const callbackUrl = `${BASE_URL}/api/payment/verify?orderId=${orderCode}`;

    const res = await fetch("https://gateway.zibal.ir/v1/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchant: ZIBAL_MERCHANT,
        amount,
        callbackUrl,
        description: `پرداخت سفارش ${orderCode} زیبولند`,
        orderId: orderCode,
      }),
    });

    const data = await res.json();

    if (data.result !== 100 || !data.trackId) {
      await conn.rollback();
      await conn.release();
      return NextResponse.json(
        { error: data.message || "خطا در اتصال به درگاه", result: data.result },
        { status: 502 },
      );
    }

    const trackId = data.trackId.toString();

    await conn.execute("UPDATE orders SET track_id = ? WHERE id = ?", [
      trackId,
      orderId,
    ]);

    await conn.execute(
      `INSERT INTO payments (order_id, track_id, amount, status) VALUES (?, ?, ?, 'pending')`,
      [orderId, trackId, amount],
    );

    await conn.commit();
    await conn.release();

    return NextResponse.json({
      paymentUrl: `https://gateway.zibal.ir/start/${trackId}`,
      orderCode,
      orderId,
    });
  } catch (error: any) {
    await conn.rollback();
    await conn.release();
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "خطا در ثبت سفارش", details: error.message },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json(
      { error: "لطفاً توکن را ارائه دهید" },
      { status: 401 },
    );
  }

  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    console.error("JWT_SECRET is not set");
    return NextResponse.json(
      { error: "خطای سرور: تنظیمات نادرست" },
      { status: 500 },
    );
  }

  let userId;
  try {
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jose.jwtVerify(token, secret);
    userId = payload.userId;
  } catch (error: any) {
    console.error("JWT verification error:", error.message);
    return NextResponse.json(
      { error: "توکن نامعتبر است", details: error.message },
      { status: 401 },
    );
  }

  const conn = await pool.getConnection();

  try {
    const [orders]: any = await conn.query(
      `SELECT o.*, a.province, a.city, a.street, a.building_number, a.alley, a.unit, a.postal_code, o.tracking_info
       FROM orders o 
       JOIN addresses a ON o.address_id = a.id 
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId],
    );
    
    for (let order of orders) {
      const [items]: any = await conn.query(
        `SELECT oi.*, p.title, p.image, oi.color_json, oi.price_type
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id],
      );
      order.items = items.map((item: any) => ({
        ...item,
        color: item.color_json ? JSON.parse(item.color_json) : null,
      }));
    }

    await conn.release();
    return NextResponse.json(orders);
  } catch (error: any) {
    await conn.release();
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات سفارشات", details: error.message },
      { status: 500 },
    );
  }
}