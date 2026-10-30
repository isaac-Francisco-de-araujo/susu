import { createFileRoute } from "@tanstack/react-router";
import { Bell, Building2, Clock3, Download, Save } from "lucide-react";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { Button, Card, Field, SelectField, TextareaField } from "@/components/ui-kit";
import { RemoteStatus } from "@/components/remote-status";
import { saveSettings, settingsStore } from "@/lib/studio-store";
import { downloadBackup } from "@/lib/api";
import { downloadBlob } from "@/lib/downloads";
import { localDate } from "@/lib/analytics";

export const Route = createFileRoute("/admin/configuracoes")({ component: Page });
function Page() {
  const { data, ready, loading, saving, error } = settingsStore.use();
  const [success, setSuccess] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [backupError, setBackupError] = useState("");
  const [backupSuccess, setBackupSuccess] = useState(false);
  return (
    <AdminShell title="Configurações" subtitle="Personalize os dados do studio">
      <RemoteStatus loading={loading} error={error} retry={settingsStore.refresh} />
      {success && !error && (
        <p role="status" className="mb-4 text-sm text-primary">
          Configurações salvas com sucesso.
        </p>
      )}
      {ready && (
        <form
          key={JSON.stringify(data)}
          onChange={() => setSuccess(false)}
          onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            setSuccess(false);
            try {
              await saveSettings({
                studioName: String(form.get("studioName")),
                professionalName: String(form.get("professionalName")),
                whatsapp: String(form.get("whatsapp")),
                instagram: String(form.get("instagram")),
                address: String(form.get("address")),
                firstWeekday: Number(form.get("firstWeekday")),
                slotMinutes: Number(form.get("slotMinutes")),
                opensAt: String(form.get("opensAt")),
                closesAt: String(form.get("closesAt")),
                remindersEnabled: form.get("remindersEnabled") === "on",
              });
              setSuccess(true);
            } catch {
              /* Store displays the error and preserves the form. */
            }
          }}
          className="grid max-w-4xl gap-6"
        >
          <fieldset disabled={saving} className="contents">
            <Card className="p-5 sm:p-6">
              <h2 className="mb-5 flex items-center gap-3 font-display text-xl font-semibold">
                <Building2 className="h-5 w-5 text-primary" />
                Dados do studio
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  required
                  maxLength={150}
                  name="studioName"
                  label="Nome do studio"
                  defaultValue={data.studioName}
                />
                <Field
                  required
                  maxLength={150}
                  name="professionalName"
                  label="Nome da profissional"
                  defaultValue={data.professionalName}
                />
                <Field
                  required
                  maxLength={25}
                  name="whatsapp"
                  label="WhatsApp (com DDI e DDD)"
                  placeholder="5511999999999"
                  defaultValue={data.whatsapp}
                />
                <Field
                  maxLength={31}
                  name="instagram"
                  label="Instagram (usuário)"
                  defaultValue={data.instagram}
                />
                <div className="sm:col-span-2">
                  <TextareaField
                    maxLength={1000}
                    name="address"
                    label="Endereço"
                    defaultValue={data.address}
                  />
                </div>
              </div>
            </Card>
            <Card className="p-5 sm:p-6">
              <h2 className="mb-5 flex items-center gap-3 font-display text-xl font-semibold">
                <Clock3 className="h-5 w-5 text-primary" />
                Atendimento
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField
                  name="firstWeekday"
                  label="Primeiro dia da semana"
                  defaultValue={data.firstWeekday}
                >
                  <option value="1">Segunda-feira</option>
                  <option value="0">Domingo</option>
                </SelectField>
                <Field
                  required
                  type="number"
                  min={5}
                  max={180}
                  name="slotMinutes"
                  label="Intervalo entre horários (minutos)"
                  defaultValue={data.slotMinutes}
                />
                <Field
                  required
                  name="opensAt"
                  label="Horário de início"
                  type="time"
                  defaultValue={data.opensAt.slice(0, 5)}
                />
                <Field
                  required
                  name="closesAt"
                  label="Horário de término"
                  type="time"
                  defaultValue={data.closesAt.slice(0, 5)}
                />
              </div>
            </Card>
            <Card className="p-5 sm:p-6">
              <h2 className="mb-5 flex items-center gap-3 font-display text-xl font-semibold">
                <Bell className="h-5 w-5 text-primary" />
                Lembretes
              </h2>
              <label className="flex items-center justify-between gap-4">
                <span>
                  <strong className="block text-sm">Preparar lembretes na agenda</strong>
                  <span className="text-xs text-muted-foreground">
                    Exibir botão de WhatsApp nas 24 horas anteriores ao atendimento. O envio é
                    manual.
                  </span>
                </span>
                <input
                  name="remindersEnabled"
                  aria-label="Preparar lembretes na agenda"
                  type="checkbox"
                  defaultChecked={data.remindersEnabled}
                  className="h-5 w-5 accent-primary"
                />
              </label>
            </Card>
            <Button disabled={saving} type="submit" className="justify-self-end">
              <Save className="h-4 w-4" />
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </fieldset>
        </form>
      )}
      <Card className="mt-6 max-w-4xl p-5 sm:p-6">
        <h2 className="flex items-center gap-3 font-display text-xl font-semibold">
          <Download className="h-5 w-5 text-primary" />
          Backup do banco e das fotos
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Baixe um ZIP com os dados completos do banco local H2 e as fotos enviadas. Guarde uma
          cópia em outro dispositivo. O arquivo também inclui orientações de restauração.
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Na configuração local padrão, o servidor salva uma cópia em data/backups um minuto após
          iniciar e a cada 24 horas enquanto estiver ligado, mantendo as sete últimas. A rotina pode
          ser configurada no backend.
        </p>
        <Button
          className="mt-4"
          variant="secondary"
          disabled={backingUp}
          onClick={async () => {
            setBackingUp(true);
            setBackupError("");
            setBackupSuccess(false);
            try {
              downloadBlob(await downloadBackup(), `studio-backup-${localDate()}.zip`);
              setBackupSuccess(true);
            } catch (failure) {
              setBackupError(
                failure instanceof Error ? failure.message : "Não foi possível gerar o backup.",
              );
            } finally {
              setBackingUp(false);
            }
          }}
        >
          <Download className="h-4 w-4" />
          {backingUp ? "Gerando backup..." : "Baixar backup completo"}
        </Button>
        {backupError && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            {backupError}
          </p>
        )}
        {backupSuccess && (
          <p role="status" className="mt-3 text-sm text-primary">
            Backup gerado. O download foi iniciado.
          </p>
        )}
      </Card>
    </AdminShell>
  );
}
