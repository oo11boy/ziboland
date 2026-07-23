import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import * as jose from "jose";

// GET - دریافت تمام مزایا (برای ادمین)
export async function GET() {
  try {
    const conn = await pool.getConnection();
    const [rows]: any = await conn.query(
      `SELECT * FROM benefits ORDER BY display_order ASC, id ASC`
    );
    conn.release();
    
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error fetching benefits:", error);
    return NextResponse.json(
      { error: "خطا در دریافت مزایا" },
      { status: 500 }
    );
  }
}

// POST - ایجاد مزیت جدید
export async function POST(request: Request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    return NextResponse.json(
      { error: "لطفاً توکن را ارائه دهید" },
      { status: 401 }
    );
  }

  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    return NextResponse.json(
      { error: "خطای سرور: تنظیمات نادرست" },
      { status: 500 }
    );
  }

  let userId;
  try {
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jose.jwtVerify(token, secret);
    userId = payload.userId;
    
    const conn = await pool.getConnection();
    const [userRows]: any = await conn.query(
      "SELECT role FROM users WHERE id = ?",
      [userId]
    );
    conn.release();

    if (userRows.length === 0 || userRows[0].role !== "admin") {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: "توکن نامعتبر است" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { title, description, image, link, display_order, is_active } = body;

    if (!title || !image) {
      return NextResponse.json(
        { error: "عنوان و تصویر الزامی است" },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();
    const [result]: any = await conn.query(
      `INSERT INTO benefits 
       (title, description, image, link, display_order, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description || null, image, link || '#', display_order || 0, is_active ?? 1]
    );
    conn.release();

    return NextResponse.json({
      message: "مزیت با موفقیت ایجاد شد",
      id: result.insertId
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating benefit:", error);
    return NextResponse.json(
      { error: "خطا در ایجاد مزیت" },
      { status: 500 }
    );
  }
}

// PUT - به‌روزرسانی مزیت
export async function PUT(request: Request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    return NextResponse.json(
      { error: "لطفاً توکن را ارائه دهید" },
      { status: 401 }
    );
  }

  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    return NextResponse.json(
      { error: "خطای سرور: تنظیمات نادرست" },
      { status: 500 }
    );
  }

  try {
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = payload.userId;
    
    const conn = await pool.getConnection();
    const [userRows]: any = await conn.query(
      "SELECT role FROM users WHERE id = ?",
      [userId]
    );
    conn.release();

    if (userRows.length === 0 || userRows[0].role !== "admin") {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: "توکن نامعتبر است" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, title, description, image, link, display_order, is_active } = body;

    if (!id || !title || !image) {
      return NextResponse.json(
        { error: "شناسه، عنوان و تصویر الزامی است" },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();
    const [result]: any = await conn.query(
      `UPDATE benefits 
       SET title = ?, description = ?, image = ?, link = ?, 
           display_order = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [title, description || null, image, link || '#', display_order || 0, is_active ?? 1, id]
    );
    conn.release();

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "مزیت یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "مزیت با موفقیت به‌روزرسانی شد"
    });
  } catch (error: any) {
    console.error("Error updating benefit:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی مزیت" },
      { status: 500 }
    );
  }
}

// DELETE - حذف مزیت
export async function DELETE(request: Request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    return NextResponse.json(
      { error: "لطفاً توکن را ارائه دهید" },
      { status: 401 }
    );
  }

  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    return NextResponse.json(
      { error: "خطای سرور: تنظیمات نادرست" },
      { status: 500 }
    );
  }

  try {
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = payload.userId;
    
    const conn = await pool.getConnection();
    const [userRows]: any = await conn.query(
      "SELECT role FROM users WHERE id = ?",
      [userId]
    );
    conn.release();

    if (userRows.length === 0 || userRows[0].role !== "admin") {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: "توکن نامعتبر است" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "شناسه مزیت الزامی است" },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();
    const [result]: any = await conn.query(
      "DELETE FROM benefits WHERE id = ?",
      [id]
    );
    conn.release();

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "مزیت یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "مزیت با موفقیت حذف شد"
    });
  } catch (error: any) {
    console.error("Error deleting benefit:", error);
    return NextResponse.json(
      { error: "خطا در حذف مزیت" },
      { status: 500 }
    );
  }
}