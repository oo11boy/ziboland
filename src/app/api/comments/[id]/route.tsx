// app/api/comments/[id]/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  try {
    const { status, admin_reply } = await request.json();
    const updates: any = {};
    if (typeof status !== 'undefined') updates.status = status ? 1 : 0;
    if (admin_reply) updates.admin_reply = admin_reply;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 });
    }

    const [result] = await pool.query('UPDATE comments SET ? WHERE id = ?', [updates, id]);
    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Comment updated' });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json({ error: 'Failed to update', details: (error as Error).message }, { status: 500 });
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
    return NextResponse.json({ message: 'Comment and replies deleted' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting comment:', error);
    return NextResponse.json({ error: 'Failed to delete', details: (error as Error).message }, { status: 500 });
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