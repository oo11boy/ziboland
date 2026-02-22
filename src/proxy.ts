// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

const SECRET_KEY = process.env.JWT_SECRET || '5b139e5c95598b17e8a6064a7f972f4f2b5970801f4cd4118a35cd7d782fa370'

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value
  const pathname = request.nextUrl.pathname

  // مسیرهایی که نیازی به احراز هویت ندارند
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('favicon.ico') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  let user = null

  if (token) {
    try {
      const secret = new TextEncoder().encode(SECRET_KEY)
      const { payload } = await jose.jwtVerify(token, secret)

      user = {
        id: payload.userId as number,
        phone: payload.phone as string,
        role: payload.role as 'admin' | 'customer'
      }
    } catch (err) {
      console.error('Invalid or expired token → deleting cookie')
      const response = NextResponse.redirect(new URL('/myaccount', request.url))
      response.cookies.delete('authToken')
      return response
    }
  }

  // 1. صفحه myaccount (ورود/ثبت‌نام)
  if (pathname === '/myaccount' || pathname === '/myaccount/') {
    // اگر کاربر لاگین کرده → هدایت به داشبورد مناسب
    if (user) {
      const dashboard = user.role === 'admin' ? '/admindashboard' : '/userdashboard'
      return NextResponse.redirect(new URL(dashboard, request.url))
    }
    // اگر لاگین نکرده → اجازه نمایش صفحه ورود/ثبت‌نام
    return NextResponse.next()
  }

  // 2. مسیرهای نیازمند لاگین (checkout, userdashboard و ...)
  const protectedPaths = [
    '/checkout',
    '/userdashboard',
    '/cartlist',
    '/orders',
    // هر صفحه دیگری که فقط کاربر لاگین کرده باید ببیند
  ]

  if (protectedPaths.some(p => pathname.startsWith(p))) {
    if (!user) {
      const loginUrl = new URL('/myaccount', request.url)
      loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search)
      return NextResponse.redirect(loginUrl)
    }

    // اگر نقش admin بود و خواست به userdashboard بره → می‌تونی محدود کنی یا اجازه بدی
    if (pathname.startsWith('/userdashboard') && user.role === 'admin') {
      // می‌تونی این شرط رو حذف کنی اگر ادمین هم اجازه دسترسی به userdashboard داشته باشه
      return NextResponse.redirect(new URL('/admindashboard', request.url))
    }

    return NextResponse.next()
  }

  // 3. پنل مدیریت فقط برای ادمین
  if (pathname.startsWith('/admindashboard')) {
    if (!user || user.role !== 'admin') {
      return NextResponse.redirect(new URL('/myaccount', request.url))
    }
    return NextResponse.next()
  }

  // بقیه صفحات عمومی → بدون محدودیت
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * همه مسیرها به جز موارد استاتیک و api
     * می‌تونی دقیق‌تر بنویسی اگر خواستی فقط چند صفحه خاص رو محافظت کنی
     */
    '/((?!api|_next/static|_next/image|favicon.ico|static).*)',
    
    // یا دقیق‌تر (اگر فقط می‌خوای صفحات مشخص رو چک کنی):
    // '/myaccount',
    // '/checkout/:path*',
    // '/userdashboard/:path*',
    // '/admindashboard/:path*',
  ],
}