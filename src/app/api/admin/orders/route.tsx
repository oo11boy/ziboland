import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import * as jose from "jose";

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

  let userRole;
  try {
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jose.jwtVerify(token, secret);
    userRole = payload.role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }
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
        u.username, 
        u.email,
        COALESCE(o.ship_first_name, a.first_name, u.first_name) AS first_name,
        COALESCE(o.ship_last_name,  a.last_name,  u.last_name)  AS last_name,
        COALESCE(o.ship_phone_number, a.phone_number, u.phone_number) AS phone_number,
        COALESCE(o.ship_province, a.province) AS province,
        COALESCE(o.ship_city, a.city) AS city,
        COALESCE(o.ship_street, a.street) AS street,
        COALESCE(o.ship_alley, a.alley) AS alley,
        COALESCE(o.ship_building_number, a.building_number) AS building_number,
        COALESCE(o.ship_unit, a.unit) AS unit,
        COALESCE(o.ship_postal_code, a.postal_code) AS postal_code,
        o.extra_details,
        o.tracking_info
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      LEFT JOIN addresses a ON o.address_id = a.id
      ORDER BY o.created_at DESC`,
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