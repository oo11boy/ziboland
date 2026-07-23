import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import * as jose from "jose";

// GET - دریافت تمام روش‌های ارسال
export async function GET() {
  try {
    const conn = await pool.getConnection();
    const [rows]: any = await conn.query(
      `SELECT * FROM shipping_methods ORDER BY display_order ASC, id ASC`
    );
    conn.release();
    
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("Error fetching shipping methods:", error);
    return NextResponse.json(
      { error: "خطا در دریافت روش‌های ارسال" },
      { status: 500 }
    );
  }
}

// POST - ایجاد روش ارسال جدید
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
    const { name, key, description, cost, delivery_time, extra_note, display_order, is_active } = body;

    if (!name) {
      return NextResponse.json(
        { error: "نام روش ارسال الزامی است" },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();
    const [result]: any = await conn.query(
      `INSERT INTO shipping_methods 
       (name, \`key\`, description, cost, delivery_time, extra_note, display_order, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, key || null, description || null, cost || 0, delivery_time || null, extra_note || null, display_order || 0, is_active ?? 1]
    );
    conn.release();

    return NextResponse.json({
      message: "روش ارسال با موفقیت ایجاد شد",
      id: result.insertId
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating shipping method:", error);
    return NextResponse.json(
      { error: "خطا در ایجاد روش ارسال" },
      { status: 500 }
    );
  }
}

// PUT - به‌روزرسانی روش ارسال
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
    const { id, name, key, description, cost, delivery_time, extra_note, display_order, is_active } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: "شناسه و نام روش ارسال الزامی است" },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();
    const [result]: any = await conn.query(
      `UPDATE shipping_methods 
       SET name = ?, \`key\` = ?, description = ?, cost = ?, delivery_time = ?, 
           extra_note = ?, display_order = ?, is_active = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, key || null, description || null, cost || 0, delivery_time || null, extra_note || null, display_order || 0, is_active ?? 1, id]
    );
    conn.release();

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "روش ارسال یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "روش ارسال با موفقیت به‌روزرسانی شد"
    });
  } catch (error: any) {
    console.error("Error updating shipping method:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی روش ارسال" },
      { status: 500 }
    );
  }
}

// DELETE - حذف روش ارسال
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
        { error: "شناسه روش ارسال الزامی است" },
        { status: 400 }
      );
    }

    const conn = await pool.getConnection();
    const [result]: any = await conn.query(
      "DELETE FROM shipping_methods WHERE id = ?",
      [id]
    );
    conn.release();

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "روش ارسال یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "روش ارسال با موفقیت حذف شد"
    });
  } catch (error: any) {
    console.error("Error deleting shipping method:", error);
    return NextResponse.json(
      { error: "خطا در حذف روش ارسال" },
      { status: 500 }
    );
  }
}