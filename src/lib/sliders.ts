// src/lib/sliders.ts
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// تعریف اینترفیس در اینجا (یا ایمپورت از types/types.tsx)
export interface Slide {
  id: number;
  link: string;
  imagewide: string;
  imagemin: string;
  alt: string;
}

export async function getSliders(): Promise<Slide[]> {
  try {
    // استفاده از <Slide[]> برای مشخص کردن نوع داده‌های دریافتی
    const [rows] = await pool.query<RowDataPacket[]>("SELECT * FROM sliders ORDER BY id DESC");
    
    // تبدیل (Cast) کردن خروجی به آرایه‌ای از Slide
    return rows as Slide[]; 
  } catch (error) {
    console.error("خطا در دریافت اسلایدرها:", error);
    return [];
  }
}