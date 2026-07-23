import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import * as jose from "jose";

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
    return NextResponse.json({ error: "توکن نامعتبر است" }, { status: 401 });
  }

  const { status, tracking_info } = await request.json();
  
  if (
    !["pending", "processing", "shipped", "delivered", "cancelled"].includes(
      status,
    )
  ) {
    return NextResponse.json({ error: "وضعیت نامعتبر است" }, { status: 400 });
  }

  const conn = await pool.getConnection();

  try {
    // اگر وضعیت "shipped" است، tracking_info را هم به‌روزرسانی کن
    if (status === "shipped" && tracking_info) {
      const [result]: any = await conn.execute(
        `UPDATE orders SET status = ?, tracking_info = ?, updated_at = NOW() WHERE id = ?`,
        [status, tracking_info, id],
      );
      if (result.affectedRows === 0) {
        return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
      }
    } else {
      const [result]: any = await conn.execute(
        `UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?`,
        [status, id],
      );
      if (result.affectedRows === 0) {
        return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
      }
    }

    await conn.commit();
    return NextResponse.json({
      message: "وضعیت سفارش با موفقیت به‌روزرسانی شد",
    });
  } catch (error: any) {
    await conn.rollback();
    console.error("Error updating order status:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی وضعیت سفارش", details: error.message },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}

// DELETE - حذف سفارش
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token)
    return NextResponse.json({ error: "عدم احراز هویت" }, { status: 401 });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

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
    await conn.rollback();
    return NextResponse.json(
      { error: "خطا در حذف سفارش", details: error.message },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}