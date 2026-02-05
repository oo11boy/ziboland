import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();
  try {
    const [rows] = await pool.query("SELECT * FROM banners WHERE id = ?", [id]);
    if ((rows as any[]).length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json((rows as any[])[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch banner: " + error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();
  try {
    const data = await req.json();
    const { image, alt, link, text, banner_order } = data;
    if (!image || !alt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    await pool.query(
      "UPDATE banners SET image = ?, alt = ?, link = ?, text = ?, banner_order = ? WHERE id = ?",
      [image, alt, link || null, text || null, banner_order, id]
    );
    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update banner: " + error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();
  try {
    await pool.query("DELETE FROM banners WHERE id = ?", [id]);
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete banner: " + error }, { status: 500 });
  }
}