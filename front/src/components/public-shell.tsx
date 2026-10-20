import { whatsappLink, bookingMessage } from "@/lib/config";
import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Instagram, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui-kit";

const links = [
  ["Início", "/"],
  ["Serviços", "/servicos"],
  ["Trabalhos", "/trabalhos"],
  ["Sobre", "/sobre"],
  ["Contato", "/contato"],
] as const;

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (state) => state.location.pathname });
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl">
      <div className="mx-auto grid h-18 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            <Heart className="h-4 w-4 fill-current" />
          </span>
          <span className="truncate font-display text-xl font-semibold">Studio Bella</span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map(([label, to]) => (
            <Link
              key={to}
              to={to}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${path === to ? "bg-accent text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </Link>
          ))}
          <a
            href={whatsappLink(bookingMessage())}
            target="_blank"
            rel="noreferrer"
            className="ml-3 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft"
          >
            Agendar horário <Heart className="h-4 w-4 fill-current" />
          </a>
        </nav>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <nav className="border-t border-border bg-background p-4 lg:hidden">
          {links.map(([label, to]) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-4 py-3 text-base font-medium hover:bg-accent"
            >
              {label}
            </Link>
          ))}
          <a
            href={whatsappLink(bookingMessage())}
            target="_blank"
            rel="noreferrer"
            onClick={() => setOpen(false)}
            className="mt-2 flex h-12 items-center justify-center rounded-lg bg-primary font-semibold text-primary-foreground"
          >
            Agendar horário <Heart className="ml-2 h-4 w-4 fill-current" />
          </a>
        </nav>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-foreground text-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 font-display text-2xl font-semibold">
              <Heart className="h-5 w-5 fill-current text-primary" />
              Studio Bella
            </div>
            <p className="mt-3 max-w-sm text-sm leading-6 text-background/65">
              Beleza, cuidado e atenção em cada detalhe. Seu momento de autocuidado começa aqui.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold uppercase text-background/50">Explore</p>
            <div className="mt-4 grid gap-2 text-sm">
              {links.slice(0, 3).map(([label, to]) => (
                <Link key={to} to={to} className="text-background/75 hover:text-background">
                  {label}
                </Link>
              ))}
              <a
                href={whatsappLink(bookingMessage())}
                target="_blank"
                rel="noreferrer"
                className="text-background/75 hover:text-background"
              >
                Agendamento
              </a>
            </div>
          </div>
          <div>
            <p className="text-sm font-bold uppercase text-background/50">Acompanhe</p>
            <div className="mt-4 flex gap-3">
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="grid h-10 w-10 place-items-center rounded-full border border-background/15"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://wa.me/5511999999999"
                aria-label="WhatsApp"
                className="grid h-10 w-10 place-items-center rounded-full border border-background/15"
              >
                W
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-background/10 pt-5 text-xs text-background/50">
          © 2026 Studio Bella. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </>
  );
}
