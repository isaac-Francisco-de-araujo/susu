import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/public-shell";
import { ServiceGrid } from "@/components/service-grid";
import { SectionTitle } from "@/components/ui-kit";
import { loadPublicCatalog } from "@/lib/public-data";
export const Route = createFileRoute("/servicos")({
  loader: () => loadPublicCatalog(),
  head: () => ({
    meta: [
      { title: "Serviços | Manicure e Pedicure" },
      {
        name: "description",
        content: "Conheça os serviços e os preços de manicure, pedicure e esmaltação.",
      },
      { property: "og:title", content: "Serviços | Manicure e Pedicure" },
      { property: "og:description", content: "Cuidados profissionais para suas unhas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  const catalog = Route.useLoaderData();
  return (
    <PublicLayout>
      <section className="bg-rose-soft py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            level={1}
            eyebrow="Menu de cuidados"
            title="Serviços para o seu momento"
            copy="Escolha o cuidado ideal. Todos os atendimentos incluem preparação cuidadosa e acabamento impecável."
          />
        </div>
      </section>
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ServiceGrid initialItems={catalog.services} />
          <div className="mt-10 rounded-xl bg-muted p-6 text-sm leading-7 text-muted-foreground">
            <strong className="text-foreground">Importante:</strong> O agendamento é feito pelo
            WhatsApp: toque em "Agendar aqui" e combine o melhor horário diretamente com a
            profissional.
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
