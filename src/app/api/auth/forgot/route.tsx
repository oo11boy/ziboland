import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email } = data;

    if (!email) {
      return NextResponse.json({ error: 'ایمیل الزامی است' }, { status: 400 });
    }

    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if ((rows as any[]).length === 0) {
      return NextResponse.json({ error: 'کاربر یافت نشد' }, { status: 404 });
    }

    // Simulate sending reset link (in production, integrate with email service)
    console.log(`لینک بازیابی رمز عبور برای ${email} ارسال شد`);
    return NextResponse.json({ message: 'لینک بازیابی ارسال شد' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'خطا در ارسال لینک بازیابی' }, { status: 500 });
  }
}