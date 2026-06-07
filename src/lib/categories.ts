// src/lib/categories.ts
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { Categoryapi } from "@/types/types";

export async function getCategories(): Promise<Categoryapi[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM categories",
    );
    return rows as Categoryapi[];
  } catch (error) {
    console.error("خطا در دریافت دسته‌بندی‌ها:", error);
    return [];
  }
}
