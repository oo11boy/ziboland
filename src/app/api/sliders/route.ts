// app/api/sliders/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM sliders ORDER BY slide_order",
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sliders" + error },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { imagewide, imagemin, alt, link, slide_order } = data;
    if (!imagewide || !imagemin || !alt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }
    const [result] = await pool.query(
      "INSERT INTO sliders (imagewide, imagemin, alt, link, slide_order) VALUES (?, ?, ?, ?, ?)",
      [imagewide, imagemin, alt, link || null, slide_order || 0],
    );
    return NextResponse.json({ id: (result as any).insertId }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add slider" + error },
      { status: 500 },
    );
  }
}
