import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import * as jose from 'jose';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params; // Await params to resolve the Promise
  const id = params.id;
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    console.log(`PUT /api/notifications/${id}: No token provided`);
    return NextResponse.json({ error: 'لطفاً توکن را ارائه دهید' }, { status: 401 });
  }

  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    console.error(`PUT /api/notifications/${id}: JWT_SECRET is not set`);
    return NextResponse.json({ error: 'خطای سرور: تنظیمات نادرست' }, { status: 500 });
  }

  let userRole;
  try {
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jose.jwtVerify(token, secret);
    userRole = payload.role;
    if (userRole !== 'admin') {
      console.log(`PUT /api/notifications/${id}: Unauthorized access, role: ${userRole}`);
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }
  } catch (error: any) {
    console.error(`PUT /api/notifications/${id}: JWT verification error:`, error.message);
    return NextResponse.json({ error: 'توکن نامعتبر است', details: error.message }, { status: 401 });
  }

  try {
    const [result] = await pool.query(
      'UPDATE notifications SET `read` = 1 WHERE id = ?', // Escape `read` as it's a reserved keyword
      [id]
    );
    if ((result as any).affectedRows === 0) {
      console.log(`PUT /api/notifications/${id}: Notification not found`);
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }
    console.log(`PUT /api/notifications/${id}: Notification marked as read`);
    return NextResponse.json({ message: 'Notification marked as read' }, { status: 200 });
  } catch (error: any) {
    console.error(`PUT /api/notifications/${id}: Error marking notification as read:`, error.message);
    return NextResponse.json({ error: 'Failed to mark notification as read', details: error.message }, { status: 500 });
  }
}