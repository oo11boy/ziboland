import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// 🟢 GET تنظیمات
export async function GET() {
  try {
    const [rows] = await pool.query("SELECT * FROM site_settings LIMIT 1");
    if (Array.isArray(rows) && rows.length > 0) {
      return NextResponse.json(rows[0]);
    }
    return NextResponse.json({});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

// 🟠 POST ایجاد یا ویرایش تنظیمات
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      site_name,
      site_description,
      site_icon,
      telegram_link,
      whatsapp_link,
      instagram_link,
      email,
      phone,
      address,
      working_hours,
      working_days,
    } = data;

    interface SettingsRow {
      id: number;
    }
    const [rows] = await pool.query("SELECT id FROM site_settings LIMIT 1");

    if (Array.isArray(rows) && rows.length > 0) {
      const id = (rows[0] as SettingsRow).id;
      await pool.query(
        `UPDATE site_settings SET
          site_name=?, site_description=?, site_icon=?, telegram_link=?,
          whatsapp_link=?, instagram_link=?, email=?, phone=?, address=?,
          working_hours=?, working_days=? WHERE id=?`,
        [
          site_name,
          site_description,
          site_icon,
          telegram_link,
          whatsapp_link,
          instagram_link,
          email,
          phone,
          address,
          working_hours,
          working_days,
          id,
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO site_settings 
        (site_name, site_description, site_icon, telegram_link, whatsapp_link,
        instagram_link, email, phone, address, working_hours, working_days)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          site_name,
          site_description,
          site_icon,
          telegram_link,
          whatsapp_link,
          instagram_link,
          email,
          phone,
          address,
          working_hours,
          working_days,
        ]
      );
    }

    return NextResponse.json({ message: "Settings saved successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
