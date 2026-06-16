WITH ranked AS (
    SELECT
        id,
        COALESCE(device_key, mac_address, app_installation_id, id::text) AS identity_key,
        first_value(id) OVER (
            PARTITION BY COALESCE(device_key, mac_address, app_installation_id, id::text)
            ORDER BY is_blocked DESC, last_seen_at DESC NULLS LAST, created_at DESC
        ) AS keep_id,
        bool_or(is_blocked) OVER (
            PARTITION BY COALESCE(device_key, mac_address, app_installation_id, id::text)
        ) AS any_blocked
    FROM devices
),
merged_flags AS (
    UPDATE devices
    SET is_blocked = ranked.any_blocked
    FROM ranked
    WHERE devices.id = ranked.keep_id
    RETURNING devices.id
)
DELETE FROM devices
USING ranked
WHERE devices.id = ranked.id
  AND ranked.id <> ranked.keep_id;
