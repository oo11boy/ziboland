import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface Contact extends RowDataPacket {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  subject: string;
  message: string;
  created_at: string;
  status: "pending" | "read" | "responded";
}

// POST: ایجاد پیام جدید و ثبت اعلان برای مدیر
export async function POST(request: NextRequest) {
  const conn = await pool.getConnection();
  try {
    const { name, email, phone, subject, message } = await request.json();

    // ۱. اعتبارسنجی اولیه
    if (!name || !phone || !subject || !message) {
      return NextResponse.json(
        { error: "فیلدهای الزامی را پر کنید" },
        { status: 400 },
      );
    }

    // اعتبارسنجی فرمت ایمیل در صورت وجود
    let finalEmail = email && email.trim() !== "" ? email.trim() : "وارد نشده";
    if (email && email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: "فرمت ایمیل نامعتبر است" },
          { status: 400 },
        );
      }
    }

    // شروع تراکنش
    await conn.beginTransaction();

    // ۲. ثبت پیام در دیتابیس
    const [result] = await conn.query(
      "INSERT INTO contacts (name, email, phone, subject, message, created_at, status) VALUES (?, ?, ?, ?, ?, NOW(), 'pending')",
      [name.trim(), finalEmail, phone.trim(), subject.trim(), message.trim()],
    );

    const contactId = (result as any).insertId;

    // ۳. ثبت نوتیفیکیشن برای مدیر
    const notificationMessage = `پیام جدید از طرف "${name}" با موضوع "${subject}" دریافت شد`;
    await conn.query(
      "INSERT INTO notifications (type, message, related_id) VALUES (?, ?, ?)",
      ["contact", notificationMessage, contactId],
    );

    // تایید تراکنش
    await conn.commit();

    return NextResponse.json(
      { message: "پیام شما با موفقیت ارسال شد" },
      { status: 201 },
    );
  } catch (error) {
    // بازگشت به حالت قبل در صورت بروز خطا
    await conn.rollback();
    console.error("خطا در ارسال پیام:", error);
    return NextResponse.json(
      { error: "خطا در سرور، دوباره تلاش کنید" },
      { status: 500 },
    );
  } finally {
    // آزادسازی کانکشن
    conn.release();
  }
}

// GET: دریافت لیست پیام‌ها
export async function GET() {
  try {
    const [rows] = await pool.query<Contact[]>(
      "SELECT id, name, email, phone, subject, message, created_at, status FROM contacts ORDER BY created_at DESC",
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("خطا در دریافت پیام‌ها:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اطلاعات" },
      { status: 500 },
    );
  }
}
