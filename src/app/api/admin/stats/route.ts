import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET() {
  try {
    const [productsCount] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM products",
    );
    const [usersCount] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM users",
    );
    const [ordersSum] = await pool.query<RowDataPacket[]>(
      "SELECT SUM(amount) as total FROM payments WHERE status = 'paid'",
    );
    const [categoriesCount] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM categories",
    );

    const stats = {
      totalProducts: (productsCount as RowDataPacket[])[0].count,
      totalUsers: (usersCount as RowDataPacket[])[0].count,
      totalRevenue: (ordersSum as RowDataPacket[])[0].total || 0,
      totalCategories: (categoriesCount as RowDataPacket[])[0].count,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "خطا در دریافت آمار" }, { status: 500 });
  }
}
