import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  CircleDollarSign,
  MessageCircle,
  Plus,
  UsersRound,
  UserX,
} from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { MetricCard, MiniBars, StatusBadge } from "@/components/admin-widgets";
import { Button, Card } from "@/components/ui-kit";
import { RemoteStatus } from "@/components/remote-status";
import { money } from "@/lib/mock-data";
import { whatsappLink } from "@/lib/config";
import {
  appointmentsStore,
  clientsStore,
  financeStore,
  saveAppointment,
  settingsStore,
} from "@/lib/studio-store";
import { clientsWithoutReturn } from "@/lib/client-follow-up";
import type { AppointmentStatus, SavedAppointment } from "@/lib/mock-data";
import { inRange, localDate, periodRange, procedureStats, total } from "@/lib/analytics";

export const Route = createFileRoute("/brigor/")({
  head: () => ({ meta: [{ title: "Dashboard | Painel profissional" }] }),
  component: Page,
});

function Page() {
  const appointments = appointmentsStore.use();
  const clients = clientsStore.use();
  const finance = financeStore.use();
  const { data: settings } = settingsStore.use();
  const now = new Date();
  const today = localDate(now);
  const todays = appointments.data.filter((item) => item.startsAt.startsWith(today));
  const upcoming = appointments.data
    .filter(
      (item) =>
        (new Date(item.startsAt) >= now || item.startsAt.startsWith(today)) &&
        ["Pendente", "Confirmado"].includes(item.status),
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const pending = upcoming.filter((item) => item.status === "Pendente");
  const missed = todays.filter((item) => item.status === "Não atendido");
  const clientName = (id: string) => clients.data.find((item) => item.id === id)?.name ?? "Cliente";
  const days = Array.from(
    { length: 7 },
    (_, index) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + index),
  );
  const monthStats = procedureStats(
    appointments.data.filter((item) => inRange(item.startsAt, periodRange("Mês", now))),
  );
  const top = monthStats[0];
  const inactive = clientsWithoutReturn(clients.data, appointments.data, 30, now);
  const changeStatus = async (item: SavedAppointment, status: AppointmentStatus) => {
    try {
      await saveAppointment({ ...item, status }, item.id);
    } catch {
      /* Store displays errors. */
    }
  };
  return (
    <AdminShell
      title={`Olá, ${settings.professionalName}! 💕`}
      subtitle={now.toLocaleDateString("pt-BR", { dateStyle: "full" })}
      action={
        <div className="flex flex-wrap gap-2">
          <Link
            to="/brigor/agenda"
            search={{ novo: true }}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-bold text-primary-foreground"
          >
            <Plus className="h-4 w-4" />
            Novo atendimento
          </Link>
          <Link
            to="/brigor/clientes"
            search={{ novo: true }}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-xs font-bold"
          >
            <UsersRound className="h-4 w-4" />
            Nova cliente
          </Link>
        </div>
      }
    >
      <RemoteStatus
        loading={appointments.loading}
        error={appointments.error}
        retry={appointmentsStore.refresh}
      />
      <RemoteStatus loading={clients.loading} error={clients.error} retry={clientsStore.refresh} />
      <RemoteStatus loading={finance.loading} error={finance.error} retry={financeStore.refresh} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Atendimentos hoje"
          value={String(todays.filter((item) => item.status !== "Cancelado").length)}
          icon={CalendarCheck}
        />
        <MetricCard
          label="Receitas do dia"
          value={money(
            total(
              finance.data.filter((item) => item.date === today),
              "Entrada",
            ),
          )}
          icon={CircleDollarSign}
        />
        <MetricCard label="Próximos a confirmar" value={String(pending.length)} icon={UsersRound} />
        <MetricCard label="Não atendidos hoje" value={String(missed.length)} icon={UserX} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Hoje e próximos atendimentos</h2>
            <Link to="/brigor/agenda" className="text-sm font-bold text-primary">
              Ver agenda
            </Link>
          </div>
          {!appointments.loading && !upcoming.length && (
            <p className="mt-5 text-sm text-muted-foreground">Nenhum atendimento futuro.</p>
          )}
          <div className="mt-5 grid gap-3">
            {upcoming.slice(0, 5).map((item) => (
              <article
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-muted/60 p-3"
              >
                <div>
                  <p className="font-semibold">{clientName(item.clientId)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.startsAt).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}{" "}
                    · {item.serviceName}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={item.status} />
                  {item.status === "Pendente" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={appointments.saving}
                      onClick={() => void changeStatus(item, "Confirmado")}
                      aria-label={`Confirmar atendimento de ${clientName(item.clientId)}`}
                    >
                      Confirmar
                    </Button>
                  )}
                  {new Date(item.startsAt) <= now && (
                    <Button
                      size="sm"
                      disabled={appointments.saving}
                      onClick={() => void changeStatus(item, "Atendido")}
                      aria-label={`Concluir atendimento de ${clientName(item.clientId)}`}
                    >
                      Concluir
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">Receitas</h2>
          <p className="mb-4 mt-1 text-xs text-muted-foreground">Últimos sete dias</p>
          <MiniBars
            values={days.map((day) =>
              total(
                finance.data.filter((item) => item.date === localDate(day)),
                "Entrada",
              ),
            )}
            labels={days.map((day) =>
              day.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
            )}
          />
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">Procedimento mais realizado no mês</h2>
          <p className="mt-5 font-display text-2xl">
            {top?.name ?? "Nenhum atendimento concluído"}
          </p>
          {top && (
            <p className="mt-2 text-sm text-muted-foreground">
              {top.count} atendimento(s) · {money(top.revenue)}
            </p>
          )}
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">Confirmar clientes</h2>
          <div className="mt-4 grid gap-4">
            {!appointments.loading && !pending.length && (
              <p className="text-sm text-muted-foreground">Tudo confirmado! 💕</p>
            )}
            {pending.slice(0, 10).map((item) => {
              const client = clients.data.find((person) => person.id === item.clientId);
              const date = new Date(item.startsAt).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              });
              return (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{client?.name ?? "Cliente"}</p>
                    <p className="text-xs text-muted-foreground">
                      {date} · {item.serviceName}
                    </p>
                  </div>
                  {client && (
                    <a
                      className="flex items-center gap-2 text-sm font-bold text-primary"
                      href={whatsappLink(
                        `Olá, ${client.name}! Posso confirmar seu horário de ${item.serviceName} em ${date}? 💕`,
                        client.phone,
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Confirmar
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
        <Card className="p-5 sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold">
                Clientes para convidar a voltar
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Há 30 dias ou mais sem atendimento e sem próximo horário agendado.
              </p>
            </div>
            <Link
              to="/brigor/clientes"
              search={{ retorno: true }}
              className="text-sm font-bold text-primary"
            >
              Ver todas
            </Link>
          </div>
          {!clients.loading &&
            !appointments.loading &&
            !clients.error &&
            !appointments.error &&
            (inactive.length ? (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {inactive.slice(0, 6).map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 p-3"
                  >
                    <div>
                      <p className="font-semibold">{client.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {client.inactiveDays} dias sem retornar
                      </p>
                    </div>
                    <a
                      href={whatsappLink(
                        `Olá, ${client.name.split(" ")[0]}! Vamos combinar seu próximo horário para cuidar das unhas? 💕`,
                        client.phone,
                      )}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Convidar ${client.name} pelo WhatsApp`}
                      className="inline-flex h-10 items-center gap-2 text-sm font-bold text-primary"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Convidar
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Nenhuma cliente sem retorno neste período.
              </p>
            ))}
        </Card>
      </div>
    </AdminShell>
  );
}
