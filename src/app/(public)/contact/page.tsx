import { Metadata } from 'next';
import { ContactForm } from '@/components/contact/ContactForm';
import { Mail, Phone, MapPin, Linkedin, Instagram, FileText, ArrowUpRight } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { getWebPageSchema } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Contacto & Consultoria',
  description:
    'Entre em contacto com Marcelo Júnior Cumbe para novos projetos de arquitetura, consultoria BIM, desenho urbano ou colaborações técnicas em Moçambique.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contacto & Consultoria | MJC Architecture',
    description:
      'Entre em contacto com Marcelo Júnior Cumbe para novos projetos de arquitetura, consultoria BIM, desenho urbano ou colaborações técnicas em Moçambique.',
    url: '/contact',
  },
};

export default function ContactPage() {
  const contactSchema = getWebPageSchema({
    path: '/contact',
    name: 'Contacto & Consultoria | MJC Architecture',
    description:
      'Entre em contacto com Marcelo Júnior Cumbe para novos projetos de arquitetura, consultoria BIM, desenho urbano ou colaborações técnicas em Moçambique.',
    type: 'ContactPage',
    breadcrumbs: [
      { name: 'Início', url: '/' },
      { name: 'Contacto', url: '/contact' },
    ],
  });

  return (
    <div className="arch-container py-12 sm:py-20 space-y-16">
      <JsonLd data={contactSchema} />
      {/* Cabeçalho */}
      <div className="space-y-4 max-w-3xl border-b border-[#f5f1ea]/15 pb-8">
        <span className="text-[11px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
          Diálogo & Parcerias
        </span>
        <h1 className="font-display text-4xl sm:text-6xl text-[#f5f1ea] tracking-tight">
          VAMOS CONVERSAR?
        </h1>
        <p className="text-base text-[#f5f1ea]/70 leading-relaxed font-normal">
          Seja para uma encomenda residencial, consultoria técnica em modelagem BIM ou
          desenvolvimento de planos urbanísticos, preencha o formulário ou contacte através dos
          canais diretos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Formulário Interativo */}
        <div className="lg:col-span-7 border border-[#f5f1ea]/10 bg-[#141416] p-6 sm:p-10">
          <h2 className="font-display text-xl text-[#f5f1ea] mb-6">
            Envie uma Mensagem Direta
          </h2>
          <ContactForm />
        </div>

        {/* Canais Diretos de Contacto */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 sm:p-8 border border-[#f5f1ea]/10 bg-[#121214] space-y-6">
            <h3 className="font-display text-sm uppercase tracking-widest text-[#e8342a]">
              Informações Rápidas
            </h3>

            <div className="space-y-4">
              <a
                href="mailto:marcelojuniord07@gmail.com"
                className="flex items-start gap-3 text-sm text-[#f5f1ea]/80 hover:text-[#e8342a] transition-colors group"
              >
                <Mail className="w-5 h-5 text-[#e8342a] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs uppercase tracking-widest text-[#f5f1ea]/40">
                    Email
                  </span>
                  <span className="font-mono text-sm">marcelojuniord07@gmail.com</span>
                </div>
              </a>

              <a
                href="https://wa.link/qdv2hj"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-sm text-[#f5f1ea]/80 hover:text-[#e8342a] transition-colors group"
              >
                <Phone className="w-5 h-5 text-[#e8342a] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs uppercase tracking-widest text-[#f5f1ea]/40">
                    WhatsApp Direto
                  </span>
                  <span className="font-mono text-sm">+258 84 713 0805</span>
                </div>
              </a>

              <div className="flex items-start gap-3 text-sm text-[#f5f1ea]/80">
                <MapPin className="w-5 h-5 text-[#e8342a] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="block text-xs uppercase tracking-widest text-[#f5f1ea]/40">
                    Localização do Ateliê
                  </span>
                  <span>Catembe, Rua da Igreja — Maputo, Moçambique</span>
                </div>
              </div>
            </div>
          </div>

          {/* Redes e Currículo */}
          <div className="p-6 sm:p-8 border border-[#f5f1ea]/10 bg-[#121214] space-y-4">
            <h3 className="font-display text-sm uppercase tracking-widest text-[#e8342a]">
              Documentos & Redes
            </h3>

            <div className="space-y-3">
              <a
                href="https://drive.google.com/file/d/1PLqDbRhrFCbv4OgxCZhGxB1yKRgxhRoX/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-[#f5f1ea]/15 hover:border-[#e8342a] text-xs font-display uppercase tracking-widest text-[#f5f1ea] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#e8342a]" />
                  <span>Curriculum Vitae (PDF)</span>
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <a
                href="https://www.linkedin.com/in/marcellojrc/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-[#f5f1ea]/15 hover:border-[#e8342a] text-xs font-display uppercase tracking-widest text-[#f5f1ea] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4 text-[#e8342a]" />
                  <span>LinkedIn / marcellojrc</span>
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <a
                href="https://www.instagram.com/marcellojrc/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 border border-[#f5f1ea]/15 hover:border-[#e8342a] text-xs font-display uppercase tracking-widest text-[#f5f1ea] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-[#e8342a]" />
                  <span>Instagram / @marcellojrc</span>
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
