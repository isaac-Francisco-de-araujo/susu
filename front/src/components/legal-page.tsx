import type { ReactNode } from "react";
import { PublicLayout } from "./public-shell";
import { settingsStore } from "@/lib/studio-store";
import { whatsappLink } from "@/lib/config";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  const { data: settings } = settingsStore.use();
  const contact = whatsappLink("Olá, gostaria de falar sobre privacidade e meus dados pessoais.");
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_p]:my-3 [&_p]:leading-7 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
        <h1 className="font-display text-4xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{settings.studioName} · Atualizado em 30 de outubro de 2026</p>
        {children}
        <h2>Contato</h2>
        <p>Para dúvidas sobre estas informações ou solicitações relacionadas aos seus dados, utilize o WhatsApp de contato do estabelecimento. Não envie documentos ou informações sensíveis na primeira mensagem. A identidade será verificada apenas na medida necessária para proteger seus dados.</p>
        {contact ? <a href={contact} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center font-semibold text-primary underline">Falar sobre privacidade pelo WhatsApp</a> : <p>O canal de contato será exibido quando cadastrado pelo estabelecimento.</p>}
      </article>
    </PublicLayout>
  );
}
