import { NextResponse } from "next/server";
import * as jose from "jose";

export async function GET(request: Request) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "لطفاً توکن را ارائه دهید" }, { status: 401 });
  }

  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    console.error("JWT_SECRET is not set");
    return NextResponse.json({ error: "خطای سرور: تنظیمات نادرست" }, { status: 500 });
  }

  try {
    const secret = new TextEncoder().encode(secretKey);
    const { payload } = await jose.jwtVerify(token, secret);
    return NextResponse.json({
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    });
  } catch (error: any) {
    console.error("JWT verification error:", error.message);
    return NextResponse.json({ error: "توکن نامعتبر است", details: error.message }, { status: 401 });
  }
}