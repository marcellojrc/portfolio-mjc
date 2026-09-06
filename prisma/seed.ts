import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Seed da Base de Dados MJC Architecture ---');

  // 1. Limpar registos anteriores
  await prisma.activityLog.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.projectMedia.deleteMany();
  await prisma.project.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.education.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.siteSettings.deleteMany();
  await prisma.user.deleteMany();

  // 2. Criar Utilizador Administrador
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'admin_mjc_2026!';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  const adminEmail = process.env.ADMIN_EMAIL || 'marcelojuniord07@gmail.com';

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: 'Marcelo Júnior Cumbe',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log(`✓ Administrador criado: ${admin.email}`);

  // 3. Criar Experiências Profissionais
  const experiences = [
    {
      period: 'Abr — Ago 2026',
      role: 'Estágio de Arquitetura',
      organization: 'LDM Arquitectos, Lda.',
      description: 'Desenvolvimento de projetos arquitetónicos, produção de documentação técnica executiva, representação de soluções espaciais e acompanhamento colaborativo de diferentes etapas de obra em equipa multidisciplinar.',
      order: 1,
    },
    {
      period: '2025',
      role: 'Docência de Revit (BIM)',
      organization: 'CFM – Beira',
      description: 'Capacitação técnica em Autodesk Revit (BIM) para quadros profissionais da empresa Portos e Caminhos de Ferro de Moçambique (CFM–Beira), com ênfase em modelagem paramétrica, famílias e documentação técnica de projeto.',
      order: 2,
    },
    {
      period: '2024 — Presente',
      role: 'Coordenação de Mapeamento Digital',
      organization: 'YouthMappers Moçambique',
      description: 'Liderança e coordenação de mapathons, formação de equipas e colaboração internacional em projetos humanitários com dados geoespaciais abertos, incluindo a destacada campanha continental Africa 30 Days.',
      order: 3,
    },
    {
      period: '2023 — Presente',
      role: 'Colaborador Geoespacial',
      organization: 'OpenStreetMap (OSM)',
      description: 'Mapeamento colaborativo e validação em bases de dados geoespaciais humanitárias globais (HOT-OSM), focadas em gestão de risco de catástrofes e planeamento urbano participativo.',
      order: 4,
    },
  ];

  for (const exp of experiences) {
    await prisma.experience.create({ data: exp });
  }
  console.log(`✓ ${experiences.length} experiências profissionais semeadas.`);

  // 4. Criar Percurso Educacional
  const educations = [
    {
      period: '2022 — Presente',
      degree: 'Licenciatura em Arquitetura e Planeamento Físico',
      institution: 'Universidade Eduardo Mondlane (UEM)',
      description: 'Estudante finalista. Formação abrangente em projeto arquitetónico, desenho urbano, planeamento territorial, sistemas construtivos e modelagem computacional. Conclusão prevista para fevereiro de 2027.',
      order: 1,
    },
    {
      period: '2023 — 2024',
      degree: 'Treinamento Avançado em Revit (BIM)',
      institution: 'Formação Especializada BIM',
      description: 'Especialização técnica focada em modelagem de informação da construção (BIM), extração automatizada de quantitativos, documentação técnica de execução e fluxos paramétricos com Dynamo.',
      order: 2,
    },
    {
      period: '2023',
      degree: 'Sistemas de Informação Geográfica (SIG)',
      institution: 'Formação em Geotecnologias',
      description: 'Prática intensiva em análise espacial, mapeamento digital e planeamento territorial recorrendo a QGIS, ferramentas do ecossistema OpenStreetMap e recolha de dados com KoBoToolbox.',
      order: 3,
    },
    {
      period: '2015 — 2019',
      degree: 'Ensino Médio (12.º Ano)',
      institution: 'Escola Secundária do Noroeste 1',
      description: 'Conclusão do ensino secundário geral com distinção nas áreas de ciências e desenho técnico.',
      order: 4,
    },
  ];

  for (const edu of educations) {
    await prisma.education.create({ data: edu });
  }
  console.log(`✓ ${educations.length} registos de formação semeados.`);

  // 5. Criar Ferramentas & Competências
  const skills = [
    { name: 'Revit (BIM)', level: 'Avançado', category: 'Modelagem & BIM', order: 1 },
    { name: 'AutoCAD', level: 'Avançado', category: 'Desenho Técnico', order: 2 },
    { name: 'Lumion', level: 'Avançado', category: 'Visualização 3D', order: 3 },
    { name: 'SketchUp', level: 'Avançado', category: 'Modelagem Rápida', order: 4 },
    { name: 'ArchiCAD', level: 'Intermédio', category: 'Modelagem & BIM', order: 5 },
    { name: '3ds Max', level: 'Intermédio', category: 'Visualização 3D', order: 6 },
    { name: 'Corona Renderer', level: 'Intermédio', category: 'Visualização 3D', order: 7 },
    { name: 'QGIS', level: 'Intermédio', category: 'Geotecnologias', order: 8 },
    { name: 'Dynamo BIM', level: 'Intermédio', category: 'Design Paramétrico', order: 9 },
    { name: 'OpenStreetMap Suite', level: 'Avançado', category: 'Geotecnologias', order: 10 },
  ];

  for (const skill of skills) {
    await prisma.skill.create({ data: skill });
  }
  console.log(`✓ ${skills.length} competências semeadas.`);

  // 6. Criar os 12 Projetos Reais e seus Media
  const projectsData = [
    {
      number: '01',
      slug: 'casa-q28c25',
      title: 'Casa Q28C25',
      category: 'Habitacional',
      location: 'Chamanculo "C", Cidade de Maputo',
      year: '2024',
      status: 'Concluído',
      area: '449 m²',
      role: 'Co-autor',
      software: 'AutoCAD, Revit, Lumion',
      services: 'Projeto de Execução, Estudo Preliminar, Modelação 3D',
      concept: 'Organização dos espaços domésticos em torno de áreas comuns bem ventiladas, respondendo à densidade e proximidade típicas do tecido urbano consolidado de Chamanculo.',
      technicalDetails: 'Desenvolvido a partir da Escola de Inverno FAPF/UEM. Integração de ventilação cruzada passiva e iluminação zenital para minimizar o consumo energético.',
      description: 'Projeto habitacional multifamiliar desenvolvido em contexto urbano consolidado, concebido a partir da Escola de Inverno FAPF/UEM. A proposta organiza os espaços domésticos em torno de áreas comuns bem ventiladas, respondendo às condições de densidade e proximidade típicas do bairro.',
      coverImage: '/images/proj01_01.jpg',
      featured: true,
      published: true,
      order: 1,
      media: [
        { url: '/images/proj01_01.jpg', type: 'RENDER', alt: 'Casa Q28C25 — Perspetiva frontal da fachada', caption: 'Composição volumétrica contemporânea integrada no bairro de Chamanculo.' },
        { url: '/images/proj01_02.jpg', type: 'RENDER', alt: 'Casa Q28C25 — Vista de pátio e circulação interior', caption: 'Pátio interno e galerias de distribuição que promovem ventilação cruzada.' },
      ],
    },
    {
      number: '02',
      slug: 'oficina-de-artes',
      title: 'Oficina de Artes',
      category: 'Equipamento',
      location: 'Maputo',
      year: '2024',
      status: 'Concluído',
      area: '847 m²',
      role: 'Autor do Projeto',
      software: 'Revit, Lumion, Photoshop',
      services: 'Conceito Arquitetónico, Modelagem BIM, Renders Finais',
      concept: 'Elevação do corpo principal por pilotis de aço, libertando o solo urbano para permeabilidade pedonal e criando um ambiente de luz controlada para criação artística.',
      technicalDetails: 'Combinação de betão aparente, estrutura metálica e panos envidraçados termoacústicos. Integração harmoniosa ao lote urbano e à malha construída envolvente.',
      description: 'Oficina elevada por pilotis de aço, pensada para um ambiente propício à criação e apreciação artística. Betão, madeira e vidro combinam-se para conferir modernidade e leveza ao espaço, integrando-o harmoniosamente ao lote urbano envolvente e à malha construída vizinha.',
      coverImage: '/images/proj02_01.jpg',
      featured: true,
      published: true,
      order: 2,
      media: [
        { url: '/images/proj02_01.jpg', type: 'RENDER', alt: 'Oficina de Artes — Vista aérea e enquadramento urbano', caption: 'Enquadramento da volumetria no lote com relação direta à cota térrea pedonal.' },
        { url: '/images/proj02_02.jpg', type: 'RENDER', alt: 'Oficina de Artes — Relação entre pilotis e espaço público', caption: 'Pilotis metálicos e permeabilidade visual no rés-do-chão.' },
        { url: '/images/proj02_03.jpg', type: 'RENDER', alt: 'Oficina de Artes — Vista de detalhe da materialidade', caption: 'Transparência de vidro e textura do betão em luz de fim de tarde.' },
      ],
    },
    {
      number: '03',
      slug: 'design-de-interior',
      title: 'Design de Interior',
      category: 'Interiores',
      location: 'Maputo (Caso hipotético)',
      year: '2025',
      status: 'Estudo Conceitual',
      area: '185 m²',
      role: 'Designer de Interiores & Renderista',
      software: '3ds Max, Corona Renderer, SketchUp',
      services: 'Composição Espacial, Seleção de Materiais, Iluminação Cénica',
      concept: 'Exploração de tons neutros, madeiras naturais e iluminação indireta quente como elementos de conforto sensorial na vivência residencial.',
      technicalDetails: 'Exercício de interiores com modelagem detalhada de marcenaria sob medida e simulação de iluminação foto-realista.',
      description: 'Exercício de design de interiores para um programa habitacional hipotético, explorando paletas de materiais, iluminação e mobiliário como ferramentas de composição espacial — complemento à prática de projeto arquitetónico ao nível do detalhe interior.',
      coverImage: '/images/proj03_01.jpg',
      featured: false,
      published: true,
      order: 3,
      media: [
        { url: '/images/proj03_01.jpg', type: 'RENDER', alt: 'Design de interior — Sala de estar integrada', caption: 'Composição de sala de estar com paleta terrosa e iluminação difusa.' },
        { url: '/images/proj03_02.jpg', type: 'RENDER', alt: 'Design de interior — Vista da zona de refeições', caption: 'Transição fluida entre área de convívio e refeições.' },
        { url: '/images/proj03_03.jpg', type: 'RENDER', alt: 'Design de interior — Suíte principal', caption: 'Detalhe de marcenaria e cabeceira ripada em carvalho quente.' },
        { url: '/images/proj03_04.jpg', type: 'RENDER', alt: 'Design de interior — Ambiente de leitura', caption: 'Enquadramento intimista com foco em luz natural e ventilação.' },
      ],
    },
    {
      number: '04',
      slug: 'residencia-e-bar',
      title: 'Residência e Bar',
      category: 'Habitacional',
      location: 'Bela Vista Village, Maputo',
      year: '2025',
      status: 'Concluído',
      area: '724,6 m² (Terreno)',
      role: 'Arquiteto Projetista',
      software: 'Revit, Lumion, AutoCAD',
      services: 'Projeto Geral, Desenhos Executivos, Quantificação de Áreas',
      concept: 'Coexistência equilibrada entre a esfera íntima familiar e um programa comercial de lazer através de dois blocos com linguagens dialogantes.',
      technicalDetails: 'Piscina de 49,4 m², deck em madeira tratada de 85,5 m², terraço de cobertura com 142 m² e 447,7 m² de área verde integradora.',
      description: 'Dois volumes independentes que interagem sem perder autonomia funcional. A residência prioriza a convivência, com sala comum integrada e grandes vãos para luz natural e ventilação cruzada. O bloco comercial (bar), em dois pisos, destaca-se pelo terraço superior de 142 m², pensado para lazer ao ar livre. A área de lazer soma piscina de 49,4 m², deck de madeira de 85,5 m² e 447,7 m² de área verde de transição entre os blocos.',
      coverImage: '/images/proj04_02.jpg',
      featured: true,
      published: true,
      order: 4,
      media: [
        { url: '/images/proj04_02.jpg', type: 'RENDER', alt: 'Residência e Bar — Vista aérea geral do conjunto', caption: 'Implantação com dois volumes: habitação à esquerda e bar com terraço à direita.' },
        { url: '/images/proj04_03.jpg', type: 'RENDER', alt: 'Residência e Bar — Fachada do bloco residencial', caption: 'Aberturas generosas e elementos de proteção solar na fachada sul.' },
        { url: '/images/proj04_04.jpg', type: 'RENDER', alt: 'Residência e Bar — Perspetiva do bar ao entardecer', caption: 'Bar em dois pisos com lounge exterior e iluminação cenográfica.' },
        { url: '/images/proj04_05.jpg', type: 'RENDER', alt: 'Residência e Bar — Zona de piscina e deck', caption: 'Piscina de 49,4 m² articulada com deck de madeira e zona verdejante.' },
        { url: '/images/proj04_06.jpg', type: 'PLAN', alt: 'Residência e Bar — Planta do piso térreo', caption: 'Planta baixa cotada do piso térreo com distribuição dos dois corpos.' },
        { url: '/images/proj04_07.jpg', type: 'DRAWING', alt: 'Residência e Bar — Desenho de sistemas construtivos', caption: 'Esquema de fundações, alvenarias estruturais e coberturas planas.' },
        { url: '/images/proj04_08.jpg', type: 'PLAN', alt: 'Residência e Bar — Planta do primeiro piso', caption: 'Distribuição dos quartos da residência e terraço panorâmico do bar.' },
      ],
    },
    {
      number: '05',
      slug: 'edificio-changule',
      title: 'Edifício Changule',
      category: 'Habitacional',
      location: 'Katembe, Maputo',
      year: '2025',
      status: 'Concluído',
      area: '380 m²',
      role: 'Arquiteto Autor',
      software: 'Revit (BIM), Lumion',
      services: 'Estudo Bioclimático, Modelagem BIM, Projeto de Arquitetura',
      concept: 'Adaptação rigorosa à topografia e hidrografia de Katembe com soleira elevada em 0,7 m para imunidade a enchentes e ventilação inferior.',
      technicalDetails: 'Rés-do-chão open-space com 3 quartos a nascente. Piso superior com suíte master, escritório e terraços privados de contemplate da baía de Maputo.',
      description: 'Resposta técnica às condições ambientais de Katembe: soleira elevada a 0,7 m como precaução contra cheias. No rés-do-chão, um desenho open-space integra sala, jantar e cozinha; três quartos a nascente garantem privacidade e conforto térmico matinal, com área de lazer e piscina. No piso superior, o núcleo de circulação vertical distribui luz da tarde pela suíte, escritório e áreas de lazer privadas.',
      coverImage: '/images/proj05_01.jpg',
      featured: true,
      published: true,
      order: 5,
      media: [
        { url: '/images/proj05_01.jpg', type: 'RENDER', alt: 'Edifício Changule — Perspetiva principal com piscina', caption: 'Elevação da cota do piso e piscina em relação ao terreno natural.' },
        { url: '/images/proj05_02.jpg', type: 'RENDER', alt: 'Edifício Changule — Fachada frontal e acessos', caption: 'Volume em dois pisos com planos brancos e ripados de madeira.' },
        { url: '/images/proj05_03.jpg', type: 'RENDER', alt: 'Edifício Changule — Vista posterior e zona de lazer', caption: 'Área gourmet sombreada integrada com o jardim privado.' },
        { url: '/images/proj05_04.jpg', type: 'PLAN', alt: 'Edifício Changule — Planta do piso térreo', caption: 'Planta térrea: sala open-space, cozinha e quartos voltados a nascente.' },
        { url: '/images/proj05_05.jpg', type: 'PLAN', alt: 'Edifício Changule — Planta do piso superior', caption: 'Planta do primeiro piso com escritório, suíte e varandas privativas.' },
      ],
    },
    {
      number: '06',
      slug: 'reconfiguracao-de-fachada',
      title: 'Reconfiguração de Fachada',
      category: 'Reabilitação',
      location: 'Chiboene, Maputo',
      year: '2025',
      status: 'Concluído',
      area: '190 m²',
      role: 'Arquiteto Consultor',
      software: 'Revit, SketchUp, Lumion',
      services: 'Retrofit de Fachada, Modelação de Sombreamento, Consultoria Térmica',
      concept: 'Revitalização formal de uma estrutura pré-existente desprovida de identidade através de brises horizontais e planos contrastantes de sombra.',
      technicalDetails: 'Platibandas de proteção solar que otimizam o ganho térmico e novos panos envidraçados que maximizam a iluminação natural.',
      description: 'Intervenção técnica e estética numa estrutura existente, transformando um volume convencional num desenho contemporâneo. Elementos de sombreamento e o jogo dinâmico de cheios e vazios reforçam a composição original; superfícies envidraçadas ampliam a transparência e a ligação com o exterior, protegidas por platibandas que melhoram a eficiência térmica sob o sol de Maputo.',
      coverImage: '/images/proj06_05.jpg',
      featured: false,
      published: true,
      order: 6,
      media: [
        { url: '/images/proj06_05.jpg', type: 'RENDER', alt: 'Fachada Chiboene — Render final da solução', caption: 'Fachada reconfigurada com dinamismo de cheios, vazios e textura amadeirada.' },
        { url: '/images/proj06_01.jpg', type: 'RENDER', alt: 'Fachada Chiboene — Estudo volumétrico 1', caption: 'Primeiras iterações da nova volumetria sobre o esqueleto existente.' },
        { url: '/images/proj06_02.jpg', type: 'RENDER', alt: 'Fachada Chiboene — Estudo volumétrico 2', caption: 'Ajuste de proporções nas platibandas e aberturas.' },
        { url: '/images/proj06_03.jpg', type: 'RENDER', alt: 'Fachada Chiboene — Vista diagonal', caption: 'Comportamento dos elementos de sombreamento em sol da tarde.' },
        { url: '/images/proj06_04.jpg', type: 'DRAWING', alt: 'Fachada Chiboene — Estudo de materiais', caption: 'Paleta construtiva: argamassas cimentícias, esquadrias pretas e madeira.' },
        { url: '/images/proj06_06.jpg', type: 'RENDER', alt: 'Fachada Chiboene — Vista ao nível do observador', caption: 'Perspetiva de aproximação pedonal.' },
        { url: '/images/proj06_07.jpg', type: 'RENDER', alt: 'Fachada Chiboene — Iluminação noturna', caption: 'Estratégia luminotécnica com iluminação linear embutida.' },
      ],
    },
    {
      number: '07',
      slug: 'projeto-habitacional-t3',
      title: 'Projeto Habitacional T3',
      category: 'Habitacional',
      location: 'Machipanda, Manica',
      year: '2024',
      status: 'Concluído / Em Obra',
      area: '210 m²',
      role: 'Arquiteto Projetista',
      software: 'AutoCAD, Revit, Lumion',
      services: 'Projeto Completo de Arquitetura, Acompanhamento de Obra',
      concept: 'Habitação unifamiliar que dialoga com o relevo acidentado e o clima fresco de Machipanda, priorizando alvenarias locais e ventilação cruzada.',
      technicalDetails: 'Três quartos com uma suíte, sala ampla integrada, cobertura de águas com beirados generosos para escoamento pluvial eficiente.',
      description: 'Moradia unifamiliar T3 projetada para oferecer conforto térmico e integração com o entorno rural de Machipanda. A residência contempla três quartos (sendo uma suíte), áreas sociais amplas e cozinha integrada. O design privilegia iluminação e ventilação natural, garantindo funcionalidade e qualidade construtiva com recursos locais.',
      coverImage: '/images/proj07_01.jpg',
      featured: true,
      published: true,
      order: 7,
      media: [
        { url: '/images/proj07_01.jpg', type: 'RENDER', alt: 'Habitação T3 Machipanda — Perspetiva frontal', caption: 'Moradia T3 implantada no terreno acidentado com vista para o vale.' },
        { url: '/images/proj07_02.jpg', type: 'RENDER', alt: 'Habitação T3 Machipanda — Vista lateral', caption: 'Beirados proeminentes e esquadrias de proteção climática.' },
        { url: '/images/proj07_03.jpg', type: 'PLAN', alt: 'Habitação T3 Machipanda — Planta cotada', caption: 'Planta baixa com distribuição clara dos setores social e íntimo.' },
        { url: '/images/proj07_04.jpg', type: 'SECTION', alt: 'Habitação T3 Machipanda — Corte transversal', caption: 'Corte arquitetónico ilustrando a relação com a pendente natural do terreno.' },
        { url: '/images/proj07_05.jpg', type: 'PHOTO', alt: 'Habitação T3 Machipanda — Fotografia de obra 1', caption: 'Levantamento de alvenarias e execução da estrutura de betão in situ.' },
        { url: '/images/proj07_06.jpg', type: 'PHOTO', alt: 'Habitação T3 Machipanda — Fotografia de obra 2', caption: 'Fase de montagem da estrutura de cobertura em madeira.' },
      ],
    },
    {
      number: '08',
      slug: 'projeto-sueia',
      title: 'Projeto Sueia',
      category: 'Habitacional',
      location: 'Boquico, Matola',
      year: '2025',
      status: 'Concluído',
      area: '315 m²',
      role: 'Arquiteto Responsável & Coordenação Técnica',
      software: 'Revit (BIM), AutoCAD, Lumion',
      services: 'Projeto de Execução Completo, Dossier de Engenharia e Arquitetura',
      concept: 'Moradia contemporânea encomendada pelo Sr. José Sueia em Mualhaze, valorizando a vida familiar em torno de um pátio de lazer com piscina e zona gourmet coberta.',
      technicalDetails: 'Dossier executivo integral contendo plantas gerais, fundações, pilares, vigas, cotas e elevações completas prontas para aprovação camarária e edificação.',
      description: 'Residência unifamiliar em Boquico, Matola, articulada em torno de um espaço de lazer com piscina e zona gourmet coberta. A composição volumétrica combina brise-soleil em madeira, varandas balançadas e grandes envidraçados, com plantas técnicas detalhadas do piso térreo e do primeiro piso.',
      coverImage: '/images/proj08_01.jpg',
      featured: true,
      published: true,
      order: 8,
      media: [
        { url: '/images/proj08_01.jpg', type: 'RENDER', alt: 'Projeto Sueia — Vista da piscina e zona social', caption: 'Piscina e área gourmet abrigada sob estrutura de betão e madeira.' },
        { url: '/images/proj08_02.jpg', type: 'RENDER', alt: 'Projeto Sueia — Perspetiva da fachada principal', caption: 'Fachada urbana com brises de madeira e varanda superior balançada.' },
        { url: '/images/proj08_03.jpg', type: 'PLAN', alt: 'Projeto Sueia — Planta técnica de execução', caption: 'Prancha de desenho técnico com cotagem e arranjo de mobiliário.' },
        { url: '/images/proj08_04.jpg', type: 'PHOTO', alt: 'Projeto Sueia — Registo fotográfico de implantação', caption: 'Enquadramento do local de implantação no bairro de Boquico.' },
      ],
    },
    {
      number: '09',
      slug: 'remodelacao-e-ampliacao',
      title: 'Remodelação e Ampliação',
      category: 'Reabilitação',
      location: 'Matendene, Maputo',
      year: '2024',
      status: 'Concluído',
      area: '160 m² (Área ampliada)',
      role: 'Arquiteto & Coordenação de Reforço Estrutural',
      software: 'AutoCAD, Revit, Lumion',
      services: 'Levantamento Cadastral, Projeto de Reforço, Projeto Arquitetónico T2',
      concept: 'Aproveitamento da pegada do edifício existente através de ampliação vertical com novo apartamento T2 completamente autónomo.',
      technicalDetails: 'Compatibilização de cargas entre alvenarias existentes e nova laje de piso, com plano meticuloso de pilares e lintéis de reforço estrutural.',
      description: 'Reabilitação e ampliação vertical de um edifício residencial existente. A intervenção principal cria, no primeiro andar, um apartamento T2 totalmente independente do piso térreo — um desafio de compatibilização entre a estrutura existente e a nova carga, exigindo um plano detalhado de reforço estrutural para garantir estabilidade e segurança.',
      coverImage: '/images/proj09_01.jpg',
      featured: false,
      published: true,
      order: 9,
      media: [
        { url: '/images/proj09_01.jpg', type: 'RENDER', alt: 'Matendene — Vista exterior pós-ampliação', caption: 'Composição unificada da edificação térrea original com o novo piso T2 superior.' },
        { url: '/images/proj09_02.jpg', type: 'RENDER', alt: 'Matendene — Acesso independente superior', caption: 'Escadaria exterior em betão armado e guarda-corpos contemporâneos.' },
        { url: '/images/proj09_03.jpg', type: 'PHOTO', alt: 'Matendene — Estado prévio do edifício térreo', caption: 'Registo do estado original antes do início da intervenção.' },
        { url: '/images/proj09_04.jpg', type: 'PHOTO', alt: 'Matendene — Execução de cintas e pilares', caption: 'Trabalhos de reforço estrutural sobre a alvenaria pré-existente.' },
        { url: '/images/proj09_05.jpg', type: 'PLAN', alt: 'Matendene — Planta do novo piso T2', caption: 'Planta arquitetónica cotada do apartamento superior independente.' },
        { url: '/images/proj09_06.jpg', type: 'SECTION', alt: 'Matendene — Corte estrutural de compatibilização', caption: 'Corte ilustrando a ancoragem da nova laje nos apoios de reforço.' },
      ],
    },
    {
      number: '10',
      slug: 'requalificacao-urbana-polana-canico-a',
      title: 'Requalificação Urbana — Polana Caniço A',
      category: 'Urbano',
      location: 'Polana Caniço, Maputo',
      year: '2025',
      status: 'Proposta Urbana / Académica',
      area: '≈ 10,4 hectares',
      role: 'Planeador Físico / Urbanista',
      software: 'QGIS, OpenStreetMap, AutoCAD, Lumion',
      services: 'Masterplan Urbano, Análise Geoespacial, Mapeamento de Campo, Desenho Viário',
      concept: 'Regeneração integrada de tecido urbano informal com base em dados geoespaciais abertos, priorizando mobilidade ativa, espaço cívico e tipologias habitacionais incrementais.',
      technicalDetails: 'Eixo estruturante na Avenida Vladimir Lenine com ciclovia e passeios acessíveis. Tipologias divididas em blocos A/B (geminadas, 2 pisos), bloco C (edifícios T2, 3 pisos) e bloco D (uso misto comercial/residencial, 4 pisos).',
      description: 'Revitalização de um tecido urbano informal e carente de infraestrutura, apoiada em mapeamento de campo e sensoriamento remoto. A proposta organiza-se a partir de uma nova hierarquia viária centrada na Avenida Vladimir Lenine — eixo estruturante com frente ativa e mobilidade suave (ciclovias e passeios amplos). A habitação distribui-se em quatro blocos: moradias geminadas (A e B), edifícios T2 de média densidade (C) e blocos mistos com comércio no piso térreo (D).',
      coverImage: '/images/proj04_01.jpg',
      featured: true,
      published: true,
      order: 10,
      media: [
        { url: '/images/proj04_01.jpg', type: 'RENDER', alt: 'Polana Caniço A — Vista aérea do complexo urbano e desportivo', caption: 'Visão panorâmica do masterplan proposto com arena desportiva e blocos habitacionais.' },
        { url: '/images/proj10_01.jpg', type: 'PLAN', alt: 'Polana Caniço A — Masterplan geral', caption: 'Planta geral do plano de pormenor cobrindo os 10,4 hectares de intervenção.' },
        { url: '/images/proj10_02.jpg', type: 'DRAWING', alt: 'Polana Caniço A — Mapeamento de campo participativo', caption: 'Levantamento cadastral colaborativo com a comunidade local.' },
        { url: '/images/proj10_03.jpg', type: 'DRAWING', alt: 'Polana Caniço A — Análise por sensoriamento remoto e SIG', caption: 'Cartografia temática elaborada em QGIS com camadas de declividade e drenagem.' },
        { url: '/images/proj10_04.jpg', type: 'PLAN', alt: 'Polana Caniço A — Desenho urbano e quadras', caption: 'Subdivisão de lotes e espaços verdes públicos de proximidade.' },
        { url: '/images/proj10_05.jpg', type: 'DRAWING', alt: 'Polana Caniço A — Hierarquia viária primária', caption: 'Rede de mobilidade estruturante ligando a Av. Vladimir Lenine.' },
        { url: '/images/proj10_06.jpg', type: 'DRAWING', alt: 'Polana Caniço A — Hierarquia viária secundária e pedonal', caption: 'Malha de vielas pedonais qualificadas para acessibilidade e serviços de emergência.' },
        { url: '/images/proj10_07.jpg', type: 'SECTION', alt: 'Polana Caniço A — Perfis transversais viários', caption: 'Cortes viários dimensionando faixas de rodagem, ciclovias e passeios arborizados.' },
        { url: '/images/proj10_08.jpg', type: 'RENDER', alt: 'Polana Caniço A — Maquete volumétrica 3D da proposta', caption: 'Modelo digital demonstrando o escalonamento volumétrico dos blocos A, B, C e D.' },
      ],
    },
    {
      number: '11',
      slug: 'centro-infantil-aea-ziranguane',
      title: 'Centro Infantil AEA Ziranguane',
      category: 'Equipamento',
      location: 'Distrito de Mecanhelas, Niassa',
      year: '2026',
      status: 'Fase BIM & Orçamentação',
      area: '520 m²',
      role: 'Arquiteto Responsável & Coordenação BIM',
      software: 'Revit (BIM), Dynamo, Excel',
      services: 'Modelagem Paramétrica, Orçamentação Técnica, Dossier de Financiamento',
      concept: 'Desenvolvimento de um Bloco Escolar-Modelo prototípico comunitário, projetado com técnicas locais de tijolo de terra comprimida e ventilação térmica passiva para fácil replicação comunitária.',
      technicalDetails: 'Quantificação minuciosa em Revit com tabelas automáticas de componentes e materiais, permitindo orçamentação precisa para submissão a agências internacionais de financiamento.',
      description: 'Como arquiteto responsável, o foco está no desenvolvimento e quantificação do Bloco Escolar-Modelo — um protótipo pensado para servir de guia técnico e prático, permitindo que a própria comunidade de Ziranguane participe na construção. O projeto encontra-se em fase BIM, com quantificação de materiais e orçamentação para compor o dossiê de financiamento, assegurando um edifício robusto, sustentável e de fácil manutenção.',
      coverImage: '/images/proj11_01.jpg',
      featured: true,
      published: true,
      order: 11,
      media: [
        { url: '/images/proj11_01.jpg', type: 'RENDER', alt: 'Ziranguane — Modelo BIM com vista axonométrica', caption: 'Perspetiva do bloco escolar evidenciando varandas de circulação periférica.' },
        { url: '/images/proj11_02.jpg', type: 'RENDER', alt: 'Ziranguane — Vista exterior das salas de aula', caption: 'Cobogós e aberturas altas para exaustão de ar quente.' },
        { url: '/images/proj11_03.jpg', type: 'RENDER', alt: 'Ziranguane — Perspetiva do pátio escolar', caption: 'Pátio central coberto para refeições e recreação infantil.' },
        { url: '/images/proj11_04.jpg', type: 'DRAWING', alt: 'Ziranguane — Tabelas de quantitativos e orçamentação BIM', caption: 'Extração automática de áreas, volumes de betão e contagem de alvenarias.' },
        { url: '/images/proj11_05.jpg', type: 'DRAWING', alt: 'Ziranguane — Pormenorização construtiva de cobertura', caption: 'Detalhe executivo de encaixe de tesouras e isolamento térmico da cobertura.' },
      ],
    },
    {
      number: '12',
      slug: 'sunset-condo-madende',
      title: 'Sunset Condo Madendé',
      category: 'Urbano',
      location: 'Madendé, Gaza (acesso pela EN-1)',
      year: '2026',
      status: 'Concluído / Em Comercialização',
      area: '11 lotes (50x40m e 50x50m)',
      role: 'Desenho Urbano & Masterplan',
      software: 'AutoCAD, Lumion, QGIS',
      services: 'Loteamento, Modelação de Paisagem, Material Promocional',
      concept: 'Condomínio de baixa densidade integrado à natureza costeira de Gaza, estruturado em torno de uma via em U para garantir privacidade, segurança e acessibilidade direta à EN-1.',
      technicalDetails: 'Loteamento exclusivo com 11 parcelas amplas para residências unifamiliares confortáveis, a 600m da vila de Madendé e próximo das praias de Chiringuele, Nhambavale e Dingoni.',
      description: 'Desenvolvimento planeado exclusivo com 11 lotes organizados em torno de uma rua central em formato U. Apenas a 600 metros do centro de Madendé e próximo da estrada EN-1, articula acessibilidade com tranquilidade e proximidade às praias de Chiringuele (25 km), Nhambavale (12 km) e Dingoni (14 km).',
      coverImage: '/images/sunset_01.jpg',
      featured: true,
      published: true,
      order: 12,
      media: [
        { url: '/images/sunset_01.jpg', type: 'RENDER', alt: 'Sunset Condo Madendé — Perspetiva do portal de entrada', caption: 'Pórtico de acesso e arborização nativa ao longo da via central.' },
        { url: '/images/sunset_02.jpg', type: 'RENDER', alt: 'Sunset Condo Madendé — Vista aérea da malha de lotes', caption: 'Disposição em U dos 11 lotes exclusivos maximizando o horizonte poente.' },
        { url: '/images/sunset_03.jpg', type: 'RENDER', alt: 'Sunset Condo Madendé — Perspetiva da via interna', caption: 'Rua interna pavimentada com calçadas permeáveis e iluminação solar.' },
        { url: '/images/sunset_04.jpg', type: 'RENDER', alt: 'Sunset Condo Madendé — Enquadramento ao pôr do sol', caption: 'Ambiente natural circundante e relação com o ecossistema costeiro.' },
        { url: '/images/sunset_05.jpg', type: 'RENDER', alt: 'Sunset Condo Madendé — Conceito de habitação modelo', caption: 'Tipologia arquitetónica sugerida para os lotes 50x40 e 50x50.' },
      ],
    },
  ];

  for (const p of projectsData) {
    const { media, ...projectInfo } = p;
    const project = await prisma.project.create({
      data: {
        ...projectInfo,
        media: {
          create: media.map((m, idx) => ({
            url: m.url,
            type: m.type,
            alt: m.alt,
            caption: m.caption,
            order: idx + 1,
          })),
        },
      },
    });
    console.log(`✓ Projeto ${project.number} inserido: ${project.title} (${media.length} imagens)`);
  }

  // 7. Configurações gerais do site
  const settings = [
    { key: 'site_title', value: 'MJC — Arquitetura & Planeamento Físico' },
    { key: 'site_description', value: 'Portfólio e plataforma de arquitetura de Marcelo Júnior Cumbe. Maputo, Moçambique.' },
    { key: 'author_name', value: 'Marcelo Júnior Cumbe' },
    { key: 'author_location', value: 'Catembe, Rua da Igreja — Maputo, Moçambique' },
    { key: 'author_email', value: 'marcelojuniord07@gmail.com' },
    { key: 'author_whatsapp', value: '+258847130805' },
    { key: 'author_linkedin', value: 'https://www.linkedin.com/in/marcellojrc/' },
    { key: 'author_instagram', value: 'https://www.instagram.com/marcellojrc/' },
    { key: 'author_cv_url', value: 'https://drive.google.com/file/d/1PLqDbRhrFCbv4OgxCZhGxB1yKRgxhRoX/view?usp=sharing' },
  ];

  for (const s of settings) {
    await prisma.siteSettings.create({ data: s });
  }
  console.log(`✓ Configurações do site semeadas.`);

  // 8. Registar Log de Inicialização
  await prisma.activityLog.create({
    data: {
      action: 'SYSTEM_INITIALIZED',
      details: 'Plataforma MJC Architecture 2.0 inicializada com 12 projetos e dados originais.',
    },
  });

  console.log('--- Seed Concluído com Sucesso Total! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
