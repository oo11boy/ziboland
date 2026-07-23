import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

// GET - دریافت تمام مزایا
export async function GET() {
  try {
    const conn = await pool.getConnection();
    const [rows]: any = await conn.query(
      `SELECT * FROM benefits WHERE is_active = 1 ORDER BY display_order ASC, id ASC`
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