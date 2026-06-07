// app/api/comments/recent/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT c.id, c.text, c.name, c.date, p.title as product_title 
      FROM comments c 
      LEFT JOIN products p ON c.product_id = p.id 
      ORDER BY c.date DESC 
      LIMIT 5
    `);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching recent comments:", error);
    return NextResponse.json(
      { error: "خطا در دریافت نظرات اخیر" },
      { status: 500 },
    );
  }
}
