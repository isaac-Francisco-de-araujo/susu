import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { StatusBadge } from "@/components/admin-widgets";
import { Button, Field, Modal, SelectField, TextareaField } from "@/components/ui-kit";
import { RemoteStatus } from "@/components/remote-status";
import {
  type SavedAppointment,
  type AppointmentStatus,
  appointmentStatuses,
  money,
} from "@/lib/mock-data";
import {
  appointmentsStore,
  clientsStore,
  saveAppointment,
  settingsStore,
} from "@/lib/studio-store";
import { useServicesState } from "@/lib/services-store";
import { whatsappLink } from "@/lib/config";

export const Route = createFileRoute("/admin/agenda")({
  validateSearch: (search: Record<string, unknown>): { novo?: boolean | undefined } => ({
    novo: search["novo"] === true || search["novo"] === "true" ? true : undefined,
  }),
  component: Page,
});
const localDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
function Page() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: items, loading, saving, error } = appointmentsStore.use();
  const clients = clientsStore.use();
  const services = useServicesState();
  const { data: settings } = settingsStore.use();
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [date, setDate] = useState(() => localDate(new Date()));
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<SavedAppointment | null>(null);
  const [serviceId, setServiceId] = useState("");
  const [price, setPrice] = useState("");
  useEffect(() => {
    if (!search.novo || loading || services.loading || clients.loading) return;
    const selected = services.items.find((service) => service.active);
    if (selected && clients.data.length) {
      setEditing(null);
      setServiceId(selected.id);
      setPrice(String(selected.price));
      setModal(true);
    }
    void navigate({ search: {}, replace: true });
  }, [
    search.novo,
    loading,
    services.loading,
    services.items,
    clients.loading,
    clients.data.length,
    navigate,
  ]);
  const active = services.items.filter((item) => item.active || item.id === editing?.serviceId);
  const open = (item?: SavedAppointment) => {
    setEditing(item ?? null);
    const selected =
      services.items.find((service) => service.id === item?.serviceId) ??
      services.items.find((service) => service.active);
    setServiceId(item?.serviceId ?? selected?.id ?? "");
    setPrice(String(item?.price ?? selected?.price ?? 0));
    setModal(true);
  };
  const changeStatus = async (item: SavedAppointment, status: AppointmentStatus) => {
    try {
      await saveAppointment({ ...item, status }, item.id);
    } catch {
      /* Store displays errors. */
    }
  };
  const first = (month.getDay() - settings.firstWeekday + 7) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const weekdays = Array.from(
    { length: 7 },
    (_, index) =>
      ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][(index + settings.firstWeekday) % 7],
  );
  const dayItems = items.filter((item) => item.startsAt.slice(0, 10) === date);
  const slots: string[] = [];
  const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
  for (
    let time = minutes(settings.opensAt);
    time < minutes(settings.closesAt);
    time += Math.max(5, settings.slotMinutes)
  )
    slots.push(
      `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(time % 60).padStart(2, "0")}`,
    );
  const editTime = editing?.startsAt.slice(11, 16);
  if (editTime && !slots.includes(editTime)) slots.push(editTime);
  return (
    <AdminShell
      title="Agenda"
      subtitle={month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
      action={
        <Button
          size="sm"
          disabled={
            loading ||
            services.loading ||
            clients.loading ||
            saving ||
            !clients.data.length ||
            !services.items.some((item) => item.active)
          }
          onClick={() => open()}
        >
          <Plus className="h-4 w-4" />
          Novo agendamento
        </Button>
      }
    >
      <RemoteStatus loading={loading} error={error} retry={appointmentsStore.refresh} />
      <RemoteStatus loading={clients.loading} error={clients.error} retry={clientsStore.refresh} />
      <RemoteStatus
        loading={services.loading}
        error={services.error}
        retry={async () => {
          const { refreshServices } = await import("@/lib/services-store");
          await refreshServices();
        }}
      />
      {!clients.loading && !clients.data.length && (
        <p className="mb-4 text-sm">
          Cadastre uma cliente em{" "}
          <Link to="/admin/clientes" className="font-bold text-primary">
            Clientes
          </Link>{" "}
          para criar um agendamento.
        </p>
      )}
      {!services.loading && !services.items.some((item) => item.active) && (
        <p className="mb-4 text-sm">
          Cadastre um procedimento ativo em{" "}
          <Link to="/admin/procedimentos" className="font-bold text-primary">
            Procedimentos
          </Link>
          .
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Mês anterior"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
            >
              <ChevronLeft />
            </Button>
            <h2 className="font-display text-xl font-semibold">
              {month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Próximo mês"
              onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {weekdays.map((day) => (
              <span key={day} className="py-2 font-bold">
                {day}
              </span>
            ))}
            {Array.from({ length: first }, (_, index) => (
              <span key={`blank-${index}`} />
            ))}
            {Array.from({ length: days }, (_, index) => {
              const value = localDate(new Date(month.getFullYear(), month.getMonth(), index + 1));
              const count = items.filter(
                (item) => item.startsAt.startsWith(value) && item.status !== "Cancelado",
              ).length;
              return (
                <button
                  key={value}
                  onClick={() => setDate(value)}
                  className={`min-h-16 rounded-lg border p-2 ${date === value ? "border-primary bg-accent" : "border-transparent hover:bg-muted"}`}
                >
                  <span>{index + 1}</span>
                  {count > 0 && (
                    <span className="mt-1 block text-[10px] font-bold text-primary">
                      {count} cliente(s)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
        <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="font-display text-xl font-semibold">
            {new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h2>
          {!dayItems.length && (
            <p className="mt-5 text-sm text-muted-foreground">Nenhum atendimento neste dia.</p>
          )}
          <div className="mt-5 grid gap-3">
            {dayItems.map((item) => {
              const client = clients.data.find((person) => person.id === item.clientId);
              const until = new Date(item.startsAt).getTime() - Date.now();
              const reminder =
                settings.remindersEnabled &&
                until > 0 &&
                until <= 24 * 60 * 60 * 1000 &&
                (item.status === "Pendente" || item.status === "Confirmado");
              return (
                <article key={item.id} className="rounded-xl bg-muted p-4">
                  <div className="flex flex-wrap justify-between gap-2">
                    <div>
                      <p className="font-semibold">
                        {item.startsAt.slice(11, 16)} · {client?.name ?? "Cliente"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.serviceName} · {money(item.price)}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={saving}
                      onClick={() => open(item)}
                    >
                      Editar
                    </Button>
                    <select
                      aria-label={`Status de ${client?.name ?? "cliente"}`}
                      disabled={saving}
                      value={item.status}
                      onChange={(event) =>
                        void changeStatus(item, event.target.value as AppointmentStatus)
                      }
                      className="h-9 rounded-lg border border-input bg-background px-2 text-xs"
                    >
                      {appointmentStatuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                    {reminder && client && (
                      <a
                        className="text-sm font-bold text-primary"
                        href={whatsappLink(
                          `Olá, ${client.name}! Lembrete: seu procedimento ${item.serviceName} está agendado para ${new Date(item.startsAt).toLocaleString("pt-BR")}. 💕`,
                          client.phone,
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Enviar lembrete por WhatsApp
                      </a>
                    )}
                  </div>
                  {item.notes && <p className="mt-2 whitespace-pre-wrap text-sm">{item.notes}</p>}
                </article>
              );
            })}
          </div>
        </section>
      </div>
      <Modal
        open={modal}
        title={editing ? "Editar agendamento" : "Novo agendamento"}
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
            const startsAt = `${String(form.get("date"))}T${String(form.get("time"))}:00`;
            try {
              await saveAppointment(
                {
                  clientId: String(form.get("clientId")),
                  serviceId,
                  startsAt,
                  price: Number(price),
                  status: String(form.get("status")) as AppointmentStatus,
                  payment: String(form.get("payment")),
                  notes: String(form.get("notes")),
                },
                editing?.id,
              );
              setDate(startsAt.slice(0, 10));
              setMonth(new Date(Number(startsAt.slice(0, 4)), Number(startsAt.slice(5, 7)) - 1, 1));
              setModal(false);
            } catch {
              /* Preserve the form on failure. */
            }
          }}
        >
          {error && (
            <p role="alert" className="text-sm text-destructive sm:col-span-2">
              {error}
            </p>
          )}
          <SelectField
            required
            name="clientId"
            label="Cliente"
            defaultValue={editing?.clientId ?? clients.data[0]?.id}
          >
            {clients.data.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} · {client.phone}
              </option>
            ))}
          </SelectField>
          <Field
            required
            type="date"
            name="date"
            label="Data"
            defaultValue={editing?.startsAt.slice(0, 10) ?? date}
          />
          <SelectField required name="time" label="Horário" defaultValue={editTime ?? slots[0]}>
            {slots.map((slot) => (
              <option key={slot}>{slot}</option>
            ))}
          </SelectField>
          <SelectField
            required
            label="Procedimento"
            value={serviceId}
            onChange={(event) => {
              setServiceId(event.target.value);
              setPrice(
                String(
                  services.items.find((service) => service.id === event.target.value)?.price ?? 0,
                ),
              );
            }}
          >
            {editing && !services.items.some((service) => service.id === editing.serviceId) && (
              <option value={editing.serviceId}>
                {editing.serviceName} (removido do catálogo)
              </option>
            )}
            {active.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </SelectField>
          <Field
            required
            label="Valor"
            type="number"
            min="0"
            max="9999999999.99"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
          <SelectField name="status" label="Status" defaultValue={editing?.status ?? "Pendente"}>
            {appointmentStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </SelectField>
          <SelectField name="payment" label="Pagamento" defaultValue={editing?.payment ?? "Pix"}>
            {["Pix", "Dinheiro", "Débito", "Crédito"].map((payment) => (
              <option key={payment}>{payment}</option>
            ))}
          </SelectField>
          <div className="sm:col-span-2">
            <TextareaField
              name="notes"
              label="Observações"
              maxLength={5000}
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
              {saving ? "Salvando..." : "Salvar agendamento"}
            </Button>
          </div>
        </form>
      </Modal>
    </AdminShell>
  );
}
