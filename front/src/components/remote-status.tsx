import { Button } from "./ui-kit";

export function RemoteStatus({ loading, error, retry }: { loading: boolean; error: string | null; retry: () => Promise<void> }) {
  return <>
    {loading && <p role="status" className="mb-4 text-sm">Carregando...</p>}
    {error && <div role="alert" className="mb-4 rounded-lg border border-destructive p-4 text-sm">
      <p>{error}</p><Button variant="secondary" disabled={loading} onClick={() => void retry()}>Tentar novamente</Button>
    </div>}
  </>;
}
