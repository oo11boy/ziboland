// api/auth/send-otp/route.ts
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();

    if (!phone || phone.length !== 11 || !phone.startsWith("09")) {
      return NextResponse.json(
        { error: "شماره موبایل نامعتبر است" },
        { status: 400 },
      );
    }

    // بایپس ادمین - بدون ارسال پیامک
    if (phone === "09123456789") {
      const fixedCode = "123456";

      await pool.query(
        `INSERT INTO verification_codes (user_id, email, code, expires_at, used)
         VALUES (0, ?, ?, DATE_ADD(NOW(), INTERVAL 30 MINUTE), 0)`,
        [phone, fixedCode],
      );

      console.log(`[ADMIN BYPASS] No SMS sent for ${phone} - fixed code: 1234`);

      return NextResponse.json({ success: true });
    }

    // کاربران معمولی → کد تصادفی + ارسال پیامک واقعی
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      `INSERT INTO verification_codes (user_id, email, code, expires_at, used)
       VALUES (0, ?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE), 0)`,
      [phone, code],
    );

    const cleanPhone = "98" + phone.substring(1);

    const response = await fetch("https://edge.ippanel.com/v1/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.IPPANEL_API_KEY!,
      },
      body: JSON.stringify({
        sending_type: "pattern",
        from_number: process.env.IPPANEL_ORIGINATOR,
        code: process.env.IPPANEL_PATTERN_CODE,
        recipients: [cleanPhone],
        params: {
          code: code,
        },
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.meta?.status) {
      console.error("IPPanel send error:", result);
      return NextResponse.json(
        { error: "خطا در ارسال پیامک" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("send-otp error:", err);
    return NextResponse.json(
      { error: "خطای سرور در ارسال کد" },
      { status: 500 },
    );
  }
}
