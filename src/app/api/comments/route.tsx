import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

interface CommentRow extends RowDataPacket {
  id: number;
  product_id: number;
  name: string;
  rating: number | null;
  text: string;
  admin_reply: string | null;
  date: string;
  status: number;
  parent_id: number | null;
  is_admin: number;
  product_title: string;
}

export async function GET() {
  try {
    const [rows] = await pool.query<CommentRow[]>(
      'SELECT c.*, p.title as product_title FROM comments c LEFT JOIN products p ON c.product_id = p.id ORDER BY c.date DESC'
    );
    const comments = rows.map((row) => ({
      id: row.id,
      product_id: row.product_id,
      name: row.name,
      rating: row.rating,
      text: row.text,
      admin_reply: row.admin_reply,
      date: row.date,
      status: !!row.status,
      parent_id: row.parent_id || null,
      is_admin: !!row.is_admin,
      product_title: row.product_title || 'نامشخص',
    }));
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments', details: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { product_id, parent_id, name, rating, text, status, is_admin } = await request.json();
    if (!product_id || !text || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate product exists
    const [prodRows] = await conn.query<RowDataPacket[]>('SELECT id, title FROM products WHERE id = ?', [product_id]);
    if (prodRows.length === 0) {
      return NextResponse.json({ error: 'Invalid product_id' }, { status: 400 });
    }

    // Validate parent if exists
    if (parent_id) {
      const [parentRows] = await conn.query<RowDataPacket[]>('SELECT id FROM comments WHERE id = ? AND product_id = ?', [parent_id, product_id]);
      if (parentRows.length === 0) {
        return NextResponse.json({ error: 'Invalid parent_id' }, { status: 400 });
      }
    }

    const [result] = await conn.query(
      'INSERT INTO comments (product_id, name, rating, text, status, parent_id, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [product_id, name, rating || null, text, status || 0, parent_id || null, is_admin || 0]
    );

    const commentId = (result as any).insertId;
    const productTitle = prodRows[0].title;
    const notificationMessage = `کامنت جدید برای محصول "${productTitle}" ثبت شد`;

    await conn.query(
      'INSERT INTO notifications (type, message, related_id) VALUES (?, ?, ?)',
      ['comment', notificationMessage, product_id]
    );

    await conn.commit();
    return NextResponse.json({ id: commentId }, { status: 201 });
  } catch (error) {
    await conn.rollback();
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Failed to add comment', details: (error as Error).message }, { status: 500 });
  } finally {
    conn.release();
  }
}