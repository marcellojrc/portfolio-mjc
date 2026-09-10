import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/admin/upload/token/route';
import * as auth from '@/lib/auth';
import { prisma } from '@/lib/db';
import * as blobSdk from '@vercel/blob';
import * as blobClient from '@vercel/blob/client';

vi.mock('@/lib/auth', () => ({
  getSession: vi.fn(),
  requireRoles: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@vercel/blob', () => ({
  issueSignedToken: vi.fn(),
}));

vi.mock('@vercel/blob/client', () => ({
  handleUploadPresigned: vi.fn(),
  handleUpload: vi.fn(),
}));

describe('Endpoint POST /api/admin/upload/token', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.BLOB_STORE_ID = 'store_test123';
    process.env.BLOB_WEBHOOK_PUBLIC_KEY =
      '-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA0000000000000000000000000000000000000000000=\n-----END PUBLIC KEY-----';
    delete process.env.BLOB_READ_WRITE_TOKEN;
  });

  it('retorna 401 quando o utilizador não está autenticado', async () => {
    vi.mocked(auth.getSession).mockResolvedValue(null);

    const req = new Request('http://localhost:3000/api/admin/upload/token', {
      method: 'POST',
      body: JSON.stringify({ type: 'blob.generate-presigned-url' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toContain('Não autenticado');
  });

  it('retorna 403 quando o utilizador tem perfil de VIEWER', async () => {
    const mockSession = {
      userId: 'usr_viewer',
      email: 'viewer@example.com',
      name: 'Viewer',
      role: 'VIEWER' as const,
    };
    vi.mocked(auth.getSession).mockResolvedValue(mockSession);
    vi.mocked(auth.requireRoles).mockReturnValue(
      new Response(JSON.stringify({ error: 'Acesso negado' }), { status: 403 }) as any
    );

    const req = new Request('http://localhost:3000/api/admin/upload/token', {
      method: 'POST',
      body: JSON.stringify({ type: 'blob.generate-presigned-url' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('processa pedido de presigned URL com sucesso para ADMIN', async () => {
    const mockSession = {
      userId: 'usr_admin',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'ADMIN' as const,
    };
    vi.mocked(auth.getSession).mockResolvedValue(mockSession);
    vi.mocked(auth.requireRoles).mockReturnValue(null);
    vi.mocked(blobClient.handleUploadPresigned).mockResolvedValue({
      type: 'blob.generate-presigned-url',
      presignedUrlPayload: {
        url: 'https://dewetrtey1kzjdbu.public.blob.vercel-storage.com',
        fields: {},
      },
    } as any);

    const req = new Request('http://localhost:3000/api/admin/upload/token', {
      method: 'POST',
      body: JSON.stringify({
        type: 'blob.generate-presigned-url',
        payload: {
          pathname: 'projects/foto.jpg',
          clientPayload: null,
          multipart: true,
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.type).toBe('blob.generate-presigned-url');
    expect(data.presignedUrlPayload.url).toBeDefined();
    expect(blobClient.handleUploadPresigned).toHaveBeenCalled();
  });

  it('rejeita ficheiro SVG com erro 400', async () => {
    const mockSession = {
      userId: 'usr_admin',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'ADMIN' as const,
    };
    vi.mocked(auth.getSession).mockResolvedValue(mockSession);
    vi.mocked(auth.requireRoles).mockReturnValue(null);
    vi.mocked(blobClient.handleUploadPresigned).mockImplementation(async (options: any) => {
      await options.getSignedToken('desenho.svg', null, false);
      return {} as any;
    });

    const req = new Request('http://localhost:3000/api/admin/upload/token', {
      method: 'POST',
      body: JSON.stringify({
        type: 'blob.generate-presigned-url',
        payload: {
          pathname: 'desenho.svg',
          clientPayload: null,
          multipart: false,
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('SVG');
  });

  it('rejeita ficheiro GIF com erro 400', async () => {
    const mockSession = {
      userId: 'usr_admin',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'ADMIN' as const,
    };
    vi.mocked(auth.getSession).mockResolvedValue(mockSession);
    vi.mocked(auth.requireRoles).mockReturnValue(null);
    vi.mocked(blobClient.handleUploadPresigned).mockImplementation(async (options: any) => {
      await options.getSignedToken('animacao.gif', null, false);
      return {} as any;
    });

    const req = new Request('http://localhost:3000/api/admin/upload/token', {
      method: 'POST',
      body: JSON.stringify({
        type: 'blob.generate-presigned-url',
        payload: {
          pathname: 'animacao.gif',
          clientPayload: null,
          multipart: false,
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('GIF');
  });

  it('retorna 404 quando o projectId especificado não existe na BD', async () => {
    const mockSession = {
      userId: 'usr_admin',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'ADMIN' as const,
    };
    vi.mocked(auth.getSession).mockResolvedValue(mockSession);
    vi.mocked(auth.requireRoles).mockReturnValue(null);
    vi.mocked(prisma.project.findUnique).mockResolvedValue(null);
    vi.mocked(blobClient.handleUploadPresigned).mockImplementation(async (options: any) => {
      await options.getSignedToken('foto.jpg', JSON.stringify({ projectId: 'prj_inexistente' }), false);
      return {} as any;
    });

    const req = new Request('http://localhost:3000/api/admin/upload/token', {
      method: 'POST',
      body: JSON.stringify({
        type: 'blob.generate-presigned-url',
        payload: {
          pathname: 'foto.jpg',
          clientPayload: JSON.stringify({ projectId: 'prj_inexistente' }),
          multipart: false,
        },
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toContain('não foi encontrado');
  });
});
