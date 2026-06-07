// app/api/products/recent/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT id, title, image 
      FROM products 
      ORDER BY id DESC 
      LIMIT 5
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching recent products:", error);
    return NextResponse.json(
      { error: "خطا در دریافت محصولات اخیر" },
      { status: 500 },
    );
  }
}
