import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { mediaUrl } from "@/lib/api";
import { galleryStore } from "@/lib/studio-store";
import type { GalleryPhoto } from "@/lib/mock-data";
import { Button, Modal } from "./ui-kit";
import { RemoteStatus } from "./remote-status";

export function GalleryGrid({
  limit,
  initialItems,
}: {
  limit?: number;
  initialItems?: GalleryPhoto[] | undefined;
}) {
  const { data, loading, error } = galleryStore.use(initialItems);
  const [selected, setSelected] = useState<GalleryPhoto | null>(null);
  const photos = data.filter((photo) => photo.active).slice(0, limit);
  return (
    <>
      <RemoteStatus loading={loading} error={error} retry={galleryStore.refresh} />
      {!loading && !error && !photos.length && (
        <p className="text-sm text-muted-foreground">Novos trabalhos serão publicados em breve.</p>
      )}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <button
            key={photo.id}
            aria-label={`Ver ${photo.title}`}
            onClick={() => setSelected(photo)}
            className="group relative aspect-square overflow-hidden rounded-xl"
          >
            <img
              src={mediaUrl(photo.image)}
              alt={photo.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <span className="absolute bottom-3 right-3 rounded-full bg-background/85 p-2">
              <Maximize2 className="h-4 w-4" />
            </span>
          </button>
        ))}
      </div>
      <Modal
        open={!!selected}
        title={selected?.title ?? "Detalhes do trabalho"}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <img
              src={mediaUrl(selected.image)}
              alt={selected.title}
              className="max-h-[65vh] w-full rounded-xl object-contain"
            />
            <Button className="mt-4 w-full" onClick={() => setSelected(null)}>
              Fechar
            </Button>
          </>
        )}
      </Modal>
    </>
  );
}
