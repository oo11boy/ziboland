import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const { phone, first_name, last_name } = await req.json();

    if (!phone || !first_name?.trim() || !last_name?.trim()) {
      return NextResponse.json({ error: "اطلاعات ناقص است" }, { status: 400 });
    }

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE phone_number = ?",
      [phone],
    );

    if ((existing as any[]).length > 0) {
      return NextResponse.json(
        { error: "این شماره قبلاً ثبت شده است" },
        { status: 409 },
      );
    }

    const username = `user_${Date.now()}`;
    const dummyPasswordHash = await bcrypt.hash(
      "dummy_" + Math.random().toString(36).slice(2),
      10,
    );

    const [result] = await pool.query(
      `INSERT INTO users 
       (username, password_hash, phone_number, first_name, last_name, role, is_active)
       VALUES (?, ?, ?, ?, ?, 'customer', 1)`,
      [username, dummyPasswordHash, phone, first_name.trim(), last_name.trim()],
    );

    const userId = (result as any).insertId;

    const [newUserRows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);

    const user = (newUserRows as any[])[0];

    const token = jwt.sign(
      { userId: user.id, phone: user.phone_number, role: user.role },
      SECRET,
      { expiresIn: "1d" },
    );

    const res = NextResponse.json({ success: true });
    res.cookies.set("authToken", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400,
    });

    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
