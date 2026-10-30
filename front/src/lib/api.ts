import { redirectToLogin } from "./auth.ts";

export const API_URL = (import.meta.env?.["VITE_API_URL"] || "/api").replace(/\/$/, "");
let csrf: Promise<{ token: string; headerName: string }> | undefined;
export function resetCsrf() { csrf = undefined; }

async function csrfToken() {
  csrf ??= fetch(`${API_URL}/auth/csrf`, { credentials: "include", cache: "no-store", signal: AbortSignal.timeout(20000) })
    .then(async (response) => {
      if (!response.ok) throw new Error("Não foi possível iniciar uma sessão segura.");
      return response.json() as Promise<{ token: string; headerName: string }>;
    }).catch((error) => { resetCsrf(); throw error; });
  return csrf;
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  let response: Response;
  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  try {
    if (!["GET", "HEAD", "OPTIONS"].includes((init?.method ?? "GET").toUpperCase())) {
      const token = await csrfToken();
      headers.set(token.headerName, token.token);
    }
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
      signal: init?.signal ?? AbortSignal.timeout(20000),
    });
  } catch (error) {
    if (init?.signal?.aborted) throw error;
    throw new Error("Não foi possível conectar à API. Verifique se o backend está em execução.");
  }
  if (!response.ok) {
    if (
      response.status === 401 &&
      path !== "/auth/me" &&
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/admin")
    )
      redirectToLogin();
    if (response.status === 403) resetCsrf();
    const problem = await response.json().catch(() => null);
    const fields = problem?.errors as Record<string, string> | undefined;
    const detail = fields ? Object.values(fields).join("; ") : problem?.detail;
    throw new Error(detail || `Não foi possível concluir a operação (HTTP ${response.status}).`);
  }
  return response;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await request(path, init);
  return response.status === 204 ? (undefined as T) : response.json();
}

export async function downloadBackup() {
  return (await request("/backups", { signal: AbortSignal.timeout(120000) })).blob();
}

export function mediaUrl(image: string) {
  return image.startsWith("/api/uploads/") ? `${API_URL}${image.slice(4)}` : image;
}

export async function uploadPhoto(file: File) {
  if (!/\.jpe?g$/i.test(file.name) || (file.type && file.type !== "image/jpeg"))
    throw new Error("Escolha uma foto no formato JPG ou JPEG.");
  if (file.size > 5 * 1024 * 1024) throw new Error("A foto deve ter até 5 MB.");
  const form = new FormData();
  form.append("file", file);
  return (await api<{ url: string }>("/uploads", { method: "POST", body: form })).url;
}
