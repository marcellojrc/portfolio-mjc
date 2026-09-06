import { ProjectForm } from '@/components/admin/ProjectForm';

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <span className="text-[10px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
          Novo Registo
        </span>
        <h1 className="font-display text-3xl text-[#f5f1ea]">CRIAR PROJETO</h1>
      </div>

      <ProjectForm />
    </div>
  );
}
