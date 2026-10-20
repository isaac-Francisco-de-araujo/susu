import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarCheck,
  CircleDollarSign,
  Crown,
  MessageCircle,
  UserX,
  UsersRound,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { MetricCard, MiniBars, StatusBadge } from "@/components/admin-widgets";
import { Button, Card } from "@/components/ui-kit";
import { appointments, money } from "@/lib/mock-data";
import { whatsappLink } from "@/lib/config";
export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard | Studio Bella" },
      { name: "description", content: "Visão geral da agenda e do negócio do Studio Bella." },
      { property: "og:title", content: "Dashboard | Studio Bella" },
      { property: "og:description", content: "Gestão diária do Studio Bella." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
function Page() {
  // integrar com o back aq
  const today = 29;
  const todays = appointments.filter((a) => a.day === today);
  const upcoming = appointments.filter((a) => a.status !== "Cancelado").slice(0, 3);
  const toConfirm = appointments.filter((a) => a.status === "Pendente");
  const notAttended = appointments.filter((a) => a.status === "Não atendido");
  const dayRevenue = todays
    .filter((a) => a.status === "Atendido" || a.status === "Confirmado")
    .reduce((t, a) => t + a.value, 0);
  return (
    <AdminShell
      title="Bom dia, Bella! 💕"
      subtitle={`Hoje você tem ${todays.length} atendimentos.`}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Clientes hoje" value={String(todays.length)} icon={CalendarCheck} />
        <MetricCard label="Faturamento do dia" value={money(dayRevenue)} icon={CircleDollarSign} />
        <MetricCard label="Confirmar clientes" value={String(toConfirm.length)} icon={UsersRound} />
        <MetricCard
          label="Clientes não atendidos"
          value={String(notAttended.length)}
          icon={UserX}
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Próximos atendimentos</h2>
              <p className="mt-1 text-xs text-muted-foreground">29 de setembro</p>
            </div>
            <Link to="/admin/agenda" className="text-xs font-bold text-primary">
              Ver agenda
            </Link>
          </div>
          <div className="mt-5 grid gap-3">
            {upcoming.map((a) => (
              <div
                key={a.id}
                className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg bg-muted/60 p-3"
              >
                <div className="rounded-md bg-card px-2.5 py-2 text-sm font-bold shadow-soft">
                  {a.time}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{a.client}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.service}</p>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">Faturamento</h2>
          <p className="mt-1 text-xs text-muted-foreground">Últimos 7 dias</p>
          <MiniBars
            values={[280, 420, 310, 510, 460, 620, 385]}
            labels={["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]}
          />
        </Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary">
              <Crown className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Procedimento mais realizado</p>
              <h2 className="font-display text-xl font-semibold">Manicure + Pedicure</h2>
            </div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[72%] rounded-full bg-primary" />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">38 atendimentos neste mês</p>
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">Confirmar clientes</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Atendimentos próximos aguardando confirmação
          </p>
          <div className="mt-4 grid gap-3">
            {toConfirm.length === 0 && (
              <p className="text-sm text-muted-foreground">Tudo confirmado! 💕</p>
            )}
            {toConfirm.map((a) => (
              <div key={a.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{a.client}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.day}/09 às {a.time} · {a.service}
                  </p>
                </div>
                <a
                  href={whatsappLink(
                    `Olá, ${a.client.split(" ")[0]}! Posso confirmar seu horário de ${a.service} no dia ${a.day}/09 às ${a.time}? 💕`,
                    a.phone,
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="secondary" size="sm">
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Confirmar</span>
                  </Button>
                </a>
              </div>
            ))}
          </div>
          {notAttended.length > 0 && (
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-bold uppercase text-muted-foreground">Não atendidos</p>
              {notAttended.map((a) => (
                <p key={a.id} className="mt-2 text-sm">
                  {a.client}{" "}
                  <span className="text-muted-foreground">
                    · {a.day}/09 {a.time}
                  </span>
                </p>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminShell>
  );
}
