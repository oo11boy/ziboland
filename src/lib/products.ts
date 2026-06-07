// src/lib/products.ts
import pool from "@/lib/db";
import { Product } from "@/types/types";
import { RowDataPacket } from "mysql2";

export async function getProductById(id: string): Promise<Product | null> {
  try {
    // استفاده از pool برای اجرای کوئری
    // توجه: در mysql2 نتیجه معمولاً یک آرایه است که اولین المان آن ردیف‌هاست
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM products WHERE id = ?", 
      [id]
    );

    // اگر محصولی یافت نشد
    if (rows.length === 0) {
      return null;
    }

    // بازگرداندن اولین نتیجه به عنوان محصول
    return rows[0] as Product;
  } catch (error) {
    console.error("Database Error:", error);
    return null;
  }
}