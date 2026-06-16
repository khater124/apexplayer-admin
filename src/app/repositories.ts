import bcrypt from 'bcryptjs';
import { ProviderAdminConfig } from './config.js';
import { decryptText, encryptText } from './crypto-utils.js';
import { query } from './database.js';

export interface ProviderCodeRow {
    id: string;
    code: string;
    store_name: string;
    is_active: boolean;
    is_blocked: boolean;
    expires_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    device_count?: number;
}

export interface ProviderHostRow {
    id: string;
    provider_code_id: string;
    host_url: string;
    priority: number;
    is_active: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

export interface DeviceRow {
    id: string;
    provider_code_id: string | null;
    provider_code: string;
    username: string;
    password_encrypted: string | null;
    password?: string;
    resolved_host_used: string | null;
    device_key: string | null;
    mac_address: string | null;
    app_installation_id: string | null;
    app_version: string | null;
    ip_address: string | null;
    is_blocked: boolean;
    last_seen_at: string | null;
    created_at: string;
    updated_at: string;
    store_name?: string | null;
    code_is_blocked?: boolean | null;
    code_is_active?: boolean | null;
    code_expires_at?: string | null;
    playlists?: DevicePlaylistRow[];
}

export interface DevicePlaylistRow {
    provider_code: string;
    store_name: string | null;
    username: string;
    password?: string;
    password_encrypted: string | null;
    resolved_host_used: string | null;
    last_seen_at: string | null;
}

export async function ensureConfiguredAdminUser(
    config: ProviderAdminConfig
): Promise<void> {
    const passwordHash = await bcrypt.hash(config.adminPassword, 12);
    await query(
        `INSERT INTO admin_users (username, password_hash, is_active)
         VALUES ($1, $2, TRUE)
         ON CONFLICT (username) DO UPDATE SET
            password_hash = excluded.password_hash,
            is_active = TRUE`,
        [config.adminUsername, passwordHash],
        config
    );
}

export async function verifyAdminCredentials(
    username: string,
    password: string,
    config: ProviderAdminConfig
): Promise<boolean> {
    const result = await query<{ id: string; password_hash: string }>(
        `SELECT id, password_hash
         FROM admin_users
         WHERE username = $1 AND is_active = TRUE
         LIMIT 1`,
        [username],
        config
    );
    const admin = result.rows[0];
    if (!admin) {
        return false;
    }

    const valid = await bcrypt.compare(password, admin.password_hash);
    if (valid) {
        await query(
            'UPDATE admin_users SET last_login_at = now() WHERE id = $1',
            [admin.id],
            config
        );
    }
    return valid;
}

export async function listProviderCodes(
    config: ProviderAdminConfig
): Promise<ProviderCodeRow[]> {
    const result = await query<ProviderCodeRow>(
        `SELECT
            provider_codes.*,
            COUNT(DISTINCT COALESCE(
                devices.device_key,
                devices.mac_address,
                devices.app_installation_id,
                devices.id::text
            ))::int AS device_count
         FROM provider_codes
         LEFT JOIN devices ON devices.provider_code_id = provider_codes.id
         GROUP BY provider_codes.id
         ORDER BY provider_codes.created_at DESC`,
        [],
        config
    );
    return result.rows;
}

export async function getProviderCodeByCode(
    code: string,
    config: ProviderAdminConfig
): Promise<ProviderCodeRow | null> {
    const result = await query<ProviderCodeRow>(
        `SELECT * FROM provider_codes WHERE code = $1 LIMIT 1`,
        [code],
        config
    );
    return result.rows[0] ?? null;
}

export async function listHostsForCode(
    providerCodeId: string,
    config: ProviderAdminConfig,
    onlyActive = false
): Promise<ProviderHostRow[]> {
    const result = await query<ProviderHostRow>(
        `SELECT *
         FROM provider_code_hosts
         WHERE provider_code_id = $1 ${onlyActive ? 'AND is_active = TRUE' : ''}
         ORDER BY priority ASC, created_at ASC`,
        [providerCodeId],
        config
    );
    return result.rows;
}

export async function findMatchingDevice(
    input: {
        appInstallationId?: string | null;
        deviceKey?: string | null;
        macAddress?: string | null;
        providerCode?: string;
        username?: string;
    },
    config: ProviderAdminConfig
): Promise<DeviceRow | null> {
    const result = await query<DeviceRow>(
        `SELECT *
         FROM devices
         WHERE
            (
                $1::text IS NOT NULL
                AND app_installation_id = $1
            )
            OR (
                $2::text IS NOT NULL
                AND device_key = $2
            )
            OR (
                $3::text IS NOT NULL
                AND mac_address = $3
            )
         ORDER BY is_blocked DESC, updated_at DESC
         LIMIT 1`,
        [
            input.appInstallationId ?? null,
            input.deviceKey ?? null,
            input.macAddress ?? null,
            input.providerCode ?? null,
            input.username ?? null,
        ],
        config
    );
    return result.rows[0] ?? null;
}

export async function upsertDeviceLogin(
    input: {
        appInstallationId?: string | null;
        appVersion?: string | null;
        deviceKey?: string | null;
        macAddress?: string | null;
        password: string;
        providerCode: ProviderCodeRow;
        resolvedHostUsed: string;
        username: string;
        ipAddress?: string | null;
    },
    config: ProviderAdminConfig
): Promise<DeviceRow> {
    const existing = await findMatchingDevice(
        {
            appInstallationId: input.appInstallationId,
            deviceKey: input.deviceKey,
            macAddress: input.macAddress,
            providerCode: input.providerCode.code,
            username: input.username,
        },
        config
    );
    const encryptedPassword = encryptText(
        input.password,
        config.encryptionSecret
    );

    if (existing) {
        const result = await query<DeviceRow>(
            `UPDATE devices SET
                provider_code_id = $1,
                provider_code = $2,
                username = $3,
                password_encrypted = $4,
                resolved_host_used = $5,
                device_key = COALESCE($6, device_key),
                mac_address = COALESCE($7, mac_address),
                app_installation_id = COALESCE($8, app_installation_id),
                app_version = COALESCE($9, app_version),
                ip_address = COALESCE($10::inet, ip_address),
                last_seen_at = now()
             WHERE id = $11
             RETURNING *`,
            [
                input.providerCode.id,
                input.providerCode.code,
                input.username,
                encryptedPassword,
                input.resolvedHostUsed,
                input.deviceKey ?? null,
                input.macAddress ?? null,
                input.appInstallationId ?? null,
                input.appVersion ?? null,
                input.ipAddress ?? null,
                existing.id,
            ],
            config
        );
        return result.rows[0];
    }

    const result = await query<DeviceRow>(
        `INSERT INTO devices (
            provider_code_id,
            provider_code,
            username,
            password_encrypted,
            resolved_host_used,
            device_key,
            mac_address,
            app_installation_id,
            app_version,
            ip_address,
            last_seen_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::inet, now())
         RETURNING *`,
        [
            input.providerCode.id,
            input.providerCode.code,
            input.username,
            encryptedPassword,
            input.resolvedHostUsed,
            input.deviceKey ?? null,
            input.macAddress ?? null,
            input.appInstallationId ?? null,
            input.appVersion ?? null,
            input.ipAddress ?? null,
        ],
        config
    );
    return result.rows[0];
}

export async function listDevices(
    config: ProviderAdminConfig,
    providerCodeId?: string
): Promise<DeviceRow[]> {
    const result = await query<DeviceRow>(
        `SELECT
            ranked.*,
            provider_codes.store_name,
            provider_codes.is_blocked AS code_is_blocked,
            provider_codes.is_active AS code_is_active,
            provider_codes.expires_at AS code_expires_at,
            COALESCE(playlists.items, '[]'::json) AS playlists
         FROM (
            SELECT DISTINCT ON (COALESCE(
                devices.device_key,
                devices.mac_address,
                devices.app_installation_id,
                devices.id::text
            ))
                devices.*,
                COALESCE(
                    devices.device_key,
                    devices.mac_address,
                    devices.app_installation_id,
                    devices.id::text
                ) AS device_identity
            FROM devices
            ${providerCodeId ? 'WHERE devices.provider_code_id = $1' : ''}
            ORDER BY
                COALESCE(
                    devices.device_key,
                    devices.mac_address,
                    devices.app_installation_id,
                    devices.id::text
                ),
                devices.is_blocked DESC,
                devices.last_seen_at DESC NULLS LAST,
                devices.created_at DESC
         ) ranked
         LEFT JOIN provider_codes ON provider_codes.id = ranked.provider_code_id
         LEFT JOIN LATERAL (
            SELECT json_agg(
                json_build_object(
                    'provider_code', grouped.provider_code,
                    'store_name', grouped.store_name,
                    'username', grouped.username,
                    'password_encrypted', grouped.password_encrypted,
                    'resolved_host_used', grouped.resolved_host_used,
                    'last_seen_at', grouped.last_seen_at
                )
                ORDER BY grouped.last_seen_at DESC NULLS LAST
            ) AS items
            FROM (
                SELECT DISTINCT ON (
                    devices.provider_code,
                    devices.username,
                    devices.resolved_host_used
                )
                    devices.provider_code,
                    playlist_codes.store_name,
                    devices.username,
                    devices.password_encrypted,
                    devices.resolved_host_used,
                    devices.last_seen_at
                FROM devices
                LEFT JOIN provider_codes playlist_codes
                    ON playlist_codes.id = devices.provider_code_id
                WHERE
                    (
                        ranked.device_key IS NOT NULL
                        AND devices.device_key = ranked.device_key
                    )
                    OR (
                        ranked.mac_address IS NOT NULL
                        AND devices.mac_address = ranked.mac_address
                    )
                    OR (
                        ranked.app_installation_id IS NOT NULL
                        AND devices.app_installation_id = ranked.app_installation_id
                    )
                ORDER BY
                    devices.provider_code,
                    devices.username,
                    devices.resolved_host_used,
                    devices.last_seen_at DESC NULLS LAST
            ) grouped
         ) playlists ON TRUE
         ORDER BY ranked.last_seen_at DESC NULLS LAST, ranked.created_at DESC`,
        providerCodeId ? [providerCodeId] : [],
        config
    );
    return result.rows.map((row) => ({
        ...row,
        password: decryptText(row.password_encrypted, config.encryptionSecret),
        playlists: (row.playlists ?? []).map((playlist) => ({
            ...playlist,
            password: decryptText(
                playlist.password_encrypted,
                config.encryptionSecret
            ),
        })),
    }));
}

export async function updateDevicesLastSeen(
    deviceIds: string[],
    config: ProviderAdminConfig
): Promise<void> {
    if (deviceIds.length === 0) {
        return;
    }
    await query(
        'UPDATE devices SET last_seen_at = now() WHERE id = ANY($1::uuid[])',
        [deviceIds],
        config
    );
}
