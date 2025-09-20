// api/brands/[id]/route.ts

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Brand } from '@/types/types';
import { RowDataPacket } from 'mysql2/promise';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const brandId = parseInt(params.id);
  if (isNaN(brandId)) {
    return NextResponse.json({ error: 'Invalid brand ID' }, { status: 400 });
  }

  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, title, img, link FROM brands WHERE id = ?',
      [brandId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const brand: Brand = {
      id: rows[0].id,
      title: rows[0].title,
      img: rows[0].img,
      link: rows[0].link,
    };

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const brandId = parseInt(params.id);
  if (isNaN(brandId)) {
    return NextResponse.json({ error: 'Invalid brand ID' }, { status: 400 });
  }

  try {
    const data = await request.json();
    const { title, img, link } = data;

    // Validate required fields
    if (!title || !img || !link) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [result] = await pool.query(
      'UPDATE brands SET title = ?, img = ?, link = ? WHERE id = ?',
      [title, img, link, brandId]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Brand updated successfully' });
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json(
      { error: 'Failed to update brand', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const brandId = parseInt(params.id);
  if (isNaN(brandId)) {
    return NextResponse.json({ error: 'Invalid brand ID' }, { status: 400 });
  }

  try {
    const [result] = await pool.query('DELETE FROM brands WHERE id = ?', [brandId]);

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json(
      { error: 'Failed to delete brand', details: (error as Error).message },
      { status: 500 }
    );
  }
}