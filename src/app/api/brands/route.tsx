// api/brands/route.ts (add POST to existing GET)

import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Brand } from '@/types/types';
import { RowDataPacket } from 'mysql2/promise';

// Existing GET
export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT id, title, img, link
      FROM brands
      ORDER BY id
    `);

    const brands: Brand[] = rows.map(row => ({
      id: row.id,
      title: row.title,
      img: row.img,
      link: row.link,
    }));

    if (brands.length === 0) {
      return NextResponse.json({ error: 'No brands found' }, { status: 404 });
    }

    return NextResponse.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// New POST
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { title, img, link } = data;

    // Validate required fields
    if (!title || !img || !link) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [result] = await pool.query(
      'INSERT INTO brands (title, img, link) VALUES (?, ?, ?)',
      [title, img, link]
    );

    const brandId = (result as any).insertId;

    return NextResponse.json({ id: brandId }, { status: 201 });
  } catch (error) {
    console.error('Error adding brand:', error);
    return NextResponse.json(
      { error: 'Failed to add brand', details: (error as Error).message },
      { status: 500 }
    );
  }
}