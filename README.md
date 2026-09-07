# MJC Architecture — Plataforma Digital & Portfólio

Plataforma digital profissional e sistema de gestão de conteúdos (CMS) para o ateliê e prática de **Marcelo Júnior Cumbe** — Estudante Finalista de Arquitetura e Planeamento Físico na **Universidade Eduardo Mondlane (UEM)**, Maputo, Moçambique.

---

## 🏛️ Visão e Identidade

Concebido segundo princípios de desenho editorial e rigor arquitetónico:
- **Espacialidade & Ritmo:** Grelha estruturante de 12 colunas, hierarquia tipográfica imponente com as famílias `Archivo` e `Archivo Black`.
- **Materialidade & Cor:** Modo escuro arquitetónico (`#0c0c0d`), contrastes de texturas, realces em terracota (`#d98a4f`) e vermelho cinábrio (`#e8342a`).
- **Precisão Construtiva:** Todos os 12 projetos incluem fichas técnicas com áreas (m²), papéis desempenhados, programas funcionais, sistemas construtivos e galerias com visualizador Lightbox acessível.

---

## 🚀 Funcionalidades Principais

### 🌐 Website Público
1. **Homepage Cinemática (`/`):** Hero monumental, indicadores chave de carreira (12 projetos, UEM, BIM, GIS), manifesto de design, disciplinas e chamada para ação.
2. **Catálogo Filtrável (`/projects`):** Navegação reativa por categorias (*Habitacional*, *Equipamento*, *Urbano*, *Reabilitação*, *Interiores*), pesquisa instantânea em tempo real e contadores.
3. **Páginas Individuais de Case Study (`/projects/[slug]`):** Estrutura de memória descritiva, conceito espacial, ficha técnica com softwares e áreas, galeria de plantas/cortes/renders em alta resolução com navegação contínua entre projetos.
4. **Sobre Mim (`/about`):** Biografia integral, registos fotográficos de atividades práticas (docência CFM-Beira, GIZ, YouthMappers), competências e caixa de ferramentas de software.
5. **Trajetória Profissional (`/experience`):** Linha do tempo editorial com percurso em ateliê, formação corporativa e projetos geoespaciais humanitários.
6. **Contacto Seguro (`/contact`):** Formulário interativo com validação no servidor (Zod) e gravação em base de dados, além de canais diretos (WhatsApp, Email, LinkedIn, Instagram e Download do CV em PDF).

### 🔐 Painel Administrativo Editorial (`/admin`)
- **Autenticação Segura:** Sessões assinadas com JWT via cookies HttpOnly, passwords protegidas com algoritmo `bcryptjs`.
- **Dashboard de Métricas (`/admin/dashboard`):** Total de projetos, projetos publicados vs. rascunhos, contador de mensagens recebidas e registo cronológico de atividades do sistema.
- **Gestão de Projetos (`/admin/projects`):** Listagem geral com alternância rápida entre *Publicado* e *Rascunho*, toggle de *Destaque na Homepage*, criação (`/admin/projects/new`), edição (`/admin/projects/[id]/edit`) e eliminação.
- **Caixa de Mensagens (`/admin/messages`):** Leitura de consultas enviadas pelo público com marcação de lida/não lida e eliminação.
- **Biblioteca de Mídia (`/admin/media`):** Catálogo visual de imagens e desenhos técnicos classificados por tipologia (*RENDER*, *PLAN*, *SECTION*, *DRAWING*, *PHOTO*).

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Propósito |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 15 (App Router) | Server Components, páginas estáticas e rotas dinâmicas |
| **Linguagem** | TypeScript | Tipagem estrita de modelos, props e APIs |
| **Estilos & Layout** | Tailwind CSS | Sistema de design modular com tokens arquitetónicos |
| **Base de Dados & ORM** | Prisma ORM + SQLite / PostgreSQL | Persistência de dados (SQLite local e pronto para Postgres em prod) |
| **Autenticação** | `jose` + `bcryptjs` | Sessões seguras em cookies HttpOnly |
| **Validação** | Zod | Validação robusta de formulários e rotas de API |
| **Ícones** | Lucide React | Grafismo minimalista e editorial |
| **Testes** | Vitest | Testes unitários para schemas de validação e utilitários |
| **CI/CD** | GitHub Actions | Pipeline automatizado de lint, typecheck, testes e build |

---

## 📦 Instalação e Execução Local

### Pré-requisitos
- Node.js v20+ instalado
- npm ou pnpm

### Passos:
```bash
# 1. Aceder ao diretório do projeto
cd E:\Antigravity\portfolio-mjc

# 2. Instalar as dependências
npm run install (ou npm.cmd install no Windows)

# 3. Configurar variáveis de ambiente
cp .env.example .env

# 4. Sincronizar a base de dados e executar o Seed dos 12 projetos originais
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts

# 5. Iniciar o servidor de desenvolvimento
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o website público.

Para aceder ao Painel Administrativo, visite [http://localhost:3000/admin](http://localhost:3000/admin):
- **Email:** `marcelojuniord07@gmail.com`
- **Palavra-passe padrão:** `admin_mjc_2026!` *(definida no .env)*

---

## 🧪 Testes Automatizados

```bash
# Executar a suite de testes Vitest
npm test

# Verificação de tipos TypeScript
npm run typecheck

# Teste de compilação de produção
npm run build
```

---

## 🚀 Preparação para Produção (Vercel + PostgreSQL)

1. Crie uma base de dados PostgreSQL gratuita (ex.: [Neon.tech](https://neon.tech) ou [Supabase](https://supabase.com)).
2. O ficheiro `prisma/schema.prisma` já usa PostgreSQL; mantenha `prisma/schema.sqlite.prisma` exclusivamente para cópias de segurança e leitura do SQLite local.
3. Defina as variáveis de ambiente na Vercel:
   - `DATABASE_URL`: Connection string do seu PostgreSQL.
   - `AUTH_SECRET`: Segredo longo e aleatório (`openssl rand -base64 32`).
   - `ADMIN_EMAIL`: O seu email de acesso.
   - `ADMIN_DEFAULT_PASSWORD`: A sua palavra-passe forte.
   - `NEXT_PUBLIC_SITE_URL`: Domínio final do website (ex.: `https://marcelocumbe.com`).
4. Com uma URL Neon nova e vazia, aplique o schema e importe o dump preservando IDs e relações:
   ```bash
   npm run db:migrate-deploy
   npm run db:migrate-to-neon -- --apply
   ```
   A importação recusa bases Neon que já contenham dados e só declara sucesso após verificar as contagens do dump.
5. Configure `BLOB_READ_WRITE_TOKEN` na Vercel. Em produção, uploads não recorrem ao disco efémero: sem esse token, são recusados.

---

© 2026 Marcelo Júnior Cumbe. Todos os direitos reservados.
Universidade Eduardo Mondlane — Faculdade de Arquitetura e Planeamento Físico.
