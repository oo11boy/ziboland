// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ message: 'خروج با موفقیت انجام شد' });
    response.cookies.set('authToken', '', { maxAge: 0 }); // Clear the cookie
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'خطا در خروج' }, { status: 500 });
  }
}