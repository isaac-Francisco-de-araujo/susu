import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem("studio-auth");
    try {
      await api("/auth/me");
    } catch {
      throw redirect({ to: "/login" });
    }
  },
  component: AdminLayout,
  head: () => ({ meta: [{ name: "robots", content: "noindex, nofollow" }] }),
});

function AdminLayout() {
  return <Outlet />;
}
