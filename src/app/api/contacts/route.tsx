import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface Contact extends RowDataPacket{
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  created_at: string;
  status: "pending" | "read" | "responded";
}

// POST: ایجاد پیام جدید (فرم تماس)
export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    // اعتبارسنجی داده‌ها
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "فیلدهای الزامی پر نشده‌اند" },
        { status: 400 }
      );
    }

    // اعتبارسنجی فرمت ایمیل
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "فرمت ایمیل نامعتبر است" },
        { status: 400 }
      );
    }

    // ذخیره در دیتابیس
    const [result] = await pool.query(
      "INSERT INTO contacts (name, email, phone, subject, message, created_at, status) VALUES (?, ?, ?, ?, ?, NOW(), 'pending')",
      [name, email, phone || null, subject, message]
    );

    return NextResponse.json(
      { message: "پیام شما با موفقیت ارسال شد" },
      { status: 201 }
    );
  } catch (error) {
    console.error("خطا در ارسال پیام:", error);
    return NextResponse.json(
      { error: "خطا در ارسال پیام", details: (error as Error).message },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    const [rows] = await pool.query<Contact[]>(
      "SELECT id, name, email, phone, subject, message, created_at, status FROM contacts ORDER BY created_at DESC"
    );

    // به جای 404، آرایه خالی برگردانید
    return NextResponse.json(rows);
  } catch (error) {
    console.error("خطا در دریافت پیام‌ها:", error);
    return NextResponse.json(
      { error: "خطا در دریافت پیام‌ها", details: (error as Error).message },
      { status: 500 }
    );
  }
}