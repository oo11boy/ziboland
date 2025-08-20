// src/app/api/comments/[productId]/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { CommentRow } from '@/types/types';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params; 
    const id = Number(productId);
    if (Number.isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const [comments] = await pool.query<CommentRow[]>(
      `SELECT id, name, rating, text, date 
       FROM comments 
       WHERE product_id = ?`,
      [id]
    );

    return NextResponse.json(comments);
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
