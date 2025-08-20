import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Product, ProductRow } from '@/types/types';

export async function GET() {
  try {
  const [rows] = await pool.query<ProductRow[]>(`
  SELECT 
    p.id AS product_id, p.title, p.image, p.originalPrice, p.discountedPrice, 
    p.wholesalePrice, p.discountwholesalePrice, p.minwholesale, p.discount, 
    p.discountwholesale, p.category, p.mothercatId, p.subcatId, p.rating, 
    p.inStock, p.numericPrice, p.sales, p.features, p.content,
    m.type AS media_type, m.src AS media_src, m.thumbnail AS media_thumbnail, m.alt AS media_alt,
    col.englishName, col.persianName, col.hexCode,
    it.id AS infotable_id, it.name AS infotable_name, it.value AS infotable_value,
    com.id AS comment_id, com.name AS comment_name, com.rating AS comment_rating, 
    com.text AS comment_text, com.date AS comment_date,
    b.id AS brand_id, b.img AS brand_img, b.link AS brand_link
  FROM products p
  LEFT JOIN media m ON p.id = m.product_id
  LEFT JOIN colors col ON p.id = col.product_id
  LEFT JOIN infotable it ON p.id = it.product_id
  LEFT JOIN comments com ON p.id = com.product_id
  LEFT JOIN brands b ON p.brand_id = b.id
  ORDER BY p.id, m.id, col.id, it.id, com.id, b.id
`);


    const productsMap: Record<number, Product> = {};

    rows.forEach((row) => {
      const pid = row.product_id;

      if (!productsMap[pid]) {
        productsMap[pid] = {
          id: pid,
          title: row.title,
          image: row.image,
          originalPrice: row.originalPrice,
          discountedPrice: row.discountedPrice,
          wholesalePrice: row.wholesalePrice,
          discountwholesalePrice: row.discountwholesalePrice,
          minwholesale: row.minwholesale,
          discount: row.discount,
          discountwholesale: row.discountwholesale,
          category: row.category,
          mothercatId: row.mothercatId,
          subcatId: row.subcatId,
          rating: row.rating,
          inStock: row.inStock,
          numericPrice: row.numericPrice,
          sales: row.sales,
          features: row.features ? JSON.parse(row.features) : undefined,
          content: row.content ?? undefined,
          media: [],
          colors: [],
          infotable: [],
          comments: [],
          brandDetails: row.brand_id
            ? {
                id: row.brand_id,
                img: row.brand_img ?? '',
                link: row.brand_link ?? '',
              }
            : undefined,
        };
      }

      if (row.media_type && row.media_src &&
        !productsMap[pid].media!.some(m => m.src === row.media_src)) {
        productsMap[pid].media!.push({
          type: row.media_type,
          src: row.media_src,
          thumbnail: row.media_thumbnail ?? '',
          alt: row.media_alt ?? '',
        });
      }

      if (row.englishName && row.hexCode &&
        !productsMap[pid].colors!.some(c => c.hexCode === row.hexCode)) {
        productsMap[pid].colors!.push({
          englishName: row.englishName,
          persianName: row.persianName ?? '',
          hexCode: row.hexCode,
        });
      }

      if (row.infotable_id &&
        !productsMap[pid].infotable!.some(it => it.id === row.infotable_id)) {
        productsMap[pid].infotable!.push({
          id: row.infotable_id,
          name: row.infotable_name ?? '',
          value: row.infotable_value ?? '',
        });
      }

      if (row.comment_id &&
        !productsMap[pid].comments!.some(c => c.id === row.comment_id)) {
        productsMap[pid].comments!.push({
          id: row.comment_id,
          name: row.comment_name ?? '',
          rating: row.comment_rating ?? 0,
          text: row.comment_text ?? '',
          date: row.comment_date ?? '',
        });
      }
    });

    return NextResponse.json(Object.values(productsMap));
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
