import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { Categoryapi, RowDataPacket } from "@/types/types";

interface SubcategoryRow extends RowDataPacket {
  id: number;
  name: string;
}

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
        if (!row.cat_name) return;
        categoriesMap[catId] = {
          id: catId,
          name: row.cat_name,
          link: row.link || "",
          mothercat: row.mothercat,
          icon: row.icon || "icon",
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
      return NextResponse.json(null, { status: 200 });
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

// ===================== UPDATE CATEGORY =====================
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
    const { name, link = "", mothercat, subcat } = data;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "نام دسته‌بندی الزامی است" },
        { status: 400 }
      );
    }

    const iconValue = "icon";

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.query(
        "UPDATE categories SET name = ?, link = ?, mothercat = ?, icon = ? WHERE id = ?",
        [name.trim(), link, mothercat ? 1 : 0, iconValue, categoryId]
      );

      // فقط اولین عنصر (rows) را می‌گیریم و به نوع دلخواه تبدیل می‌کنیم
      const [currentSubcatsRows] = await connection.query<RowDataPacket[]>(
        "SELECT id, name FROM subcategories WHERE category_id = ?",
        [categoryId]
      );
      const currentSubcats = currentSubcatsRows as SubcategoryRow[];

      const currentSubcatMap = new Map<number, string>();
      currentSubcats.forEach((sc) => currentSubcatMap.set(sc.id, sc.name));

      const usedSubcatIds = new Set<number>();

      if (subcat && Array.isArray(subcat)) {
        for (const sub of subcat) {
          if (!sub.name?.trim()) continue;

          let subcatId: number;

          if (sub.id && currentSubcatMap.has(sub.id)) {
            const oldName = currentSubcatMap.get(sub.id);
            if (oldName !== sub.name.trim()) {
              await connection.query(
                "UPDATE subcategories SET name = ? WHERE id = ? AND category_id = ?",
                [sub.name.trim(), sub.id, categoryId]
              );
            }
            subcatId = sub.id;
          } else {
            const [result] = await connection.query(
              "INSERT INTO subcategories (category_id, name) VALUES (?, ?)",
              [categoryId, sub.name.trim()]
            );
            subcatId = (result as any).insertId;
          }

          usedSubcatIds.add(subcatId);

          const [currentItemsRows] = await connection.query<RowDataPacket[]>(
            "SELECT id, name FROM subcategory_items WHERE subcategory_id = ?",
            [subcatId]
          );
          const currentItems = currentItemsRows as SubcategoryRow[];

          const currentItemMap = new Map<number, string>();
          currentItems.forEach((item) => currentItemMap.set(item.id, item.name));

          const usedItemIds = new Set<number>();

          if (sub.items && Array.isArray(sub.items)) {
            for (const item of sub.items) {
              if (!item.name?.trim()) continue;

              let itemId: number;

              if (item.id && currentItemMap.has(item.id)) {
                const oldName = currentItemMap.get(item.id);
                if (oldName !== item.name.trim()) {
                  await connection.query(
                    "UPDATE subcategory_items SET name = ? WHERE id = ? AND subcategory_id = ?",
                    [item.name.trim(), item.id, subcatId]
                  );
                }
                itemId = item.id;
              } else {
                const [itemResult] = await connection.query(
                  "INSERT INTO subcategory_items (subcategory_id, name) VALUES (?, ?)",
                  [subcatId, item.name.trim()]
                );
                itemId = (itemResult as any).insertId;
              }

              usedItemIds.add(itemId);
            }
          }

          const itemsToDelete = currentItems
            .filter((item) => !usedItemIds.has(item.id))
            .map((item) => item.id);

          if (itemsToDelete.length > 0) {
            const placeholders = itemsToDelete.map(() => "?").join(",");
            await connection.query(
              `DELETE FROM subcategory_items 
               WHERE id IN (${placeholders}) 
               AND subcategory_id = ? 
               AND id NOT IN (SELECT itemId FROM products WHERE itemId IS NOT NULL)`,
              [...itemsToDelete, subcatId]
            );
          }
        }
      }

      const subcatsToDelete = currentSubcats.filter(
        (sc) => !usedSubcatIds.has(sc.id)
      );

      if (subcatsToDelete.length > 0) {
        const deleteIds = subcatsToDelete.map((sc) => sc.id);
        const placeholders = deleteIds.map(() => "?").join(",");

        const [usedInProducts] = await connection.query(
          `SELECT p.id AS product_id, p.title AS product_name, p.subcatId 
           FROM products p 
           WHERE p.subcatId IN (${placeholders})`,
          deleteIds
        );

        if ((usedInProducts as any[]).length > 0) {
          const conflictMap = new Map<
            number,
            { subcatName: string; products: { id: number; name: string }[] }
          >();

          (usedInProducts as any[]).forEach((prod: any) => {
            const subcatId = prod.subcatId;
            const subcatName = currentSubcatMap.get(subcatId) || "نامشخص";
            if (!conflictMap.has(subcatId)) {
              conflictMap.set(subcatId, { subcatName, products: [] });
            }
            conflictMap.get(subcatId)!.products.push({
              id: prod.product_id,
              name: prod.product_name,
            });
          });

          let message =
            "⚠️ برخی زیرمجموعه‌ها حذف نشدند چون در محصولات زیر استفاده شده‌اند:\n\n";
          conflictMap.forEach(({ subcatName, products }) => {
            message += `➜ زیرمجموعه "${subcatName}":\n`;
            products.forEach((p, i) => {
              message += `   ${i + 1}. ${p.name} (ID: ${p.id})\n`;
              message += `      ویرایش محصول: /admindashboard/products/${p.id}/edit\n`;
            });
            message += "\n";
          });
          message += "لطفاً ابتدا زیرمجموعه را از محصولات فوق حذف یا تغییر دهید.";

          await connection.rollback();
          return NextResponse.json(
            {
              error: "ویرایش نیمه‌کامل",
              details: message,
              partialSuccess: true,
            },
            { status: 400 }
          );
        }

        await connection.query(
          `DELETE FROM subcategory_items WHERE subcategory_id IN (${placeholders})`,
          deleteIds
        );
        await connection.query(
          `DELETE FROM subcategories WHERE id IN (${placeholders}) AND category_id = ?`,
          [...deleteIds, categoryId]
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
      {
        error: "خطا در بروزرسانی دسته‌بندی",
        details: (error as Error).message,
      },
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

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [subcatsRows] = await connection.query<RowDataPacket[]>(
      "SELECT id, name FROM subcategories WHERE category_id = ?",
      [categoryId]
    );
    const subcats = subcatsRows as SubcategoryRow[];

    const subcatIds = subcats.map((s) => s.id);
    const subcatMap = new Map(subcats.map((s) => [s.id, s.name]));

    if (subcatIds.length > 0) {
      const placeholders = subcatIds.map(() => "?").join(",");

      const [usedProducts] = await connection.query<RowDataPacket[]>(
        `
        SELECT p.id AS product_id, p.title AS product_name, p.subcatId 
        FROM products p 
        WHERE p.subcatId IN (${placeholders})
        ORDER BY p.subcatId, p.title
        `,
        subcatIds
      );

      if (usedProducts.length > 0) {
        const conflicts = new Map<
          number,
          { subcatName: string; products: { id: number; name: string; editUrl: string }[] }
        >();

        usedProducts.forEach((prod: any) => {
          const subcatId = prod.subcatId;
          const subcatName = subcatMap.get(subcatId) || `زیرمجموعه ${subcatId}`;
          if (!conflicts.has(subcatId)) {
            conflicts.set(subcatId, { subcatName, products: [] });
          }
          conflicts.get(subcatId)!.products.push({
            id: prod.product_id,
            name: prod.product_name,
            editUrl: `/admindashboard/products/${prod.product_id}/edit`,
          });
        });

        let message =
          "نمی‌توان زیرمجموعه را حذف کرد چون در محصولات زیر استفاده شده است:\n\n" +
          "لطفاً ابتدا به صفحه ویرایش هر محصول بروید و زیرمجموعه را تغییر دهید یا خالی کنید.\n\n";

        const conflictedProducts: Record<
          string,
          { subcatName: string; products: { id: number; name: string; editUrl: string }[] }
        > = {};

        conflicts.forEach(({ subcatName, products }, subcatId) => {
          message += `➜ زیرمجموعه "${subcatName}":\n`;
          products.forEach((prod, i) => {
            message += `   ${i + 1}. ${prod.name} → ویرایش: ${prod.editUrl}\n`;
          });
          message += "\n";

          conflictedProducts[subcatId] = { subcatName, products };
        });

        await connection.rollback();
        return NextResponse.json(
          {
            error: "حذف ناموفق",
            details: message.trim(),
            conflictedProducts,
          },
          { status: 400 }
        );
      }

      await connection.query(
        `DELETE FROM subcategory_items WHERE subcategory_id IN (${placeholders})`,
        subcatIds
      );

      await connection.query(
        `DELETE FROM subcategories WHERE id IN (${placeholders})`,
        subcatIds
      );
    }

    const [result] = await connection.query(
      "DELETE FROM categories WHERE id = ?",
      [categoryId]
    );

    if ((result as any).affectedRows === 0) {
      await connection.rollback();
      return NextResponse.json({ error: "دسته‌بندی یافت نشد" }, { status: 404 });
    }

    await connection.commit();
    return NextResponse.json({ message: "دسته‌بندی با موفقیت حذف شد" });
  } catch (error: any) {
    await connection.rollback();
    console.error("خطا در حذف دسته‌بندی:", error);

    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return NextResponse.json(
        {
          error: "حذف ناموفق",
          details:
            "این دسته‌بندی یا زیرمجموعه‌های آن در محصولات استفاده شده است.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "خطا در حذف دسته‌بندی", details: error.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}