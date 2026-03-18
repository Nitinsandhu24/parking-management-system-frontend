-- Bookings and payments

CREATE TABLE IF NOT EXISTS bookings (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id        UUID        NOT NULL REFERENCES parking_slots(id),
    user_id        UUID        NOT NULL,
    vehicle_plate  VARCHAR(20) NOT NULL,
    status         VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    start_time     TIMESTAMP   NOT NULL,
    end_time       TIMESTAMP,
    checked_in_at  TIMESTAMP,
    checked_out_at TIMESTAMP,
    notes          TEXT,
    created_at     TIMESTAMP   NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
    id             UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id     UUID           NOT NULL UNIQUE REFERENCES bookings(id),
    amount         DECIMAL(10, 2) NOT NULL,
    method         VARCHAR(30)    NOT NULL DEFAULT 'CASH',
    status         VARCHAR(30)    NOT NULL DEFAULT 'PENDING',
    transaction_id VARCHAR(255),
    gateway_ref    VARCHAR(255),
    paid_at        TIMESTAMP,
    created_at     TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_slot_id    ON bookings(slot_id);
CREATE INDEX idx_bookings_user_id    ON bookings(user_id);
CREATE INDEX idx_bookings_status     ON bookings(status);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status     ON payments(status);
CREATE INDEX idx_payments_paid_at    ON payments(paid_at);
