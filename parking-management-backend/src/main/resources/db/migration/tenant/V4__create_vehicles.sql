-- Vehicles and entry/exit logs

CREATE TABLE IF NOT EXISTS vehicles (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID        NOT NULL,
    plate_number VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type VARCHAR(30) NOT NULL DEFAULT 'CAR',
    make         VARCHAR(100),
    model        VARCHAR(100),
    color        VARCHAR(50),
    created_at   TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicle_logs (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_id      UUID        NOT NULL REFERENCES parking_slots(id),
    plate_number VARCHAR(20) NOT NULL,
    log_type     VARCHAR(10) NOT NULL DEFAULT 'ENTRY',
    booking_id   UUID,
    event_time   TIMESTAMP   NOT NULL DEFAULT NOW(),
    created_at   TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicles_user_id      ON vehicles(user_id);
CREATE INDEX idx_vehicles_plate        ON vehicles(plate_number);
CREATE INDEX idx_vehicle_logs_plate    ON vehicle_logs(plate_number);
CREATE INDEX idx_vehicle_logs_slot     ON vehicle_logs(slot_id);
CREATE INDEX idx_vehicle_logs_time     ON vehicle_logs(event_time DESC);
