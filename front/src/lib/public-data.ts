import { createServerFn } from "@tanstack/react-start";
import type { GalleryPhoto, Service } from "./mock-data";

// Per-request data: never seed module-level stores on the SSR server.
export const loadPublicCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const base = (
    process.env["SERVER_API_URL"] || `${process.env["BACKEND_URL"] || "http://127.0.0.1:8080"}/api`
  ).replace(/\/$/, "");
  async function read<T>(path: string): Promise<T | undefined> {
    try {
      const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(5000) });
      return response.ok ? ((await response.json()) as T) : undefined;
    } catch {
      return undefined;
    }
  }
  const [services, gallery] = await Promise.all([
    read<Service[]>("/services?activeOnly=true"),
    read<GalleryPhoto[]>("/gallery"),
  ]);
  return { services, gallery };
});
