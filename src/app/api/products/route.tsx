// api/products/index.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

interface Variant {
  id: number;
  color_englishName: string;
  color_persianName: string | null;
  color_hexCode: string;
  price_single: number;
  price_wholesale: number;
  discount_percent: number;
  min_wholesale: number;
  in_stock: boolean;
  stock_quantity: number;
  image_main: string | null;
  images: string[] | null;
  infotable: { name: string; value: string }[] | null;
}

interface Product {
  id: number;
  title: string;
  image: string;
  category: string;
  mothercatId: number;
  subcatId: number;
  itemId: number | null;
  rating: number;
  inStock: boolean;
  sales: number;
  features: string[] | null;
  content: string | null;
  media: { type: string; src: string; thumbnail: string | null; alt: string }[];
  variants: Variant[];
  brandDetails?: {
    id: number;
    title: string;
    img: string;
    link: string;
  };
}

export async function GET() {
  try {
    // ابتدا تمام محصولات و اطلاعات پایه رو می‌گیریم
    const [productRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        p.id AS product_id,
        p.title,
        p.image,
        p.category,
        p.mothercatId,
        p.subcatId,
        p.itemId,
        p.rating,
        p.inStock,
        p.sales,
        p.features,
        p.content,
        m.type AS media_type,
        m.src AS media_src,
        m.thumbnail AS media_thumbnail,
        m.alt AS media_alt,
        b.id AS brand_id,
        b.title AS brand_title,
        b.img AS brand_img,
        b.link AS brand_link
      FROM products p
      LEFT JOIN media m ON p.id = m.product_id
      LEFT JOIN brands b ON p.brand_id = b.id
      ORDER BY p.id, m.id
      `
    );

    // سپس تمام واریانت‌ها رو می‌گیریم (حذف discount_wholesale_percent)
    const [variantRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        pv.id AS variant_id,
        pv.product_id,
        pv.color_englishName,
        pv.color_persianName,
        pv.color_hexCode,
        pv.price_single,
        pv.price_wholesale,
        pv.discount_percent,
        pv.min_wholesale,
        pv.in_stock,
        pv.stock_quantity,
        pv.image_main,
        pv.images,
        pv.infotable
      FROM product_variants pv
      ORDER BY pv.id
      `
    );

    const productsMap: Record<number, Product> = {};

    // ساخت محصولات پایه
    productRows.forEach((row) => {
      const pid = row.product_id;
      if (!productsMap[pid]) {
        productsMap[pid] = {
          id: pid,
          title: row.title,
          image: row.image,
          category: row.category,
          mothercatId: row.mothercatId,
          subcatId: row.subcatId,
          itemId: row.itemId,
          rating: row.rating,
          inStock: !!row.inStock,
          sales: row.sales,
          features: row.features ? JSON.parse(row.features) : null,
          content: row.content ?? null,
          media: [],
          variants: [],
          brandDetails: row.brand_id
            ? {
                id: row.brand_id,
                title: row.brand_title ?? "",
                img: row.brand_img ?? "",
                link: row.brand_link ?? "",
              }
            : undefined,
        };
      }

      // اضافه کردن مدیا (گالری عمومی محصول)
      if (
        row.media_type &&
        row.media_src &&
        !productsMap[pid].media.some((m) => m.src === row.media_src)
      ) {
        productsMap[pid].media.push({
          type: row.media_type,
          src: row.media_src,
          thumbnail: row.media_thumbnail ?? null,
          alt: row.media_alt ?? "",
        });
      }
    });

    // اضافه کردن واریانت‌ها به هر محصول
    variantRows.forEach((row) => {
      const pid = row.product_id;
      if (productsMap[pid]) {
        productsMap[pid].variants.push({
          id: row.variant_id,
          color_englishName: row.color_englishName,
          color_persianName: row.color_persianName,
          color_hexCode: row.color_hexCode,
          price_single: Number(row.price_single),
          price_wholesale: Number(row.price_wholesale),
          discount_percent: row.discount_percent,
          min_wholesale: row.min_wholesale,
          in_stock: !!row.in_stock,
          stock_quantity: row.stock_quantity,
          image_main: row.image_main,
          images: row.images ? JSON.parse(row.images) : null,
          infotable: row.infotable ? JSON.parse(row.infotable) : null,
        });
      }
    });

    const products = Object.values(productsMap);

    if (products.length === 0) {
      return NextResponse.json({ error: "No products found" }, { status: 404 });
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products", details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const {
      title,
      brand_id,
      image,
      category,
      mothercatId,
      subcatId,
      itemId,
      rating = 0,
      inStock = 1,
      sales = 0,
      features,
      content,
      media = [],
      variants = [],
    } = data;

    // اعتبارسنجی فیلدهای اصلی محصول
    if (!title || !image || !category || !mothercatId || !subcatId || !itemId) {
      return NextResponse.json(
        { error: "Missing required product fields" },
        { status: 400 }
      );
    }

    // اعتبارسنجی واریانت‌ها
    if (!Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json(
        { error: "At least one variant is required" },
        { status: 400 }
      );
    }

    for (const variant of variants) {
      if (
        !variant.color_englishName ||
        !variant.color_hexCode ||
        !variant.price_single ||
        !variant.price_wholesale
      ) {
        return NextResponse.json(
          {
            error:
              "Each variant must have color_englishName, color_hexCode, price_single and price_wholesale",
          },
          { status: 400 }
        );
      }
      if (variant.infotable && !Array.isArray(variant.infotable)) {
        return NextResponse.json(
          { error: "infotable in variant must be an array" },
          { status: 400 }
        );
      }
      if (variant.images && !Array.isArray(variant.images)) {
        return NextResponse.json(
          { error: "images in variant must be an array of URLs" },
          { status: 400 }
        );
      }
    }

    // اعتبارسنجی کلیدهای خارجی
    if (brand_id) {
      const [brandRows] = await pool.query<RowDataPacket[]>(
        "SELECT id FROM brands WHERE id = ?",
        [brand_id]
      );
      if (brandRows.length === 0)
        return NextResponse.json(
          { error: "Invalid brand_id" },
          { status: 400 }
        );
    }

    const [catRows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM categories WHERE id = ?",
      [mothercatId]
    );
    if (catRows.length === 0)
      return NextResponse.json(
        { error: "Invalid mothercatId" },
        { status: 400 }
      );

    const [subcatRows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM subcategories WHERE id = ? AND category_id = ?",
      [subcatId, mothercatId]
    );
    if (subcatRows.length === 0)
      return NextResponse.json({ error: "Invalid subcatId" }, { status: 400 });

    const [itemRows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM subcategory_items WHERE id = ? AND subcategory_id = ?",
      [itemId, subcatId]
    );
    if (itemRows.length === 0)
      return NextResponse.json({ error: "Invalid itemId" }, { status: 400 });

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. درج محصول اصلی
      const [productResult] = await connection.query(
        `
        INSERT INTO products (
          brand_id, title, image, category, mothercatId,
          subcatId, itemId, rating, inStock, sales,
          features, content
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          brand_id || null,
          title,
          image,
          category,
          mothercatId,
          subcatId,
          itemId,
          rating,
          inStock,
          sales,
          features ? JSON.stringify(features) : null,
          content || null,
        ]
      );

      const productId = (productResult as any).insertId;

      // 2. درج مدیای عمومی محصول
      if (media.length > 0) {
        for (const item of media) {
          await connection.query(
            "INSERT INTO media (product_id, type, src, thumbnail, alt) VALUES (?, ?, ?, ?, ?)",
            [productId, item.type, item.src, item.thumbnail || null, item.alt]
          );
        }
      }

      // 3. درج واریانت‌ها (حذف discount_wholesale_percent از کوئری)
      for (const variant of variants) {
        await connection.query(
          `
          INSERT INTO product_variants (
            product_id,
            color_englishName, color_persianName, color_hexCode,
            price_single, price_wholesale,
            discount_percent,
            min_wholesale, in_stock, stock_quantity,
            image_main, images, infotable
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            productId,
            variant.color_englishName,
            variant.color_persianName || null,
            variant.color_hexCode,
            variant.price_single,
            variant.price_wholesale,
            variant.discount_percent || 0,
            variant.min_wholesale || 1,
            variant.in_stock !== undefined ? variant.in_stock : 1,
            variant.stock_quantity || 0,
            variant.image_main || null,
            variant.images ? JSON.stringify(variant.images) : null,
            variant.infotable ? JSON.stringify(variant.infotable) : null,
          ]
        );
      }

      await connection.commit();
      return NextResponse.json(
        { id: productId, message: "Product and variants created successfully" },
        { status: 201 }
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error adding product:", error);
    return NextResponse.json(
      { error: "Failed to add product", details: (error as Error).message },
      { status: 500 }
    );
  }
}