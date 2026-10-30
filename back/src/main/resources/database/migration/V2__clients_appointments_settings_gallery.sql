CREATE TABLE clients (
    id UUID PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(25) NOT NULL,
    birthday DATE,
    first_visit DATE,
    notes VARCHAR(5000) NOT NULL
);
CREATE TABLE appointments (
    id UUID PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    service_id UUID NOT NULL,
    service_name VARCHAR(150) NOT NULL,
    starts_at TIMESTAMP NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    status VARCHAR(30) NOT NULL,
    payment VARCHAR(30) NOT NULL,
    notes VARCHAR(5000) NOT NULL
);
CREATE INDEX appointments_client_date ON appointments(client_id, starts_at);
CREATE TABLE studio_settings (
    id INTEGER PRIMARY KEY,
    studio_name VARCHAR(150) NOT NULL,
    professional_name VARCHAR(150) NOT NULL,
    whatsapp VARCHAR(25) NOT NULL,
    instagram VARCHAR(100) NOT NULL,
    address VARCHAR(1000) NOT NULL,
    first_weekday INTEGER NOT NULL,
    slot_minutes INTEGER NOT NULL,
    opens_at TIME NOT NULL,
    closes_at TIME NOT NULL,
    reminders_enabled BOOLEAN NOT NULL
);
INSERT INTO studio_settings VALUES (1, 'Studio Bella', 'Bella', '5511999999999', 'studiobella', 'Rua das Flores, 120 — Centro', 1, 30, '09:00:00', '19:00:00', TRUE);
CREATE TABLE gallery_photos (
    id UUID PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    image VARCHAR(2048) NOT NULL,
    active BOOLEAN NOT NULL,
    display_order INTEGER NOT NULL
);
