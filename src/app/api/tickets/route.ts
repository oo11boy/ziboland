import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { Ticket } from '@/types/types';

interface TicketRow extends RowDataPacket {
  id: number;
  user_id: number;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  response: string | null;
  admin_id: number | null;
}

export async function GET(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    let decoded: { userId: number; role: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; role: string };
      if (!decoded.userId) {
        return NextResponse.json({ error: 'Invalid token: User ID missing' }, { status: 401 });
      }
    } catch (err) {
      console.error('JWT verification error:', err);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    let query = '';
    let queryParams: any[] = [];

    if (decoded.role === 'admin') {
      query = 'SELECT * FROM tickets ORDER BY created_at DESC';
    } else {
      query = 'SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC';
      queryParams = [decoded.userId];
    }

    const [rows] = await pool.query<TicketRow[]>(query, queryParams);
    const tickets: Ticket[] = rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      subject: row.subject,
      message: row.message,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      response: row.response,
      admin_id: row.admin_id
    }));

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    let decoded: { userId: number };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
      if (!decoded.userId) {
        return NextResponse.json({ error: 'Invalid token: User ID missing' }, { status: 401 });
      }
    } catch (err) {
      console.error('JWT verification error:', err);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const data = await request.json();
    const { subject, message } = data;

    if (!subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [result] = await pool.query(
      'INSERT INTO tickets (user_id, subject, message) VALUES (?, ?, ?)',
      [decoded.userId, subject, message]
    );

    const ticketId = (result as any).insertId;
    return NextResponse.json({ id: ticketId }, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to create ticket', details: (error as Error).message },
      { status: 500 }
    );
  }
}