import { whatsappLink, bookingMessage } from "@/lib/config";
import { settingsStore } from "@/lib/studio-store";
import { createFileRoute } from "@tanstack/react-router";
import { Clock3, Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import { PublicLayout } from "@/components/public-shell";
import { SectionTitle } from "@/components/ui-kit";
export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato | Manicure e Pedicure" },
      { name: "description", content: "Consulte os canais de contato e agende pelo WhatsApp." },
      { property: "og:title", content: "Contato | Manicure e Pedicure" },
      {
        property: "og:description",
        content: "WhatsApp, Instagram, endereço e horários do estabelecimento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  const { data: settings } = settingsStore.use();
  const info = [
    [Phone, "WhatsApp", settings.whatsapp],
    [Instagram, "Instagram", settings.instagram ? `@${settings.instagram}` : "Não informado"],
    [MapPin, "Endereço", settings.address || "Não informado"],
    [Clock3, "Atendimento", `Das ${settings.opensAt.slice(0, 5)} às ${settings.closesAt.slice(0, 5)}`],
  ] as const;
  return (
    <PublicLayout>
      <section className="bg-rose-soft py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            level={1}
            eyebrow="Contato"
            title="Vai ser um prazer cuidar de você"
            copy="Escolha seu canal preferido. Respondemos assim que possível durante o horário de atendimento."
          />
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto grid max-w-5xl gap-4 px-4 sm:grid-cols-2 sm:px-6">
          {info.map(([Icon, title, text]) => (
            <div
              key={title}
              className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-soft"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-accent text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
          <a
            href={whatsappLink(bookingMessage())}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex h-13 items-center justify-center gap-2 rounded-lg bg-whatsapp text-sm font-bold text-whatsapp-foreground sm:col-span-2"
          >
            <MessageCircle className="h-5 w-5" />
            Falar pelo WhatsApp
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
