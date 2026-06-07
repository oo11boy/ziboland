// src/lib/settings.ts
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function getSettings() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM site_settings LIMIT 1");
    return rows[0] || null;
  } catch (error) {
    console.error("خطا در دریافت تنظیمات سایت:", error);
    return null;
  }
}