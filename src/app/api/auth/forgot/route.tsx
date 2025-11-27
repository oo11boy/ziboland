// app/api/auth/forgot/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "ایمیل الزامی است" }, { status: 400 });
    }

    // بررسی وجود کاربر
    const [rows] = await pool.query(
      "SELECT id, first_name FROM users WHERE email = ?",
      [email]
    );
    const user = (rows as any[])[0];

    if (!user) {
      // حتی اگر کاربر وجود نداشته باشه، پیام موفقیت می‌دیم (امنیت در برابر enumeration attack)
      return NextResponse.json({
        message: "اگر ایمیل ثبت شده باشد، لینک بازیابی ارسال شد.",
      });
    }

    // تولید توکن ریست پسورد (معتبر برای 15 دقیقه)
    const resetToken = jwt.sign(
      { userId: user.id, purpose: "password-reset" },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `${BASE_URL}/reset-password?token=${resetToken}`;

    // تنظیمات Nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });

    // قالب ایمیل حرفه‌ای و زیبا (مثل شوید)
    const mailOptions = {
      from: `"زیبولند" <${process.env.GOOGLE_EMAIL}>`,
      to: email,
      subject: "بازیابی رمز عبور زیبولند",
      html: `
        <!DOCTYPE html>
        <html lang="fa" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Tahoma, Arial, sans-serif; background:#f9f9fb; margin:0; padding:20px; }
            .container { max-width: 600px; margin: auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #805B99, #a078b8); padding: 30px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 26px; }
            .content { padding: 40px 30px; text-align: center; color: #333; }
            .code { font-size: 18px; color: #805B99; margin: 20px 0; }
            .btn {
              display: inline-block;
              background: #805B99;
              color: white;
              padding: 14px 32px;
              border-radius: 50px;
              text-decoration: none;
              font-weight: bold;
              margin: 20px 0;
              box-shadow: 0 4px 15px rgba(128, 91, 153, 0.3);
            }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 13px; color: #777; }
            .footer a { color: #805B99; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>زیبولند</h1>
              <p>درخواست بازیابی رمز عبور</p>
            </div>
            <div class="content">
              <p>سلام ${user.first_name || "کاربر گرامی"}،</p>
              <p>درخواست بازیابی رمز عبور برای حساب شما دریافت شد.</p>
              <p>برای تنظیم رمز عبور جدید، روی دکمه زیر کلیک کنید:</p>
              <a href="${resetLink}" class="btn">تغییر رمز عبور</a>
              <p class="code">این لینک تا ۱۵ دقیقه پس از ارسال معتبر است.</p>
              <p>اگر این درخواست از طرف شما نبوده، این ایمیل را نادیده بگیرید.</p>
            </div>
            <div class="footer">
              <p>با تشکر، تیم <a href="https://ziboland.co">زیبولند</a></p>
              <p>پشتیبانی: <a href="mailto:support@ziboland.co">support@ziboland.co</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: "لینک بازیابی رمز عبور با موفقیت به ایمیل شما ارسال شد.",
    });
  } catch (error: any) {
    console.error("Forgot password email error:", error);
    return NextResponse.json(
      { error: "خطا در ارسال ایمیل. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}
