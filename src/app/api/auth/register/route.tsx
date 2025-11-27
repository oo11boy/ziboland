// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GOOGLE_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { username, password, email, phone_number, first_name, last_name } = await request.json();

    // اعتبارسنجی
    if (!username || !password || !email || !first_name || !last_name) {
      return NextResponse.json({ error: 'فیلدهای الزامی پر نشده‌اند' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'رمز عبور باید حداقل ۶ کاراکتر باشد' }, { status: 400 });
    }

    // بررسی تکراری بودن
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if ((existing as any[]).length > 0) {
      return NextResponse.json({ error: 'ایمیل یا نام کاربری قبلاً استفاده شده' }, { status: 400 });
    }

    // ایجاد کاربر با وضعیت غیرفعال (تا تأیید ایمیل)
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      `INSERT INTO users 
       (username, password_hash, email, phone_number, first_name, last_name, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [username, password_hash, email, phone_number || null, first_name, last_name]
    );

    const userId = (result as any).insertId;

    // تولید کد ۶ رقمی
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // ذخیره کد در دیتابیس (معتبر برای ۱۰ دقیقه)
    await pool.query(
      `INSERT INTO verification_codes (user_id, email, code, expires_at) 
       VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
      [userId, email, verificationCode]
    );

    // ارسال ایمیل تأیید
    await transporter.sendMail({
      from: `"زیبولند" <${process.env.GOOGLE_EMAIL}>`,
      to: email,
      subject: 'کد تأیید ثبت‌نام در زیبولند',
      html: `
        <!DOCTYPE html>
        <html dir="rtl" lang="fa">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Tahoma, sans-serif; background:#f8f9fa; padding:20px; }
            .container { max-width: 580px; margin: auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #805B99, #a078b8); padding: 30px; text-align: center; color: white; }
            .content { padding: 40px 30px; text-align: center; }
            .code { font-size: 36px; font-weight: bold; color: #805B99; letter-spacing: 8px; margin: 25px 0; background: #f5e8ff; padding: 15px; border-radius: 12px; }
            .btn { background: #805B99; color: white; padding: 14px 32px; border-radius: 50px; text-decoration: none; display: inline-block; margin: 20px 0; font-weight: bold; }
            .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 13px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>خوش آمدید به زیبولند</h1>
            </div>
            <div class="content">
              <p>سلام <strong>${first_name}</strong> عزیز،</p>
              <p>ثبت‌نام شما با موفقیت انجام شد.</p>
              <p>برای فعال‌سازی حساب، کد زیر را وارد کنید:</p>
              <div class="code">${verificationCode}</div>
              <p>این کد تا <strong>۱۰ دقیقه</strong> دیگر معتبر است.</p>
            </div>
            <div class="footer">
              <p>تیم زیبولند | <a href="https://ziboland.co">ziboland.co</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({
      message: 'ثبت‌نام موفق! کد تأیید به ایمیل شما ارسال شد.',
      requireVerification: true,
      email: email
    }, { status: 201 });

  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.' }, { status: 500 });
  }
}