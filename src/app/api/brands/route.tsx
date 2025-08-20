
// app/api/brands/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [brands] = await pool.query(`SELECT id, img, link FROM brands`);
    return NextResponse.json(brands);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
