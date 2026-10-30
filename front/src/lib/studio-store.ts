import { api } from "./api";
import { createRemoteStore } from "./remote-store";
import type {
  StudioSettings,
  SavedClient,
  ClientInput,
  SavedAppointment,
  AppointmentInput,
  GalleryPhoto,
  GalleryInput,
  FinancialEntry,
  FinancialInput,
} from "./mock-data";

export const settingsStore = createRemoteStore<StudioSettings>("/settings", {
  studioName: "Pink Petal Studio",
  professionalName: "",
  whatsapp: "",
  instagram: "",
  address: "",
  firstWeekday: 1,
  slotMinutes: 30,
  opensAt: "09:00",
  closesAt: "19:00",
  remindersEnabled: true,
});
export const clientsStore = createRemoteStore<SavedClient[]>("/clients", []);
export const appointmentsStore = createRemoteStore<SavedAppointment[]>("/appointments", []);
export const galleryStore = createRemoteStore<GalleryPhoto[]>("/gallery", []);
export const financeStore = createRemoteStore<FinancialEntry[]>("/finance", []);
const upsert = <T extends { id: string }>(items: T[], saved: T) => [
  ...items.filter((item) => item.id !== saved.id),
  saved,
];
export const saveSettings = (input: StudioSettings) =>
  settingsStore.mutate(
    () => api<StudioSettings>("/settings", { method: "PUT", body: JSON.stringify(input) }),
    (_, saved) => saved,
  );
export const saveClient = (input: ClientInput, id?: string) =>
  clientsStore.mutate(
    () =>
      api<SavedClient>(`/clients${id ? `/${id}` : ""}`, {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(input),
      }),
    (items, saved) => upsert(items, saved).sort((a, b) => a.name.localeCompare(b.name)),
  );
export const deleteClient = (id: string) =>
  clientsStore.mutate(
    () => api(`/clients/${id}`, { method: "DELETE" }),
    (items) => items.filter((item) => item.id !== id),
  );
export async function saveAppointment(input: AppointmentInput, id?: string) {
  await appointmentsStore.mutate(
    () =>
      api<SavedAppointment>(`/appointments${id ? `/${id}` : ""}`, {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(input),
      }),
    (items, saved) => upsert(items, saved).sort((a, b) => a.startsAt.localeCompare(b.startsAt)),
  );
  await Promise.all([clientsStore.refresh(), financeStore.refresh()]);
}
export const saveGalleryPhoto = (input: GalleryInput, id?: string) =>
  galleryStore.mutate(
    () =>
      api<GalleryPhoto>(`/gallery${id ? `/${id}` : ""}`, {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(input),
      }),
    (items, saved) => upsert(items, saved).sort((a, b) => a.displayOrder - b.displayOrder),
  );
export const deleteGalleryPhoto = (id: string) =>
  galleryStore.mutate(
    () => api(`/gallery/${id}`, { method: "DELETE" }),
    (items) => items.filter((item) => item.id !== id),
  );
export const saveFinancialEntry = (input: FinancialInput, id?: string) =>
  financeStore.mutate(
    () =>
      api<FinancialEntry>(`/finance${id ? `/${id}` : ""}`, {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(input),
      }),
    upsert,
  );
export const deleteFinancialEntry = (id: string) =>
  financeStore.mutate(
    () => api(`/finance/${id}`, { method: "DELETE" }),
    (items) => items.filter((item) => item.id !== id),
  );
