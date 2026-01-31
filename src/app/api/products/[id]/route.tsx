// api/products/[id].ts
import { NextRequest, NextResponse } from "next/server";
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

// ===================== GET PRODUCT BY ID =====================
export async function GET(request: NextRequest) {
  const idStr = request.nextUrl.pathname.split("/").pop();
  const productId = parseInt(idStr || "");
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    // 1. اطلاعات پایه محصول + مدیا عمومی + برند
    const [productRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        p.id AS product_id,
        p.title,
        p.image,
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
      WHERE p.id = ?
      ORDER BY m.id
      `,
      [productId]
    );

    if (productRows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // 2. تمام واریانت‌های این محصول
    const [variantRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT
        pv.id AS variant_id,
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
      WHERE pv.product_id = ?
      ORDER BY pv.id
      `,
      [productId]
    );

    // ساخت آبجکت محصول
    const row = productRows[0];
    const product: Product = {
      id: row.product_id,
      title: row.title,
      image: row.image,
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

    // اضافه کردن مدیای عمومی
    productRows.forEach((r) => {
      if (
        r.media_type &&
        r.media_src &&
        !product.media.some((m) => m.src === r.media_src)
      ) {
        product.media.push({
          type: r.media_type,
          src: r.media_src,
          thumbnail: r.media_thumbnail ?? null,
          alt: r.media_alt ?? "",
        });
      }
    });

    // اضافه کردن واریانت‌ها
    variantRows.forEach((r) => {
      product.variants.push({
        id: r.variant_id,
        color_englishName: r.color_englishName,
        color_persianName: r.color_persianName,
        color_hexCode: r.color_hexCode,
        price_single: Number(r.price_single),
        price_wholesale: Number(r.price_wholesale),
        discount_percent: r.discount_percent,
        min_wholesale: r.min_wholesale,
        in_stock: !!r.in_stock,
        stock_quantity: r.stock_quantity,
        image_main: r.image_main,
        images: r.images ? JSON.parse(r.images) : null,
        infotable: r.infotable ? JSON.parse(r.infotable) : null,
      });
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// ===================== UPDATE PRODUCT (PUT) =====================
export async function PUT(request: NextRequest) {
  const idStr = request.nextUrl.pathname.split("/").pop();
  const productId = parseInt(idStr || "");
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    const data = await request.json();

    const {
      title,
      brand_id,
      image,
      mothercatId,
      subcatId,
      itemId,
      rating = 0,
      inStock = 1,
      sales = 0,
      features,
      content,
      media = [],
      variants = [], // آرایه از واریانت‌های جدید
    } = data;

    // اعتبارسنجی فیلدهای اصلی محصول
    if (!title || !image || !mothercatId || !subcatId || !itemId) {
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
        variant.price_single === undefined ||
        variant.price_wholesale === undefined
      ) {
        return NextResponse.json(
          {
            error:
              "Each variant must have color_englishName, color_hexCode, price_single and price_wholesale",
          },
          { status: 400 }
        );
      }
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. آپدیت محصول اصلی
      await connection.query(
        `
        UPDATE products SET
          brand_id = ?, title = ?, image = ?, mothercatId = ?,
          subcatId = ?, itemId = ?, rating = ?, inStock = ?, sales = ?,
          features = ?, content = ?
        WHERE id = ?
        `,
        [
          brand_id || null,
          title,
          image,
        
          mothercatId,
          subcatId,
          itemId,
          rating,
          inStock,
          sales,
          features ? JSON.stringify(features) : null,
          content || null,
          productId,
        ]
      );

      // 2. جایگزینی مدیای عمومی
      await connection.query("DELETE FROM media WHERE product_id = ?", [
        productId,
      ]);
if (Array.isArray(media) && media.length > 0) {
  for (const item of media) {
    await connection.query(
      "INSERT INTO media (product_id, type, src, thumbnail, alt) VALUES (?, ?, ?, ?, ?)",
      [productId, item.type, item.src, item.thumbnail || null, item.alt]
    );
  }
}

      // 3. جایگزینی کامل واریانت‌ها
      await connection.query(
        "DELETE FROM product_variants WHERE product_id = ?",
        [productId]
      );

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
      return NextResponse.json({
        message: "Product and variants updated successfully",
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// ===================== DELETE PRODUCT =====================
export async function DELETE(request: NextRequest) {
  const idStr = request.nextUrl.pathname.split("/").pop();
  const productId = parseInt(idStr || "");
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  const { force = false } = await request.json().catch(() => ({}));

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // بررسی سفارش‌ها
    const [orders] = await connection.query<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM order_items WHERE product_id = ?",
      [productId]
    );
    const orderCount = orders[0]?.count || 0;

    if (orderCount > 0 && !force) {
      await connection.rollback();
      return NextResponse.json(
        {
          error:
            "این محصول سفارش دارد. برای حذف اجباری از force=true استفاده کنید.",
        },
        { status: 400 }
      );
    }

    if (force && orderCount > 0) {
      await connection.query("DELETE FROM order_items WHERE product_id = ?", [
        productId,
      ]);
    }

    // حذف محصول (واریانت‌ها به دلیل ON DELETE CASCADE خودکار حذف می‌شن)
    const [result] = await connection.query(
      "DELETE FROM products WHERE id = ?",
      [productId]
    );

    if ((result as any).affectedRows === 0) {
      await connection.rollback();
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await connection.commit();
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product", details: (error as Error).message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}
