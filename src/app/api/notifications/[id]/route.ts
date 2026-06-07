import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

// 🔒 بررسی توکن ادمین
async function verifyAdminFromToken(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) throw { status: 401, message: "توکن ارائه نشده است" };
  if (!JWT_SECRET) throw { status: 500, message: "JWT_SECRET تنظیم نشده است" };

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    if ((payload as any).role !== "admin") {
      throw { status: 403, message: "دسترسی غیرمجاز" };
    }
  } catch (err: any) {
    throw { status: 401, message: err?.message || "توکن نامعتبر است" };
  }
}

// 🟡 PUT: علامت‌گذاری اعلان خاص به عنوان خوانده‌شده
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  try {
    await verifyAdminFromToken(request);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  try {
    const [result] = await pool.query(
      "UPDATE notifications SET `read` = 1 WHERE id = ?",
      [id],
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "اعلان یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({ message: "اعلان خوانده شد" }, { status: 200 });
  } catch (error: any) {
    console.error(`PUT /api/notifications/${id} error:`, error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی اعلان", details: error.message },
      { status: 500 },
    );
  }
}
