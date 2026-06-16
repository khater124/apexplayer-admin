CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS schema_migrations (
    id TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS provider_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    store_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMPTZ NULL,
    notes TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS provider_code_hosts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_code_id UUID NOT NULL REFERENCES provider_codes(id) ON DELETE CASCADE,
    host_url TEXT NOT NULL,
    priority INTEGER NOT NULL DEFAULT 100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(provider_code_id, host_url)
);

CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_code_id UUID NULL REFERENCES provider_codes(id) ON DELETE SET NULL,
    provider_code TEXT NOT NULL,
    username TEXT NOT NULL,
    password_encrypted TEXT NULL,
    resolved_host_used TEXT NULL,
    device_key TEXT NULL,
    mac_address TEXT NULL,
    app_installation_id TEXT NULL,
    app_version TEXT NULL,
    ip_address INET NULL,
    is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
    last_seen_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_provider_codes_code ON provider_codes(code);
CREATE INDEX IF NOT EXISTS idx_provider_codes_status ON provider_codes(is_active, is_blocked, expires_at);

CREATE INDEX IF NOT EXISTS idx_provider_code_hosts_code_priority
ON provider_code_hosts(provider_code_id, is_active, priority);

CREATE INDEX IF NOT EXISTS idx_devices_provider_code ON devices(provider_code);
CREATE INDEX IF NOT EXISTS idx_devices_provider_code_id ON devices(provider_code_id);
CREATE INDEX IF NOT EXISTS idx_devices_device_key ON devices(device_key);
CREATE INDEX IF NOT EXISTS idx_devices_mac_address ON devices(mac_address);
CREATE INDEX IF NOT EXISTS idx_devices_app_installation_id ON devices(app_installation_id);
CREATE INDEX IF NOT EXISTS idx_devices_username ON devices(username);
CREATE INDEX IF NOT EXISTS idx_devices_last_seen ON devices(last_seen_at DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS provider_codes_set_updated_at ON provider_codes;
CREATE TRIGGER provider_codes_set_updated_at
BEFORE UPDATE ON provider_codes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS provider_code_hosts_set_updated_at ON provider_code_hosts;
CREATE TRIGGER provider_code_hosts_set_updated_at
BEFORE UPDATE ON provider_code_hosts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS devices_set_updated_at ON devices;
CREATE TRIGGER devices_set_updated_at
BEFORE UPDATE ON devices
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS admin_users_set_updated_at ON admin_users;
CREATE TRIGGER admin_users_set_updated_at
BEFORE UPDATE ON admin_users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
