import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM banners ORDER BY banner_order");
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch banners: " + error }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { image, alt, link, text, banner_order } = data;
    if (!image || !alt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const [result] = await pool.query(
      "INSERT INTO banners (image, alt, link, text, banner_order) VALUES (?, ?, ?, ?, ?)",
      [image, alt, link || null, text || null, banner_order || 0]
    );
    return NextResponse.json({ id: (result as any).insertId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add banner: " + error }, { status: 500 });
  }
}