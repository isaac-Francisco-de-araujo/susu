import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShieldCheck, Sparkles } from "lucide-react";
import professionalImage from "@/assets/professional.jpg";
import { PublicLayout } from "@/components/public-shell";
import { settingsStore } from "@/lib/studio-store";
export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre | Manicure e Pedicure" },
      {
        name: "description",
        content: "Conheça a profissional e os serviços do estabelecimento.",
      },
      { property: "og:title", content: "Sobre | Manicure e Pedicure" },
      { property: "og:description", content: "Beleza e cuidado com atenção aos detalhes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  const { data: settings } = settingsStore.use();
  return (
    <PublicLayout>
      <section className="py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <img
            src={professionalImage}
            width={1024}
            height={1280}
            alt="Imagem ilustrativa de uma profissional de manicure"
            className="aspect-[4/5] w-full rounded-xl object-cover shadow-card"
          />
          <div>
            <p className="text-xs font-bold uppercase text-primary">Minha história</p>
            <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
              Olá, eu sou {settings.professionalName}
            </h1>
            <p className="mt-6 leading-8 text-muted-foreground">
              Sou manicure e pedicure apaixonada por transformar o cuidado com as unhas em um
              momento de bem-estar. Recebo cada cliente com atenção, escuta e
              muito carinho.
            </p>
            <p className="mt-4 leading-8 text-muted-foreground">
              Meu compromisso é unir técnica, higiene e beleza para que você se sinta segura,
              acolhida e ainda mais confiante.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Sparkles, label: "Técnica" },
                { icon: ShieldCheck, label: "Segurança" },
                { icon: Heart, label: "Carinho" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-xl bg-accent p-4 text-center">
                  <Icon className="mx-auto h-5 w-5 text-primary" />
                  <p className="mt-2 text-sm font-semibold">{label}</p>
                </div>
              ))}
            </div>
            <Link
              to="/servicos"
              className="mt-8 inline-flex h-12 items-center rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground"
            >
              Agende seu momento
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
