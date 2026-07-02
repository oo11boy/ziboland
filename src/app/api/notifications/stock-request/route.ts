import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { productId, variantId, productTitle, variantColor, name, phone } = body;

  // اعتبارسنجی
  if (!productId || !name || !phone) {
    return NextResponse.json(
      { error: "اطلاعات ناقص است" },
      { status: 400 },
    );
  }

  if (!/^\d{11}$/.test(phone)) {
    return NextResponse.json(
      { error: "شماره تماس باید ۱۱ رقم باشد" },
      { status: 400 },
    );
  }

  const conn = await pool.getConnection();

  try {
    // ذخیره درخواست در دیتابیس
    await conn.execute(
      `INSERT INTO stock_notification_requests 
       (product_id, variant_id, product_title, variant_color, customer_name, phone_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [productId, variantId || null, productTitle, variantColor || null, name, phone],
    );

    // ایجاد نوتیفیکیشن برای ادمین - استفاده از نوع 'ticket' که در ENUM موجود است
    await conn.execute(
      `INSERT INTO notifications (type, message, related_id) 
       VALUES ('ticket', ?, ?)`,
      [
        `درخواست موجودی برای محصول "${productTitle}" ${variantColor ? `(رنگ ${variantColor})` : ""} توسط ${name} (${phone})`,
        productId,
      ],
    );

    await conn.commit();

    return NextResponse.json(
      { message: "درخواست با موفقیت ثبت شد" },
      { status: 200 },
    );
  } catch (error: any) {
    await conn.rollback();
    console.error("Error saving stock request:", error);
    return NextResponse.json(
      { error: "خطا در ثبت درخواست", details: error.message },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}