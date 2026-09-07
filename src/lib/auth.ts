import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export interface AdminPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole | string;
}

const COOKIE_NAME = 'mjc_admin_session';

export function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      'ERRO CRÍTICO DE SEGURANÇA: AUTH_SECRET tem de estar configurado e ter pelo menos 32 caracteres.'
    );
  }

  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: AdminPayload): Promise<string> {
  const secret = getJwtSecret();
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  return token;
}

export async function getSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as AdminPayload;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * RBAC Helper: Verifica se o utilizador possui um dos papéis autorizados
 */
export function hasPermission(userRole: string | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as UserRole);
}

/**
 * RBAC Guard para rotas de API
 * Retorna NextResponse de erro se não autorizado, ou null se a autorização passar.
 */
export function requireRoles(
  session: AdminPayload | null,
  allowedRoles: UserRole[] = ['ADMIN']
): NextResponse | null {
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado. Inicie sessão para continuar.' }, { status: 401 });
  }

  if (!hasPermission(session.role, allowedRoles)) {
    return NextResponse.json(
      {
        error: `Acesso negado. A sua conta (${session.role}) não tem permissões para esta operação.`,
      },
      { status: 403 }
    );
  }

  return null;
}
