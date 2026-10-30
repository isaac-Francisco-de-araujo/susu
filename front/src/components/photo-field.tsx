import { useState } from "react";
import { mediaUrl, uploadPhoto } from "@/lib/api";
import { Field } from "./ui-kit";

export function PhotoField({ value, onChange, onBusyChange, disabled = false }: {
  value: string; onChange: (value: string) => void; onBusyChange: (busy: boolean) => void; disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="grid gap-3">
      <Field label="Foto JPG/JPEG (até 5 MB)" type="file" accept=".jpg,.jpeg,image/jpeg"
        disabled={disabled || busy}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          setError(""); setBusy(true); onBusyChange(true);
          try { onChange(await uploadPhoto(file)); }
          catch (failure) { setError(failure instanceof Error ? failure.message : "Erro ao enviar foto."); }
          finally { setBusy(false); onBusyChange(false); }
        }} />
      {busy && <p role="status" className="text-sm">Enviando foto...</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {value && <img src={mediaUrl(value)} alt="Prévia da foto" className="h-36 w-48 rounded-lg object-cover" />}
    </div>
  );
}
