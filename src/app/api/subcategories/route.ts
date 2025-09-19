// app/api/subcategories/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Subcategory, RowDataPacket } from '@/types/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category_id');
  const subcatId = searchParams.get('id');

  try {
    let query = `
      SELECT 
        sc.id, sc.category_id, sc.name,
        sci.id AS item_id, sci.name AS item_name
      FROM subcategories sc
      LEFT JOIN subcategory_items sci ON sc.id = sci.subcategory_id
    `;
    const queryParams: (number | undefined)[] = [];

    const conditions: string[] = [];
    if (categoryId !== null) {
      if (isNaN(parseInt(categoryId))) {
        return NextResponse.json({ error: 'Invalid category_id' }, { status: 400 });
      }
      conditions.push('sc.category_id = ?');
      queryParams.push(parseInt(categoryId));
    }
    if (subcatId !== null) {
      if (isNaN(parseInt(subcatId))) {
        return NextResponse.json({ error: 'Invalid subcategory ID' }, { status: 400 });
      }
      conditions.push('sc.id = ?');
      queryParams.push(parseInt(subcatId));
    }
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY sc.id, sci.id";

    const [rows] = await pool.query<RowDataPacket[]>(query, queryParams);

    const subcatsMap: Record<number, Subcategory> = {};
    const itemIds = new Set<number>();

    rows.forEach((row) => {
      const scId = row.id;

      if (!subcatsMap[scId]) {
        subcatsMap[scId] = {
          id: scId,
          category_id: row.category_id,
          name: row.name,
          items: [],
        };
      }

      if (row.item_id && !itemIds.has(row.item_id)) {
        subcatsMap[scId].items.push({
          id: row.item_id,
          name: row.item_name ?? "",
        });
        itemIds.add(row.item_id);
      }
    });

    const subcategories = Object.values(subcatsMap);
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

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { category_id, name } = data;

    if (!category_id || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate category_id
    const [catRows] = await pool.query<RowDataPacket[]>('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (catRows.length === 0) {
      return NextResponse.json({ error: 'Invalid category_id' }, { status: 400 });
    }

    const [result] = await pool.query(
      'INSERT INTO subcategories (category_id, name) VALUES (?, ?)',
      [category_id, name]
    );

    return NextResponse.json({ id: (result as any).insertId }, { status: 201 });
  } catch (error) {
    console.error('Error adding subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to add subcategory', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const subcatId = parseInt(params.id);
  if (isNaN(subcatId)) {
    return NextResponse.json({ error: 'Invalid subcategory ID' }, { status: 400 });
  }

  try {
    const data = await request.json();
    const { category_id, name } = data;

    if (!category_id || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate category_id
    const [catRows] = await pool.query<RowDataPacket[]>('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (catRows.length === 0) {
      return NextResponse.json({ error: 'Invalid category_id' }, { status: 400 });
    }

    const [result] = await pool.query(
      'UPDATE subcategories SET category_id = ?, name = ? WHERE id = ?',
      [category_id, name, subcatId]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Subcategory updated successfully' });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to update subcategory', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const subcatId = parseInt(params.id);
  if (isNaN(subcatId)) {
    return NextResponse.json({ error: 'Invalid subcategory ID' }, { status: 400 });
  }

  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Delete related items
      await connection.query('DELETE FROM subcategory_items WHERE subcategory_id = ?', [subcatId]);

      // Delete subcategory
      const [result] = await connection.query('DELETE FROM subcategories WHERE id = ?', [subcatId]);

      if ((result as any).affectedRows === 0) {
        throw new Error('Subcategory not found');
      }

      await connection.commit();
      return NextResponse.json({ message: 'Subcategory deleted successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json(
      { error: 'Failed to delete subcategory', details: (error as Error).message },
      { status: 500 }
    );
  }
}