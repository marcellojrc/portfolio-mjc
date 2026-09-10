import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Introduza um email válido.'),
  password: z.string().min(6, 'A palavra-passe deve ter pelo menos 6 caracteres.'),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.'),
  email: z.string().email('Introduza um email válido.'),
  subject: z.string().optional(),
  message: z.string().min(10, 'A mensagem deve ter pelo menos 10 caracteres.'),
});

export function isValidMediaUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  const lower = trimmed.toLowerCase();
  // 1. Rejeição de esquemas perigosos e data URIs
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.includes('<') ||
    lower.includes('>')
  ) {
    return false;
  }

  // 2. Extração de extensão do arquivo
  const cleanPath = lower.split(/[?#]/)[0];
  const dotIndex = cleanPath.lastIndexOf('.');
  if (dotIndex === -1) return false;
  const ext = cleanPath.slice(dotIndex);

  // 3. Validação estrita de extensão (Apenas JPG, PNG, WebP, AVIF — rejeita SVG, GIF, PDF, EXE)
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
  if (!allowedExtensions.includes(ext)) {
    return false;
  }

  // 4. Validação da origem do asset (Conformidade arquitetural e next.config.ts)
  // 4.1. Caminhos locais de projeto (public/images/...)
  if (trimmed.startsWith('/images/')) {
    return true;
  }

  // 4.2. Vercel Blob Storage oficial (HTTPS com hostname vercel-storage.com)
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    if (host === 'blob.vercel-storage.com' || host.endsWith('.blob.vercel-storage.com')) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

export const projectMediaSchema = z.object({
  id: z.string().optional(),
  url: z
    .string()
    .min(1, 'O caminho/URL da imagem é obrigatório.')
    .refine(isValidMediaUrl, {
      message: 'Ficheiros SVG não são permitidos no CMS. Formatos aceites: JPG, PNG, WebP ou AVIF.',
    }),
  type: z
    .enum(['IMAGE', 'PLAN', 'SECTION', 'ELEVATION', 'RENDER', 'PHOTO'])
    .default('IMAGE'),
  alt: z.string().default(''),
  caption: z.string().optional().nullable(),
  order: z.number().int().default(0),
});

export const projectSchema = z.object({
  title: z.string().min(2, 'O título é obrigatório.'),
  slug: z.string().min(2, 'O slug é obrigatório.'),
  number: z.string().min(1, 'O número do projeto é obrigatório.'),
  category: z.string().min(2, 'A categoria é obrigatória.'),
  location: z.string().min(2, 'A localização é obrigatória.'),
  year: z.string().min(4, 'O ano é obrigatório.'),
  status: z.string().default('Concluído'),
  description: z.string().min(10, 'A descrição deve ser detalhada.'),
  area: z.string().optional().nullable(),
  role: z.string().optional().nullable(),
  software: z.string().optional().nullable(),
  services: z.string().optional().nullable(),
  concept: z.string().optional().nullable(),
  technicalDetails: z.string().optional().nullable(),
  coverImage: z
    .string()
    .min(1, 'A imagem de capa é obrigatória.')
    .refine(isValidMediaUrl, {
      message: 'Ficheiros SVG não são permitidos como imagem de capa. Formatos aceites: JPG, PNG, WebP ou AVIF.',
    }),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  media: z.array(projectMediaSchema).optional(),
});

export const experienceSchema = z.object({
  id: z.string().optional(),
  period: z.string().min(1, 'O período é obrigatório (ex: 2024 — Presente).'),
  role: z.string().min(2, 'O cargo/função é obrigatório.'),
  organization: z.string().min(2, 'A organização/empresa é obrigatória.'),
  description: z.string().min(5, 'A descrição é obrigatória.'),
  order: z.number().int().default(0),
});

export const educationSchema = z.object({
  id: z.string().optional(),
  period: z.string().min(1, 'O período é obrigatório (ex: 2022 — Presente).'),
  degree: z.string().min(2, 'O curso/grau é obrigatório.'),
  institution: z.string().min(2, 'A instituição é obrigatória.'),
  description: z.string().min(5, 'A descrição detalhada é obrigatória.'),
  order: z.number().int().default(0),
});

export const skillSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'O nome da competência é obrigatório.'),
  level: z.string().min(1, 'O nível é obrigatório (ex: Avançado, Intermédio).'),
  category: z.string().min(1, 'A categoria é obrigatória (ex: BIM & GIS).'),
  order: z.number().int().default(0),
});

export const siteSettingsSchema = z.record(z.string(), z.string());

export const aboutProfileSchema = z.object({
  name: z.string().min(2, 'O nome é obrigatório.'),
  title: z.string().min(2, 'O título profissional é obrigatório.'),
  bioParagraph1: z.string().min(10, 'O primeiro parágrafo da biografia é obrigatório.'),
  bioParagraph2: z.string().optional().default(''),
  bioParagraph3: z.string().optional().default(''),
  portraitUrl: z
    .string()
    .min(1, 'A fotografia de perfil é obrigatória.')
    .refine(isValidMediaUrl, {
      message: 'Ficheiros SVG não são permitidos como foto de perfil. Formatos aceites: JPG, PNG, WebP ou AVIF.',
    }),
  workBase: z.string().min(2, 'A base de trabalho é obrigatória.'),
  focus: z.string().min(2, 'O foco profissional é obrigatório.'),
  cvUrl: z.string().optional().default(''),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ProjectMediaInput = z.infer<typeof projectMediaSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ExperienceInput = z.infer<typeof experienceSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type SkillInput = z.infer<typeof skillSchema>;
export type AboutProfileInput = z.infer<typeof aboutProfileSchema>;
