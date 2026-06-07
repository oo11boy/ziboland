import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const token =
      request.headers.get("Authorization")?.replace("Bearer ", "") || "";
    const { userId } = verifyToken(token);

    const [rows] = await pool.query(
      "SELECT username, email, phone_number, first_name, last_name, role, is_active FROM users WHERE id = ?",
      [userId],
    );
    const user = (rows as any[])[0];

    if (!user) {
      return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "احراز هویت ناموفق" }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    const token =
      request.headers.get("Authorization")?.replace("Bearer ", "") || "";
    const { userId } = verifyToken(token);
    const data = await request.json();
    const { username, email, phone_number, first_name, last_name } = data;

    if (!username || !email || !first_name || !last_name) {
      return NextResponse.json(
        { error: "فیلدهای الزامی پر نشده‌اند" },
        { status: 400 },
      );
    }

    const [result] = await pool.query(
      "UPDATE users SET username = ?, email = ?, phone_number = ?, first_name = ?, last_name = ? WHERE id = ?",
      [username, email, phone_number || null, first_name, last_name, userId],
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({
      message: "اطلاعات کاربر با موفقیت به‌روزرسانی شد",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی اطلاعات کاربر" },
      { status: 500 },
    );
  }
}
