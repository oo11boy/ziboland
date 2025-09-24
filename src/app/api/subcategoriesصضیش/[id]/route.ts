import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const subcatId = parseInt(params.id);
  if (isNaN(subcatId)) {
    return NextResponse.json({ error: "Invalid subcategory ID" }, { status: 400 });
  }

  try {
    const data = await request.json();
    const { category_id, name } = data;

    if (!category_id || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate category
    const [catRows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM categories WHERE id = ?",
      [category_id]
    );
    if (catRows.length === 0) {
      return NextResponse.json({ error: "Invalid category_id" }, { status: 400 });
    }

    const [result] = await pool.query(
      "UPDATE subcategories SET category_id = ?, name = ? WHERE id = ?",
      [category_id, name, subcatId]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "Subcategory not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Subcategory updated successfully" });
  } catch (error) {
    console.error("Error updating subcategory:", error);
    return NextResponse.json(
      { error: "Failed to update subcategory", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const subcatId = parseInt(params.id);
  if (isNaN(subcatId)) {
    return NextResponse.json({ error: "Invalid subcategory ID" }, { status: 400 });
  }

  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Delete related items
      await connection.query("DELETE FROM subcategory_items WHERE subcategory_id = ?", [subcatId]);

      // Delete subcategory
      const [result] = await connection.query("DELETE FROM subcategories WHERE id = ?", [subcatId]);

      if ((result as any).affectedRows === 0) {
        throw new Error("Subcategory not found");
      }

      await connection.commit();
      return NextResponse.json({ message: "Subcategory deleted successfully" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    return NextResponse.json(
      { error: "Failed to delete subcategory", details: (error as Error).message },
      { status: 500 }
    );
  }
}
