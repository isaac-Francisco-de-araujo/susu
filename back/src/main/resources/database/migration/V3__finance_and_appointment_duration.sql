ALTER TABLE appointments ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 30;
CREATE INDEX appointments_starts_at ON appointments(starts_at);
CREATE TABLE financial_entries (
    id UUID PRIMARY KEY,
    type VARCHAR(10) NOT NULL CHECK (type IN ('Entrada', 'Despesa')),
    description VARCHAR(500) NOT NULL,
    entry_date DATE NOT NULL,
    payment VARCHAR(30) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0)
);
CREATE INDEX financial_entries_date ON financial_entries(entry_date);
