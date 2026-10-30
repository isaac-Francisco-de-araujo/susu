import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, MessageCircle, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { Button, Card, Field, Modal, TextareaField } from "@/components/ui-kit";
import { RemoteStatus } from "@/components/remote-status";
import { type SavedClient, type SavedAppointment, money } from "@/lib/mock-data";
import { appointmentsStore, clientsStore, deleteClient, saveClient } from "@/lib/studio-store";
import { api } from "@/lib/api";
import { whatsappLink } from "@/lib/config";
import { clientsWithoutReturn } from "@/lib/client-follow-up";

export const Route = createFileRoute("/admin/clientes")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { novo?: boolean | undefined; retorno?: boolean | undefined } => ({
    novo: search["novo"] === true || search["novo"] === "true" ? true : undefined,
    retorno: search["retorno"] === true || search["retorno"] === "true" ? true : undefined,
  }),
  component: Page,
});
const dateLabel = (date: string | null) =>
  date ? new Date(date.length === 10 ? `${date}T12:00:00` : date).toLocaleDateString("pt-BR") : "—";
function Page() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: items, loading, saving, error } = clientsStore.use();
  const appointmentState = appointmentsStore.use();
  const { data: appointments } = appointmentState;
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<SavedClient | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedAppointment[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [retryHistory, setRetryHistory] = useState(0);
  const selected = items.find((client) => client.id === selectedId);
  useEffect(() => {
    if (!search.novo || loading) return;
    setEditing(null);
    setModal(true);
    void navigate({ search: { retorno: search.retorno }, replace: true });
  }, [search.novo, search.retorno, loading, navigate]);
  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();
    setHistory([]);
    setHistoryLoading(true);
    setHistoryError("");
    void api<SavedAppointment[]>(`/clients/${selectedId}/history`, { signal: controller.signal })
      .then(setHistory)
      .catch((failure: Error) => {
        if (!controller.signal.aborted) setHistoryError(failure.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setHistoryLoading(false);
      });
    return () => controller.abort();
  }, [selectedId, appointments, retryHistory]);
  const inactive = clientsWithoutReturn(items, appointments);
  const inactiveIds = new Set(inactive.map((client) => client.id));
  const filtered = items.filter(
    (client) =>
      (!search.retorno || inactiveIds.has(client.id)) &&
      (client.name.toLowerCase().includes(query.toLowerCase()) || client.phone.includes(query)),
  );
  const open = (client?: SavedClient) => {
    setEditing(client ?? null);
    setModal(true);
  };
  return (
    <AdminShell
      title="Clientes"
      subtitle={`${items.length} clientes cadastradas`}
      action={
        <Button size="sm" disabled={loading || saving} onClick={() => open()}>
          <Plus className="h-4 w-4" />
          Nova cliente
        </Button>
      }
    >
      <RemoteStatus loading={loading} error={error} retry={clientsStore.refresh} />
      <RemoteStatus
        loading={appointmentState.loading}
        error={appointmentState.error}
        retry={appointmentsStore.refresh}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={!search.retorno ? "primary" : "secondary"}
          onClick={() => void navigate({ search: {} })}
        >
          Todas as clientes
        </Button>
        <Button
          size="sm"
          disabled={loading || appointmentState.loading || !!error || !!appointmentState.error}
          variant={search.retorno ? "primary" : "secondary"}
          onClick={() => void navigate({ search: { retorno: true } })}
        >
          Sem retorno há 30+ dias ({inactive.length})
        </Button>
      </div>
      {search.retorno && (
        <p className="mb-4 text-sm text-muted-foreground">
          Clientes com atendimento concluído há pelo menos 30 dias e sem horário futuro pendente ou
          confirmado.
        </p>
      )}
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <input
          aria-label="Buscar cliente"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar por nome ou telefone"
          className="h-11 w-full rounded-lg border border-input bg-card pl-10 pr-3"
        />
      </div>
      {!loading && !error && !filtered.length && (
        <p>Nenhuma cliente encontrada para este filtro.</p>
      )}
      <div className="grid gap-4">
        {filtered.map((client) => (
          <Card
            key={client.id}
            className="grid gap-4 p-5 lg:grid-cols-[1fr_1fr_auto] lg:items-center"
          >
            <div>
              <h2 className="font-semibold">{client.name}</h2>
              <p className="text-sm text-muted-foreground">{client.phone}</p>
              {!appointmentState.loading &&
                !appointmentState.error &&
                inactiveIds.has(client.id) && (
                  <p className="mt-1 text-xs font-bold text-primary">
                    {inactive.find((item) => item.id === client.id)?.inactiveDays} dias sem retornar
                  </p>
                )}
            </div>
            <div className="text-sm">
              <p>
                Último procedimento:{" "}
                <strong>{client.lastProcedure ?? "Nenhum atendimento realizado"}</strong>
              </p>
              <p className="text-muted-foreground">
                {dateLabel(client.lastVisit)} · {client.visits} atendimentos · {money(client.spent)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <a
                href={whatsappLink(
                  `Olá, ${client.name.split(" ")[0]}! Que tal reservar um momento para cuidar das unhas? Vamos combinar seu próximo horário? 💕`,
                  client.phone,
                )}
                target="_blank"
                rel="noreferrer"
                aria-label={`Chamar ${client.name} no WhatsApp`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-primary hover:bg-accent"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedId(client.id)}
                aria-label={`Histórico de ${client.name}`}
              >
                <Eye className="h-4 w-4" />
                Histórico
              </Button>
              <Button
                disabled={saving}
                variant="ghost"
                size="icon"
                onClick={() => open(client)}
                aria-label={`Editar ${client.name}`}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                disabled={saving}
                variant="ghost"
                size="icon"
                aria-label={`Excluir ${client.name}`}
                onClick={async () => {
                  try {
                    await deleteClient(client.id);
                  } catch {
                    /* Store displays the error. */
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal
        open={modal}
        title={editing ? "Editar cliente" : "Cadastrar cliente"}
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
              await saveClient(
                {
                  name: String(form.get("name")),
                  phone: String(form.get("phone")),
                  birthday: String(form.get("birthday") || "") || null,
                  firstVisit: String(form.get("firstVisit") || "") || null,
                  notes: String(form.get("notes")),
                },
                editing?.id,
              );
              setModal(false);
            } catch {
              /* Preserve the form on failure. */
            }
          }}
        >
          <p className="text-sm leading-6 text-muted-foreground sm:col-span-2">
            Nome e telefone são usados para atendimento e confirmação; histórico e valores apoiam a prestação do serviço e os registros financeiros. Nascimento é opcional: preencha apenas com finalidade informada à cliente. Não registre documentos ou informações de saúde nas observações. Consulte a <Link to="/privacidade" target="_blank" className="text-primary underline">Política de Privacidade</Link> e registre somente o necessário.
          </p>
          {error && (
            <p role="alert" className="text-sm text-destructive sm:col-span-2">
              {error}
            </p>
          )}
          <Field
            required
            maxLength={150}
            name="name"
            label="Nome completo"
            defaultValue={editing?.name}
          />
          <Field
            required
            maxLength={25}
            name="phone"
            type="tel"
            autoComplete="tel"
            label="Telefone com DDI e DDD"
            placeholder="5511999999999"
            defaultValue={editing?.phone}
          />
          <Field
            name="birthday"
            label="Data de nascimento (opcional)"
            type="date"
            defaultValue={editing?.birthday ?? ""}
          />
          <Field
            name="firstVisit"
            label="Primeiro atendimento"
            type="date"
            defaultValue={editing?.firstVisit ?? ""}
          />
          <div className="sm:col-span-2">
            <TextareaField
              maxLength={5000}
              name="notes"
              label="Observações"
              defaultValue={editing?.notes}
            />
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button
              disabled={saving}
              type="button"
              variant="secondary"
              onClick={() => setModal(false)}
            >
              Cancelar
            </Button>
            <Button disabled={saving} type="submit">
              {saving ? "Salvando..." : "Salvar cliente"}
            </Button>
          </div>
        </form>
      </Modal>
      <Modal
        open={!!selected}
        title={selected?.name ?? "Histórico da cliente"}
        onClose={() => setSelectedId(null)}
      >
        {selected && (
          <div>
            <p className="text-sm text-muted-foreground">
              {selected.phone} · Nascimento: {dateLabel(selected.birthday)}
            </p>
            {selected.notes && <p className="mt-3 whitespace-pre-wrap text-sm">{selected.notes}</p>}
            <div className="mt-5 rounded-lg bg-muted p-4">
              <p>
                Último procedimento: <strong>{selected.lastProcedure ?? "Nenhum"}</strong>
              </p>
              <p className="text-sm">
                {dateLabel(selected.lastVisit)} · {selected.visits} atendimentos · Total{" "}
                {money(selected.spent)}
              </p>
            </div>
            <h3 className="mt-6 font-display text-xl font-semibold">
              Histórico de procedimentos realizados
            </h3>
            {historyLoading && <p role="status">Carregando histórico...</p>}
            {historyError && (
              <div role="alert">
                <p>{historyError}</p>
                <Button onClick={() => setRetryHistory((value) => value + 1)}>
                  Tentar novamente
                </Button>
              </div>
            )}
            {!historyLoading && !historyError && !history.length && (
              <p className="mt-3 text-sm text-muted-foreground">
                Nenhum procedimento realizado. Marque um agendamento como Atendido para registrá-lo
                aqui.
              </p>
            )}
            {history.map((item) => (
              <div key={item.id} className="flex justify-between gap-4 border-b border-border py-3">
                <div>
                  <p className="font-semibold">{item.serviceName}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.startsAt).toLocaleString("pt-BR")} · Atendido · {item.payment}
                  </p>
                  {item.notes && <p className="mt-1 whitespace-pre-wrap text-sm">{item.notes}</p>}
                </div>
                <strong className="text-sm">{money(item.price)}</strong>
              </div>
            ))}
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/admin/agenda" className="font-bold text-primary">
                Registrar atendimento na agenda →
              </Link>
              <a
                href={whatsappLink(
                  `Olá, ${selected.name.split(" ")[0]}! Tudo bem? 💕`,
                  selected.phone,
                )}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm font-bold text-primary"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp da cliente
              </a>
            </div>
          </div>
        )}
      </Modal>
    </AdminShell>
  );
}
