// api/auth/verify-otp/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const { phone, code } = await req.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: "شماره و کد الزامی است" },
        { status: 400 },
      );
    }

    // بایپس ادمین - کد ثابت بدون نیاز به بررسی دیتابیس
    if (phone === "09123456789" && code === "123456") {
      // پیدا کردن کاربر ادمین
      const [rows] = await pool.query(
        "SELECT * FROM users WHERE phone_number = ? AND role = 'admin' LIMIT 1",
        [phone],
      );

      const admin = (rows as any[])[0];

      if (!admin) {
        return NextResponse.json(
          { error: "حساب ادمین با این شماره یافت نشد" },
          { status: 403 },
        );
      }

      const token = jwt.sign(
        {
          userId: admin.id,
          phone: admin.phone_number,
          role: admin.role,
        },
        SECRET,
        { expiresIn: "1d" },
      );

      const res = NextResponse.json({ success: true, isNew: false });
      res.cookies.set("authToken", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 86400,
      });

      return res;
    }

    // منطق عادی کاربران (چک کد از دیتابیس)
    const [verificationRows] = await pool.query(
      `SELECT * FROM verification_codes 
       WHERE email = ? 
         AND code = ? 
         AND expires_at > NOW() 
         AND used = 0
       ORDER BY id DESC 
       LIMIT 1`,
      [phone, code],
    );

    const verification = (verificationRows as any[])[0];

    if (!verification) {
      return NextResponse.json(
        { error: "کد نامعتبر یا منقضی شده است" },
        { status: 400 },
      );
    }

    // مارک کردن کد به عنوان استفاده شده
    await pool.query("UPDATE verification_codes SET used = 1 WHERE id = ?", [
      verification.id,
    ]);

    // پیدا کردن کاربر
    const [userRows] = await pool.query(
      "SELECT * FROM users WHERE phone_number = ? LIMIT 1",
      [phone],
    );

    let user = (userRows as any[])[0];

    if (user) {
      // کاربر قدیمی → لاگین
      const token = jwt.sign(
        {
          userId: user.id,
          phone: user.phone_number,
          role: user.role,
        },
        SECRET,
        { expiresIn: "1d" },
      );

      const res = NextResponse.json({ success: true, isNew: false });
      res.cookies.set("authToken", token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 86400,
      });

      return res;
    }

    // کاربر جدید
    return NextResponse.json({ success: true, isNew: true });
  } catch (err) {
    console.error("verify-otp error:", err);
    return NextResponse.json(
      { error: "خطای سرور در تأیید کد" },
      { status: 500 },
    );
  }
}
