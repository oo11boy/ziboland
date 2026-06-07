import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

interface SubcategoryItem {
  id: number;
  subcategory_id: number;
  name: string;
}

export async function GET(request: NextRequest) {
  const idStr = request.nextUrl.pathname.split("/").pop();
  const subcatId = parseInt(idStr || "");

  if (isNaN(subcatId)) {
    return NextResponse.json(
      { error: "Invalid subcategory ID" },
      { status: 400 },
    );
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, subcategory_id, name 
       FROM subcategory_items 
       WHERE subcategory_id = ? 
       ORDER BY id`,
      [subcatId],
    );

    const items: SubcategoryItem[] = rows.map((row) => ({
      id: row.id,
      subcategory_id: row.subcategory_id,
      name: row.name,
    }));

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching subcategory items:", error);
    return NextResponse.json(
      { error: "Failed to fetch subcategory items" },
      { status: 500 },
    );
  }
}
