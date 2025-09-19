// app/api/comments/[id]/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  try {
    const { status } = await request.json();
    const [result] = await pool.query('UPDATE comments SET status = ? WHERE id = ? AND is_admin = 0', [status ? 1 : 0, id]);
    if ((result as any).affectedRows === 0) return NextResponse.json({ error: 'Comment not found or is admin reply' }, { status: 404 });
    return NextResponse.json({ message: 'Status updated' });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await deleteCommentTree(connection, id);
    await connection.commit();
    return NextResponse.json({ message: 'Comment deleted' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  } finally {
    connection.release();
  }
}

async function deleteCommentTree(connection: any, commentId: number) {
  const [children] = await connection.query('SELECT id FROM comments WHERE parent_id = ?', [commentId]);
  for (const child of children) {
    await deleteCommentTree(connection, child.id);
  }
  await connection.query('DELETE FROM comments WHERE id = ?', [commentId]);
}