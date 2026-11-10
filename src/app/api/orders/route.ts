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
    // 1. دریافت روش‌های ارسال
    const [shippingMethods]: any = await conn.query(
      `SELECT id, name, cost, \`key\` FROM shipping_methods WHERE is_active = 1`,
    );

    const selectedMethod = shippingMethods.find(
      (m: any) =>
        m.key === deliveryType ||
        m.id.toString() === deliveryType ||
        m.name === deliveryType,
    );

    if (!selectedMethod) {
      return NextResponse.json(
        { error: "روش ارسال نامعتبر است" },
        { status: 400 },
      );
    }

    const deliveryCost = Number(selectedMethod.cost) || 0;
    const shippingMethodName = selectedMethod.name;

    // 2. محاسبه مبلغ کل
    const itemsTotal = items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + Number(item.price) * Number(item.quantity),
      0,
    );

    const expectedAmount = (itemsTotal + deliveryCost) * 10;

    if (Number(amount) !== expectedAmount) {
      return NextResponse.json(
        { error: "مبلغ سفارش با آیتم‌ها مطابقت ندارد" },
        { status: 400 },
      );
    }

    // 3. خواندن آدرس برای snapshot
    const [addressRows]: any = await conn.query(
      `SELECT first_name, last_name, phone_number, province, city,
              street, alley, building_number, unit, postal_code
       FROM addresses WHERE id = ? AND user_id = ? AND is_deleted = 0`,
      [address.id, userId],
    );

    if (addressRows.length === 0) {
      return NextResponse.json(
        { error: "آدرس انتخاب شده یافت نشد" },
        { status: 400 },
      );
    }

    const addr = addressRows[0];

    await conn.beginTransaction();

    // 4. چک موجودی و دریافت variant_id
    for (const item of items) {
      if (item.color?.hexCode && item.color?.englishName) {
        const [variantRows]: any = await conn.query(
          `SELECT id, stock_quantity
           FROM product_variants 
           WHERE product_id = ? AND color_englishName = ? AND color_hexCode = ?`,
          [item.product_id, item.color.englishName, item.color.hexCode],
        );

        if (variantRows.length === 0) {
          await conn.rollback();
          return NextResponse.json(
            { error: `رنگ مورد نظر برای محصول یافت نشد` },
            { status: 400 },
          );
        }

        if (variantRows[0].stock_quantity < item.quantity) {
          await conn.rollback();
          return NextResponse.json(
            {
              error: `موجودی کافی برای محصول با رنگ ${
                item.color.persianName || item.color.englishName
              } وجود ندارد. موجودی: ${variantRows[0].stock_quantity} عدد`,
            },
            { status: 400 },
          );
        }

        item.variant_id = variantRows[0].id;
      } else {
        const [fallback]: any = await conn.query(
          `SELECT id, stock_quantity FROM product_variants 
           WHERE product_id = ? AND in_stock = 1 
           ORDER BY id ASC LIMIT 1`,
          [item.product_id],
        );
        if (fallback.length > 0) {
          item.variant_id = fallback[0].id;
        }
      }
    }

    // 5. تولید کد سفارش
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

    // 6. ثبت سفارش با snapshot
    const [orderResult]: any = await conn.execute(
      `INSERT INTO orders 
       (user_id, address_id, total_amount, shipping_method, status, payment_status, order_code, extra_details,
        ship_first_name, ship_last_name, ship_phone_number,
        ship_province, ship_city, ship_street, ship_alley,
        ship_building_number, ship_unit, ship_postal_code)
       VALUES (?, ?, ?, ?, 'pending', 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        address.id,
        amount,
        shippingMethodName,
        orderCode,
        extraDetails || null,
        addr.first_name,
        addr.last_name,
        addr.phone_number,
        addr.province,
        addr.city,
        addr.street,
        addr.alley,
        addr.building_number,
        addr.unit,
        addr.postal_code,
      ],
    );
    const orderId = orderResult.insertId;

    // 7. درج آیتم‌ها
    for (const item of items) {
      const colorData = item.color
        ? {
            englishName: item.color.englishName,
            persianName: item.color.persianName || null,
            hexCode: item.color.hexCode,
          }
        : null;

      await conn.execute(
        `INSERT INTO order_items 
         (order_id, product_id, variant_id, quantity, unit_price, price_type, color_json)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.variant_id || null,
          item.quantity,
          item.price,
          item.price_type || "single",
          colorData ? JSON.stringify(colorData) : null,
        ],
      );
    }

    // 8. نوتیفیکیشن
    await conn.query(
      "INSERT INTO notifications (type, message, related_id) VALUES ('order', ?, ?)",
      [`سفارش جدید با کد ${orderCode} ثبت شد`, orderId],
    );

    // 9. درخواست پرداخت زیبال
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

    return NextResponse.json({
      paymentUrl: `https://gateway.zibal.ir/start/${trackId}`,
      orderCode,
      orderId,
    });
  } catch (error: any) {
    try {
      await conn.rollback();
    } catch {}
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "خطا در ثبت سفارش", details: error.message },
      { status: 500 },
    );
  } finally {
    conn.release();
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
      `SELECT 
         o.*,
         COALESCE(o.ship_first_name, a.first_name)       AS first_name,
         COALESCE(o.ship_last_name,  a.last_name)        AS last_name,
         COALESCE(o.ship_phone_number, a.phone_number)   AS phone_number,
         COALESCE(o.ship_province, a.province)           AS province,
         COALESCE(o.ship_city, a.city)                   AS city,
         COALESCE(o.ship_street, a.street)               AS street,
         COALESCE(o.ship_alley, a.alley)                 AS alley,
         COALESCE(o.ship_building_number, a.building_number) AS building_number,
         COALESCE(o.ship_unit, a.unit)                   AS unit,
         COALESCE(o.ship_postal_code, a.postal_code)     AS postal_code,
         o.tracking_info
       FROM orders o 
       LEFT JOIN addresses a ON o.address_id = a.id 
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId],
    );

    for (const order of orders) {
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

    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات سفارشات", details: error.message },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}