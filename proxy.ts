import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, decodeSession } from '@/app/lib/auth/token';

const LOGIN_PATH = '/admin/login';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = decodeSession(req.cookies.get(SESSION_COOKIE)?.value);
  const isLoginPage = pathname === LOGIN_PATH;

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL(LOGIN_PATH, req.url));
  }

  if (session && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
