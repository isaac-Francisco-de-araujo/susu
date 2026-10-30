import { useEffect, useMemo, useSyncExternalStore } from "react";
import { api } from "./api.ts";

export function createRemoteStore<T>(path: string, defaults: T) {
  const initial = {
    data: defaults,
    ready: false,
    loading: true,
    saving: false,
    error: null as string | null,
  };
  let state = initial;
  let loaded = false;
  let pending: Promise<void> | null = null;
  const listeners = new Set<() => void>();
  const emit = (update: Partial<typeof state>) => {
    state = { ...state, ...update };
    listeners.forEach((listener) => listener());
  };
  const refresh = () => {
    if (pending) return pending;
    emit({ loading: true });
    pending = api<T>(path)
      .then((data) => {
        loaded = true;
        emit({ data, ready: true, error: null });
      })
      .catch((error: Error) => emit({ error: error.message }))
      .finally(() => {
        pending = null;
        emit({ loading: false });
      });
    return pending;
  };
  const focus = () => {
    if (!state.saving) void refresh();
  };
  const subscribe = (listener: () => void) => {
    if (!listeners.size) window.addEventListener("focus", focus);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
      if (!listeners.size) window.removeEventListener("focus", focus);
    };
  };
  return {
    get: () => state.data,
    refresh,
    async mutate<R>(operation: () => Promise<R>, reconcile: (current: T, saved: R) => T) {
      if (state.saving) throw new Error("Aguarde a operação atual terminar.");
      emit({ saving: true, error: null });
      try {
        if (pending) await pending;
        const saved = await operation();
        loaded = true;
        emit({ data: reconcile(state.data, saved), ready: true });
        await refresh();
      } catch (error) {
        emit({ error: error instanceof Error ? error.message : "Erro ao salvar." });
        throw error;
      } finally {
        emit({ saving: false });
      }
    },
    use(initialData?: T) {
      const seed = useMemo(
        () =>
          initialData === undefined
            ? initial
            : { ...initial, data: initialData, ready: true, loading: false },
        [initialData],
      );
      const snapshot = useSyncExternalStore(
        subscribe,
        () => state,
        () => seed,
      );
      useEffect(() => {
        if (!loaded) void refresh();
      }, []);
      return initialData !== undefined && !snapshot.ready
        ? { ...snapshot, data: initialData, loading: false }
        : snapshot;
    },
  };
}
