import { Clock3, MessageCircle } from "lucide-react";
import { money, type Service } from "@/lib/mock-data";
import { refreshServices, useServicesState } from "@/lib/services-store";
import nailGallery from "@/assets/nail-gallery.jpg";
import { mediaUrl } from "@/lib/api";
import { settingsStore } from "@/lib/studio-store";
import { bookingMessage, whatsappLink } from "@/lib/config";
import { Card } from "./ui-kit";

export function ServiceGrid({
  limit,
  initialItems,
}: {
  limit?: number;
  initialItems?: Service[] | undefined;
}) {
  settingsStore.use();
  const { items, loading, error } = useServicesState(initialItems);
  const services = items.filter((service) => service.active).slice(0, limit);
  if (loading && !items.length) return <p role="status">Carregando procedimentos...</p>;
  if (error)
    return (
      <div role="alert" className="text-sm text-muted-foreground">
        <p>Não foi possível atualizar os procedimentos.</p>
        <button className="mt-2 font-bold text-primary" onClick={() => void refreshServices()}>
          Tentar novamente
        </button>
      </div>
    );
  if (!services.length)
    return (
      <p className="text-sm text-muted-foreground">Nenhum procedimento disponível no momento.</p>
    );
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {services.map((service) => (
        <Card
          key={service.id}
          className="group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-card"
        >
          <div className="aspect-[4/3] overflow-hidden bg-muted">
            <img
              src={mediaUrl(service.image) || nailGallery}
              alt={service.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-xl font-semibold">{service.name}</h3>
              <span className="shrink-0 font-display text-xl font-semibold text-primary">
                {money(service.price)}
              </span>
            </div>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
              {service.description}
            </p>
            {service.duration && (
              <span className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3 className="h-4 w-4" />
                {service.duration}
              </span>
            )}
            <a
              href={whatsappLink(bookingMessage(service.name))}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-bold text-primary-foreground shadow-soft transition hover:opacity-90"
            >
              <MessageCircle className="h-4 w-4" />
              Agendar aqui
            </a>
          </div>
        </Card>
      ))}
    </div>
  );
}
