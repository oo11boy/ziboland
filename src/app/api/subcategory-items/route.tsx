// api/subcategory-items.ts (new file)
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { SubcategoryItem } from "@/types/types";
import { RowDataPacket } from "mysql2/promise";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subcategoryId = searchParams.get("subcategory_id");
  try {
    if (!subcategoryId || isNaN(parseInt(subcategoryId))) {
      return NextResponse.json(
        { error: "Invalid or missing subcategory_id" },
        { status: 400 },
      );
    }
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT id, subcategory_id, name
      FROM subcategory_items
      WHERE subcategory_id = ?
      ORDER BY id
    `,
      [parseInt(subcategoryId)],
    );
    const items: SubcategoryItem[] = rows.map((row) => ({
      id: row.id,
      subcategory_id: row.subcategory_id,
      name: row.name,
    }));
    if (items.length === 0) {
      return NextResponse.json({ error: "No items found" }, { status: 404 });
    }
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching subcategory items:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch subcategory items",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
