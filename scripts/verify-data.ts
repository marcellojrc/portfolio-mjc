import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
  console.log('=== VERIFICAÇÃO DE INTEGRIDADE DA BASE DE DADOS ===');

  const [
    users,
    projects,
    media,
    exp,
    edu,
    skills,
    msgs,
    logs,
    settings,
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

  console.table({
    'Utilizadores (User)': users,
    'Projetos (Project)': projects,
    'Mídias de Projetos (ProjectMedia)': media,
    'Experiências (Experience)': exp,
    'Formação (Education)': edu,
    'Competências (Skill)': skills,
    'Mensagens (ContactMessage)': msgs,
    'Logs de Atividade (ActivityLog)': logs,
    'Definições do Site (SiteSettings)': settings,
  });

  // Amostragem de integridade
  const sampleProject = await prisma.project.findFirst({
    include: { media: { take: 2 } },
  });

  if (sampleProject) {
    console.log(`\n✓ Amostra de Projeto: "${sampleProject.title}" (#${sampleProject.number}) com ${sampleProject.media.length} mídias associadas.`);
  }

  console.log('=== VERIFICAÇÃO CONCLUÍDA COM SUCESSO ===');
}

verify()
  .catch((e) => {
    console.error('Falha na verificação:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
