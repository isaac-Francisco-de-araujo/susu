import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/public-shell";
import { SectionTitle } from "@/components/ui-kit";
import { GalleryGrid } from "@/components/gallery-grid";
import { loadPublicCatalog } from "@/lib/public-data";

export const Route = createFileRoute("/trabalhos")({
  loader: () => loadPublicCatalog(),
  head: () => ({
    meta: [
      { title: "Meus trabalhos" },
      { name: "description", content: "Galeria de trabalhos e inspirações do studio." },
    ],
  }),
  component: Page,
});
function Page() {
  const catalog = Route.useLoaderData();
  return (
    <PublicLayout>
      <section className="bg-rose-soft py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            level={1}
            eyebrow="Portfólio"
            title="Meus trabalhos"
            copy="Clique em uma foto para ver cada detalhe de perto."
          />
        </div>
      </section>
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <GalleryGrid initialItems={catalog.gallery} />
        </div>
      </section>
    </PublicLayout>
  );
}
