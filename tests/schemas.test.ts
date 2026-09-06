import { describe, it, expect } from 'vitest';
import {
  contactSchema,
  loginSchema,
  projectSchema,
  projectMediaSchema,
  experienceSchema,
  educationSchema,
  skillSchema,
  aboutProfileSchema,
} from '@/schemas';

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
      email: 'admin@exemplo.com',
      password: 'password123',
    };

    const result = loginSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('validates project schema fields with media gallery', () => {
    const validProject = {
      title: 'Mercado Fajardo',
      slug: 'mercado-fajardo',
      number: '02',
      category: 'Equipamento',
      location: 'Beira, Moçambique',
      year: '2025',
      status: 'Concluído',
      description: 'Requalificação de espaço comercial com ventilação natural.',
      coverImage: '/images/uploads/mercado-capa.jpg',
      featured: true,
      published: true,
      media: [
        {
          url: '/images/uploads/mercado-capa.jpg',
          type: 'RENDER',
          alt: 'Perspetiva principal do mercado',
          caption: 'Entrada com arborização nativa',
          order: 1,
        },
        {
          url: '/images/uploads/mercado-planta.jpg',
          type: 'PLAN',
          alt: 'Planta de implantação',
          caption: 'Distribuição dos módulos de bancadas',
          order: 2,
        },
      ],
    };

    const result = projectSchema.safeParse(validProject);
    expect(result.success).toBe(true);
  });

  it('validates individual media item types and captions', () => {
    const validMedia = {
      url: '/images/corte-aa.jpg',
      type: 'SECTION',
      alt: 'Corte transversal AA',
      caption: 'Pormenor da claraboia e ventilação passiva',
      order: 3,
    };

    const result = projectMediaSchema.safeParse(validMedia);
    expect(result.success).toBe(true);
  });

  it('validates experience schema and rejects missing period or role', () => {
    const validExp = {
      period: '2025',
      role: 'Docência de Revit (BIM)',
      organization: 'CFM – Beira',
      description: 'Capacitação técnica em Autodesk Revit para equipas de engenharia.',
      order: 2,
    };
    expect(experienceSchema.safeParse(validExp).success).toBe(true);

    const invalidExp = {
      period: '',
      role: '',
      organization: 'Empresa',
      description: 'Curto',
    };
    expect(experienceSchema.safeParse(invalidExp).success).toBe(false);
  });

  it('validates education schema and editable academic descriptions', () => {
    const validEdu = {
      period: '2022 — Presente',
      degree: 'Licenciatura em Arquitetura e Planeamento Físico',
      institution: 'Universidade Eduardo Mondlane (UEM)',
      description: 'Formação aprofundada em projeto de arquitetura, BIM e SIG.',
      order: 1,
    };
    expect(educationSchema.safeParse(validEdu).success).toBe(true);

    const invalidEdu = {
      period: '2022',
      degree: '',
      institution: '',
      description: '',
    };
    expect(educationSchema.safeParse(invalidEdu).success).toBe(false);
  });

  it('validates skill schema with levels and categories', () => {
    const validSkill = {
      name: 'Autodesk Revit',
      level: 'Avançado',
      category: 'BIM & GIS',
      order: 1,
    };
    expect(skillSchema.safeParse(validSkill).success).toBe(true);
  });

  it('validates about profile schema', () => {
    const validProfile = {
      name: 'Marcelo Júnior Cumbe',
      title: 'Arquiteto & Planeador Físico',
      bioParagraph1: 'Estudante finalista de arquitetura apaixonado por sustentabilidade e modelação BIM.',
      portraitUrl: '/images/about_portrait.jpg',
      workBase: 'Catembe, Maputo',
      focus: 'BIM · GIS · Arquitetura Sustentável',
    };
    expect(aboutProfileSchema.safeParse(validProfile).success).toBe(true);
  });
});
