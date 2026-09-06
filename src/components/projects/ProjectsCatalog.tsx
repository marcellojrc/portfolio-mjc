'use client';

import { useState, useMemo } from 'react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Search, SlidersHorizontal } from 'lucide-react';

interface ProjectItem {
  id: string;
  slug: string;
  number: string;
  title: string;
  category: string;
  location: string;
  year: string;
  area: string | null;
  coverImage: string;
  description: string;
  software: string | null;
  featured: boolean;
}

interface ProjectsCatalogProps {
  initialProjects: ProjectItem[];
}

const CATEGORIES = [
  'Todos',
  'Habitacional',
  'Equipamento',
  'Urbano',
  'Reabilitação',
  'Interiores',
];

export function ProjectsCatalog({ initialProjects }: ProjectsCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    return initialProjects.filter((project) => {
      const matchesCategory =
        selectedCategory === 'Todos' ||
        project.category.toLowerCase().includes(selectedCategory.toLowerCase());

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === '' ||
        project.title.toLowerCase().includes(query) ||
        project.location.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        (project.software && project.software.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [initialProjects, selectedCategory, searchQuery]);

  return (
    <div className="space-y-12">
      {/* Barra de Filtros e Pesquisa */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#f5f1ea]/10 pb-8">
        {/* Categorias Tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 text-xs font-display uppercase tracking-wider transition-all duration-200 border ${
                selectedCategory === category
                  ? 'bg-[#e8342a] border-[#e8342a] text-white'
                  : 'bg-[#121214] border-[#f5f1ea]/15 text-[#f5f1ea]/70 hover:border-[#f5f1ea]/40 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Campo de Pesquisa */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#f5f1ea]/40" />
          <input
            type="text"
            placeholder="Pesquisar por título, local ou software..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#121214] border border-[#f5f1ea]/15 text-[#f5f1ea] placeholder:text-[#f5f1ea]/30 focus:outline-none focus:border-[#e8342a] transition-colors"
          />
        </div>
      </div>

      {/* Contador de Resultados */}
      <div className="flex items-center justify-between text-xs uppercase tracking-widest text-[#f5f1ea]/50">
        <span>
          A exibir <span className="text-[#e8342a] font-semibold">{filteredProjects.length}</span> de{' '}
          {initialProjects.length} projetos
        </span>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#e8342a]" />
          <span>Filtro Ativo: {selectedCategory}</span>
        </div>
      </div>

      {/* Grelha de Projetos */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              slug={project.slug}
              number={project.number}
              title={project.title}
              category={project.category}
              location={project.location}
              year={project.year}
              area={project.area}
              coverImage={project.coverImage}
              description={project.description}
              featured={project.featured}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 border border-dashed border-[#f5f1ea]/15 space-y-4">
          <p className="text-base text-[#f5f1ea]/60">Nenhum projeto encontrado para os critérios selecionados.</p>
          <button
            onClick={() => {
              setSelectedCategory('Todos');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs font-display uppercase tracking-widest bg-[#e8342a] text-white hover:bg-white hover:text-black transition-colors"
          >
            Limpar Filtros
          </button>
        </div>
      )}
    </div>
  );
}
