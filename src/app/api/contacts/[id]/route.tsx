import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface Contact extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  created_at: string;
  status: "pending" | "read" | "responded";
}

// GET: دریافت یک پیام خاص
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // ⚠ اینجا به صورت Promise
) {
  const { id } = await params; // ⚠ باید await شود
  const contactId = parseInt(id);
  if (isNaN(contactId)) {
    return NextResponse.json(
      { error: "شناسه پیام نامعتبر است" },
      { status: 400 },
    );
  }

  try {
    const [rows] = await pool.query<Contact[]>(
      "SELECT id, name, email, phone, subject, message, created_at, status FROM contacts WHERE id = ?",
      [contactId],
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "پیام یافت نشد" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("خطا در دریافت پیام:", error);
    return NextResponse.json(
      { error: "خطا در دریافت پیام", details: (error as Error).message },
      { status: 500 },
    );
  }
}

// PUT: به‌روزرسانی پیام (وضعیت یا اطلاعات)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const contactId = parseInt(id);
  if (isNaN(contactId)) {
    return NextResponse.json(
      { error: "شناسه پیام نامعتبر است" },
      { status: 400 },
    );
  }

  try {
    const data = await request.json();
    const { name, email, phone, subject, message, status } = data;

    // اعتبارسنجی
    if (status && !["pending", "read", "responded"].includes(status)) {
      return NextResponse.json({ error: "وضعیت نامعتبر است" }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "فرمت ایمیل نامعتبر است" },
        { status: 400 },
      );
    }

    // به‌روزرسانی اطلاعات
    const [result] = await pool.query(
      `UPDATE contacts SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        subject = COALESCE(?, subject),
        message = COALESCE(?, message),
        status = COALESCE(?, status)
      WHERE id = ?`,
      [
        name || null,
        email || null,
        phone || null,
        subject || null,
        message || null,
        status || null,
        contactId,
      ],
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "پیام یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({ message: "پیام با موفقیت به‌روزرسانی شد" });
  } catch (error) {
    console.error("خطا در به‌روزرسانی پیام:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی پیام", details: (error as Error).message },
      { status: 500 },
    );
  }
}

// DELETE: حذف یک پیام
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const contactId = parseInt(id);
  if (isNaN(contactId)) {
    return NextResponse.json(
      { error: "شناسه پیام نامعتبر است" },
      { status: 400 },
    );
  }

  try {
    const [result] = await pool.query("DELETE FROM contacts WHERE id = ?", [
      contactId,
    ]);
    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "پیام یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({ message: "پیام با موفقیت حذف شد" });
  } catch (error) {
    console.error("خطا در حذف پیام:", error);
    return NextResponse.json(
      { error: "خطا در حذف پیام", details: (error as Error).message },
      { status: 500 },
    );
  }
}
