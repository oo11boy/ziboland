// app/api/auth/resend-code/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const [users] = await pool.query(
      "SELECT id, first_name FROM users WHERE email = ?",
      [email],
    );
    const user = (users as any[])[0];

    if (!user) {
      return NextResponse.json({ error: "ایمیل یافت نشد" }, { status: 404 });
    }

    // حذف کدهای قبلی
    await pool.query(
      "DELETE FROM verification_codes WHERE email = ? AND used = 0",
      [email],
    );

    // کد جدید
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      `INSERT INTO verification_codes (user_id, email, code, expires_at) 
       VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
      [user.id, email, code],
    );

    await transporter.sendMail({
      from: `"زیبولند" <${process.env.GOOGLE_EMAIL}>`,
      to: email,
      subject: "کد تأیید جدید - زیبولند",
      html: `
        <div style="font-family:Tahoma; direction:rtl; text-align:center; padding:30px; background:#f9f9fb;">
          <div style="max-width:500px; margin:auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
            <div style="background:linear-gradient(135deg,#805B99,#a078b8); padding:30px; color:white;">
              <h1>زیبولند</h1>
            </div>
            <div style="padding:40px;">
              <p>سلام ${user.first_name || "کاربر گرامی"}،</p>
              <p>درخواست کد جدید دریافت شد.</p>
              <div style="font-size:36px; font-weight:bold; color:#805B99; background:#f5e8ff; padding:20px; border-radius:12px; margin:25px 0;">
                ${code.match(/.{1,3}/g)?.join(" ")}
              </div>
              <p>این کد تا <strong>۱۰ دقیقه</strong> معتبر است.</p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ message: "کد جدید ارسال شد" });
  } catch (error) {
    console.error("Resend code error:", error);
    return NextResponse.json({ error: "خطا در ارسال کد" }, { status: 500 });
  }
}
