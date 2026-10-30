import { test } from "node:test";
import assert from "node:assert/strict";
import { inRange, localDate, periodRange, procedureStats, total } from "./analytics.ts";
import type { FinancialEntry, SavedAppointment } from "./mock-data";

test("periods handle leap years, Sunday and year boundaries", () => {
  assert.deepEqual(periodRange("Mês", new Date(2024, 1, 29)), {
    from: "2024-02-01",
    to: "2024-02-29",
  });
  assert.deepEqual(periodRange("Semana", new Date(2027, 0, 3)), {
    from: "2026-12-28",
    to: "2027-01-03",
  });
  assert.deepEqual(periodRange("Ano", new Date(2026, 9, 22)), {
    from: "2026-01-01",
    to: "2026-12-31",
  });
  assert.equal(localDate(new Date(2026, 0, 1, 0, 1)), "2026-01-01");
  const range = periodRange("Personalizado", new Date(), "2026-10-01", "2026-10-02");
  assert.equal(inRange("2026-10-02T23:59:00", range), true);
  assert.equal(inRange("2026-10-03", range), false);
  assert.equal(inRange("2026-10-01", { from: "2026-10-02", to: "2026-10-01" }), false);
});

test("financial totals separate expenses and sum in cents", () => {
  const entries = [
    { type: "Entrada", amount: 0.1 },
    { type: "Entrada", amount: 0.2 },
    { type: "Despesa", amount: 10 },
  ] as FinancialEntry[];
  assert.equal(total(entries, "Entrada"), 0.3);
  assert.equal(total(entries, "Despesa"), 10);
  assert.equal(total([], "Entrada"), 0);
});

test("procedure reports use completed appointments and stable procedure IDs", () => {
  const appointments = [
    { serviceId: "one", serviceName: "Nome antigo", price: 20.1, status: "Atendido" },
    { serviceId: "one", serviceName: "Nome novo", price: 30.2, status: "Atendido" },
    { serviceId: "one", serviceName: "Nome novo", price: 500, status: "Cancelado" },
    { serviceId: "two", serviceName: "Outro", price: 80, status: "Confirmado" },
  ] as SavedAppointment[];
  const stats = procedureStats(appointments);
  assert.equal(stats.length, 1);
  assert.equal(stats[0]?.count, 2);
  assert.equal(stats[0]?.revenue, 50.3);
});
