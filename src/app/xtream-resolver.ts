import { ProviderAdminConfig } from './config.js';
import {
    ProviderCodeRow,
    findMatchingDevice,
    getProviderCodeByCode,
    listHostsForCode,
    upsertDeviceLogin,
} from './repositories.js';

export interface ProviderLoginInput {
    providerCode: string;
    username: string;
    password: string;
    deviceKey?: string | null;
    macAddress?: string | null;
    appInstallationId?: string | null;
    appVersion?: string | null;
    ipAddress?: string | null;
}

export interface ProviderLoginSuccess {
    success: true;
    providerCode: string;
    resolvedHost: string;
}

export interface ProviderLoginFailure {
    success: false;
    error: 'Invalid credentials';
}

export type ProviderLoginResult = ProviderLoginSuccess | ProviderLoginFailure;

function invalidCredentials(): ProviderLoginFailure {
    return { success: false, error: 'Invalid credentials' };
}

function isProviderCodeAllowed(providerCode: ProviderCodeRow): boolean {
    if (!providerCode.is_active || providerCode.is_blocked) {
        return false;
    }

    if (!providerCode.expires_at) {
        return true;
    }

    return Date.parse(providerCode.expires_at) > Date.now();
}

function normalizeHostUrl(value: string): string | null {
    try {
        const url = new URL(value);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return null;
        }
        url.pathname = url.pathname.replace(/\/+$/, '');
        url.search = '';
        url.hash = '';
        return url.href.replace(/\/+$/, '');
    } catch {
        return null;
    }
}

function isXtreamLoginSuccess(payload: unknown): boolean {
    if (!payload || typeof payload !== 'object') {
        return false;
    }

    const userInfo = (payload as { user_info?: Record<string, unknown> })
        .user_info;
    if (!userInfo || typeof userInfo !== 'object') {
        return false;
    }

    const auth = userInfo['auth'];
    const status = String(userInfo['status'] ?? '').toLowerCase();

    return (
        (auth === 1 || auth === '1' || status === 'active') &&
        status !== 'disabled'
    );
}

async function tryXtreamHost(
    hostUrl: string,
    username: string,
    password: string,
    timeoutMs: number
): Promise<boolean> {
    const normalizedHost = normalizeHostUrl(hostUrl);
    if (!normalizedHost) {
        return false;
    }

    const url = new URL(`${normalizedHost}/player_api.php`);
    url.searchParams.set('username', username);
    url.searchParams.set('password', password);
    url.searchParams.set('action', 'get_account_info');

    try {
        const response = await fetch(url, {
            headers: { Accept: 'application/json' },
            signal: AbortSignal.timeout(timeoutMs),
        });
        if (!response.ok) {
            return false;
        }

        return isXtreamLoginSuccess(await response.json());
    } catch {
        return false;
    }
}

export async function resolveProviderLogin(
    input: ProviderLoginInput,
    config: ProviderAdminConfig
): Promise<ProviderLoginResult> {
    const providerCode = await getProviderCodeByCode(
        input.providerCode,
        config
    );

    if (!providerCode || !isProviderCodeAllowed(providerCode)) {
        return invalidCredentials();
    }

    const matchingDevice = await findMatchingDevice(
        {
            appInstallationId: input.appInstallationId,
            deviceKey: input.deviceKey,
            macAddress: input.macAddress,
            providerCode: providerCode.code,
            username: input.username,
        },
        config
    );

    if (matchingDevice?.is_blocked) {
        return invalidCredentials();
    }

    const hosts = await listHostsForCode(providerCode.id, config, true);
    const normalizedHosts = hosts
        .map((host) => normalizeHostUrl(host.host_url))
        .filter((host): host is string => Boolean(host));

    const orderedHosts = [
        matchingDevice?.resolved_host_used,
        ...normalizedHosts,
    ].filter((host, index, all): host is string =>
        Boolean(host && all.indexOf(host) === index)
    );

    for (const host of orderedHosts) {
        const success = await tryXtreamHost(
            host,
            input.username,
            input.password,
            config.xtreamHostTimeoutMs
        );

        if (!success) {
            continue;
        }

        await upsertDeviceLogin(
            {
                appInstallationId: input.appInstallationId,
                appVersion: input.appVersion,
                deviceKey: input.deviceKey,
                macAddress: input.macAddress,
                password: input.password,
                providerCode,
                resolvedHostUsed: host,
                username: input.username,
                ipAddress: input.ipAddress,
            },
            config
        );

        return {
            success: true,
            providerCode: providerCode.code,
            resolvedHost: host,
        };
    }

    return invalidCredentials();
}
