import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { prisma } from '@/lib/db';

// Conteúdo do CMS deve refletir alterações sem exigir acesso à base durante o build.
export const dynamic = 'force-dynamic';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cvSetting = await prisma.siteSettings.findUnique({
    where: { key: 'author_cv_url' },
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#0c0c0d]">
      <Header cvUrl={cvSetting?.value} />
      <main id="main-content" className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}
