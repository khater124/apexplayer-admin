CREATE INDEX IF NOT EXISTS idx_devices_identity_playlist
ON devices(provider_code_id, username, last_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_devices_app_installation_id
ON devices(app_installation_id)
WHERE app_installation_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_devices_device_key
ON devices(device_key)
WHERE device_key IS NOT NULL;
