import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || '';
    const { userId } = verifyToken(token);
    const data = await request.json();
    const { first_name, last_name, phone_number, province, city, street, alley, building_number, unit, postal_code, extra_details, is_default } = data;

    if (!first_name || !last_name || !phone_number || !province || !city || !street || !postal_code) {
      return NextResponse.json({ error: 'فیلدهای الزامی پر نشده‌اند' }, { status: 400 });
    }

    if (is_default) {
      await pool.query('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }

    const [result] = await pool.query(
      'UPDATE addresses SET first_name = ?, last_name = ?, phone_number = ?, province = ?, city = ?, street = ?, alley = ?, building_number = ?, unit = ?, postal_code = ?, extra_details = ?, is_default = ? WHERE id = ? AND user_id = ?',
      [first_name, last_name, phone_number, province, city, street, alley || null, building_number || null, unit || null, postal_code, extra_details || null, is_default ? 1 : 0, params.id, userId]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'آدرس یافت نشد' }, { status: 404 });
    }

    return NextResponse.json({ message: 'آدرس با موفقیت به‌روزرسانی شد' });
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json({ error: 'خطا در به‌روزرسانی آدرس' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || '';
    const { userId } = verifyToken(token);

    const [result] = await pool.query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [params.id, userId]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'آدرس یافت نشد' }, { status: 404 });
    }

    return NextResponse.json({ message: 'آدرس با موفقیت حذف شد' });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json({ error: 'خطا در حذف آدرس' }, { status: 500 });
  }
}