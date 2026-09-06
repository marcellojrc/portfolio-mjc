import { describe, it, expect } from 'vitest';
import { hasPermission, requireRoles, getJwtSecret, type AdminPayload } from '@/lib/auth';

describe('RBAC & Security Authentication', () => {
  it('correctly evaluates role permissions', () => {
    expect(hasPermission('ADMIN', ['ADMIN'])).toBe(true);
    expect(hasPermission('ADMIN', ['ADMIN', 'EDITOR'])).toBe(true);
    expect(hasPermission('EDITOR', ['ADMIN'])).toBe(false);
    expect(hasPermission('EDITOR', ['ADMIN', 'EDITOR'])).toBe(true);
    expect(hasPermission('VIEWER', ['ADMIN', 'EDITOR'])).toBe(false);
    expect(hasPermission('VIEWER', ['ADMIN', 'EDITOR', 'VIEWER'])).toBe(true);
    expect(hasPermission(undefined, ['ADMIN'])).toBe(false);
  });

  it('requireRoles returns 401 when session is null', () => {
    const errorResponse = requireRoles(null, ['ADMIN']);
    expect(errorResponse).not.toBeNull();
    expect(errorResponse?.status).toBe(401);
  });

  it('requireRoles returns 403 when user lacks required role', () => {
    const editorSession: AdminPayload = {
      userId: 'user_123',
      email: 'editor@exemplo.com',
      name: 'Editor MJC',
      role: 'EDITOR',
    };

    const forbidden = requireRoles(editorSession, ['ADMIN']);
    expect(forbidden).not.toBeNull();
    expect(forbidden?.status).toBe(403);
  });

  it('requireRoles returns null (success) when user has authorized role', () => {
    const adminSession: AdminPayload = {
      userId: 'admin_123',
      email: 'admin@exemplo.com',
      name: 'Marcelo Cumbe',
      role: 'ADMIN',
    };

    const allowed = requireRoles(adminSession, ['ADMIN']);
    expect(allowed).toBeNull();
  });

  it('returns valid JWT secret key in development mode', () => {
    const secret = getJwtSecret();
    expect(secret).toBeInstanceOf(Uint8Array);
    expect(secret.length).toBeGreaterThanOrEqual(16);
  });
});
