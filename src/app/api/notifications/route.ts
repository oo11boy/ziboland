import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import * as jose from "jose";
import { RowDataPacket } from "mysql2";

interface NotificationRow extends RowDataPacket {
  id: number;
  type: "comment" | "ticket" | "order";
  message: string;
  created_at: string;
  read: number; // stored as TINYINT(1)
  related_id?: number | null;
  product_title?: string | null;
  order_code?: string | null;
}

const JWT_SECRET = process.env.JWT_SECRET;

// 🔒 بررسی توکن ادمین
async function verifyAdminFromToken(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) throw { status: 401, message: "توکن ارائه نشده است" };
  if (!JWT_SECRET) throw { status: 500, message: "JWT_SECRET تنظیم نشده است" };

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    if ((payload as any).role !== "admin") {
      throw { status: 403, message: "دسترسی غیرمجاز" };
    }
    return payload;
  } catch (err: any) {
    throw { status: 401, message: err?.message || "توکن نامعتبر است" };
  }
}

// 🟢 GET: دریافت همه اعلان‌ها
export async function GET() {
  try {
    const [rows] = await pool.query<NotificationRow[]>(`
      SELECT n.*, 
             p.title AS product_title, 
             o.order_code AS order_code
      FROM notifications n
      LEFT JOIN products p ON n.type = 'comment' AND n.related_id = p.id
      LEFT JOIN orders o ON n.type = 'order' AND n.related_id = o.id
      ORDER BY n.created_at DESC
    `);

    const notifications = rows.map((r) => ({
      id: r.id,
      type: r.type,
      message: r.message,
      created_at: r.created_at,
      read: Boolean(Number(r.read)),
      related_id: r.related_id ?? null,
      related_data: r.product_title ?? r.order_code ?? null,
    }));

    return NextResponse.json(notifications, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json(
      { error: "خطا در دریافت اعلان‌ها", details: error.message },
      { status: 500 },
    );
  }
}

// 🔵 PATCH: علامت‌گذاری تمام اعلان‌ها به عنوان خوانده‌شده
export async function PATCH(request: Request) {
  try {
    await verifyAdminFromToken(request);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  try {
    const [result] = await pool.query(
      `UPDATE notifications SET \`read\` = 1 WHERE \`read\` = 0`,
    );
    return NextResponse.json(
      {
        message: "تمام اعلان‌ها خوانده‌شده علامت‌گذاری شدند",
        affected: (result as any).affectedRows,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("PATCH /api/notifications error:", error);
    return NextResponse.json(
      { error: "خطا در به‌روزرسانی اعلان‌ها", details: error.message },
      { status: 500 },
    );
  }
}
