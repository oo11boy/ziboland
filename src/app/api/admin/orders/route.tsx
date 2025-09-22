import { NextResponse } from "next/server";
import pool from "@/lib/db";
import * as jose from "jose";

export async function GET(request: Request) {
  // Extract and verify JWT token
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "لطفاً توکن را ارائه دهید" }, { status: 401 });
  }

  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    console.error("JWT_SECRET is not set");
    return NextResponse.json({ error: "خطای سرور: تنظیمات نادرست" }, { status: 500 });
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
    return NextResponse.json({ error: "توکن نامعتبر است", details: error.message }, { status: 401 });
  }

  const conn = await pool.getConnection();

  try {
    // Fetch all orders with user and address details, including first_name, last_name, and phone_number
    const [orders]: any = await conn.query(
      `SELECT 
         o.*, 
         u.username, 
         u.email, 
         u.first_name, 
         u.last_name, 
         u.phone_number, 
         a.province, 
         a.city, 
         a.street, 
         a.building_number, 
         a.alley, 
         a.unit, 
         a.postal_code
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       JOIN addresses a ON o.address_id = a.id`
    );

    // Fetch items for each order
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
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات سفارشات", details: error.message },
      { status: 500 }
    );
  } finally {
    conn.release();
  }
}