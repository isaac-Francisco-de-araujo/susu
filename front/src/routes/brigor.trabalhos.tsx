import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { Button, Card, Field, Modal, SelectField } from "@/components/ui-kit";
import { PhotoField } from "@/components/photo-field";
import { RemoteStatus } from "@/components/remote-status";
import { deleteGalleryPhoto, galleryStore, saveGalleryPhoto } from "@/lib/studio-store";
import { mediaUrl } from "@/lib/api";
import type { GalleryPhoto } from "@/lib/mock-data";

export const Route = createFileRoute("/brigor/trabalhos")({ component: Page });
function Page() {
  const { data: photos, loading, saving, error } = galleryStore.use();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<GalleryPhoto | null>(null);
  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const open = (photo?: GalleryPhoto) => { setEditing(photo ?? null); setImage(photo?.image ?? ""); setModal(true); };
  return <AdminShell title="Meus trabalhos" subtitle="Gerencie as fotos da galeria e da página inicial" action={<Button size="sm" disabled={loading || saving} onClick={() => open()}><Plus className="h-4 w-4" />Adicionar foto</Button>}>
    <RemoteStatus loading={loading} error={error} retry={galleryStore.refresh} />
    {!loading && !error && !photos.length && <p className="text-sm text-muted-foreground">Nenhuma foto cadastrada. Envie a primeira foto JPG/JPEG para aparecer no site.</p>}
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{photos.map((photo) => <Card key={photo.id} className="overflow-hidden">
      <img src={mediaUrl(photo.image)} alt={photo.title} className="aspect-square w-full object-cover" />
      <div className="p-4"><h2 className="font-semibold">{photo.title}</h2><p className="mt-1 text-xs text-muted-foreground">{photo.active ? "Visível no site" : "Oculta"} · Ordem {photo.displayOrder}</p><div className="mt-4 flex gap-2"><Button disabled={saving} size="sm" variant="secondary" onClick={() => open(photo)}><Pencil className="h-4 w-4" />Editar foto</Button><Button disabled={saving} size="sm" variant="danger" aria-label={`Excluir foto ${photo.title}`} onClick={async () => { try { await deleteGalleryPhoto(photo.id); } catch { /* Store displays errors. */ } }}><Trash2 className="h-4 w-4" />Excluir</Button></div></div>
    </Card>)}</div>
    <Modal open={modal} title={editing ? "Editar foto" : "Adicionar foto"} onClose={() => { if (!saving && !uploading) setModal(false); }}>
      <form key={editing?.id ?? "new"} className="grid gap-4" onSubmit={async (event) => {
        event.preventDefault(); const form = new FormData(event.currentTarget);
        try { await saveGalleryPhoto({ title: String(form.get("title")), image, active: form.get("active") === "true", displayOrder: Number(form.get("displayOrder")) }, editing?.id); setModal(false); } catch { /* Preserve the form on failure. */ }
      }}>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <Field required maxLength={150} name="title" label="Título / descrição da foto" defaultValue={editing?.title} />
        <p className="text-sm leading-6 text-muted-foreground">Envie apenas fotos próprias ou licenciadas. Para imagens identificáveis de clientes, obtenha autorização específica antes da publicação. As imagens enviadas têm URL pública, mesmo quando ocultas na galeria; não envie documentos ou conteúdo privado. Descreva o trabalho no título para quem usa leitor de tela.</p>
        <PhotoField value={image} onChange={setImage} onBusyChange={setUploading} disabled={saving} />
        <div className="grid gap-4 sm:grid-cols-2"><Field required type="number" min={0} max={100000} name="displayOrder" label="Ordem de exibição" defaultValue={editing?.displayOrder ?? Math.max(0, ...photos.map((photo) => photo.displayOrder)) + 1} /><SelectField name="active" label="Visibilidade" defaultValue={editing?.active === false ? "false" : "true"}><option value="true">Visível no site</option><option value="false">Oculta</option></SelectField></div>
        <div className="flex justify-end gap-2"><Button disabled={saving || uploading} type="button" variant="secondary" onClick={() => setModal(false)}>Cancelar</Button><Button disabled={saving || uploading || !image} type="submit">{saving ? "Salvando..." : "Salvar foto"}</Button></div>
      </form>
    </Modal>
  </AdminShell>;
}
