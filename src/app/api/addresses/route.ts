import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const token =
      request.headers.get("Authorization")?.replace("Bearer ", "") || "";
    const { userId } = verifyToken(token);

    const [rows] = await pool.query(
      "SELECT * FROM addresses WHERE user_id = ? AND is_deleted = 0 ORDER BY is_default DESC, id DESC",
      [userId],
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "احراز هویت ناموفق یا خطا در دریافت آدرس‌ها" },
      { status: 401 },
    );
  }
}

export async function POST(request: Request) {
  const conn = await pool.getConnection();
  try {
    const token =
      request.headers.get("Authorization")?.replace("Bearer ", "") || "";
    const { userId } = verifyToken(token);

    const data = await request.json();

    const {
      first_name,
      last_name,
      phone_number,
      province,
      city,
      street,
      alley,
      building_number,
      unit,
      postal_code,
      extra_details,
      is_default,
    } = data;

    const missingFields: string[] = [];
    if (!first_name?.trim()) missingFields.push("نام");
    if (!last_name?.trim()) missingFields.push("نام خانوادگی");
    if (!phone_number?.trim()) missingFields.push("شماره تلفن");
    if (!province?.trim()) missingFields.push("استان");
    if (!city?.trim()) missingFields.push("شهر");
    if (!street?.trim()) missingFields.push("خیابان");

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `فیلدهای الزامی پر نشده‌اند: ${missingFields.join("، ")}` },
        { status: 400 },
      );
    }

    if (!/^\d{11}$/.test(String(phone_number).trim())) {
      return NextResponse.json(
        { error: "شماره تلفن باید 11 رقم باشد" },
        { status: 400 },
      );
    }

    if (postal_code && !/^\d{10}$/.test(String(postal_code).trim())) {
      return NextResponse.json(
        { error: "کدپستی وارد شده باید 10 رقم باشد" },
        { status: 400 },
      );
    }

    await conn.beginTransaction();

    if (is_default) {
      await conn.query(
        "UPDATE addresses SET is_default = 0 WHERE user_id = ? AND is_deleted = 0",
        [userId],
      );
    }

    const [countRows]: any = await conn.query(
      "SELECT COUNT(*) AS cnt FROM addresses WHERE user_id = ? AND is_deleted = 0",
      [userId],
    );
    const isFirstAddress = Number(countRows[0]?.cnt) === 0;
    const finalIsDefault = isFirstAddress ? 1 : is_default ? 1 : 0;

    const [result]: any = await conn.query(
      `INSERT INTO addresses 
       (user_id, first_name, last_name, phone_number, province, city, street,
        alley, building_number, unit, postal_code, extra_details, is_default, is_deleted)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        userId,
        String(first_name).trim(),
        String(last_name).trim(),
        String(phone_number).trim(),
        String(province).trim(),
        String(city).trim(),
        String(street).trim(),
        alley?.trim() || null,
        building_number?.trim() || null,
        unit?.trim() || null,
        postal_code?.trim() || "",
        extra_details?.trim() || null,
        finalIsDefault,
      ],
    );

    await conn.commit();

    return NextResponse.json(
      {
        id: result.insertId,
        is_default: finalIsDefault,
        message: "آدرس با موفقیت اضافه شد",
      },
      { status: 201 },
    );
  } catch (error: any) {
    try {
      await conn.rollback();
    } catch {}
    console.error("Error adding address:", error);
    return NextResponse.json(
      { error: "خطا در افزودن آدرس", details: error.message },
      { status: 500 },
    );
  } finally {
    conn.release();
  }
}