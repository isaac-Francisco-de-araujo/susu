import { api, resetCsrf } from "./api.ts";

export async function logout() {
  await api("/auth/logout", { method: "POST" });
  resetCsrf();
  redirectToLogin();
}

export function redirectToLogin() {
  sessionStorage.removeItem("studio-auth"); // Remove credentials left by older versions.
  window.location.replace("/login"); // Discard all private stores and cached route data.
}
