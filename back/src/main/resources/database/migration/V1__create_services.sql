CREATE TABLE services (
    id UUID PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    short VARCHAR(255) NOT NULL,
    description VARCHAR(5000) NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    duration VARCHAR(50) NOT NULL,
    icon VARCHAR(100) NOT NULL,
    image VARCHAR(2048) NOT NULL,
    active BOOLEAN NOT NULL
);
