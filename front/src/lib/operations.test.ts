import { test } from "node:test";
import assert from "node:assert/strict";
import { clientsWithoutReturn } from "./client-follow-up.ts";
import { financialCsv } from "./downloads.ts";
import type { SavedClient, SavedAppointment, FinancialEntry } from "./mock-data";

test("follow-up uses calendar days and excludes future booked clients and clients without visits", () => {
  const now = new Date(2026, 9, 24, 12);
  const clients = [
    { id: "cutoff", lastVisit: "2026-09-24T18:00:00" },
    { id: "recent", lastVisit: "2026-09-25" },
    { id: "booked", lastVisit: "2026-08-01" },
    { id: "cancelled", lastVisit: "2026-07-01" },
    { id: "new", lastVisit: null },
  ] as SavedClient[];
  const appointments = [
    { clientId: "booked", startsAt: "2026-10-25T09:00:00", status: "Pendente" },
    { clientId: "cancelled", startsAt: "2026-10-25T09:00:00", status: "Cancelado" },
  ] as SavedAppointment[];
  const result = clientsWithoutReturn(clients, appointments, 30, now);
  assert.deepEqual(
    result.map((item) => item.id),
    ["cancelled", "cutoff"],
  );
  assert.equal(result[1]?.inactiveDays, 30);
});

test("CSV preserves accents, quotes and multiline cells, and neutralizes spreadsheet formulas", () => {
  const csv = financialCsv([
    {
      date: "2026-10-24",
      type: "Entrada",
      description: 'Esmaltação; "gel"\nLinha 2',
      payment: "Pix",
      amount: 30.5,
      source: "appointment",
    },
    {
      date: "2026-10-24",
      type: "Despesa",
      description: " =HYPERLINK(A1)",
      payment: "Crédito",
      amount: 5,
      source: "manual",
    },
  ] as FinancialEntry[]);
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes('"Esmaltação; ""gel""\nLinha 2"'));
  assert.ok(csv.includes('"30,50";"Atendimento"'));
  assert.ok(csv.includes('"\' =HYPERLINK(A1)"'));
});
