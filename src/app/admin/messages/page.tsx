import { prisma } from '@/lib/db';
import { MessagesList } from '@/components/admin/MessagesList';

export const revalidate = 0;

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="space-y-1 border-b border-[#f5f1ea]/15 pb-6">
        <span className="text-[10px] font-display uppercase tracking-[0.2em] text-[#e8342a]">
          Comunicação
        </span>
        <h1 className="font-display text-3xl text-[#f5f1ea]">
          MENSAGENS RECEBIDAS ({messages.length})
        </h1>
      </div>

      <MessagesList initialMessages={messages} />
    </div>
  );
}
