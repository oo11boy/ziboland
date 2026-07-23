import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const conn = await pool.getConnection();
    const [rows]: any = await conn.query(
      `SELECT * FROM shipping_methods WHERE is_active = 1 ORDER BY display_order ASC, id ASC`
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