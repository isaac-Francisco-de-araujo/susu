import { createFileRoute } from "@tanstack/react-router";
import { RefreshCcw, Repeat2, UserPlus, UsersRound } from "lucide-react";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { MetricCard, MiniBars } from "@/components/admin-widgets";
import { Card, Field } from "@/components/ui-kit";
import { RemoteStatus } from "@/components/remote-status";
import { money } from "@/lib/mock-data";
import { appointmentsStore, clientsStore } from "@/lib/studio-store";
import { localDate, procedureStats } from "@/lib/analytics";

export const Route = createFileRoute("/admin/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios | Painel profissional" }] }),
  component: Page,
});

function Page() {
  const appointments = appointmentsStore.use();
  const clients = clientsStore.use();
  const [month, setMonth] = useState(localDate().slice(0, 7));
  const completed = appointments.data.filter(
    (item) => item.status === "Atendido" && item.startsAt.startsWith(month),
  );
  const stats = procedureStats(completed);
  const served = new Set(completed.map((item) => item.clientId));
  const firstCompleted = new Map<string, string>();
  appointments.data
    .filter((item) => item.status === "Atendido")
    .forEach((item) => {
      const previous = firstCompleted.get(item.clientId);
      if (!previous || item.startsAt < previous) firstCompleted.set(item.clientId, item.startsAt);
    });
  const fresh = clients.data.filter((item) =>
    (item.firstVisit ?? firstCompleted.get(item.id))?.startsWith(month),
  );
  const recurring = clients.data.filter(
    (item) => served.has(item.id) && (firstCompleted.get(item.id)?.slice(0, 7) ?? month) < month,
  );
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 45);
  const inactive = clients.data.filter(
    (item) => item.lastVisit && item.lastVisit.slice(0, 10) < localDate(cutoff),
  );
  const revenue = stats.reduce((sum, item) => sum + Math.round(item.revenue * 100), 0) / 100;
  return (
    <AdminShell
      title="Relatórios"
      subtitle="Indicadores calculados a partir dos atendimentos concluídos"
    >
      <RemoteStatus
        loading={appointments.loading}
        error={appointments.error}
        retry={appointmentsStore.refresh}
      />
      <RemoteStatus loading={clients.loading} error={clients.error} retry={clientsStore.refresh} />
      <div className="mb-5 max-w-xs">
        <Field
          label="Mês de referência"
          type="month"
          required
          value={month}
          onChange={(event) => {
            if (event.target.value) setMonth(event.target.value);
          }}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Clientes atendidas no mês"
          value={String(served.size)}
          icon={UsersRound}
        />
        <MetricCard label="Primeira visita no mês" value={String(fresh.length)} icon={UserPlus} />
        <MetricCard
          label="Retornaram de meses anteriores"
          value={String(recurring.length)}
          icon={Repeat2}
        />
        <MetricCard
          label="Sem retornar há mais de 45 dias"
          value={String(inactive.length)}
          icon={RefreshCcw}
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">Procedimentos mais realizados</h2>
          {stats.length ? (
            <div className="mt-5">
              <MiniBars
                values={stats.slice(0, 6).map((item) => item.count)}
                labels={stats.slice(0, 6).map((item) => item.name)}
              />
            </div>
          ) : (
            <p className="mt-5 text-sm text-muted-foreground">
              Nenhum atendimento concluído neste mês.
            </p>
          )}
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">Receitas de atendimentos</h2>
          <p className="mt-5 font-display text-3xl">{money(revenue)}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {completed.length} atendimento(s) concluído(s). Entradas manuais e despesas aparecem no
            Financeiro.
          </p>
        </Card>
      </div>
      <Card className="mt-6 overflow-x-auto" role="region" aria-label="Relatório de procedimentos, tabela com rolagem horizontal" tabIndex={0}>
        <table className="w-full text-left text-sm">
          <caption className="p-5 text-left font-display text-xl font-semibold">
            Resultados por procedimento
          </caption>
          <thead className="bg-muted">
            <tr>
              <th className="p-4">Procedimento</th>
              <th className="p-4">Atendimentos</th>
              <th className="p-4">Receita</th>
              <th className="p-4">Ticket médio</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((item) => (
              <tr key={item.id} className="border-t border-border">
                <td className="p-4">{item.name}</td>
                <td className="p-4">{item.count}</td>
                <td className="p-4">{money(item.revenue)}</td>
                <td className="p-4">{money(item.revenue / item.count)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <p className="mt-4 text-xs text-muted-foreground">
        A primeira visita usa a data informada no cadastro ou, quando ausente, o primeiro
        atendimento concluído. A lista de reativação considera a data atual.
      </p>
    </AdminShell>
  );
}
