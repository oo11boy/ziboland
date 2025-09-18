
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Product, ProductRow } from '@/types/types';
import { RowDataPacket } from 'mysql2/promise';

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
        b.id AS brand_id, b.title AS brand_title, b.img AS brand_img, b.link AS brand_link
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
          brand_id: row.brand_id ?? null,
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
          inStock: !!row.inStock,
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
                title: row.brand_title ?? '',
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

    const products = Object.values(productsMap);
    if (products.length === 0) {
      return NextResponse.json({ error: 'No products found' }, { status: 404 });
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      title, brand_id, image, originalPrice, discountedPrice, wholesalePrice,
      discountwholesalePrice, minwholesale, discount, discountwholesale,
      category, mothercatId, subcatId, rating, inStock, numericPrice, sales,
      features, content, infotable, media
    } = data;

    // Validate required fields
    if (!title || !image || !originalPrice || !discountedPrice ||
        !wholesalePrice || !discountwholesalePrice || !minwholesale ||
        !discount || !discountwholesale || !category || !mothercatId || !subcatId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate infotable entries
    if (infotable && !Array.isArray(infotable)) {
      return NextResponse.json({ error: 'infotable must be an array' }, { status: 400 });
    }
    if (infotable && infotable.some((item: any) => !item.name || !item.value)) {
      return NextResponse.json({ error: 'All infotable entries must have name and value' }, { status: 400 });
    }

    // Validate media entries
    if (media && !Array.isArray(media)) {
      return NextResponse.json({ error: 'media must be an array' }, { status: 400 });
    }
    if (
      media && media.some(
        (item: any) => !item.type || !item.src || !item.alt || !['image', 'video'].includes(item.type)
      )
    ) {
      return NextResponse.json({ error: 'All media entries must have valid type, src, and alt' }, { status: 400 });
    }

    // Validate foreign keys
    if (brand_id) {
      const [brandRows] = await pool.query<RowDataPacket[]>('SELECT id FROM brands WHERE id = ?', [brand_id]);
      if (brandRows.length === 0) {
        return NextResponse.json({ error: 'Invalid brand_id' }, { status: 400 });
      }
    }
    const [categoryRows] = await pool.query<RowDataPacket[]>('SELECT id FROM categories WHERE id = ?', [mothercatId]);
    if (categoryRows.length === 0) {
      return NextResponse.json({ error: 'Invalid mothercatId' }, { status: 400 });
    }
    const [subcatRows] = await pool.query<RowDataPacket[]>('SELECT id FROM subcategories WHERE id = ? AND category_id = ?', [subcatId, mothercatId]);
    if (subcatRows.length === 0) {
      return NextResponse.json({ error: 'Invalid subcatId' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert product
      const [result] = await connection.query(`
        INSERT INTO products (
          brand_id, title, image, originalPrice, discountedPrice, wholesalePrice,
          discountwholesalePrice, minwholesale, discount, discountwholesale,
          category, mothercatId, subcatId, rating, inStock, numericPrice, sales,
          features, content
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        brand_id || null, title, image, originalPrice, discountedPrice, wholesalePrice,
        discountwholesalePrice, minwholesale, discount, discountwholesale,
        category, mothercatId, subcatId, rating, inStock, numericPrice, sales,
        features, content || null
      ]);

      const productId = (result as any).insertId;

      // Insert infotable entries
      if (infotable && infotable.length > 0) {
        for (const item of infotable) {
          await connection.query(
            'INSERT INTO infotable (product_id, name, value) VALUES (?, ?, ?)',
            [productId, item.name, item.value]
          );
        }
      }

      // Insert media entries
      if (media && media.length > 0) {
        for (const item of media) {
          await connection.query(
            'INSERT INTO media (product_id, type, src, thumbnail, alt) VALUES (?, ?, ?, ?, ?)',
            [productId, item.type, item.src, item.thumbnail || null, item.alt]
          );
        }
      }

      await connection.commit();
      return NextResponse.json({ id: productId }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json(
      { error: 'Failed to add product', details: (error as Error).message },
      { status: 500 }
    );
  }
}