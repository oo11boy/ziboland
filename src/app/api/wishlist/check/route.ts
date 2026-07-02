import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import * as jose from "jose";

export async function GET(request: Request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!token) {
    return NextResponse.json(
      { error: "لطفاً وارد شوید" },
      { status: 401 },
    );
  }

  if (!productId) {
    return NextResponse.json(
      { error: "شناسه محصول الزامی است" },
      { status: 400 },
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
      "SELECT id FROM wishlist WHERE user_id = ? AND product_id = ?",
      [userId, productId]
    );

    return NextResponse.json({
      inWishlist: rows.length > 0,
    });
  } catch (error: any) {
    console.error("Error checking wishlist:", error);
    return NextResponse.json(
      { error: "خطا در بررسی وضعیت علاقه‌مندی" },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}