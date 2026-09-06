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

export const projectSchema = z.object({
  title: z.string().min(2, 'O título é obrigatório.'),
  slug: z.string().min(2, 'O slug é obrigatório.'),
  number: z.string().min(1, 'O número do projeto é obrigatório.'),
  category: z.string().min(2, 'A categoria é obrigatória.'),
  location: z.string().min(2, 'A localização é obrigatória.'),
  year: z.string().min(4, 'O ano é obrigatório.'),
  status: z.string().default('Concluído'),
  description: z.string().min(10, 'A descrição deve ser detalhada.'),
  area: z.string().optional(),
  role: z.string().optional(),
  software: z.string().optional(),
  services: z.string().optional(),
  concept: z.string().optional(),
  technicalDetails: z.string().optional(),
  coverImage: z.string().min(1, 'A imagem de capa é obrigatória.'),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
