import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

// GET همه مقالات
export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM articles ORDER BY created_at DESC",
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 },
    );
  }
}

// POST افزودن مقاله
export async function POST(request: Request) {
  try {
    const { title, slug, content, image, author, tags } = await request.json();
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const [result] = await pool.query(
      "INSERT INTO articles (title, slug, content, image, author, tags) VALUES (?, ?, ?, ?, ?, ?)",
      [title, slug, content, image || null, author || null, tags || null],
    );

    return NextResponse.json({ id: (result as any).insertId }, { status: 201 });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Failed to add article" },
      { status: 500 },
    );
  }
}
