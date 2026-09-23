import { pool } from "@/lib/db";
import { unstable_cache } from "next/cache";
import { RowDataPacket } from "mysql2";

export interface Slide {
  id: number;
  link: string | null;
  imagewide: string;
  imagemin: string;
  alt: string;
}

// ✅ کش با tag مشخص - قابل invalidation
export const getSliders = unstable_cache(
  async (): Promise<Slide[]> => {
    try {
      const [rows] = await pool.query<RowDataPacket[]>(
        "SELECT * FROM sliders ORDER BY slide_order ASC",
      );
      return rows as Slide[];
    } catch (error) {
      console.error("خطا در دریافت اسلایدرها:", error);
      return [];
    }
  },
  ["sliders-list"], // cache key
  {
    tags: ["sliders"], // 🎯 tag برای revalidate
    revalidate: 60, // fallback: هر ۱ ساعت
  },
);