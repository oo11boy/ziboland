// pages/api/categories/index.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { Categoryapi, CategoryRow } from "@/types/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mothercat = searchParams.get("mothercat");
  const categoryId = searchParams.get("id");

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

    const conditions: string[] = [];
    if (mothercat !== null) {
      if (isNaN(parseInt(mothercat))) {
        return NextResponse.json(
          { error: "پارامتر mothercat نامعتبر است" },
          { status: 400 }
        );
      }
      conditions.push("c.mothercat = ?");
      queryParams.push(parseInt(mothercat));
    }
    if (categoryId !== null) {
      if (isNaN(parseInt(categoryId))) {
        return NextResponse.json(
          { error: "شناسه دسته‌بندی نامعتبر است" },
          { status: 400 }
        );
      }
      conditions.push("c.id = ?");
      queryParams.push(parseInt(categoryId));
    }
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY c.id, sc.id, sci.id";

    const [rows] = await pool.query<CategoryRow[]>(query, queryParams);

    const categoriesMap: Record<number, Categoryapi> = {};
    const subcatIds = new Set<number>();
    const itemIds = new Set<number>();

    rows.forEach((row) => {
      const catId = row.cat_id;

      if (!categoriesMap[catId]) {
        if (!row.cat_name || !row.link || !row.icon) {
          console.warn(
            `فیلدهای مورد نیاز برای دسته‌بندی با شناسه ${catId} وجود ندارد`
          );
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
          name: row.subcat_name ?? "",
          items: [],
        });
        subcatIds.add(row.subcat_id);
      }

      if (row.item_id && !itemIds.has(row.item_id)) {
        const subcat = categoriesMap[catId].subcat.find(
          (sc) => sc.id === row.subcat_id
        );
        if (subcat) {
          subcat.items.push({
            id: row.item_id,
            name: row.item_name ?? "",
          });
          itemIds.add(row.item_id);
        }
      }
    });

    const categories = Object.values(categoriesMap);

    if (categories.length === 0) {
      return NextResponse.json([], { status: 200 }); // آرایه خالی
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error("خطا در دریافت دسته‌بندی‌ها:", error);
    return NextResponse.json(
      {
        error: "خطا در دریافت دسته‌بندی‌ها",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, link, mothercat, icon, subcat } = data;

    if (!name || !link || !icon) {
      return NextResponse.json(
        { error: "فیلدهای name، link و icon الزامی هستند" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        "INSERT INTO categories (name, link, mothercat, icon) VALUES (?, ?, ?, ?)",
        [name, link, mothercat ? 1 : 0, icon]
      );

      const categoryId = (result as any).insertId;

      if (subcat && Array.isArray(subcat)) {
        for (const sub of subcat) {
          if (!sub.name) {
            throw new Error("نام زیرمجموعه الزامی است");
          }
          const [subResult] = await connection.query(
            "INSERT INTO subcategories (category_id, name) VALUES (?, ?)",
            [categoryId, sub.name]
          );
          const subcatId = (subResult as any).insertId;

          if (sub.items && Array.isArray(sub.items)) {
            for (const item of sub.items) {
              if (!item.name) {
                throw new Error("نام آیتم زیرمجموعه الزامی است");
              }
              await connection.query(
                "INSERT INTO subcategory_items (subcategory_id, name) VALUES (?, ?)",
                [subcatId, item.name]
              );
            }
          }
        }
      }

      await connection.commit();
      return NextResponse.json({ id: categoryId }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("خطا در افزودن دسته‌بندی:", error);
    return NextResponse.json(
      { error: "خطا در افزودن دسته‌بندی", details: (error as Error).message },
      { status: 500 }
    );
  }
}