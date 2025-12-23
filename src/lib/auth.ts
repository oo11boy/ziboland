// lib/auth.ts
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SECRET_KEY = process.env.JWT_SECRET || '5b139e5c95598b17e8a6064a7f972f4f2b5970801f4cd4118a35cd7d782fa370';

export interface AuthUser {
  userId: number;
  email: string;
  role: 'admin' | 'customer';
}

// تابع پایه برای تایید توکن
export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, SECRET_KEY) as AuthUser;
  } catch (error) {
    return null;
  }
}

// ۱. لایه محافظتی ادمین (فقط ادمین)
export function withAdmin(handler: Function) {
  return async (request: Request, ...args: any[]) => {
    const token = (await cookies()).get("authToken")?.value;
    const user = token ? verifyToken(token) : null;

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: "دسترسی غیرمجاز - فقط مدیریت" }, { status: 403 });
    }

    // پاس دادن اطلاعات کاربر به هندلر اصلی برای استفاده احتمالی
    return handler(request, ...args, user);
  };
}

// ۲. لایه محافظتی مشتری (ادمین یا مشتری لاگین شده)
export function withClient(handler: Function) {
  return async (request: Request, ...args: any[]) => {
    const token = (await cookies()).get("authToken")?.value;
    const user = token ? verifyToken(token) : null;

    // مشتری یا ادمین اجازه دسترسی دارند (مثلاً ادمین باید بتواند پروفایل یوزرها را ببیند)
    if (!user || (user.role !== 'customer' && user.role !== 'admin')) {
      return NextResponse.json({ error: "لطفاً ابتدا وارد حساب کاربری خود شوید" }, { status: 401 });
    }

    return handler(request, ...args, user);
  };
}

// ۳. لایه کاربر عمومی (بدون نیاز به توکن - اما اگر توکن داشت شناسایی شود)
export function withPublic(handler: Function) {
  return async (request: Request, ...args: any[]) => {
    const token = (await cookies()).get("authToken")?.value;
    const user = token ? verifyToken(token) : null;

    // هیچ محدودیتی اعمال نمی‌شود، فقط یوزر (در صورت وجود) شناسایی می‌شود
    return handler(request, ...args, user);
  };
}