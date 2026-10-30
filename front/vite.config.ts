// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  vite: {
    publicDir: fileURLToPath(new URL("./public", import.meta.url)),
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: process.env["BACKEND_URL"] || "http://127.0.0.1:8080",
          changeOrigin: true,
          configure(proxy) {
            proxy.on("proxyReq", (outgoing, request) => {
              // Same-origin browser calls reach the local API through this proxy,
              // including LAN addresses. Preserve foreign origins for CORS rejection.
              try {
                if (
                  request.headers.origin &&
                  new URL(request.headers.origin).host === request.headers.host
                )
                  outgoing.removeHeader("origin");
              } catch {
                /* An invalid origin must not be trusted. */
              }
            });
          },
        },
      },
    },
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
  },
  tanstackStart: {
    // Use the physical directory even when Windows checks out symlinks as files.
    srcDirectory: "front/src",
    server: { entry: "server" },
  },
});
