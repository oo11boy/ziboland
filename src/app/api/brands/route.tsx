
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Brand } from '@/types/types';
import { RowDataPacket } from 'mysql2/promise';

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