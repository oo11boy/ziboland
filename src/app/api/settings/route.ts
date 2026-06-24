// app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

// 🟢 GET تنظیمات
export async function GET() {
  try {
    const [settingsRows] = await pool.query("SELECT * FROM site_settings LIMIT 1");
    const [socialLinks] = await pool.query(
      "SELECT * FROM social_links WHERE is_active = 1 ORDER BY `order` ASC"
    );
    const [phoneNumbers] = await pool.query(
      "SELECT * FROM phone_numbers WHERE is_active = 1 ORDER BY `order` ASC"
    );
    
    let settings = {};
    if (Array.isArray(settingsRows) && settingsRows.length > 0) {
      settings = settingsRows[0];
    }
    
    return NextResponse.json({
      ...settings,
      social_links: socialLinks,
      phone_numbers: phoneNumbers
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
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
      email,
      phone_numbers = [],
      address,
      working_hours,
      working_days,
      social_links = []
    } = data;

    interface SettingsRow {
      id: number;
    }
    const [rows] = await pool.query("SELECT id FROM site_settings LIMIT 1");

    if (Array.isArray(rows) && rows.length > 0) {
      const id = (rows[0] as SettingsRow).id;
      await pool.query(
        `UPDATE site_settings SET
          site_name=?, site_description=?, site_icon=?, email=?, 
          address=?, working_hours=?, working_days=? WHERE id=?`,
        [
          site_name,
          site_description,
          site_icon,
          email,
          address,
          working_hours,
          working_days,
          id,
        ],
      );
    } else {
      await pool.query(
        `INSERT INTO site_settings 
        (site_name, site_description, site_icon, email, 
         address, working_hours, working_days)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          site_name,
          site_description,
          site_icon,
          email,
          address,
          working_hours,
          working_days,
        ],
      );
    }

    // ذخیره شماره‌های تلفن
    await pool.query("DELETE FROM phone_numbers");
    if (Array.isArray(phone_numbers) && phone_numbers.length > 0) {
      for (const phone of phone_numbers) {
        if (phone.number) {
          await pool.query(
            `INSERT INTO phone_numbers (number, label, \`order\`, is_active) 
             VALUES (?, ?, ?, ?)`,
            [phone.number, phone.label || '', phone.order || 0, phone.is_active !== false ? 1 : 0]
          );
        }
      }
    }

    // ذخیره لینک‌های اجتماعی
    await pool.query("DELETE FROM social_links");
    if (Array.isArray(social_links) && social_links.length > 0) {
      for (const link of social_links) {
        if (link.title && link.link) {
          await pool.query(
            `INSERT INTO social_links (title, icon, link, \`order\`, is_active) 
             VALUES (?, ?, ?, ?, ?)`,
            [link.title, link.icon || '', link.link, link.order || 0, link.is_active !== false ? 1 : 0]
          );
        }
      }
    }

    return NextResponse.json({ message: "Settings saved successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 },
    );
  }
}