import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { revalidateSliders } from "@/lib/revalidate";

// ✅ همیشه dynamic - هیچ کشی نشود
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM sliders ORDER BY slide_order ASC",
    );
    return NextResponse.json(rows, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sliders: " + error },
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

    // 🎯 Revalidate فوری
    revalidateSliders();

    return NextResponse.json(
      { id: (result as any).insertId, message: "Added" },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add slider: " + error },
      { status: 500 },
    );
  }
}