import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Brand } from '@/types/types';
import { RowDataPacket } from 'mysql2/promise';

// GET برند با id
export async function GET(request: NextRequest) {
  const idStr = request.nextUrl.pathname.split("/").pop();
  const brandId = parseInt(idStr || "");
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

// PUT بروزرسانی برند
export async function PUT(request: NextRequest) {
  const idStr = request.nextUrl.pathname.split("/").pop();
  const brandId = parseInt(idStr || "");
  if (isNaN(brandId)) {
    return NextResponse.json({ error: 'Invalid brand ID' }, { status: 400 });
  }

  try {
    const data = await request.json();
    const { title, img, link } = data;

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
export async function DELETE(request: NextRequest) {
  const idStr = request.nextUrl.pathname.split("/").pop();
  const brandId = parseInt(idStr || "");

  if (isNaN(brandId)) {
    return NextResponse.json({ error: 'شناسه برند نامعتبر است' }, { status: 400 });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. بررسی اینکه آیا این برند در محصولات استفاده شده؟
    const [usedProducts] = await connection.query<RowDataPacket[]>(
      `
      SELECT p.id, p.title AS product_title
      FROM products p
      WHERE p.brand_id = ?
      ORDER BY p.title
      LIMIT 50
      `,
      [brandId]
    );

    if (usedProducts.length > 0) {
      // ساخت پیام خطای واضح
      let message = `نمی‌توان برند را حذف کرد چون در محصولات زیر استفاده شده است:\n\n`;
      usedProducts.forEach((prod: any, i: number) => {
        message += `${i + 1}. ${prod.product_title}\n`;
      });

      if (usedProducts.length === 50) {
        message += `\n... و ${usedProducts.length - 50} محصول دیگر`;
      }

      message += `\nلطفاً ابتدا این محصولات را ویرایش کنید و برند را تغییر دهید.`;

      await connection.rollback();
      return NextResponse.json(
        {
          error: "حذف ناموفق",
          details: message.trim(),
          conflictedProducts: usedProducts.map((p: any) => ({
            id: p.id,
            title: p.product_title,
          })),
        },
        { status: 400 }
      );
    }

    // 2. حالا امن است: حذف برند
    const [result] = await connection.query(
      'DELETE FROM brands WHERE id = ?',
      [brandId]
    );

    if ((result as any).affectedRows === 0) {
      await connection.rollback();
      return NextResponse.json({ error: 'برند یافت نشد' }, { status: 404 });
    }

    await connection.commit();
    return NextResponse.json({ message: 'برند با موفقیت حذف شد' });
  } catch (error: any) {
    await connection.rollback();
    console.error('خطا در حذف برند:', error);

    // اگر خطای FK بود، پیام واضح بده
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return NextResponse.json(
        {
          error: 'حذف ناموفق',
          details: 'این برند در محصولات استفاده شده است. لطفاً ابتدا محصولات را بررسی کنید.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'خطا در حذف برند', details: error.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}