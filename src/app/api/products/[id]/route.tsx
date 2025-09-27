import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { Product, ProductRow } from "@/types/types";

// ===================== GET PRODUCT BY ID =====================
export async function GET(request: NextRequest) {
  const idStr = request.nextUrl.pathname.split("/").pop();
  const productId = parseInt(idStr || "");
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
  }

  try {
    const [rows] = await pool.query<ProductRow[]>(
      `
      SELECT 
        p.id AS product_id, p.title, p.image, p.originalPrice, p.discountedPrice, 
        p.wholesalePrice, p.discountwholesalePrice, p.minwholesale, p.discount, 
        p.discountwholesale, p.category, p.mothercatId, p.subcatId, p.rating, 
        p.inStock, p.numericPrice, p.sales, p.features, p.content,
        m.type AS media_type, m.src AS media_src, m.thumbnail AS media_thumbnail, m.alt AS media_alt,
        col.englishName, col.persianName, col.hexCode,
        it.id AS infotable_id, it.name AS infotable_name, it.value AS infotable_value,
        com.id AS comment_id, com.product_id AS comment_product_id, com.name AS comment_name, 
        com.rating AS comment_rating, com.text AS comment_text, com.date AS comment_date,
        com.status AS comment_status, com.is_admin AS comment_is_admin,
        b.id AS brand_id, b.title AS brand_title, b.img AS brand_img, b.link AS brand_link
      FROM products p
      LEFT JOIN media m ON p.id = m.product_id
      LEFT JOIN colors col ON p.id = col.product_id
      LEFT JOIN infotable it ON p.id = it.product_id
      LEFT JOIN comments com ON p.id = com.product_id
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id = ?
      ORDER BY p.id, m.id, col.id, it.id, com.id, b.id
      `,
      [productId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

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
          features: row.features ? JSON.parse(row.features) : [],
          content: row.content ?? undefined,
          media: [],
          colors: [],
          infotable: [],
          comments: [],
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

      if (
        row.media_type &&
        row.media_src &&
        !productsMap[pid].media!.some((m) => m.src === row.media_src)
      ) {
        productsMap[pid].media!.push({
          type: row.media_type,
          src: row.media_src,
          thumbnail: row.media_thumbnail ?? "",
          alt: row.media_alt ?? "",
        });
      }

      if (
        row.englishName &&
        row.hexCode &&
        !productsMap[pid].colors!.some((c) => c.hexCode === row.hexCode)
      ) {
        productsMap[pid].colors!.push({
          englishName: row.englishName,
          persianName: row.persianName ?? "",
          hexCode: row.hexCode,
        });
      }

      if (
        row.infotable_id &&
        !productsMap[pid].infotable!.some((it) => it.id === row.infotable_id)
      ) {
        productsMap[pid].infotable!.push({
          id: row.infotable_id,
          name: row.infotable_name ?? "",
          value: row.infotable_value ?? "",
        });
      }

      if (
        row.comment_id &&
        !productsMap[pid].comments!.some((c) => c.id === row.comment_id)
      ) {
        productsMap[pid].comments!.push({
          id: row.comment_id,
          product_id: row.comment_product_id,
          name: row.comment_name ?? "",
          rating: row.comment_rating ?? 0,
          text: row.comment_text ?? "",
          date: row.comment_date ?? "",
          status: row.comment_status ? 1 : 0,
          is_admin: row.comment_is_admin ? 1 : 0,
          admin_reply: null,
          parent_id: null,
          product_title: null
        });
      }
    });

    return NextResponse.json(Object.values(productsMap)[0]);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// ===================== UPDATE PRODUCT =====================
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
      originalPrice,
      discountedPrice,
      wholesalePrice,
      discountwholesalePrice,
      minwholesale,
      discount,
      discountwholesale,
      category,
      mothercatId,
      subcatId,
      rating,
      inStock,
      numericPrice,
      sales,
      features,
      content,
      infotable,
      media,
    } = data;

    // validate fields...
    if (!title || !image || !originalPrice || !discountedPrice || !wholesalePrice || !discountwholesalePrice || !minwholesale || !discount || !discountwholesale || !category || !mothercatId || !subcatId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Update product
      const [result] = await connection.query(
        `UPDATE products SET
          brand_id = ?, title = ?, image = ?, originalPrice = ?, discountedPrice = ?,
          wholesalePrice = ?, discountwholesalePrice = ?, minwholesale = ?,
          discount = ?, discountwholesale = ?, category = ?, mothercatId = ?,
          subcatId = ?, rating = ?, inStock = ?, numericPrice = ?, sales = ?,
          features = ?, content = ?
        WHERE id = ?`,
        [
          brand_id || null,
          title,
          image,
          originalPrice,
          discountedPrice,
          wholesalePrice,
          discountwholesalePrice,
          minwholesale,
          discount,
          discountwholesale,
          category,
          mothercatId,
          subcatId,
          rating,
          inStock,
          numericPrice,
          sales,
          features,
          content || null,
          productId,
        ]
      );

      if ((result as any).affectedRows === 0) throw new Error("Product not found");

      // Replace infotable
      await connection.query("DELETE FROM infotable WHERE product_id = ?", [productId]);
      if (infotable && infotable.length > 0) {
        for (const item of infotable) {
          await connection.query(
            "INSERT INTO infotable (product_id, name, value) VALUES (?, ?, ?)",
            [productId, item.name, item.value]
          );
        }
      }

      // Replace media
      await connection.query("DELETE FROM media WHERE product_id = ?", [productId]);
      if (media && media.length > 0) {
        for (const item of media) {
          await connection.query(
            "INSERT INTO media (product_id, type, src, thumbnail, alt) VALUES (?, ?, ?, ?, ?)",
            [productId, item.type, item.src, item.thumbnail || null, item.alt]
          );
        }
      }

      await connection.commit();
      return NextResponse.json({ message: "Product updated successfully" });
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

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query("DELETE FROM infotable WHERE product_id = ?", [productId]);
    await connection.query("DELETE FROM media WHERE product_id = ?", [productId]);

    const [result] = await connection.query("DELETE FROM products WHERE id = ?", [productId]);
    if ((result as any).affectedRows === 0) throw new Error("Product not found");

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
