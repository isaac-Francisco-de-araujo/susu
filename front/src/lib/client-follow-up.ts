import type { SavedAppointment, SavedClient } from "./mock-data";

export function clientsWithoutReturn(
  clients: SavedClient[],
  appointments: SavedAppointment[],
  days = 30,
  now = new Date(),
) {
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const booked = new Set(
    appointments
      .filter(
        (item) =>
          ["Pendente", "Confirmado"].includes(item.status) && new Date(item.startsAt) >= now,
      )
      .map((item) => item.clientId),
  );
  return clients
    .flatMap((client) => {
      if (!client.lastVisit || booked.has(client.id)) return [];
      const [year, month, day] = client.lastVisit.slice(0, 10).split("-").map(Number);
      const inactiveDays = Math.floor((today - Date.UTC(year!, month! - 1, day!)) / 86400000);
      return inactiveDays >= days ? [{ ...client, inactiveDays }] : [];
    })
    .sort((a, b) => b.inactiveDays - a.inactiveDays);
}
