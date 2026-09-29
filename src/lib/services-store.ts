import { useSyncExternalStore } from "react";
import { services as seed, type Service } from "./mock-data";

// Fonte única de procedimentos (Home, /servicos e painel).
// integrar com o back aq
const KEY = "studio-services";
let state: Service[] = seed;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { const raw = localStorage.getItem(KEY); if (raw) state = JSON.parse(raw); } catch { /* ignora */ }
}
function emit() {
  // integrar com o back aq
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignora */ }
  listeners.forEach((l) => l());
}
export function setServices(update: (prev: Service[]) => Service[]) { load(); state = update(state); emit(); }
function subscribe(l: () => void) { listeners.add(l); if (!loaded) { load(); l(); } return () => listeners.delete(l); }
export function useServices() { return useSyncExternalStore(subscribe, () => state, () => seed); }
export function useActiveServices() { return useServices().filter((s) => s.active); }
