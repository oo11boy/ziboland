import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import * as jose from "jose";

// ---------- PUT: به‌روزرسانی وضعیت سفارش (فقط ادمین) ----------
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
    return NextResponse.json(
      { error: "خطای سرور: تنظیمات نادرست" },
      { status: 500 },
    );
  }

  // 🔥 احراز هویت و بررسی نقش ادمین
  try {
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jose.jwtVerify(token, secret);
    if (payload.role !== "admin") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }
  } catch (error: any) {
    console.error("JWT verification error:", error.message);
    return NextResponse.json({ error: "توکن نامعتبر است" }, { status: 401 });
  }

  // 🔥 خواندن امن بدنه درخواست
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "بدنه درخواست نامعتبر است" },
      { status: 400 },
    );
  }

  const { status, tracking_info } = body;

  if (
    !["pending", "processing", "shipped", "delivered", "cancelled"].includes(
      status,
    )
  ) {
    return NextResponse.json({ error: "وضعیت نامعتبر است" }, { status: 400 });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    let result: any;

    if (status === "shipped" && tracking_info) {
      [result] = await conn.execute(
        `UPDATE orders SET status = ?, tracking_info = ?, updated_at = NOW() WHERE id = ?`,
        [status, String(tracking_info).trim(), id],
      );
    } else {
      [result] = await conn.execute(
        `UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?`,
        [status, id],
      );
    }

    if (result.affectedRows === 0) {
      await conn.rollback();
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    await conn.commit();

    return NextResponse.json({
      message: "وضعیت سفارش با موفقیت به‌روزرسانی شد",
    });
  } catch (error: any) {
    try {
      await conn.rollback();
    } catch {}
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی وضعیت سفارش", details: error.message },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}

// ---------- DELETE: حذف کامل سفارش (فقط ادمین) ----------
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "عدم احراز هویت" }, { status: 401 });
  }

  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    return NextResponse.json(
      { error: "خطای سرور: تنظیمات نادرست" },
      { status: 500 },
    );
  }

  // 🔥 احراز هویت و بررسی نقش ادمین (قبلاً چک نمی‌شد!)
  try {
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jose.jwtVerify(token, secret);
    if (payload.role !== "admin") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }
  } catch (error: any) {
    console.error("JWT verification error:", error.message);
    return NextResponse.json({ error: "توکن نامعتبر است" }, { status: 401 });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 🔥 ترتیب حذف: payments → order_items → orders
    // (payments ممکن است FK به orders داشته باشد)
    await conn.execute(`DELETE FROM payments WHERE order_id = ?`, [id]);
    await conn.execute(`DELETE FROM order_items WHERE order_id = ?`, [id]);

    const [result]: any = await conn.execute(
      `DELETE FROM orders WHERE id = ?`,
      [id],
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    await conn.commit();

    return NextResponse.json({ message: "سفارش با موفقیت حذف شد" });
  } catch (error: any) {
    try {
      await conn.rollback();
    } catch {}
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "خطا در حذف سفارش", details: error.message },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}