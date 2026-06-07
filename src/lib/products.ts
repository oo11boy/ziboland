// src/lib/products.ts
import { pool } from "@/lib/db";
import { Product, Variant, Media, Brand } from "@/types/types";
import { RowDataPacket } from "mysql2";

export async function getProductById(id: string): Promise<Product | null> {
  try {
    // 1. دریافت اطلاعات اصلی محصول به همراه برند
    const [productRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT p.*, 
             b.id AS brand_id, b.title AS brand_title, b.img AS brand_img, b.link AS brand_link
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      WHERE p.id = ?
      `,
      [id]
    );

    if (productRows.length === 0) return null;
    const row = productRows[0];

    // 2. دریافت واریانت‌ها
    const [variantRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM product_variants WHERE product_id = ?",
      [id]
    );

    // 3. دریافت مدیا
    const [mediaRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM media WHERE product_id = ?",
      [id]
    );

    // تبدیل واریانت‌ها به فرمت صحیح
    const variants: Variant[] = variantRows.map((v) => ({
      id: v.id,
      color_englishName: v.color_englishName,
      color_persianName: v.color_persianName || null,
      color_hexCode: v.color_hexCode,
      price_single: Number(v.price_single),
      price_wholesale: Number(v.price_wholesale),
      discount_percent: Number(v.discount_percent || 0),
      discount_wholesale_percent: Number(v.discount_wholesale_percent || 0),
      min_wholesale: Number(v.min_wholesale || 1),
      in_stock: Boolean(v.in_stock),
      stock_quantity: Number(v.stock_quantity || 0),
      image_main: v.image_main || null,
      images: typeof v.images === "string" ? JSON.parse(v.images) : v.images,
      infotable: typeof v.infotable === "string" ? JSON.parse(v.infotable) : v.infotable,
    }));

    // تبدیل مدیا
    const media: Media[] = mediaRows.map((m) => ({
      type: m.type as "image" | "video",
      src: m.src,
      thumbnail: m.thumbnail || null,
      alt: m.alt || "",
    }));

    // ساخت آبجکت نهایی محصول
    const product: Product = {
      id: row.id,
      brand_id: row.brand_id || null,
      title: row.title,
      image: row.image,
      originalPrice: row.originalPrice,
      discountedPrice: row.discountedPrice,
      wholesalePrice: row.wholesalePrice,
      discountwholesalePrice: row.discountwholesalePrice,
      minwholesale: Number(row.minwholesale),
      discount: row.discount,
      discountwholesale: row.discountwholesale,
      motherCategoryName: row.motherCategoryName,
      category: row.category,
      mothercatId: row.mothercatId,
      subcatId: row.subcatId,
      itemId: row.itemId,
      rating: Number(row.rating),
      inStock: Boolean(row.inStock),
      numericPrice: Number(row.numericPrice),
      sales: Number(row.sales),
      features: typeof row.features === "string" ? JSON.parse(row.features) : (row.features || []),
      content: row.content || "",
      media: media,
      variants: variants,
      brandDetails: row.brand_id ? {
        id: row.brand_id,
        title: row.brand_title,
        img: row.brand_img,
        link: row.brand_link
      } : undefined,
    };

    return product;
  } catch (error) {
    console.error("Database Error in getProductById:", error);
    return null;
  }
}