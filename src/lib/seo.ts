import { getBaseUrl } from './utils';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function getPersonSchema() {
  const baseUrl = getBaseUrl();
  return {
    '@type': 'Person',
    '@id': `${baseUrl}/#person`,
    name: 'Marcelo Junior Cumbe',
    alternateName: ['Marcelo Cumbe', 'MarcelloJRC'],
    url: baseUrl,
    image: `${baseUrl}/images/about_portrait.jpg`,
    jobTitle: 'Estudante Finalista de Arquitetura e Planeamento Físico',
    description:
      'Estudante finalista de Arquitetura e Planeamento Físico na Universidade Eduardo Mondlane (UEM). Especializado em modelagem BIM (Autodesk Revit) e Sistemas de Informação Geográfica (SIG com QGIS) em Moçambique.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Catembe, Maputo',
      addressCountry: 'MZ',
    },
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'Universidade Eduardo Mondlane (UEM)',
      url: 'https://www.uem.mz',
    },
    sameAs: [
      'https://www.linkedin.com/in/marcellojrc/',
      'https://www.instagram.com/marcellojrc/',
      'https://github.com/marcellojrc',
    ],
  };
}

export function getWebSiteSchema() {
  const baseUrl = getBaseUrl();
  return {
    '@type': 'WebSite',
    '@id': `${baseUrl}/#website`,
    name: 'MJC Architecture',
    alternateName: 'Marcelo Cumbe Architecture Portfolio',
    url: baseUrl,
    inLanguage: 'pt-MZ',
    description:
      'Plataforma digital e portfólio profissional de arquitetura, planeamento físico, modelação BIM e cartografia SIG por Marcelo Júnior Cumbe.',
    publisher: {
      '@id': `${baseUrl}/#person`,
    },
  };
}

export function getBreadcrumbListSchema(items: BreadcrumbItem[]) {
  const baseUrl = getBaseUrl();
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const fullUrl = item.url.startsWith('http')
        ? item.url
        : `${baseUrl}${item.url.startsWith('/') ? '' : '/'}${item.url}`;
      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: fullUrl,
      };
    }),
  };
}

export function getWebPageSchema(options: {
  path: string;
  name: string;
  description: string;
  type?: string;
  breadcrumbs?: BreadcrumbItem[];
}) {
  const baseUrl = getBaseUrl();
  const pageUrl = `${baseUrl}${options.path.startsWith('/') ? '' : '/'}${options.path}`;

  const schema: Record<string, unknown> = {
    '@type': options.type || 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: options.name,
    description: options.description,
    inLanguage: 'pt-MZ',
    isPartOf: {
      '@id': `${baseUrl}/#website`,
    },
    about: {
      '@id': `${baseUrl}/#person`,
    },
  };

  if (options.breadcrumbs && options.breadcrumbs.length > 0) {
    schema.breadcrumb = getBreadcrumbListSchema(options.breadcrumbs);
  }

  return schema;
}

export function getProjectSchema(project: {
  slug: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  location?: string | null;
  year?: string | number | null;
}) {
  const baseUrl = getBaseUrl();
  const projectUrl = `${baseUrl}/projects/${project.slug}`;
  const imageUrl = project.coverImage.startsWith('http')
    ? project.coverImage
    : `${baseUrl}${project.coverImage.startsWith('/') ? '' : '/'}${project.coverImage}`;

  return {
    '@type': ['CreativeWork', 'VisualArtwork'],
    '@id': `${projectUrl}#project`,
    name: project.title,
    headline: `${project.title} — ${project.category}`,
    description: project.description,
    artform: 'Arquitetura',
    genre: project.category,
    url: projectUrl,
    image: imageUrl,
    ...(project.year ? { dateCreated: String(project.year) } : {}),
    creator: {
      '@id': `${baseUrl}/#person`,
    },
    author: {
      '@id': `${baseUrl}/#person`,
    },
    ...(project.location
      ? {
          locationCreated: {
            '@type': 'Place',
            name: project.location,
          },
        }
      : {}),
    isPartOf: {
      '@id': `${baseUrl}/#website`,
    },
    mainEntityOfPage: projectUrl,
  };
}
