import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      'ERRO CRÍTICO DE SEGURANÇA: AUTH_SECRET tem de estar configurado e ter pelo menos 32 caracteres.'
    );
  }

  return new TextEncoder().encode(secret);
}

const COOKIE_NAME = 'mjc_admin_session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secretKey = getJwtSecret();

  // 1. Se a rota for /admin/login
  if (pathname === '/admin/login') {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      try {
        await jwtVerify(token, secretKey);
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      } catch {
        // Token inválido ou expirado, permitir aceder a /admin/login
      }
    }
    return NextResponse.next();
  }

  // 2. Para qualquer rota /admin ou /admin/*
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url);
      if (pathname !== '/admin') {
        loginUrl.searchParams.set('redirect', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(token, secretKey);

      // Se acedeu a /admin diretamente e está autenticado, redireciona para o dashboard
      if (pathname === '/admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }

      return NextResponse.next();
    } catch {
      const loginUrl = new URL('/admin/login', request.url);
      if (pathname !== '/admin') {
        loginUrl.searchParams.set('redirect', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
