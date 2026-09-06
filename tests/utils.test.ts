import { describe, it, expect } from 'vitest';
import { slugify, formatDate } from '@/lib/utils';

describe('Utility Functions', () => {
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
});
