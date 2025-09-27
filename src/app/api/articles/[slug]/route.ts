import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

// GET مقاله با slug
export async function GET(req: Request, { params }: { params: { slug: string } }) {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM articles WHERE slug = ?",
    [params.slug]
  );
  if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rows[0]);
}

// PUT بروزرسانی مقاله
export async function PUT(req: Request, { params }: { params: { slug: string } }) {
  const { title, slug, content, image, author, tags } = await req.json();
  await pool.query(
    "UPDATE articles SET title=?, slug=?, content=?, image=?, author=?, tags=?, updated_at=NOW() WHERE slug=?",
    [title, slug, content, image || null, author || null, tags || null, params.slug]
  );
  return NextResponse.json({ message: "Updated" });
}

// DELETE حذف مقاله
export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  await pool.query("DELETE FROM articles WHERE slug=?", [params.slug]);
  return NextResponse.json({ message: "Deleted" });
}
