import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { username, password, email, phone_number, first_name, last_name } = data;

    if (!username || !password || !email || !first_name || !last_name) {
      return NextResponse.json({ error: 'فیلدهای الزامی پر نشده‌اند' }, { status: 400 });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if ((existing as any[]).length > 0) {
      return NextResponse.json({ error: 'کاربر قبلاً ثبت‌نام کرده است' }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash, email, phone_number, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
      [username, password_hash, email, phone_number, first_name, last_name]
    );

    const userId = (result as any).insertId;

    return NextResponse.json({ id: userId, message: 'ثبت‌نام با موفقیت انجام شد' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'خطا در ثبت‌نام' }, { status: 500 });
  }
}