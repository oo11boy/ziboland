import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import * as jose from "jose";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  if (!id) {
    return NextResponse.json(
      { error: "شناسه درخواست نامعتبر است" },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();

  try {
    // بررسی اینکه آیا این آیتم متعلق به این کاربر است
    const [existing]: any = await conn.query(
      "SELECT id FROM wishlist WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "این آیتم در لیست علاقه‌مندی‌های شما وجود ندارد" },
        { status: 404 },
      );
    }

    await conn.execute(
      "DELETE FROM wishlist WHERE id = ?",
      [id]
    );
    await conn.commit();

    return NextResponse.json(
      { message: "محصول از لیست علاقه‌مندی‌ها حذف شد" },
      { status: 200 },
    );
  } catch (error: any) {
    await conn.rollback();
    console.error("Error deleting from wishlist:", error);
    return NextResponse.json(
      { error: "خطا در حذف از لیست علاقه‌مندی‌ها" },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}