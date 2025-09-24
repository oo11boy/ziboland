import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import * as jose from 'jose';
import { RowDataPacket } from 'mysql2/promise';

interface NotificationRow extends RowDataPacket {
  id: number;
  type: 'comment' | 'ticket' | 'order';
  message: string;
  created_at: string;
  read: number;
  related_id: number | null;
  related_data: string | null;
}

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    console.log('GET /api/notifications: No token provided');
    return NextResponse.json({ error: 'لطفاً توکن را ارائه دهید' }, { status: 401 });
  }

  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    console.error('GET /api/notifications: JWT_SECRET is not set');
    return NextResponse.json({ error: 'خطای سرور: تنظیمات نادرست' }, { status: 500 });
  }

  let userRole;
  try {
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jose.jwtVerify(token, secret);
    userRole = payload.role;
    if (userRole !== 'admin') {
      console.log('GET /api/notifications: Unauthorized access, role:', userRole);
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }
  } catch (error: any) {
    console.error('GET /api/notifications: JWT verification error:', error.message);
    return NextResponse.json({ error: 'توکن نامعتبر است', details: error.message }, { status: 401 });
  }

  try {
    const [rows] = await pool.query<NotificationRow[]>(
      `SELECT n.*, 
              CASE 
                WHEN n.type = 'order' THEN o.order_code
                WHEN n.type = 'comment' THEN p.title
                WHEN n.type = 'ticket' THEN t.subject
                ELSE NULL
              END AS related_data
       FROM notifications n
       LEFT JOIN orders o ON n.related_id = o.id AND n.type = 'order'
       LEFT JOIN products p ON n.related_id = p.id AND n.type = 'comment'
       LEFT JOIN tickets t ON n.related_id = t.id AND n.type = 'ticket'
       ORDER BY n.created_at DESC`
    );
    const notifications = rows.map((row) => ({
      id: row.id,
      type: row.type,
      message: row.message,
      created_at: row.created_at,
      read: !!row.read,
      related_id: row.related_id,
      related_data: row.related_data,
    }));
    console.log('GET /api/notifications: Fetched notifications:', notifications);
    return NextResponse.json(notifications);
  } catch (error: any) {
    console.error('GET /api/notifications: Error fetching notifications:', error.message);
    return NextResponse.json({ error: 'Failed to fetch notifications', details: error.message }, { status: 500 });
  }
}