import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';
import jwt from 'jsonwebtoken';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const ticketId = parseInt(params.id);
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

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

    let query = 'SELECT * FROM tickets WHERE id = ?';
    let queryParams: any[] = [ticketId];

    if (decoded.role !== 'admin') {
      query += ' AND user_id = ?';
      queryParams.push(decoded.userId);
    }

    const [rows] = await pool.query<RowDataPacket[]>(query, queryParams);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const ticketId = parseInt(params.id);
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

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

    const data = await request.json();
    const { status, response } = data;

    if (decoded.role !== 'admin' && response) {
      return NextResponse.json({ error: 'Only admins can respond to tickets' }, { status: 403 });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (status) {
      updates.push('status = ?');
      values.push(status);
    }
    if (response && decoded.role === 'admin') {
      updates.push('response = ?, admin_id = ?');
      values.push(response, decoded.userId);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    values.push(ticketId);
    if (decoded.role !== 'admin') {
      updates.push('user_id = ?');
      values.push(decoded.userId);
    }

    const query = `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await pool.query(query, values);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'Ticket not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Ticket updated successfully' });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update ticket', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const ticketId = parseInt(params.id);
    if (isNaN(ticketId)) {
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

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

    let query = 'DELETE FROM tickets WHERE id = ?';
    let queryParams: any[] = [ticketId];

    if (decoded.role !== 'admin') {
      query += ' AND user_id = ?';
      queryParams.push(decoded.userId);
    }

    const [result] = await pool.query(query, queryParams);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'Ticket not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json(
      { error: 'Failed to delete ticket', details: (error as Error).message },
      { status: 500 }
    );
  }
}