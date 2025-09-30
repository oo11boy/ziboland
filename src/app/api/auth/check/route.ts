import { NextResponse } from 'next/server';
import * as jose from 'jose';

const SECRET_KEY = process.env.JWT_SECRET || '5b139e5c95598b17e8a6064a7f972f4f2b5970801f4cd4118a35cd7d782fa370';

export async function GET(request: Request) {
  const token = request.headers.get('cookie')?.match(/authToken=([^;]+)/)?.[1];

  if (!token) {
    return NextResponse.json({ isAuthenticated: false });
  }

  try {
    const secret = new TextEncoder().encode(SECRET_KEY);
    const { payload } = await jose.jwtVerify(token, secret);
    return NextResponse.json({ isAuthenticated: true, user: payload });
  } catch (error) {
    console.error('JWT verification error:', error);
    return NextResponse.json({ isAuthenticated: false });
  }
}