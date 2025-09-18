
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Subcategory } from '@/types/types';
import { RowDataPacket } from 'mysql2/promise';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category_id');

  try {
    if (!categoryId || isNaN(parseInt(categoryId))) {
      return NextResponse.json({ error: 'Invalid or missing category_id' }, { status: 400 });
    }

    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT id, category_id, name
      FROM subcategories
      WHERE category_id = ?
      ORDER BY id
    `, [parseInt(categoryId)]);

    const subcategories: Subcategory[] = rows.map(row => ({
      id: row.id,
      category_id: row.category_id,
      name: row.name,
    }));

    if (subcategories.length === 0) {
      return NextResponse.json({ error: 'No subcategories found' }, { status: 404 });
    }

    return NextResponse.json(subcategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subcategories', details: (error as Error).message },
      { status: 500 }
    );
  }
}