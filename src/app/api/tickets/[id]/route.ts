import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';
import jwt from 'jsonwebtoken';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params; // Await params for Next.js 14+
  try {
    const ticketId = parseInt(params.id);
    if (isNaN(ticketId)) {
      console.log(`GET /api/tickets/${params.id}: Invalid ticket ID`);
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log(`GET /api/tickets/${ticketId}: No token provided`);
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    let decoded: { userId: number; role: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; role: string };
      if (!decoded.userId) {
        console.log(`GET /api/tickets/${ticketId}: Invalid token: User ID missing`);
        return NextResponse.json({ error: 'Invalid token: User ID missing' }, { status: 401 });
      }
    } catch (err) {
      console.error(`GET /api/tickets/${ticketId}: JWT verification error:`, err);
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
      console.log(`GET /api/tickets/${ticketId}: Ticket not found`);
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    console.log(`GET /api/tickets/${ticketId}: Ticket fetched successfully`);
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error(`GET /api/tickets/${params.id}: Error fetching ticket:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch ticket', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params; // Await params for Next.js 14+
  try {
    const ticketId = parseInt(params.id); // Define ticketId here
    if (isNaN(ticketId)) {
      console.log(`PUT /api/tickets/${params.id}: Invalid ticket ID`);
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log(`PUT /api/tickets/${ticketId}: No token provided`);
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    let decoded: { userId: number; role: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; role: string };
      if (!decoded.userId) {
        console.log(`PUT /api/tickets/${ticketId}: Invalid token: User ID missing`);
        return NextResponse.json({ error: 'Invalid token: User ID missing' }, { status: 401 });
      }
    } catch (err) {
      console.error(`PUT /api/tickets/${ticketId}: JWT verification error:`, err);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const data = await request.json();
    const { status, response, user_id } = data;

    if (decoded.role !== 'admin' && (response || user_id)) {
      console.log(`PUT /api/tickets/${ticketId}: Unauthorized attempt to modify response or user_id`);
      return NextResponse.json(
        { error: 'Only admins can respond to tickets or change user_id' },
        { status: 403 }
      );
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
    if (user_id && decoded.role === 'admin') {
      // Validate user_id exists
      const [userCheck] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM users WHERE id = ?',
        [user_id]
      );
      if (userCheck.length === 0) {
        console.log(`PUT /api/tickets/${ticketId}: Invalid user_id ${user_id}`);
        return NextResponse.json({ error: 'Invalid user_id: User not found' }, { status: 400 });
      }
      updates.push('user_id = ?');
      values.push(user_id);
    }

    if (updates.length === 0) {
      console.log(`PUT /api/tickets/${ticketId}: No valid fields to update`);
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    values.push(ticketId);
    let query = `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`;
    if (decoded.role !== 'admin') {
      query += ' AND user_id = ?';
      values.push(decoded.userId);
    }

    const [result] = await pool.query(query, values);

    if ((result as any).affectedRows === 0) {
      console.log(`PUT /api/tickets/${ticketId}: Ticket not found or unauthorized`);
      return NextResponse.json({ error: 'Ticket not found or unauthorized' }, { status: 404 });
    }

    // Create notification for status change
    if (status) {
      const notificationMessage = `تیکت #${ticketId} به وضعیت "${status}" تغییر کرد`;
      await pool.query(
        'INSERT INTO notifications (type, message, related_id, `read`) VALUES (?, ?, ?, ?)',
        ['ticket', notificationMessage, ticketId, 0]
      );
      console.log(`PUT /api/tickets/${ticketId}: Notification created for status change`);
    }

    console.log(`PUT /api/tickets/${ticketId}: Ticket updated successfully`);
    return NextResponse.json({ message: 'Ticket updated successfully' });
  } catch (error: any) {
    console.error(`PUT /api/tickets/${params.id}: Error updating ticket:`, error.message);
    return NextResponse.json(
      { error: 'Failed to update ticket', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params; // Await params for Next.js 14+
  try {
    const ticketId = parseInt(params.id); // Define ticketId here
    if (isNaN(ticketId)) {
      console.log(`DELETE /api/tickets/${params.id}: Invalid ticket ID`);
      return NextResponse.json({ error: 'Invalid ticket ID' }, { status: 400 });
    }

    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      console.log(`DELETE /api/tickets/${ticketId}: No token provided`);
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    let decoded: { userId: number; role: string };
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number; role: string };
      if (!decoded.userId) {
        console.log(`DELETE /api/tickets/${ticketId}: Invalid token: User ID missing`);
        return NextResponse.json({ error: 'Invalid token: User ID missing' }, { status: 401 });
      }
    } catch (err) {
      console.error(`DELETE /api/tickets/${ticketId}: JWT verification error:`, err);
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
      console.log(`DELETE /api/tickets/${ticketId}: Ticket not found or unauthorized`);
      return NextResponse.json({ error: 'Ticket not found or unauthorized' }, { status: 404 });
    }

    console.log(`DELETE /api/tickets/${ticketId}: Ticket deleted successfully`);
    return NextResponse.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error(`DELETE /api/tickets/${params.id}: Error deleting ticket:`, error);
    return NextResponse.json(
      { error: 'Failed to delete ticket', details: (error as Error).message },
      { status: 500 }
    );
  }
}