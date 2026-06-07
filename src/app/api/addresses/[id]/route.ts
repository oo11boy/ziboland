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

// Helper برای بررسی فیلدهای اجباری
function validateAddress(data: AddressData) {
  const required = [
    "first_name",
    "last_name",
    "phone_number",
    "province",
    "city",
    "street",
    "postal_code",
  ];
  for (const field of required) {
    if (!data[field as keyof AddressData]) {
      return false;
    }
  }
  return true;
}

export async function PUT(request: NextRequest) {
  try {
    const token =
      request.headers.get("Authorization")?.replace("Bearer ", "") || "";
    const { userId } = verifyToken(token);

    // استخراج id از URL
    const id = request.nextUrl.pathname.split("/").pop();
    if (!id)
      return NextResponse.json({ error: "آدرس یافت نشد" }, { status: 404 });

    const data: AddressData = await request.json();

    if (!validateAddress(data)) {
      return NextResponse.json(
        { error: "فیلدهای الزامی پر نشده‌اند" },
        { status: 400 },
      );
    }

    if (data.is_default) {
      await pool.query(
        "UPDATE addresses SET is_default = 0 WHERE user_id = ?",
        [userId],
      );
    }

    const [result] = await pool.query(
      `UPDATE addresses
       SET first_name = ?, last_name = ?, phone_number = ?, province = ?, city = ?, street = ?, alley = ?, building_number = ?, unit = ?, postal_code = ?, extra_details = ?, is_default = ?
       WHERE id = ? AND user_id = ?`,
      [
        data.first_name,
        data.last_name,
        data.phone_number,
        data.province,
        data.city,
        data.street,
        data.alley || null,
        data.building_number || null,
        data.unit || null,
        data.postal_code,
        data.extra_details || null,
        data.is_default ? 1 : 0,
        id,
        userId,
      ],
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "آدرس یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({ message: "آدرس با موفقیت به‌روزرسانی شد" });
  } catch (error) {
    console.error("Error updating address:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی آدرس" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token =
      request.headers.get("Authorization")?.replace("Bearer ", "") || "";
    const { userId } = verifyToken(token);

    const id = request.nextUrl.pathname.split("/").pop();
    if (!id)
      return NextResponse.json({ error: "آدرس یافت نشد" }, { status: 404 });

    const [result] = await pool.query(
      "DELETE FROM addresses WHERE id = ? AND user_id = ?",
      [id, userId],
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ error: "آدرس یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({ message: "آدرس با موفقیت حذف شد" });
  } catch (error) {
    console.error("Error deleting address:", error);
    return NextResponse.json({ error: "خطا در حذف آدرس" }, { status: 500 });
  }
}
