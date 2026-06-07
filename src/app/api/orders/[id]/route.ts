// src\app\api\orders\[id]\route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const conn = await pool.getConnection();

  try {
    const [orders]: any = await conn.query(
      `SELECT o.*, a.province, a.city, a.street, a.building_number, a.alley, a.unit, a.postal_code
       FROM orders o 
       JOIN addresses a ON o.address_id = a.id 
       WHERE o.order_code = ?`,
      [id],
    );

    if (!orders.length) {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    const [items]: any = await conn.query(
      `SELECT oi.*, p.title, p.image, oi.color_json, oi.price_type
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [orders[0].id],
    );

    // Parse JSON برای color
    const parsedItems = items.map((item: any) => ({
      ...item,
      color: item.color_json ? JSON.parse(item.color_json) : null,
    }));

    return NextResponse.json({ ...orders[0], items: parsedItems });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات سفارش", details: error.message },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }, // تغییر تایپ به Promise
) {
  // مرحله حیاتی: await کردن params برای استخراج id
  const { id } = await params;

  const conn = await pool.getConnection();

  try {
    // ۱. بررسی وجود و وضعیت سفارش
    // دقت کنید در دیتابیس شما فیلد کلید اصلی id است
    const [orders]: any = await conn.query(
      "SELECT status FROM orders WHERE id = ?",
      [id],
    );

    if (orders.length === 0) {
      return NextResponse.json({ error: "سفارش یافت نشد" }, { status: 404 });
    }

    const orderStatus = orders[0].status;

    // ۲. بررسی شرط "در انتظار" بودن
    if (orderStatus !== "pending") {
      return NextResponse.json(
        { error: "تنها سفارش‌های در حالت 'در انتظار' قابل حذف هستند" },
        { status: 400 },
      );
    }

    // ۳. شروع عملیات حذف (تراکنش برای امنیت بیشتر)
    await conn.beginTransaction();

    // حذف آیتم‌های سفارش
    await conn.query("DELETE FROM order_items WHERE order_id = ?", [id]);

    // حذف خود سفارش
    await conn.query("DELETE FROM orders WHERE id = ?", [id]);

    await conn.commit();

    return NextResponse.json(
      { message: "سفارش با موفقیت حذف شد" },
      { status: 200 },
    );
  } catch (error: any) {
    if (conn) await conn.rollback();
    console.error("Error deleting order:", error);
    return NextResponse.json(
      { error: "خطا در حذف سفارش", details: error.message },
      { status: 500 },
    );
  } finally {
    if (conn) conn.release();
  }
}
