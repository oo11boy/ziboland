import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

interface AddressData {
  first_name: string;
  last_name: string;
  phone_number: string;
  province: string;
  city: string;
  street: string;
  alley?: string;
  building_number?: string;
  unit?: string;
  postal_code: string;
  extra_details?: string;
  is_default?: boolean;
}

function validateAddress(data: AddressData) {
  const required: (keyof AddressData)[] = [
    "first_name",
    "last_name",
    "phone_number",
    "province",
    "city",
    "street",
  ];

  for (const field of required) {
    const value = data[field];
    if (value === undefined || value === null || String(value).trim() === "") {
      return false;
    }
  }
  return true;
}

function extractId(request: NextRequest): string | null {
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const id = segments[segments.length - 1];
  if (!id || !/^\d+$/.test(id)) return null;
  return id;
}

export async function PUT(request: NextRequest) {
  const conn = await pool.getConnection();

  try {
    const token =
      request.headers.get("Authorization")?.replace("Bearer ", "") || "";
    const { userId } = verifyToken(token);

    const id = extractId(request);
    if (!id) {
      return NextResponse.json(
        { error: "شناسه آدرس نامعتبر است" },
        { status: 400 },
      );
    }

    const data: AddressData = await request.json();

    if (!validateAddress(data)) {
      return NextResponse.json(
        {
          error:
            "فیلدهای الزامی پر نشده‌اند (نام، نام خانوادگی، تلفن، استان، شهر، خیابان)",
        },
        { status: 400 },
      );
    }

    if (!/^\d{11}$/.test(String(data.phone_number).trim())) {
      return NextResponse.json(
        { error: "شماره تلفن باید 11 رقم باشد" },
        { status: 400 },
      );
    }

    if (data.postal_code && !/^\d{10}$/.test(String(data.postal_code).trim())) {
      return NextResponse.json(
        { error: "کدپستی باید 10 رقم باشد" },
        { status: 400 },
      );
    }

    const [existingRows]: any = await conn.query(
      "SELECT id FROM addresses WHERE id = ? AND user_id = ? AND is_deleted = 0",
      [id, userId],
    );
    if (existingRows.length === 0) {
      return NextResponse.json({ error: "آدرس یافت نشد" }, { status: 404 });
    }

    await conn.beginTransaction();

    if (data.is_default) {
      await conn.query(
        "UPDATE addresses SET is_default = 0 WHERE user_id = ? AND is_deleted = 0 AND id <> ?",
        [userId, id],
      );
    }

    await conn.query(
      `UPDATE addresses
       SET first_name = ?, last_name = ?, phone_number = ?,
           province = ?, city = ?, street = ?, alley = ?,
           building_number = ?, unit = ?, postal_code = ?,
           extra_details = ?, is_default = ?
       WHERE id = ? AND user_id = ? AND is_deleted = 0`,
      [
        String(data.first_name).trim(),
        String(data.last_name).trim(),
        String(data.phone_number).trim(),
        String(data.province).trim(),
        String(data.city).trim(),
        String(data.street).trim(),
        data.alley?.trim() || null,
        data.building_number?.trim() || null,
        data.unit?.trim() || null,
        data.postal_code?.trim() || "",
        data.extra_details?.trim() || null,
        data.is_default ? 1 : 0,
        id,
        userId,
      ],
    );

    await conn.commit();

    return NextResponse.json({ message: "آدرس با موفقیت به‌روزرسانی شد" });
  } catch (error: any) {
    try {
      await conn.rollback();
    } catch {}
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی آدرس", details: error.message },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}

export async function DELETE(request: NextRequest) {
  const conn = await pool.getConnection();

  try {
    const token =
      request.headers.get("Authorization")?.replace("Bearer ", "") || "";
    const { userId } = verifyToken(token);

    const id = extractId(request);
    if (!id) {
      return NextResponse.json(
        { error: "شناسه آدرس نامعتبر است" },
        { status: 400 },
      );
    }

    const [rows]: any = await conn.query(
      "SELECT id, is_default FROM addresses WHERE id = ? AND user_id = ? AND is_deleted = 0",
      [id, userId],
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "آدرس یافت نشد" }, { status: 404 });
    }

    const [usedInOrders]: any = await conn.query(
      "SELECT id, order_code FROM orders WHERE address_id = ? LIMIT 1",
      [id],
    );

    const isUsed = usedInOrders.length > 0;

    await conn.beginTransaction();

    if (isUsed) {
      await conn.query(
        "UPDATE addresses SET is_deleted = 1, is_default = 0 WHERE id = ? AND user_id = ?",
        [id, userId],
      );
    } else {
      await conn.query(
        "DELETE FROM addresses WHERE id = ? AND user_id = ?",
        [id, userId],
      );
    }

    if (Number(rows[0].is_default) === 1) {
      const [nextDefault]: any = await conn.query(
        "SELECT id FROM addresses WHERE user_id = ? AND is_deleted = 0 ORDER BY id ASC LIMIT 1",
        [userId],
      );
      if (nextDefault.length > 0) {
        await conn.query(
          "UPDATE addresses SET is_default = 1 WHERE id = ? AND user_id = ?",
          [nextDefault[0].id, userId],
        );
      }
    }

    await conn.commit();

    return NextResponse.json({
      message: isUsed
        ? "آدرس از لیست شما حذف شد. اطلاعات آن در سفارش‌های قبلی حفظ شده است."
        : "آدرس با موفقیت حذف شد",
      soft_deleted: isUsed,
      used_in_orders: isUsed,
    });
  } catch (error: any) {
    try {
      await conn.rollback();
    } catch {}
    console.error("Error deleting address:", error);
    return NextResponse.json(
      { error: "خطا در حذف آدرس", details: error.message },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}