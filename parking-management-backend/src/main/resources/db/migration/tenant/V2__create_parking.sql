-- Tenant schema: run once per tenant during provisioning

CREATE TABLE IF NOT EXISTS parking_lots (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(255) NOT NULL,
    address    TEXT         NOT NULL,
    city       VARCHAR(100),
    state      VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS parking_floors (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    lot_id       UUID         NOT NULL REFERENCES parking_lots(id) ON DELETE CASCADE,
    label        VARCHAR(100) NOT NULL,
    floor_number INTEGER
);

CREATE TABLE IF NOT EXISTS parking_slots (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    floor_id    UUID        NOT NULL REFERENCES parking_floors(id) ON DELETE CASCADE,
    slot_number VARCHAR(20) NOT NULL,
    type        VARCHAR(30) NOT NULL DEFAULT 'STANDARD',
    status      VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    updated_at  TIMESTAMP   NOT NULL DEFAULT NOW(),
    UNIQUE (floor_id, slot_number)
);

CREATE INDEX idx_slots_floor_id ON parking_slots(floor_id);
CREATE INDEX idx_slots_status   ON parking_slots(status);
