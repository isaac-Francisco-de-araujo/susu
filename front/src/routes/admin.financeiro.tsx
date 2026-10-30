import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Plus,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { MetricCard, MiniBars } from "@/components/admin-widgets";
import { Badge, Button, Card, Field, Modal, SelectField } from "@/components/ui-kit";
import { RemoteStatus } from "@/components/remote-status";
import { money, type FinancialEntry, type FinancialInput } from "@/lib/mock-data";
import { deleteFinancialEntry, financeStore, saveFinancialEntry } from "@/lib/studio-store";
import { inRange, localDate, periodRange, total } from "@/lib/analytics";
import { downloadBlob, financialCsv } from "@/lib/downloads";

export const Route = createFileRoute("/admin/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro | Painel profissional" }] }),
  component: Page,
});

function Page() {
  const { data, loading, saving, error } = financeStore.use();
  const [period, setPeriod] = useState("Mês");
  const [from, setFrom] = useState(localDate());
  const [to, setTo] = useState(localDate());
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<FinancialEntry | null>(null);
  const [deleting, setDeleting] = useState<FinancialEntry | null>(null);
  const range = periodRange(period, new Date(), from, to);
  const items = data
    .filter((item) => inRange(item.date, range))
    .sort((a, b) => b.date.localeCompare(a.date));
  const income = total(items, "Entrada");
  const expenses = total(items, "Despesa");
  const months = Array.from(
    { length: 6 },
    (_, index) => new Date(new Date().getFullYear(), new Date().getMonth() - 5 + index, 1),
  );
  const open = (item?: FinancialEntry) => {
    setEditing(item ?? null);
    setModal(true);
  };
  return (
    <AdminShell
      title="Financeiro"
      subtitle="Receitas de atendimentos concluídos e lançamentos manuais"
      action={
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            disabled={loading || saving || !!error || !items.length || range.from > range.to}
            onClick={() =>
              downloadBlob(
                new Blob([financialCsv(items)], { type: "text/csv;charset=utf-8" }),
                `financeiro-${range.from}-${range.to}.csv`,
              )
            }
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
          <Button size="sm" disabled={saving} onClick={() => open()}>
            <Plus className="h-4 w-4" />
            Novo lançamento
          </Button>
        </div>
      }
    >
      <RemoteStatus loading={loading} error={error} retry={financeStore.refresh} />
      <div className="mb-5 flex flex-wrap gap-2">
        {["Hoje", "Semana", "Mês", "Ano", "Personalizado"].map((value) => (
          <Button
            key={value}
            size="sm"
            variant={period === value ? "primary" : "secondary"}
            onClick={() => setPeriod(value)}
          >
            {value}
          </Button>
        ))}
      </div>
      {period === "Personalizado" && (
        <div className="mb-5 grid max-w-lg gap-3 sm:grid-cols-2">
          <Field
            label="De"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
          <Field
            label="Até"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </div>
      )}
      {range.from > range.to && (
        <p role="alert" className="mb-4 text-destructive">
          A data inicial deve ser anterior ou igual à final.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Receitas no período" value={money(income)} icon={ArrowUpRight} />
        <MetricCard label="Despesas no período" value={money(expenses)} icon={ArrowDownLeft} />
        <MetricCard
          label="Resultado no período"
          value={money(income - expenses)}
          icon={WalletCards}
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card className="p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold">Receitas mensais</h2>
          <p className="mb-4 mt-1 text-xs text-muted-foreground">
            Últimos seis meses · inclui entradas manuais
          </p>
          <MiniBars
            values={months.map((month) =>
              total(
                data.filter((item) => item.date.startsWith(localDate(month).slice(0, 7))),
                "Entrada",
              ),
            )}
            labels={months.map((month) => month.toLocaleDateString("pt-BR", { month: "short" }))}
          />
        </Card>
        <Card>
          <div className="p-5">
            <h2 className="font-display text-xl font-semibold">Lançamentos do período</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Atendimentos com status Atendido entram automaticamente. Edite esses valores pela
              agenda.
            </p>
          </div>
          {!loading && !items.length && (
            <p className="p-5 text-sm text-muted-foreground">Nenhum lançamento neste período.</p>
          )}
          <div className="divide-y divide-border">
            {items.map((item) => (
              <article
                key={`${item.source}-${item.id}`}
                className="flex flex-wrap items-center justify-between gap-3 p-5"
              >
                <div className="min-w-0">
                  <p className="font-semibold">{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(`${item.date}T12:00:00`).toLocaleDateString("pt-BR")} · {item.payment}
                  </p>
                  <Badge>{item.source === "appointment" ? "Atendimento" : item.type}</Badge>
                </div>
                <div className="text-right">
                  <p
                    className={
                      item.type === "Entrada"
                        ? "font-bold text-success"
                        : "font-bold text-destructive"
                    }
                  >
                    {item.type === "Entrada" ? "+" : "−"}
                    {money(item.amount)}
                  </p>
                  {item.source === "manual" && (
                    <div className="mt-2 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={saving}
                        onClick={() => open(item)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={saving}
                        onClick={() => setDeleting(item)}
                      >
                        Excluir
                      </Button>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </Card>
      </div>
      <Modal
        open={modal}
        title={editing ? "Editar lançamento" : "Novo lançamento"}
        onClose={() => {
          if (!saving) setModal(false);
        }}
      >
        <form
          key={editing?.id ?? "new"}
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            try {
              await saveFinancialEntry(
                {
                  type: String(form.get("type")) as FinancialInput["type"],
                  description: String(form.get("description")),
                  date: String(form.get("date")),
                  payment: String(form.get("payment")),
                  amount: Number(form.get("amount")),
                },
                editing?.id,
              );
              setModal(false);
            } catch {
              /* The store displays the error and preserves the form. */
            }
          }}
        >
          {error && (
            <p role="alert" className="text-sm text-destructive sm:col-span-2">
              {error}
            </p>
          )}
          <SelectField name="type" label="Tipo" defaultValue={editing?.type ?? "Despesa"}>
            <option>Entrada</option>
            <option>Despesa</option>
          </SelectField>
          <Field
            required
            name="description"
            label="Descrição"
            maxLength={500}
            defaultValue={editing?.description}
          />
          <Field
            required
            name="amount"
            label="Valor"
            type="number"
            min="0.01"
            max="9999999999.99"
            step="0.01"
            defaultValue={editing?.amount}
          />
          <Field
            required
            name="date"
            label="Data"
            type="date"
            defaultValue={editing?.date ?? localDate()}
          />
          <SelectField name="payment" label="Pagamento" defaultValue={editing?.payment ?? "Pix"}>
            {["Pix", "Dinheiro", "Débito", "Crédito"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </SelectField>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button
              type="button"
              variant="secondary"
              disabled={saving}
              onClick={() => setModal(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar lançamento"}
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        open={!!deleting}
        title="Excluir lançamento"
        onClose={() => {
          if (!saving) setDeleting(null);
        }}
      >
        <p>Excluir {deleting?.description}?</p>
        {error && (
          <p role="alert" className="mt-3 text-destructive">
            {error}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" disabled={saving} onClick={() => setDeleting(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            disabled={saving}
            onClick={async () => {
              if (!deleting) return;
              try {
                await deleteFinancialEntry(deleting.id);
                setDeleting(null);
              } catch {
                /* Store displays errors. */
              }
            }}
          >
            <ReceiptText className="h-4 w-4" />
            Excluir
          </Button>
        </div>
      </Modal>
    </AdminShell>
  );
}
