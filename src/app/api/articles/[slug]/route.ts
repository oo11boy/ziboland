// app/api/articles/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// تابع کمکی برای استخراج slug از URL
function getSlugFromUrl(req: NextRequest): string | null {
  // روش اول: از pathname
  const pathname = req.nextUrl.pathname;
  const parts = pathname.split("/");
  const slug = parts[parts.length - 1];
  
  // روش دوم: از URLSearchParams (اگر به صورت query parameter ارسال شود)
  const searchParams = req.nextUrl.searchParams;
  const slugParam = searchParams.get("slug");
  
  return slugParam || slug || null;
}

// GET مقاله با slug
export async function GET(req: NextRequest) {
  try {
    const slug = getSlugFromUrl(req);
    
    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM articles WHERE slug = ?",
      [slug]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT بروزرسانی مقاله
export async function PUT(req: NextRequest) {
  try {
    const slug = getSlugFromUrl(req);
    
    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      title,
      slug: newSlug,
      content,
      image,
      author,
      tags,
      meta_description,
      reading_time,
    } = body;

    // اعتبارسنجی ورودی
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // بررسی وجود مقاله
    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM articles WHERE slug = ?",
      [slug]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    // اگر slug جدید است، بررسی کنید که تکراری نباشد
    if (newSlug && newSlug !== slug) {
      const [duplicate] = await pool.query<RowDataPacket[]>(
        "SELECT id FROM articles WHERE slug = ? AND slug != ?",
        [newSlug, slug]
      );
      
      if (duplicate.length > 0) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 409 }
        );
      }
    }

    const query = `
      UPDATE articles 
      SET 
        title = ?, 
        slug = ?, 
        content = ?, 
        image = ?, 
        author = ?, 
        tags = ?,
        meta_description = ?,
        reading_time = ?,
        updated_at = NOW() 
      WHERE slug = ?
    `;

    const values = [
      title,
      newSlug || slug,
      content,
      image || null,
      author || null,
      tags ? JSON.stringify(tags) : null,
      meta_description || null,
      reading_time || null,
      slug,
    ];

    const [result] = await pool.query<ResultSetHeader>(query, values);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Failed to update article" },
        { status: 500 }
      );
    }

    // دریافت مقاله به‌روز شده
    const [updatedRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM articles WHERE slug = ?",
      [newSlug || slug]
    );

    return NextResponse.json({
      message: "Article updated successfully",
      article: updatedRows[0],
    });
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE حذف مقاله
export async function DELETE(req: NextRequest) {
  try {
    const slug = getSlugFromUrl(req);
    
    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    // بررسی وجود مقاله
    const [existing] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM articles WHERE slug = ?",
      [slug]
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM articles WHERE slug = ?",
      [slug]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Failed to delete article" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Article deleted successfully",
      deleted: true,
    });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH بروزرسانی جزئی مقاله
export async function PATCH(req: NextRequest) {
  try {
    const slug = getSlugFromUrl(req);
    
    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const updates: string[] = [];
    const values: any[] = [];

    // ساخت داینامیک کوئری بر اساس فیلدهای ارسال شده
    const allowedFields = [
      "title",
      "slug",
      "content",
      "image",
      "author",
      "tags",
      "meta_description",
      "reading_time",
      "status",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(
          field === "tags" && body[field]
            ? JSON.stringify(body[field])
            : body[field]
        );
      }
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    // اگر slug جدید است، بررسی کنید که تکراری نباشد
    if (body.slug && body.slug !== slug) {
      const [duplicate] = await pool.query<RowDataPacket[]>(
        "SELECT id FROM articles WHERE slug = ? AND slug != ?",
        [body.slug, slug]
      );
      
      if (duplicate.length > 0) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 409 }
        );
      }
    }

    updates.push("updated_at = NOW()");
    values.push(slug);

    const query = `UPDATE articles SET ${updates.join(", ")} WHERE slug = ?`;
    const [result] = await pool.query<ResultSetHeader>(query, values);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Failed to update article" },
        { status: 500 }
      );
    }

    // دریافت مقاله به‌روز شده
    const [updatedRows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM articles WHERE slug = ?",
      [body.slug || slug]
    );

    return NextResponse.json({
      message: "Article updated successfully",
      article: updatedRows[0],
    });
  } catch (error) {
    console.error("Error updating article:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// HEAD - بررسی وجود مقاله
export async function HEAD(req: NextRequest) {
  try {
    const slug = getSlugFromUrl(req);
    
    if (!slug) {
      return new NextResponse(null, { status: 400 });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM articles WHERE slug = ?",
      [slug]
    );

    if (rows.length === 0) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Error checking article:", error);
    return new NextResponse(null, { status: 500 });
  }
}