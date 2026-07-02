import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import * as jose from "jose";

export async function GET(request: Request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    return NextResponse.json(
      { error: "لطفاً وارد شوید" },
      { status: 401 },
    );
  }

  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    console.error("JWT_SECRET is not set");
    return NextResponse.json(
      { error: "خطای سرور" },
      { status: 500 },
    );
  }

  let userId;
  try {
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jose.jwtVerify(token, secret);
    userId = payload.userId;
  } catch (error: any) {
    return NextResponse.json(
      { error: "توکن نامعتبر است" },
      { status: 401 },
    );
  }

  const conn = await pool.getConnection();

  try {
    const [rows]: any = await conn.query(
      `SELECT w.*, p.title as name, p.image, p.numericPrice as price
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`,
      [userId],
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "خطا در دریافت لیست علاقه‌مندی‌ها" },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}

export async function POST(request: Request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  const body = await request.json();
  const { productId, variantId } = body;

  if (!token) {
    return NextResponse.json(
      { error: "لطفاً وارد شوید" },
      { status: 401 },
    );
  }

  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    console.error("JWT_SECRET is not set");
    return NextResponse.json(
      { error: "خطای سرور" },
      { status: 500 },
    );
  }

  let userId;
  try {
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jose.jwtVerify(token, secret);
    userId = payload.userId;
  } catch (error: any) {
    return NextResponse.json(
      { error: "توکن نامعتبر است" },
      { status: 401 },
    );
  }

  if (!productId) {
    return NextResponse.json(
      { error: "شناسه محصول الزامی است" },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();

  try {
    // بررسی اینکه آیا محصول قبلاً در لیست علاقه‌مندی‌ها وجود دارد
    const [existing]: any = await conn.query(
      "SELECT id FROM wishlist WHERE user_id = ? AND product_id = ? AND (variant_id = ? OR variant_id IS NULL)",
      [userId, productId, variantId || null]
    );

    if (existing.length > 0) {
      // اگر وجود دارد، حذفش کن (Toggle)
      await conn.execute(
        "DELETE FROM wishlist WHERE id = ?",
        [existing[0].id]
      );
      await conn.commit();
      return NextResponse.json(
        { message: "محصول از لیست علاقه‌مندی‌ها حذف شد", action: "removed" },
        { status: 200 },
      );
    }

    // اگر وجود ندارد، اضافه کن
    await conn.execute(
      "INSERT INTO wishlist (user_id, product_id, variant_id) VALUES (?, ?, ?)",
      [userId, productId, variantId || null]
    );
    await conn.commit();

    return NextResponse.json(
      { message: "محصول به لیست علاقه‌مندی‌ها اضافه شد", action: "added" },
      { status: 200 },
    );
  } catch (error: any) {
    await conn.rollback();
    console.error("Error adding to wishlist:", error);
    return NextResponse.json(
      { error: "خطا در افزودن به لیست علاقه‌مندی‌ها" },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}