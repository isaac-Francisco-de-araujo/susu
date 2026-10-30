import type { FinancialEntry } from "./mock-data";

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function financialCsv(items: FinancialEntry[]) {
  // Quote every cell and neutralize spreadsheet formulas in user-entered text.
  const cell = (value: string) =>
    `"${(/^\s*[=+@-]/.test(value) ? "'" + value : value).replaceAll('"', '""')}"`;
  const rows = [
    ["Data", "Tipo", "Descrição", "Pagamento", "Valor (R$)", "Origem"],
    ...items.map((item) => [
      item.date,
      item.type,
      item.description,
      item.payment,
      item.amount.toFixed(2).replace(".", ","),
      item.source === "appointment" ? "Atendimento" : "Manual",
    ]),
  ];
  return "\uFEFF" + rows.map((row) => row.map(cell).join(";")).join("\r\n");
}
