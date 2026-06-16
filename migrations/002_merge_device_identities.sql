-- Keep one row per playlist login on the same physical device.
-- Only sync block status across rows that share a device identity.
UPDATE devices AS target
SET is_blocked = grouped.any_blocked
FROM (
    SELECT
        COALESCE(device_key, mac_address, app_installation_id, id::text) AS identity_key,
        bool_or(is_blocked) AS any_blocked
    FROM devices
    GROUP BY 1
) AS grouped
WHERE COALESCE(
    target.device_key,
    target.mac_address,
    target.app_installation_id,
    target.id::text
) = grouped.identity_key;
