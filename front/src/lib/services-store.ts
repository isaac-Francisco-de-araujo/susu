import { useEffect, useMemo, useSyncExternalStore } from "react";
import { type Service, type ServiceInput } from "./mock-data";
import { api } from "./api";

const initial = {
  items: [] as Service[],
  loading: true,
  saving: false,
  error: null as string | null,
};
let state = initial;
let loaded = false;
let pendingLoad: Promise<void> | null = null;
const listeners = new Set<() => void>();

function emit(update: Partial<typeof state>) {
  state = { ...state, ...update };
  listeners.forEach((listener) => listener());
}

async function request<T>(path = "", init?: RequestInit): Promise<T> {
  return api<T>(`/services${path}`, init);
}

export function refreshServices(): Promise<void> {
  if (pendingLoad) return pendingLoad;
  emit({ loading: true, error: null });
  pendingLoad = request<Service[]>()
    .then((items) => {
      loaded = true;
      emit({ items });
    })
    .catch((error: Error) => emit({ error: error.message }))
    .finally(() => {
      pendingLoad = null;
      emit({ loading: false });
    });
  return pendingLoad;
}

async function mutate(operation: () => Promise<void>) {
  if (state.saving) throw new Error("Aguarde a operação atual terminar.");
  emit({ saving: true, error: null });
  try {
    // Finish any older GET before applying the mutation result to the shared store.
    if (pendingLoad) await pendingLoad;
    await operation();
    loaded = true;
  } catch (error) {
    emit({ error: error instanceof Error ? error.message : "Não foi possível salvar." });
    throw error;
  } finally {
    emit({ saving: false });
  }
}

export async function saveService(input: ServiceInput, id?: string) {
  await mutate(async () => {
    const saved = await request<Service>(id ? `/${id}` : "", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(input),
    });
    emit({
      items: [...state.items.filter((item) => item.id !== saved.id), saved].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    });
  });
}

export async function deleteService(id: string) {
  await mutate(async () => {
    await request<void>(`/${id}`, { method: "DELETE" });
    emit({ items: state.items.filter((item) => item.id !== id) });
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useServicesState(initialItems?: Service[]) {
  const seed = useMemo(
    () =>
      initialItems === undefined ? initial : { ...initial, items: initialItems, loading: false },
    [initialItems],
  );
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => seed,
  );
  useEffect(() => {
    if (!loaded) void refreshServices();
    const refresh = () => {
      if (!state.saving) void refreshServices();
    };
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);
  return initialItems !== undefined && !loaded
    ? { ...snapshot, items: initialItems, loading: false }
    : snapshot;
}

export function useServices() {
  return useServicesState().items;
}

export function useActiveServices() {
  return useServices().filter((service) => service.active);
}
