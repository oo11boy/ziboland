import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { revalidateSliders } from "@/lib/revalidate";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();
  try {
    const [rows] = await pool.query("SELECT * FROM sliders WHERE id = ?", [id]);
    if ((rows as any[]).length === 0)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json((rows as any[])[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch slider: " + error },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();
  try {
    const data = await req.json();
    const { imagewide, imagemin, alt, link, slide_order } = data;

    if (!imagewide || !imagemin || !alt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    await pool.query(
      "UPDATE sliders SET imagewide = ?, imagemin = ?, alt = ?, link = ?, slide_order = ? WHERE id = ?",
      [imagewide, imagemin, alt, link || null, slide_order, id],
    );

    // 🎯 Revalidate فوری
    revalidateSliders();

    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update slider: " + error },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();
  try {
    await pool.query("DELETE FROM sliders WHERE id = ?", [id]);

    // 🎯 Revalidate فوری
    revalidateSliders();

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete slider: " + error },
      { status: 500 },
    );
  }
}