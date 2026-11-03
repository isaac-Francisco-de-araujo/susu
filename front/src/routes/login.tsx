import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button, Card, Field } from "@/components/ui-kit";
import { api, resetCsrf } from "@/lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Entrar | Painel profissional" }, { name: "robots", content: "noindex" }],
  }),
  component: Login,
});

function Login() {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  return (
    <main className="grid min-h-screen place-items-center bg-admin p-5">
      <Card className="w-full max-w-sm p-6">
        <h1 className="font-display text-3xl">Painel profissional</h1>
        <p className="mb-6 mt-2 text-sm text-muted-foreground">Entre para gerenciar seu studio.</p>
        <form
          className="grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setSaving(true);
            setError("");
            const form = new FormData(event.currentTarget);
            try {
              await api("/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ username: String(form.get("username")), password: String(form.get("password")) }),
              });
              resetCsrf();
              sessionStorage.removeItem("studio-auth");
              window.location.assign("/brigor");
            } catch (reason) {
              setError(reason instanceof Error ? reason.message : "Não foi possível entrar.");
            } finally {
              setSaving(false);
            }
          }}
        >
          <Field required name="username" label="Usuário" autoComplete="username" />
          <Field
            required
            name="password"
            label="Senha"
            type="password"
            autoComplete="current-password"
          />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button disabled={saving} type="submit">
            {saving ? "Entrando..." : "Entrar"}
          </Button>
          <a href="/" className="text-center text-sm text-muted-foreground">
            Voltar ao site
          </a>
        </form>
      </Card>
    </main>
  );
}
