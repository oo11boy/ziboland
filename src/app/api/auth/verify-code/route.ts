// app/api/auth/verify-code/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'ایمیل و کد الزامی هستند' }, { status: 400 });
    }

    const [rows] = await pool.query(
      `SELECT vc.*, u.id as userId FROM verification_codes vc 
       JOIN users u ON vc.user_id = u.id 
       WHERE vc.email = ? AND vc.code = ? AND vc.used = 0 AND vc.expires_at > NOW()
       ORDER BY vc.id DESC LIMIT 1`,
      [email, code]
    );

    const verification = (rows as any[])[0];

    if (!verification) {
      return NextResponse.json({ error: 'کد نامعتبر یا منقضی شده است' }, { status: 400 });
    }

    // فعال‌سازی کاربر
    await pool.query('UPDATE users SET is_active = 1 WHERE id = ?', [verification.userId]);
    await pool.query('UPDATE verification_codes SET used = 1 WHERE id = ?', [verification.id]);

    return NextResponse.json({ message: 'حساب شما با موفقیت فعال شد. حالا می‌توانید وارد شوید.' });

  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json({ error: 'خطای سرور' }, { status: 500 });
  }
}