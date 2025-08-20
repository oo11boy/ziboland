import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import {  Categoryapi, CategoryRow } from '@/types/types';

export async function GET() {
  try {
    const [rows] = await pool.query<CategoryRow[]>(`
      SELECT 
        c.id AS cat_id, c.name AS cat_name, c.link, c.mothercat, c.icon,
        sc.id AS subcat_id, sc.name AS subcat_name,
        sci.id AS item_id, sci.name AS item_name
      FROM categories c
      LEFT JOIN subcategories sc ON c.id = sc.category_id
      LEFT JOIN subcategory_items sci ON sc.id = sci.subcategory_id
      ORDER BY c.id, sc.id, sci.id
    `);

    const categoriesMap: Record<number, Categoryapi> = {};

    rows.forEach((row) => {
      const catId = row.cat_id;

      if (!categoriesMap[catId]) {
        categoriesMap[catId] = {
          id: catId,
          name: row.cat_name,
          link: row.link,
          mothercat: row.mothercat,
          icon: row.icon,
          subcat: [],
        };
      }

      if (row.subcat_id && !categoriesMap[catId].subcat.some(sc => sc.id === row.subcat_id)) {
        categoriesMap[catId].subcat.push({
          id: row.subcat_id,
          name: row.subcat_name ?? '',
          items: [],
        });
      }

      if (row.item_id) {
        const subcat = categoriesMap[catId].subcat.find(sc => sc.id === row.subcat_id);
        if (subcat && !subcat.items.some(item => item.id === row.item_id)) {
          subcat.items.push({
            id: row.item_id,
            name: row.item_name ?? '',
          });
        }
      }
    });

    return NextResponse.json(Object.values(categoriesMap));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
