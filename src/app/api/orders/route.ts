// api/orders/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '@/lib/db';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key';
async function verifyToken(req: Request) {
  const token = (await cookies()).get('authToken')?.value;
  if (!token) throw new Error('Unauthorized');
  return jwt.verify(token, SECRET_KEY) as { userId: number };
}


export async function GET(request: Request) {
  try {
    const { userId } = await verifyToken(request);
    const [rows] = await pool.query(`
      SELECT o.id, o.date, o.total, o.status, p.title as product_name, p.image as product_image, p.content as product_details
      FROM orders o
      JOIN products p ON o.product_id = p.id
      WHERE o.user_id = ?
    `, [userId]);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized or failed to fetch orders' }, { status: 401 });
  }
}