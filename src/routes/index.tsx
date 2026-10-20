import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import heroImage from "@/assets/studio-hero.jpg";
import galleryImage from "@/assets/nail-gallery.jpg";
import professionalImage from "@/assets/professional.jpg";
import { PublicLayout } from "@/components/public-shell";
import { ServiceGrid } from "@/components/service-grid";
import { SectionTitle } from "@/components/ui-kit";
import { whatsappLink, bookingMessage } from "@/lib/config";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Studio Bella | Manicure e Pedicure" },
      {
        name: "description",
        content:
          "Manicure, pedicure e esmaltação em gel com cuidado e elegância. Agende seu momento no Studio Bella.",
      },
      { property: "og:title", content: "Studio Bella | Manicure e Pedicure" },
      { property: "og:description", content: "Seu momento de beleza, cuidado e autoestima." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <PublicLayout>
      <section className="relative min-h-[calc(100svh-4.5rem)] overflow-hidden bg-rose-soft">
        <img
          src={heroImage}
          width={1600}
          height={1200}
          alt="Mãos com manicure rosa delicada"
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto flex min-h-[calc(100svh-4.5rem)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-xl animate-rise">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/75 px-3 py-1.5 text-xs font-bold uppercase text-primary backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Beleza que começa nos detalhes
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
              Studio Bella
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-foreground/75">
              Unhas impecáveis, cuidado delicado e um momento só seu.
            </p>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Manicure e pedicure com técnica, carinho e atenção para você sair ainda mais
              confiante.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappLink(bookingMessage())}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground shadow-card transition hover:-translate-y-0.5"
              >
                Agendar horário <Heart className="h-4 w-4 fill-current" />
              </a>
              <Link
                to="/servicos"
                className="inline-flex h-13 items-center justify-center gap-2 rounded-lg border border-foreground/15 bg-background/75 px-6 text-sm font-bold backdrop-blur transition hover:bg-background"
              >
                Ver serviços <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-foreground/70">
              <span className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" /> Materiais esterilizados
              </span>
              <span className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-primary text-primary" /> Atendimento personalizado
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-5">
            <SectionTitle
              eyebrow="Cuidados pensados para você"
              title="Nossos serviços"
              copy="Técnica, produtos selecionados e atenção em cada etapa."
            />
            <Link to="/servicos" className="hidden text-sm font-bold text-primary sm:block">
              Ver todos →
            </Link>
          </div>
          <ServiceGrid />
        </div>
      </section>

      <section className="bg-muted/50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-end justify-between gap-5">
            <SectionTitle
              eyebrow="Portfólio"
              title="Meus trabalhos"
              copy="Um pouco do cuidado e da delicadeza que coloco em cada atendimento."
            />
            <Link to="/trabalhos" className="hidden text-sm font-bold text-primary sm:block">
              Ver galeria →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {["0% 0%", "100% 0%", "0% 100%", "100% 100%"].map((pos, i) => (
              <Link
                key={pos}
                to="/trabalhos"
                className={`group relative overflow-hidden rounded-xl ${i === 0 ? "col-span-2 row-span-2" : ""}`}
              >
                <div className={i === 0 ? "aspect-square" : "aspect-square"}>
                  <img
                    src={galleryImage}
                    width={1536}
                    height={1536}
                    loading="lazy"
                    alt={`Trabalho de nail art ${i + 1}`}
                    className="h-full w-full scale-[2.04] object-cover transition duration-500 group-hover:scale-[2.12]"
                    style={{ transformOrigin: pos }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2 lg:gap-20 lg:px-8">
          <div className="relative mx-auto max-w-md">
            <img
              src={professionalImage}
              width={1024}
              height={1280}
              loading="lazy"
              alt="Profissional do Studio Bella"
              className="aspect-[4/5] w-full rounded-xl object-cover shadow-card"
            />
            <div className="absolute -bottom-5 -right-2 rounded-xl border border-border bg-card p-4 shadow-card sm:-right-6">
              <p className="font-display text-2xl font-semibold text-primary">+8 anos</p>
              <p className="text-xs text-muted-foreground">cuidando de mulheres</p>
            </div>
          </div>
          <div>
            <SectionTitle eyebrow="Sobre mim" title="Cuidado que você sente em cada detalhe" />
            <p className="mt-6 text-base leading-8 text-muted-foreground">
              Olá! Eu sou Bella, manicure e pedicure, e meu objetivo é cuidar das suas unhas com
              carinho, qualidade e atenção aos detalhes. Cada atendimento é pensado para ser uma
              pausa leve na sua rotina.
            </p>
            <Link
              to="/sobre"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary"
            >
              Conheça minha história <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <Heart className="mx-auto h-7 w-7 fill-current" />
          <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">
            Seu próximo horário começa aqui
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-primary-foreground/80">
            Reserve seu momento de autocuidado pelo WhatsApp. Você merece essa pausa.
          </p>
          <a
            href={whatsappLink(bookingMessage())}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex h-13 items-center rounded-lg bg-background px-7 text-sm font-bold text-foreground shadow-card"
          >
            Agendar meu horário <CalendarDays className="ml-2 h-4 w-4" />
          </a>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2">
            <SectionTitle
              eyebrow="Contato"
              title="Vamos conversar?"
              copy="Fale comigo para tirar dúvidas ou encontrar o melhor horário para você."
            />
            <div className="grid gap-3">
              <div className="flex gap-3 rounded-xl border border-border p-4">
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-semibold">Studio Bella</p>
                  <p className="text-sm text-muted-foreground">Rua das Flores, 120 — Centro</p>
                </div>
              </div>
              <a
                href={whatsappLink(
                  "Olá! Gostaria de saber mais sobre os serviços do Studio Bella.",
                )}
                target="_blank"
                rel="noreferrer"
                className="flex h-12 items-center justify-center gap-2 rounded-lg bg-whatsapp text-sm font-bold text-whatsapp-foreground"
              >
                <MessageCircle className="h-5 w-5" /> Falar pelo WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
