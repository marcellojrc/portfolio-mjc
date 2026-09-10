import { getSession } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Se não houver sessão (ex.: na rota de login), renderizar diretamente
  if (!session) {
    return <div className="min-h-screen bg-[#0c0c0d]">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#0c0c0d] text-[#f5f1ea]">
      <AdminSidebar userName={session.name} userEmail={session.email} />
      <main className="flex-grow min-w-0 w-full p-3 sm:p-6 md:p-12 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
