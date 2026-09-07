import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { slugify, formatDate, getBaseUrl } from '@/lib/utils';

describe('Utility Functions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('correctly creates slugs from project titles with accents', () => {
    expect(slugify('Edifício Changule')).toBe('edificio-changule');
    expect(slugify('Requalificação Urbana — Polana Caniço A')).toBe(
      'requalificacao-urbana-polana-canico-a'
    );
    expect(slugify('Casa Q28C25')).toBe('casa-q28c25');
  });

  it('formats dates consistently', () => {
    const date = new Date('2026-09-06T12:00:00Z');
    const formatted = formatDate(date);
    expect(formatted).toContain('2026');
  });

  it('resolves getBaseUrl based on environment variables', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true, writable: true });

    expect(getBaseUrl()).toBe('http://localhost:3000');

    process.env.NEXT_PUBLIC_SITE_URL = 'https://marcellojrc.vercel.app/';
    expect(getBaseUrl()).toBe('https://marcellojrc.vercel.app');

    delete process.env.NEXT_PUBLIC_SITE_URL;
    Object.defineProperty(process.env, 'NODE_ENV', { value: 'production', configurable: true, writable: true });
    expect(getBaseUrl()).toBe('https://marcellojrc.vercel.app');

    Object.defineProperty(process.env, 'NODE_ENV', { value: 'development', configurable: true, writable: true });
    process.env.VERCEL = '1';
    expect(getBaseUrl()).toBe('https://marcellojrc.vercel.app');
  });
});

