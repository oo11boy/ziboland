import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import * as jose from "jose";

export async function GET(request: Request) {
  // گرفتن و بررسی JWT
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

  try {
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jose.jwtVerify(token, secret);

    if (payload.role !== "admin") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }
  } catch (error: any) {
    console.error("JWT verification error:", error.message);
    return NextResponse.json(
      { error: "توکن نامعتبر است", details: error.message },
      { status: 401 },
    );
  }

  try {
    const [rows]: any = await pool.query(
      `SELECT 
         o.id, o.order_code, o.total_amount, o.status, o.payment_status, o.created_at,
         u.username, u.first_name, u.last_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 5`,
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error fetching recent orders:", error);
    return NextResponse.json(
      { error: "خطا در دریافت سفارش‌های اخیر", details: error.message },
      { status: 500 },
    );
  }
}
