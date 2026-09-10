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

  describe('Auditoria de Validação de URLs de Mídia (isValidMediaUrl)', () => {
    it('aceita URL válida do Vercel Blob com extensões autorizadas (JPG, PNG, WebP, AVIF)', () => {
      const validBlobJpg = 'https://abc123xyz.public.blob.vercel-storage.com/projects/render-01.jpg';
      const validBlobWebp = 'https://blob.vercel-storage.com/projects/corte-02.webp';
      const validBlobAvif = 'https://blob.vercel-storage.com/projects/detalhe-03.avif';
      const validBlobPng = 'https://blob.vercel-storage.com/projects/planta-04.png';

      expect(projectMediaSchema.safeParse({ url: validBlobJpg, type: 'RENDER' }).success).toBe(true);
      expect(projectMediaSchema.safeParse({ url: validBlobWebp, type: 'SECTION' }).success).toBe(true);
      expect(projectMediaSchema.safeParse({ url: validBlobAvif, type: 'PHOTO' }).success).toBe(true);
      expect(projectMediaSchema.safeParse({ url: validBlobPng, type: 'PLAN' }).success).toBe(true);
    });

    it('aceita caminhos locais estáticos /images/...', () => {
      expect(projectMediaSchema.safeParse({ url: '/images/proj01_01.jpg', type: 'RENDER' }).success).toBe(true);
      expect(projectMediaSchema.safeParse({ url: '/images/uploads/obra-123.webp', type: 'PHOTO' }).success).toBe(true);
    });

    it('rejeita URL de SVG (.svg)', () => {
      const svgUrl = 'https://blob.vercel-storage.com/vetor.svg';
      expect(projectMediaSchema.safeParse({ url: svgUrl, type: 'RENDER' }).success).toBe(false);
    });

    it('rejeita URL de GIF (.gif)', () => {
      const gifUrl = 'https://blob.vercel-storage.com/animacao.gif';
      expect(projectMediaSchema.safeParse({ url: gifUrl, type: 'RENDER' }).success).toBe(false);
    });

    it('rejeita data: URI (data:image/svg+xml)', () => {
      const dataUri = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjwvc3ZnPg==';
      expect(projectMediaSchema.safeParse({ url: dataUri, type: 'RENDER' }).success).toBe(false);
    });

    it('rejeita documento PDF (.pdf)', () => {
      const pdfUrl = 'https://blob.vercel-storage.com/especificacoes.pdf';
      expect(projectMediaSchema.safeParse({ url: pdfUrl, type: 'RENDER' }).success).toBe(false);
    });

    it('rejeita executável EXE (.exe)', () => {
      const exeUrl = 'https://blob.vercel-storage.com/instalador.exe';
      expect(projectMediaSchema.safeParse({ url: exeUrl, type: 'RENDER' }).success).toBe(false);
    });

    it('rejeita URL vazia ou apenas com espaços', () => {
      expect(projectMediaSchema.safeParse({ url: '', type: 'RENDER' }).success).toBe(false);
      expect(projectMediaSchema.safeParse({ url: '   ', type: 'RENDER' }).success).toBe(false);
    });

    it('rejeita URL inválida ou esquema malicioso (javascript:)', () => {
      expect(projectMediaSchema.safeParse({ url: 'javascript:alert(1)', type: 'RENDER' }).success).toBe(false);
      expect(projectMediaSchema.safeParse({ url: 'http://', type: 'RENDER' }).success).toBe(false);
      expect(projectMediaSchema.safeParse({ url: 'not-a-valid-url', type: 'RENDER' }).success).toBe(false);
    });

    it('rejeita URL externa arbitrária fora do Vercel Blob (evita quebra do next/image)', () => {
      const externalUrl = 'https://random-unauthorized-domain.com/imagem.jpg';
      expect(projectMediaSchema.safeParse({ url: externalUrl, type: 'RENDER' }).success).toBe(false);
    });
  });
});
