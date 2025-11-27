// app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password || password.length < 6) {
      return NextResponse.json({ error: 'داده‌های نامعتبر' }, { status: 400 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'لینک منقضی شده یا نامعتبر است' }, { status: 400 });
    }

    if (decoded.purpose !== 'password-reset') {
      return NextResponse.json({ error: 'توکن نامعتبر' }, { status: 400 });
    }

    // بررسی اینکه توکن قبلاً استفاده نشده (اختیاری اما حرفه‌ای)
    const [used] = await pool.query('SELECT 1 FROM verification_codes WHERE code = ? AND used = 1', [token]);
    if ((used as any[]).length > 0) {
      return NextResponse.json({ error: 'این لینک قبلاً استفاده شده' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [password_hash, decoded.userId]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
    }

    // علامت‌گذاری توکن به عنوان استفاده شده
    await pool.query(
      'INSERT INTO verification_codes (user_id, email, code, used, expires_at) VALUES (?, ?, ?, 1, NOW()) ON DUPLICATE KEY UPDATE used = 1',
      [decoded.userId, 'reset@used', token]
    );

    return NextResponse.json({ message: 'رمز عبور با موفقیت تغییر کرد' });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'لینک منقضی شده یا نامعتبر است' }, { status: 400 });
  }
}