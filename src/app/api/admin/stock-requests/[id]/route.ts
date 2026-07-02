import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import * as jose from "jose";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // استخراج id با await
  const { id } = await params;
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

  const body = await request.json();
  const { status } = body;

  if (!status || !["pending", "notified", "cancelled"].includes(status)) {
    return NextResponse.json(
      { error: "وضعیت نامعتبر است" },
      { status: 400 },
    );
  }

  if (!id || id === "undefined") {
    return NextResponse.json(
      { error: "شناسه درخواست نامعتبر است" },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();

  try {
    await conn.execute(
      "UPDATE stock_notification_requests SET status = ? WHERE id = ?",
      [status, id]
    );
    await conn.commit();

    return NextResponse.json(
      { message: "وضعیت با موفقیت تغییر کرد" },
      { status: 200 },
    );
  } catch (error: any) {
    await conn.rollback();
    console.error("Error updating stock request:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی", details: error.message },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // استخراج id با await
  const { id } = await params;
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

  if (!id || id === "undefined") {
    return NextResponse.json(
      { error: "شناسه درخواست نامعتبر است" },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();

  try {
    await conn.execute(
      "DELETE FROM stock_notification_requests WHERE id = ?",
      [id]
    );
    await conn.commit();

    return NextResponse.json(
      { message: "درخواست با موفقیت حذف شد" },
      { status: 200 },
    );
  } catch (error: any) {
    await conn.rollback();
    console.error("Error deleting stock request:", error);
    return NextResponse.json(
      { error: "خطا در حذف", details: error.message },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}