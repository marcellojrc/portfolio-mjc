import { PrismaClient } from '../prisma/generated/sqlite';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function runBackup() {
  console.log('=== INICIANDO BACKUP SEGURO DA BASE DE DADOS SQLITE ===');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'prisma', 'backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  // 1. Cópia Binária de dev.db
  const sqliteFile = path.join(process.cwd(), 'prisma', 'dev.db');
  if (fs.existsSync(sqliteFile)) {
    const binaryBackupPath = path.join(backupDir, `dev.backup-${timestamp}.db`);
    fs.copyFileSync(sqliteFile, binaryBackupPath);
    console.log(`✓ Cópia binária criada: ${binaryBackupPath}`);
  } else {
    console.warn('! Ficheiro dev.db não encontrado no caminho esperado.');
  }

  // 2. Extração Estruturada dos Dados de todas as 9 tabelas
  console.log('Extraindo registos das tabelas...');

  const [
    users,
    projects,
    projectMedia,
    experiences,
    educations,
    skills,
    contactMessages,
    activityLogs,
    siteSettings,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.project.findMany({ orderBy: { order: 'asc' } }),
    prisma.projectMedia.findMany({ orderBy: { order: 'asc' } }),
    prisma.experience.findMany({ orderBy: { order: 'asc' } }),
    prisma.education.findMany({ orderBy: { order: 'asc' } }),
    prisma.skill.findMany({ orderBy: { order: 'asc' } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.siteSettings.findMany(),
  ]);

  const dump = {
    metadata: {
      exportedAt: new Date().toISOString(),
      source: 'prisma/dev.db (SQLite)',
      counts: {
        users: users.length,
        projects: projects.length,
        projectMedia: projectMedia.length,
        experiences: experiences.length,
        educations: educations.length,
        skills: skills.length,
        contactMessages: contactMessages.length,
        activityLogs: activityLogs.length,
        siteSettings: siteSettings.length,
      },
    },
    data: {
      users,
      projects,
      projectMedia,
      experiences,
      educations,
      skills,
      contactMessages,
      activityLogs,
      siteSettings,
    },
  };

  const jsonBackupPath = path.join(backupDir, `dump-${timestamp}.json`);
  const latestJsonPath = path.join(backupDir, 'dump-latest.json');

  fs.writeFileSync(jsonBackupPath, JSON.stringify(dump, null, 2), 'utf-8');
  fs.writeFileSync(latestJsonPath, JSON.stringify(dump, null, 2), 'utf-8');

  console.log(`✓ Exportação JSON estruturada criada: ${jsonBackupPath}`);
  console.log(`✓ Ficheiro de referência atualizado: ${latestJsonPath}`);
  console.log('--- CONTAGENS VERIFICADAS NO BACKUP ---');
  console.table(dump.metadata.counts);
  console.log('=== BACKUP CONCLUÍDO COM SUCESSO ABSOLUTO ===');
}

runBackup()
  .catch((e) => {
    console.error('Erro ao realizar backup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
