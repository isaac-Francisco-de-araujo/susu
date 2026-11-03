import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  Heart,
  LayoutDashboard,
  Menu,
  Settings,
  UsersRound,
  WalletCards,
  X,
  Sparkles,
  Images,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui-kit";
import { settingsStore } from "@/lib/studio-store";
import { logout } from "@/lib/auth";
const items = [
  ["Dashboard", "/brigor", LayoutDashboard],
  ["Agenda", "/brigor/agenda", CalendarDays],
  ["Clientes", "/brigor/clientes", UsersRound],
  ["Procedimentos", "/brigor/procedimentos", Sparkles],
  ["Meus trabalhos", "/brigor/trabalhos", Images],
  ["Financeiro", "/brigor/financeiro", WalletCards],
  ["Relatórios", "/brigor/relatorios", BarChart3],
  ["Configurações", "/brigor/configuracoes", Settings],
] as const;
export function AdminShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const sidebar = useRef<HTMLElement>(null);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const update = () => setMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!open || !mobile) return;
    const previous = document.activeElement as HTMLElement | null;
    const element = sidebar.current;
    const focusable = () => Array.from(element?.querySelectorAll<HTMLElement>("a[href],button:not(:disabled)") ?? []);
    focusable()[0]?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
      if (event.key !== "Tab") return;
      const controls = focusable();
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keyboard);
    return () => { document.removeEventListener("keydown", keyboard); previous?.focus(); };
  }, [open, mobile]);
  const { data: settings } = settingsStore.use();
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-admin">
      <a href="#conteudo-admin" className="skip-link">Pular para o conteúdo</a>
      <aside
        id="menu-admin"
        ref={sidebar}
        role={open && mobile ? "dialog" : undefined}
        aria-modal={open && mobile ? true : undefined}
        aria-label="Menu do painel"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-y-auto overscroll-contain border-r border-sidebar-border bg-sidebar p-4 transition-transform lg:visible lg:translate-x-0 ${open ? "visible translate-x-0" : "invisible -translate-x-full"}`}
      >
        <div className="flex h-12 shrink-0 items-center justify-between px-2">
          <Link to="/" className="flex min-w-0 items-center gap-2 font-display text-xl font-semibold">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Heart className="h-4 w-4 fill-current" />
            </span>
            <span className="truncate">{settings.studioName}</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Fechar menu"
          >
            <X />
          </Button>
        </div>
        <p className="mb-3 mt-8 px-3 text-[10px] font-bold uppercase text-muted-foreground">
          Gestão do studio
        </p>
        <nav aria-label="Painel profissional" className="grid shrink-0 gap-1">
          {items.map(([label, to, Icon]) => {
            const active = to === "/brigor" ? path === to : path.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft" : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{label}</span>
                {active && <ChevronRight className="h-4 w-4 shrink-0" />}
              </Link>
            );
          })}
        </nav>
        <Button variant="ghost" className="mt-4 w-full" onClick={() => { setLogoutError(""); void logout().catch(() => setLogoutError("Não foi possível encerrar a sessão. Verifique a conexão e tente novamente.")); }}>
          Sair do painel
        </Button>
        {logoutError && <p role="alert" className="mt-2 text-sm text-destructive">{logoutError}</p>}
        <div className="mt-auto shrink-0 pt-5">
          <div className="rounded-xl bg-accent p-4">
            <p className="text-sm font-semibold">Precisa de ajuda?</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Gerencie clientes, atendimentos, procedimentos e fotos do site.
            </p>
          </div>
        </div>
      </aside>
      {open && (
        <button
          className="fixed inset-0 z-40 bg-overlay/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Fechar menu"
          tabIndex={-1}
        />
      )}
      <div className="lg:pl-72" inert={open && mobile}>
        <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl">
          <div className="mx-auto grid min-h-18 max-w-[1500px] grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 px-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-3 sm:px-6">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Abrir menu"
              aria-expanded={open}
              aria-controls="menu-admin"
            >
              <Menu />
            </Button>
            <div className="min-w-0 py-3">
              <h1 className="truncate font-display text-xl font-semibold sm:text-2xl">{title}</h1>
              {subtitle && (
                <p className="truncate text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
              )}
            </div>
            {action && (
              <div className="col-span-2 flex justify-end pb-3 sm:col-span-1 sm:pb-0">
                {action}
              </div>
            )}
          </div>
        </header>
        <main id="conteudo-admin" tabIndex={-1} className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
