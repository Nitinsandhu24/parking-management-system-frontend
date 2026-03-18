-- Master schema: shared tables for tenant management and super-admin users

CREATE SCHEMA IF NOT EXISTS master;
SET search_path TO master;

CREATE TABLE IF NOT EXISTS tenants (
    id           VARCHAR(100) PRIMARY KEY,
    name         VARCHAR(255) NOT NULL UNIQUE,
    schema_name  VARCHAR(100) NOT NULL UNIQUE,
    plan         VARCHAR(50)  NOT NULL DEFAULT 'BASIC',
    active       BOOLEAN      NOT NULL DEFAULT TRUE,
    contact_email VARCHAR(255),
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    tenant_id     VARCHAR(100) NOT NULL REFERENCES tenants(id),
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role    VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role)
);

CREATE INDEX idx_users_email     ON users(email);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);

-- Seed default super-admin tenant
INSERT INTO tenants (id, name, schema_name, plan, contact_email)
VALUES ('master', 'ParkOS Admin', 'master', 'ENTERPRISE', 'admin@parkos.com')
ON CONFLICT DO NOTHING;

-- Seed super admin user (password: Admin@123 — change on first login)
INSERT INTO users (id, first_name, last_name, email, password_hash, tenant_id)
VALUES (
    gen_random_uuid(),
    'Super', 'Admin',
    'admin@parkos.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCjQ5h5jBp2n0AobZhQzj2.',
    'master'
) ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role)
SELECT id, 'ROLE_SUPER_ADMIN' FROM users WHERE email = 'admin@parkos.com'
ON CONFLICT DO NOTHING;
