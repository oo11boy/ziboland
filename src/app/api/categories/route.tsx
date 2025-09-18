import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Categoryapi, CategoryRow } from '@/types/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mothercat = searchParams.get('mothercat');
  const categoryId = searchParams.get('id');

  try {
    let query = `
      SELECT 
        c.id AS cat_id, c.name AS cat_name, c.link, c.mothercat, c.icon,
        sc.id AS subcat_id, sc.name AS subcat_name,
        sci.id AS item_id, sci.name AS item_name
      FROM categories c
      LEFT JOIN subcategories sc ON c.id = sc.category_id
      LEFT JOIN subcategory_items sci ON sc.id = sci.subcategory_id
    `;
    const queryParams: (number | undefined)[] = [];

    // Apply filters
    const conditions: string[] = [];
    if (mothercat !== null) {
      if (isNaN(parseInt(mothercat))) {
        return NextResponse.json({ error: 'Invalid mothercat parameter' }, { status: 400 });
      }
      conditions.push('c.mothercat = ?');
      queryParams.push(parseInt(mothercat));
    }
    if (categoryId !== null) {
      if (isNaN(parseInt(categoryId))) {
        return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
      }
      conditions.push('c.id = ?');
      queryParams.push(parseInt(categoryId));
    }
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY c.id, sc.id, sci.id';

    const [rows] = await pool.query<CategoryRow[]>(query, queryParams);

    const categoriesMap: Record<number, Categoryapi> = {};
    const subcatIds = new Set<number>();
    const itemIds = new Set<number>();

    rows.forEach((row) => {
      const catId = row.cat_id;

      if (!categoriesMap[catId]) {
        if (!row.cat_name || !row.link || !row.icon) {
          console.warn(`Missing required fields for category ID ${catId}`);
          return;
        }
        categoriesMap[catId] = {
          id: catId,
          name: row.cat_name,
          link: row.link,
          mothercat: row.mothercat,
          icon: row.icon,
          subcat: [],
        };
      }

      if (row.subcat_id && !subcatIds.has(row.subcat_id)) {
        categoriesMap[catId].subcat.push({
          id: row.subcat_id,
          name: row.subcat_name ?? '',
          items: [],
        });
        subcatIds.add(row.subcat_id);
      }

      if (row.item_id && !itemIds.has(row.item_id)) {
        const subcat = categoriesMap[catId].subcat.find(sc => sc.id === row.subcat_id);
        if (subcat) {
          subcat.items.push({
            id: row.item_id,
            name: row.item_name ?? '',
          });
          itemIds.add(row.item_id);
        }
      }
    });

    const categories = Object.values(categoriesMap);
    if (categories.length === 0) {
      return NextResponse.json({ error: 'No categories found' }, { status: 404 });
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: (error as Error).message },
      { status: 500 }
    );
  }
}