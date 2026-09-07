import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script de Migração Segura: SQLite Dump -> Neon PostgreSQL
 * 
 * Uso:
 * DATABASE_URL="postgresql://user:password@ep-xyz.eu-central-1.aws.neon.tech/neondb?sslmode=require" npx tsx scripts/migrate-to-neon.ts
 */

async function migrate() {
  console.log('=== MIGRAÇÃO SEGURA PARA NEON POSTGRESQL ===\n');

  if (!process.argv.includes('--apply')) {
    console.error('Migração não iniciada. Reveja o backup e execute novamente com --apply para autorizar escrita no Neon.');
    process.exit(1);
  }

  const targetUrl = process.env.DATABASE_URL;
  if (!targetUrl || targetUrl.startsWith('file:')) {
    console.error('ERRO: A variável DATABASE_URL deve apontar para uma base de dados PostgreSQL (Neon).');
    console.error('Exemplo: DATABASE_URL="postgresql://..." npx tsx scripts/migrate-to-neon.ts');
    process.exit(1);
  }

  const dumpPath = path.join(process.cwd(), 'prisma', 'backups', 'dump-latest.json');
  if (!fs.existsSync(dumpPath)) {
    console.error(`ERRO: Ficheiro de dump não encontrado em ${dumpPath}. Execute primeiro: npm run db:backup`);
    process.exit(1);
  }

  const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf-8'));
  const { data, metadata } = dump;

  console.log(`Lendo dump estruturado de ${metadata.exportedAt} com ${metadata.counts.projects} projetos e ${metadata.counts.projectMedia} mídias...`);

  const prisma = new PrismaClient({
    datasources: {
      db: { url: targetUrl },
    },
  });

  try {
    const existingCounts = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.projectMedia.count(),
      prisma.experience.count(),
      prisma.education.count(),
      prisma.skill.count(),
      prisma.contactMessage.count(),
      prisma.activityLog.count(),
      prisma.siteSettings.count(),
    ]);
    if (existingCounts.some((count) => count > 0)) {
      throw new Error(
        'O Neon de destino já contém dados. A migração foi cancelada para evitar alterações ou sobreposição de registos existentes.'
      );
    }

    await prisma.$transaction(async (tx) => {
      const prisma = tx;

    console.log('1. Migrando Utilizadores...');
    for (const u of data.users) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: {},
        create: {
          id: u.id,
          email: u.email,
          passwordHash: u.passwordHash,
          name: u.name,
          role: u.role,
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt),
        },
      });
    }

    console.log('2. Migrando Definições do Site...');
    for (const s of data.siteSettings) {
      await prisma.siteSettings.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: {
          id: s.id,
          key: s.key,
          value: s.value,
        },
      });
    }

    console.log('3. Migrando Experiências...');
    for (const e of data.experiences) {
      await prisma.experience.upsert({
        where: { id: e.id },
        update: {},
        create: {
          id: e.id,
          period: e.period,
          role: e.role,
          organization: e.organization,
          description: e.description,
          order: e.order,
          createdAt: new Date(e.createdAt),
        },
      });
    }

    console.log('4. Migrando Formações...');
    for (const ed of data.educations) {
      await prisma.education.upsert({
        where: { id: ed.id },
        update: {},
        create: {
          id: ed.id,
          period: ed.period,
          degree: ed.degree,
          institution: ed.institution,
          description: ed.description,
          order: ed.order,
          createdAt: new Date(ed.createdAt),
        },
      });
    }

    console.log('5. Migrando Competências...');
    for (const sk of data.skills) {
      await prisma.skill.upsert({
        where: { id: sk.id },
        update: {},
        create: {
          id: sk.id,
          name: sk.name,
          level: sk.level,
          category: sk.category,
          order: sk.order,
        },
      });
    }

    console.log('6. Migrando Projetos e Mídias...');
    for (const p of data.projects) {
      await prisma.project.upsert({
        where: { id: p.id },
        update: {},
        create: {
          id: p.id,
          slug: p.slug,
          number: p.number,
          title: p.title,
          category: p.category,
          location: p.location,
          year: p.year,
          status: p.status,
          description: p.description,
          area: p.area,
          role: p.role,
          software: p.software,
          services: p.services,
          concept: p.concept,
          technicalDetails: p.technicalDetails,
          coverImage: p.coverImage,
          featured: p.featured,
          published: p.published,
          order: p.order,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          publishedAt: p.publishedAt ? new Date(p.publishedAt) : null,
        },
      });
    }

    for (const m of data.projectMedia) {
      await prisma.projectMedia.upsert({
        where: { id: m.id },
        update: {},
        create: {
          id: m.id,
          projectId: m.projectId,
          url: m.url,
          type: m.type,
          alt: m.alt,
          caption: m.caption,
          order: m.order,
          createdAt: new Date(m.createdAt),
        },
      });
    }

    console.log('7. Migrando Mensagens e Logs de Atividade...');
    for (const msg of data.contactMessages) {
      await prisma.contactMessage.upsert({
        where: { id: msg.id },
        update: {},
        create: {
          id: msg.id,
          name: msg.name,
          email: msg.email,
          subject: msg.subject,
          message: msg.message,
          read: msg.read,
          createdAt: new Date(msg.createdAt),
        },
      });
    }

    for (const log of data.activityLogs) {
      await prisma.activityLog.upsert({
        where: { id: log.id },
        update: {},
        create: {
          id: log.id,
          userId: log.userId,
          action: log.action,
          details: log.details,
          createdAt: new Date(log.createdAt),
        },
      });
    }

    }, { timeout: 20_000 });

    // Validação comparativa
    console.log('\n--- VERIFICAÇÃO DE PARIDADE SQLITE vs NEON ---');
    const [
      usersCount,
      projectsCount,
      mediaCount,
      expCount,
      eduCount,
      skillsCount,
      messagesCount,
      logsCount,
      settingsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.projectMedia.count(),
      prisma.experience.count(),
      prisma.education.count(),
      prisma.skill.count(),
      prisma.contactMessage.count(),
      prisma.activityLog.count(),
      prisma.siteSettings.count(),
    ]);

    const parityTable = {
      'Utilizadores': { SQLite: metadata.counts.users, Neon: usersCount },
      'Projetos': { SQLite: metadata.counts.projects, Neon: projectsCount },
      'Mídias': { SQLite: metadata.counts.projectMedia, Neon: mediaCount },
      'Experiências': { SQLite: metadata.counts.experiences, Neon: expCount },
      'Formações': { SQLite: metadata.counts.educations, Neon: eduCount },
      'Skills': { SQLite: metadata.counts.skills, Neon: skillsCount },
      'Mensagens': { SQLite: metadata.counts.contactMessages, Neon: messagesCount },
      'Logs de Atividade': { SQLite: metadata.counts.activityLogs, Neon: logsCount },
      'Configurações': { SQLite: metadata.counts.siteSettings, Neon: settingsCount },
    };

    console.table(parityTable);

    const parityOk =
      usersCount === metadata.counts.users &&
      projectsCount === metadata.counts.projects &&
      mediaCount === metadata.counts.projectMedia &&
      expCount === metadata.counts.experiences &&
      eduCount === metadata.counts.educations &&
      skillsCount === metadata.counts.skills &&
      messagesCount === metadata.counts.contactMessages &&
      logsCount === metadata.counts.activityLogs &&
      settingsCount === metadata.counts.siteSettings;

    if (!parityOk) {
      throw new Error('A migração terminou sem paridade total. Não prossiga para produção até investigar as contagens acima.');
    }

    console.log('\n✓ MIGRAÇÃO CONCLUÍDA COM 100% DE PARIDADE E SUCESSO!');
  } finally {
    await prisma.$disconnect();
  }
}

migrate().catch((err) => {
  console.error('Erro na migração:', err);
  process.exit(1);
});
