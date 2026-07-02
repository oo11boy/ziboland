// src\app\api\admin\stock-requests\route.ts
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

  let userId;
  try {
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jose.jwtVerify(token, secret);
    userId = payload.userId;
    
    // بررسی اینکه کاربر ادمین است
    const conn = await pool.getConnection();
    const [userRows]: any = await conn.query(
      "SELECT role FROM users WHERE id = ?",
      [userId]
    );
    conn.release();

    if (userRows.length === 0 || userRows[0].role !== "admin") {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 },
      );
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
    const [rows]: any = await conn.query(
      `SELECT * FROM stock_notification_requests 
       ORDER BY created_at DESC`
    );
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error fetching stock requests:", error);
    return NextResponse.json(
      { error: "خطا در دریافت درخواست‌ها", details: error.message },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}