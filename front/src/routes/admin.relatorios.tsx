import { createFileRoute } from "@tanstack/react-router";
import { RefreshCcw, Repeat2, UserPlus, UsersRound } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { MetricCard, MiniBars } from "@/components/admin-widgets";
import { Card } from "@/components/ui-kit";
import { money } from "@/lib/mock-data";
export const Route = createFileRoute("/admin/relatorios")({
  head: () => ({
    meta: [
      { title: "Relatórios | Studio Bella" },
      { name: "description", content: "Indicadores de procedimentos, faturamento e clientes." },
      { property: "og:title", content: "Relatórios | Studio Bella" },
      { property: "og:description", content: "Resultados do Studio Bella." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
const stats = [
  { name: "Manicure + Pedicure", count: 38, revenue: 2280 },
  { name: "Manicure", count: 31, revenue: 930 },
  { name: "Pedicure", count: 24, revenue: 840 },
  { name: "Esmaltação em gel", count: 17, revenue: 1190 },
];
function Page() {
  return (
    <AdminShell title="Relatórios" subtitle="Setembro de 2026">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total de clientes" value="87" icon={UsersRound} />
        <MetricCard label="Novas clientes" value="12" icon={UserPlus} detail="+18%" />
        <MetricCard label="Clientes recorrentes" value="64" icon={Repeat2} />
        <MetricCard label="Para reativar" value="11" icon={RefreshCcw} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">Procedimentos mais realizados</h2>
          <p className="mt-1 text-xs text-muted-foreground">Quantidade de atendimentos</p>
          <MiniBars
            values={stats.map((s) => s.count)}
            labels={["Combo", "Manicure", "Pedicure", "Gel"]}
          />
        </Card>
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">Faturamento por procedimento</h2>
          <div className="mt-6 grid gap-5">
            {stats.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between gap-4">
                  <span className="truncate text-sm font-medium">{s.name}</span>
                  <strong className="text-sm">{money(s.revenue)}</strong>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${s.revenue / 22.8}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-border p-5">
          <h2 className="font-display text-xl font-semibold">Resumo dos procedimentos</h2>
        </div>
        {stats.map((s, i) => (
          <div
            key={s.name}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-5 py-4 last:border-0"
          >
            <span className="text-sm font-bold text-primary">0{i + 1}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.count} atendimentos</p>
            </div>
            <strong className="text-sm">{money(s.revenue)}</strong>
          </div>
        ))}
      </Card>
    </AdminShell>
  );
}
