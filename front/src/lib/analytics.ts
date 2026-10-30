import type { FinancialEntry, SavedAppointment } from "./mock-data";

export function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function periodRange(period: string, now = new Date(), from = "", to = "") {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  if (period === "Semana") {
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    end.setTime(start.getTime());
    end.setDate(end.getDate() + 6);
  } else if (period === "Mês") {
    start.setDate(1);
    end.setMonth(end.getMonth() + 1, 0);
  } else if (period === "Ano") {
    start.setMonth(0, 1);
    end.setMonth(11, 31);
  } else if (period === "Personalizado") return { from, to };
  return { from: localDate(start), to: localDate(end) };
}

export function inRange(date: string, range: { from: string; to: string }) {
  const day = date.slice(0, 10);
  return Boolean(
    range.from && range.to && range.from <= range.to && day >= range.from && day <= range.to,
  );
}

export function total(entries: FinancialEntry[], type: "Entrada" | "Despesa") {
  return (
    entries
      .filter((item) => item.type === type)
      .reduce((sum, item) => sum + Math.round(item.amount * 100), 0) / 100
  );
}

export function procedureStats(items: SavedAppointment[]) {
  const stats = new Map<string, { id: string; name: string; count: number; revenue: number }>();
  items
    .filter((item) => item.status === "Atendido")
    .forEach((item) => {
      const previous = stats.get(item.serviceId) ?? {
        id: item.serviceId,
        name: item.serviceName,
        count: 0,
        revenue: 0,
      };
      previous.count += 1;
      previous.revenue += Math.round(item.price * 100);
      stats.set(item.serviceId, previous);
    });
  return [...stats.values()]
    .map((item) => ({ ...item, revenue: item.revenue / 100 }))
    .sort((a, b) => b.count - a.count);
}
