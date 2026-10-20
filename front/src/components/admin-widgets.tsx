import { Circle } from "lucide-react";
import { Badge, Card } from "./ui-kit";
import type { AppointmentStatus } from "@/lib/mock-data";
export const statusTone: Record<AppointmentStatus, "success" | "warning" | "info" | "danger"> = {
  Confirmado: "success",
  Pendente: "warning",
  Atendido: "info",
  "Não atendido": "danger",
  Cancelado: "danger",
};
export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <Badge tone={statusTone[status]}>
      <Circle className="h-2 w-2 fill-current" />
      {status}
    </Badge>
  );
}
export function MetricCard({
  label,
  value,
  icon: Icon,
  detail,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  detail?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary">
          <Icon className="h-5 w-5" />
        </span>
        {detail && <span className="text-xs font-semibold text-success">{detail}</span>}
      </div>
      <p className="mt-5 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold">{value}</p>
    </Card>
  );
}
export function MiniBars({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-44 items-end gap-2 sm:gap-3">
      {values.map((v, i) => (
        <div key={labels[i]} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <div
            className="w-full rounded-t-md bg-primary/20 transition hover:bg-primary"
            style={{ height: `${Math.max(12, (v / max) * 130)}px` }}
          />
          <span className="truncate text-[10px] text-muted-foreground">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}
