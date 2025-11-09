import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { Categoryapi } from "@/types/types";

// ===================== GET CATEGORY BY ID =====================
export async function GET(request: NextRequest) {
  const idStr = request.nextUrl.pathname.split("/").pop();
  const categoryId = parseInt(idStr || "");

  if (isNaN(categoryId)) {
    return NextResponse.json(
      { error: "شناسه دسته‌بندی نامعتبر است" },
      { status: 400 }
    );
  }

  try {
    const [rows] = await pool.query(
      `
      SELECT 
        c.id AS cat_id, c.name AS cat_name, c.link, c.mothercat, c.icon,
        sc.id AS subcat_id, sc.name AS subcat_name,
        sci.id AS item_id, sci.name AS item_name
      FROM categories c
      LEFT JOIN subcategories sc ON c.id = sc.category_id
      LEFT JOIN subcategory_items sci ON sc.id = sci.subcategory_id
      WHERE c.id = ?
      ORDER BY c.id, sc.id, sci.id
      `,
      [categoryId]
    );

    const categoriesMap: Record<number, Categoryapi> = {};
    const subcatIds = new Set<number>();
    const itemIds = new Set<number>();

    (rows as any[]).forEach((row: any) => {
      const catId = row.cat_id;

      if (!categoriesMap[catId]) {
        if (!row.cat_name || !row.link || !row.icon) return;
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

    const category = Object.values(categoriesMap)[0];
    if (!category) {
      return NextResponse.json({ error: "دسته‌بندی یافت نشد" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("خطا در دریافت دسته‌بندی:", error);
    return NextResponse.json(
      { error: "خطا در دریافت دسته‌بندی", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// ===================== UPDATE CATEGORY (ویرایش امن) =====================
export async function PUT(request: NextRequest) {
  const idStr = request.nextUrl.pathname.split("/").pop();
  const categoryId = parseInt(idStr || "");

  if (isNaN(categoryId)) {
    return NextResponse.json(
      { error: "شناسه دسته‌بندی نامعتبر است" },
      { status: 400 }
    );
  }

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

      // 1. بروزرسانی دسته‌بندی اصلی
      await connection.query(
        "UPDATE categories SET name = ?, link = ?, mothercat = ?, icon = ? WHERE id = ?",
        [name, link, mothercat ? 1 : 0, icon, categoryId]
      );

      // 2. دریافت زیرمجموعه‌های فعلی
      const [currentSubcats] = await connection.query(
        "SELECT id, name FROM subcategories WHERE category_id = ?",
        [categoryId]
      ) as any[];

      const currentSubcatMap = new Map<number, string>();
      currentSubcats.forEach((sc: { id: number; name: string; }) => currentSubcatMap.set(sc.id, sc.name));

      const usedSubcatIds = new Set<number>();
      const newSubcatNames = new Set<string>();

      // 3. پردازش زیرمجموعه‌های ارسالی
      if (subcat && Array.isArray(subcat)) {
        for (const sub of subcat) {
          if (!sub.name?.trim()) continue;

          newSubcatNames.add(sub.name.trim());

          // اگر زیرمجموعه id دارد → بروزرسانی نام
          if (sub.id && currentSubcatMap.has(sub.id)) {
            const oldName = currentSubcatMap.get(sub.id);
            if (oldName !== sub.name.trim()) {
              await connection.query(
                "UPDATE subcategories SET name = ? WHERE id = ? AND category_id = ?",
                [sub.name.trim(), sub.id, categoryId]
              );
            }
            usedSubcatIds.add(sub.id);

            // مدیریت آیتم‌های زیرمجموعه
            if (sub.items && Array.isArray(sub.items)) {
              // حذف آیتم‌های قدیمی
              await connection.query(
                "DELETE FROM subcategory_items WHERE subcategory_id = ?",
                [sub.id]
              );
              // درج آیتم‌های جدید
              for (const item of sub.items) {
                if (item.name?.trim()) {
                  await connection.query(
                    "INSERT INTO subcategory_items (subcategory_id, name) VALUES (?, ?)",
                    [sub.id, item.name.trim()]
                  );
                }
              }
            }
          }
          // اگر id ندارد → زیرمجموعه جدید
          else {
            const [result] = await connection.query(
              "INSERT INTO subcategories (category_id, name) VALUES (?, ?)",
              [categoryId, sub.name.trim()]
            );
            const newSubcatId = (result as any).insertId;
            usedSubcatIds.add(newSubcatId);

            if (sub.items && Array.isArray(sub.items)) {
              for (const item of sub.items) {
                if (item.name?.trim()) {
                  await connection.query(
                    "INSERT INTO subcategory_items (subcategory_id, name) VALUES (?, ?)",
                    [newSubcatId, item.name.trim()]
                  );
                }
              }
            }
          }
        }
      }

      const subcatsToDelete = currentSubcats
        .filter((sc: { id: number; }) => !usedSubcatIds.has(sc.id))
        .map((sc: { id: any; }) => sc.id);

      if (subcatsToDelete.length > 0) {
        // فقط زیرمجموعه‌هایی که در محصولات استفاده نشده‌اند حذف شوند
        const placeholders = subcatsToDelete.map(() => "?").join(",");
        await connection.query(
          `DELETE FROM subcategory_items WHERE subcategory_id IN (${placeholders})`,
          subcatsToDelete
        );
        await connection.query(
          `DELETE FROM subcategories 
           WHERE id IN (${placeholders}) 
           AND category_id = ? 
           AND id NOT IN (SELECT subcatId FROM products WHERE subcatId IS NOT NULL)`,
          [...subcatsToDelete, categoryId]
        );
      }

      await connection.commit();
      return NextResponse.json({ message: "دسته‌بندی با موفقیت بروزرسانی شد" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("خطا در بروزرسانی دسته‌بندی:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی دسته‌بندی", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// ===================== DELETE CATEGORY =====================
export async function DELETE(request: NextRequest) {
  const idStr = request.nextUrl.pathname.split("/").pop();
  const categoryId = parseInt(idStr || "");

  if (isNaN(categoryId)) {
    return NextResponse.json(
      { error: "شناسه دسته‌بندی نامعتبر است" },
      { status: 400 }
    );
  }

  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        "DELETE FROM subcategory_items WHERE subcategory_id IN (SELECT id FROM subcategories WHERE category_id = ?)",
        [categoryId]
      );
      await connection.query("DELETE FROM subcategories WHERE category_id = ?", [categoryId]);
      const [result] = await connection.query("DELETE FROM categories WHERE id = ?", [categoryId]);

      if ((result as any).affectedRows === 0) {
        throw new Error("دسته‌بندی یافت نشد");
      }

      await connection.commit();
      return NextResponse.json({ message: "دسته‌بندی با موفقیت حذف شد" });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("خطا در حذف دسته‌بندی:", error);
    return NextResponse.json(
      { error: "خطا در حذف دسته‌بندی", details: (error as Error).message },
      { status: 500 }
    );
  }
}
