import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShieldCheck, Sparkles } from "lucide-react";
import professionalImage from "@/assets/suellen-profissional.jpeg";
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
            width={1080}
            height={1076}
            alt={`Foto de ${settings.professionalName}, manicure e pedicure`}
            className="aspect-[4/5] w-full rounded-xl object-cover shadow-card"
          />
          <div>
            <p className="text-xs font-bold uppercase text-primary">Minha história</p>
            <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
              Olá, eu sou {settings.professionalName}
            </h1>
            <p className="mt-6 leading-8 text-muted-foreground">
              Meu nome é Suellen Paz, tenho 40 anos e sou manicure por amor e vocação.

Minha história com as unhas começou há 18 anos, com a chegada do meu primeiro filho. Foi nesse momento tão especial da minha vida que decidi fazer meu curso de manicure e dar os primeiros passos na profissão, atendendo minhas clientes a domicílio.

Ao longo dessa caminhada, tive a oportunidade de ter meu próprio espaço e também trabalhar em outros salões de beleza, adquirindo experiências e aprendizados que contribuíram para o meu crescimento.

Com a chegada do meu segundo filho, precisei desacelerar e fazer uma pausa nos atendimentos. Mas alguns sonhos e chamados permanecem vivos dentro de nós!

E foi assim que, com muita determinação, voltei a atender a domicílio, até conquistar algo que sempre desejei: ter o meu próprio Studio!

Hoje, o Suellen Paz Studio é muito mais do que um espaço de beleza. É a realização de um sonho construído com dedicação, amor e persistência.

Minha missão vai além de cuidar das unhas: quero proporcionar momentos de carinho, autoestima e valorização para cada mulher que passa por aqui.

Afinal, embelezar as mãos é também uma forma de tocar a autoestima e fazer mulheres maravilhosas se sentirem ainda mais especiais!

Seja muito bem-vinda ao Suellen Paz Studio!
            </p>
            <p className="mt-4 leading-8 text-muted-foreground">
              
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
