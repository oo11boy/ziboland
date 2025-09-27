import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || '';
    const { userId } = verifyToken(token);
    const [rows] = await pool.query('SELECT * FROM addresses WHERE user_id = ?', [userId]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json({ error: 'احراز هویت ناموفق یا خطا در دریافت آدرس‌ها' }, { status: 401 });
  }
}
export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || '';
    const { userId } = verifyToken(token);
    const data = await request.json();
    console.log('Received data:', data); // لاگ کردن داده‌های دریافتی

    const { first_name, last_name, phone_number, province, city, street, alley, building_number, unit, postal_code, extra_details, is_default } = data;

    // اعتبارسنجی دقیق‌تر
    const missingFields = [];
    if (!first_name) missingFields.push('first_name');
    if (!last_name) missingFields.push('last_name');
    if (!phone_number) missingFields.push('phone_number');
    if (!province) missingFields.push('province');
    if (!city) missingFields.push('city');
    if (!street) missingFields.push('street');
    if (!postal_code) missingFields.push('postal_code');

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `فیلدهای الزامی پر نشده‌اند: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // اعتبارسنجی فرمت شماره تلفن و کدپستی
    if (!/^\d{11}$/.test(phone_number)) {
      return NextResponse.json({ error: 'شماره تلفن باید 11 رقم باشد' }, { status: 400 });
    }
    if (!/^\d{10}$/.test(postal_code)) {
      return NextResponse.json({ error: 'کدپستی باید 10 رقم باشد' }, { status: 400 });
    }

    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }

    const [result] = await pool.query(
      'INSERT INTO addresses (user_id, first_name, last_name, phone_number, province, city, street, alley, building_number, unit, postal_code, extra_details, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, first_name, last_name, phone_number, province, city, street, alley || null, building_number || null, unit || null, postal_code, extra_details || null, is_default ? 1 : 0]
    );

    return NextResponse.json({ id: (result as any).insertId, message: 'آدرس با موفقیت اضافه شد' }, { status: 201 });
  } catch (error) {
    console.error('Error adding address:', error);
    return NextResponse.json({ error: 'خطا در افزودن آدرس' }, { status: 500 });
  }
}