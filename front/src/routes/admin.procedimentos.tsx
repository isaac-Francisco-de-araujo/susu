import { createFileRoute } from "@tanstack/react-router";
import { Clock3, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { Badge, Button, Card, Field, Modal, SelectField, TextareaField } from "@/components/ui-kit";
import { type Service, money } from "@/lib/mock-data";
import { deleteService, refreshServices, saveService, useServicesState } from "@/lib/services-store";
import nailGallery from "@/assets/nail-gallery.jpg";
import { PhotoField } from "@/components/photo-field";
import { mediaUrl } from "@/lib/api";

export const Route = createFileRoute("/admin/procedimentos")({
  head: () => ({
    meta: [
      { title: "Procedimentos | Studio Bella" },
      { name: "description", content: "Gestão dos serviços, preços e durações." },
      { property: "og:title", content: "Procedimentos | Studio Bella" },
      { property: "og:description", content: "Catálogo de procedimentos do Studio Bella." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { items, loading, saving, error } = useServicesState();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const open = (s?: Service) => {
    setEditing(s ?? null);
    setImage(s?.image ?? "");
    setModal(true);
  };
  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
      name: String(f.get("name")),
      price: Number(f.get("price")),
      duration: String(f.get("duration") ?? ""),
      description: String(f.get("description")),
      image,
      active: f.get("active") === "Ativo",
      short: editing?.short ?? "Cuidado personalizado",
      icon: editing?.icon ?? "Sparkles",
    };
    try {
      await saveService(data, editing?.id);
      setModal(false);
    } catch {
      // The shared store exposes the API error; keep the form open for retry.
    }
  };
  const remove = async (id: string) => {
    try { await deleteService(id); } catch { /* Error displayed below. */ }
  };
  const toggle = async (item: Service) => {
    const { id, ...input } = item;
    try { await saveService({ ...input, active: !item.active }, id); } catch { /* Error displayed below. */ }
  };
  return (
    <AdminShell
      title="Procedimentos"
      subtitle="Procedimentos ativos aparecem automaticamente no site"
      action={
        <Button size="sm" aria-label="Adicionar novo procedimento" disabled={saving || loading} onClick={() => open()}>
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Adicionar novo procedimento</span>
        </Button>
      }
    >
      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-destructive p-4 text-sm">
          <p>{error}</p>
          <Button variant="secondary" disabled={saving || loading} onClick={() => void refreshServices()}>
            Tentar novamente
          </Button>
        </div>
      )}
      {loading && <p role="status" className="mb-4">Carregando procedimentos...</p>}
      {!loading && !error && !items.length && (
        <p className="mb-4 text-muted-foreground">Nenhum procedimento cadastrado. Adicione o primeiro.</p>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((s) => (
          <Card key={s.id} className={`overflow-hidden ${s.active ? "" : "opacity-60"}`}>
            <div className="relative aspect-[16/9] bg-muted">
              <img src={mediaUrl(s.image) || nailGallery} alt={s.name} className="h-full w-full object-cover" />
              <div className="absolute left-3 top-3">
                <Badge tone={s.active ? "success" : "danger"}>
                  {s.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display text-xl font-semibold">{s.name}</h2>
                <div className="flex">
                  <Button disabled={saving} variant="ghost" size="icon" aria-label="Editar" onClick={() => open(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Excluir"
                    disabled={saving}
                    onClick={() => void remove(s.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
                {s.description}
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                <strong className="text-lg text-primary">{money(s.price)}</strong>
                <div className="flex items-center gap-3">
                  {s.duration && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock3 className="h-4 w-4" />
                      {s.duration}
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={saving}
                    onClick={() => void toggle(s)}
                  >
                    {s.active ? "Desativar" : "Ativar"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Modal
        open={modal}
        title={editing ? "Editar procedimento" : "Adicionar novo procedimento"}
        onClose={() => { if (!saving && !uploading) setModal(false); }}
      >
        <form key={editing?.id ?? "new"} onSubmit={save} className="grid gap-4 sm:grid-cols-2">
          {error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{error}</p>}
          <Field required maxLength={150} name="name" label="Nome" defaultValue={editing?.name} />
          <Field
            required
            name="price"
            label="Preço (R$)"
            type="number"
            step="0.01"
            min="0"
            max="9999999999.99"
            defaultValue={editing?.price}
          />
          <Field
            required
            maxLength={50}
            name="duration"
            label="Duração"
            defaultValue={editing?.duration}
            placeholder="Ex.: 40 min"
          />
          <SelectField
            name="active"
            label="Status"
            defaultValue={editing && !editing.active ? "Inativo" : "Ativo"}
          >
            <option>Ativo</option>
            <option>Inativo</option>
          </SelectField>
          <div className="sm:col-span-2">
            <PhotoField key={editing?.id ?? "new"} value={image} onChange={setImage} onBusyChange={setUploading} disabled={saving} />
          </div>
          <div className="sm:col-span-2">
            <TextareaField
              required
              maxLength={5000}
              name="description"
              label="Descrição"
              defaultValue={editing?.description}
            />
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <Button disabled={saving || uploading} type="button" variant="secondary" onClick={() => setModal(false)}>
              Cancelar
            </Button>
            <Button disabled={saving || uploading} type="submit">{saving ? "Salvando..." : "Salvar procedimento"}</Button>
          </div>
        </form>
      </Modal>
    </AdminShell>
  );
}
