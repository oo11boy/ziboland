// middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || '5b139e5c95598b17e8a6064a7f972f4f2b5970801f4cd4118a35cd7d782fa370';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith('/admindashboard')) {
    const token = request.cookies.get('authToken')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/myaccount', request.url));
    }

    try {
      const decoded = verify(token, SECRET_KEY) as { userId: number; email: string; role: string };
      if (decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/userdashboard', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/myaccount', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admindashboard/:path*'],
};