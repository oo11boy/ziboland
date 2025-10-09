// app/api/sliders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();
  try {
    const [rows] = await pool.query("SELECT * FROM sliders WHERE id = ?", [id]);
    if ((rows as any[]).length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json((rows as any[])[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch slider"+error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();
  try {
    const data = await req.json();
    const { imagewide, imagemin, alt, link, slide_order } = data;
    if (!imagewide || !imagemin || !alt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    await pool.query(
      "UPDATE sliders SET imagewide = ?, imagemin = ?, alt = ?, link = ?, slide_order = ? WHERE id = ?",
      [imagewide, imagemin, alt, link || null, slide_order, id]
    );
    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update slider"+error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();
  try {
    await pool.query("DELETE FROM sliders WHERE id = ?", [id]);
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete slider"+error }, { status: 500 });
  }
}