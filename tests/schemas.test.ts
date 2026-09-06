import { describe, it, expect } from 'vitest';
import { contactSchema, loginSchema, projectSchema } from '@/schemas';

describe('Zod Validation Schemas', () => {
  it('validates correct contact submission', () => {
    const valid = {
      name: 'Paulo Jorge',
      email: 'paulo@exemplo.com',
      subject: 'Projeto de Moradia',
      message: 'Gostaria de solicitar um orçamento para um projeto residencial em Maputo.',
    };

    const result = contactSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects contact submission with invalid email', () => {
    const invalid = {
      name: 'Paulo',
      email: 'not-an-email',
      message: 'Mensagem de teste.',
    };

    const result = contactSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('validates correct login credentials', () => {
    const valid = {
      email: 'marcelojuniord07@gmail.com',
      password: 'password123',
    };

    const result = loginSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('validates project schema fields', () => {
    const validProject = {
      title: 'Casa Q28C25',
      slug: 'casa-q28c25',
      number: '01',
      category: 'Habitacional',
      location: 'Maputo',
      year: '2024',
      status: 'Concluído',
      description: 'Projeto habitacional multifamiliar desenvolvido em contexto consolidado.',
      coverImage: '/images/proj01_01.jpg',
      featured: true,
      published: true,
    };

    const result = projectSchema.safeParse(validProject);
    expect(result.success).toBe(true);
  });
});
