export interface ProviderAdminConfig {
    adminPassword: string;
    adminUsername: string;
    cookieSecure: boolean;
    databaseUrl: string;
    encryptionSecret: string;
    nodeEnv: string;
    port: number;
    publicCorsOrigins: string[];
    runMigrationsOnStart: boolean;
    sessionSecret: string;
    xtreamHostTimeoutMs: number;
}

function requiredEnv(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) {
        throw new Error(`Missing required environment variable ${name}`);
    }
    return value;
}

function optionalBoolean(name: string, fallback: boolean): boolean {
    const value = process.env[name]?.trim().toLowerCase();
    if (!value) {
        return fallback;
    }
    return ['1', 'true', 'yes', 'on'].includes(value);
}

function optionalNumber(name: string, fallback: number): number {
    const value = process.env[name]?.trim();
    if (!value) {
        return fallback;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function loadConfig(): ProviderAdminConfig {
    const nodeEnv = process.env['NODE_ENV']?.trim() || 'development';
    const sessionSecret =
        process.env['ADMIN_JWT_SECRET']?.trim() ||
        process.env['SESSION_SECRET']?.trim() ||
        '';

    if (!sessionSecret) {
        throw new Error(
            'Missing ADMIN_JWT_SECRET or SESSION_SECRET environment variable'
        );
    }

    return {
        adminPassword: requiredEnv('ADMIN_PASSWORD'),
        adminUsername: requiredEnv('ADMIN_USERNAME'),
        cookieSecure:
            process.env['COOKIE_SECURE']?.trim() !== undefined
                ? optionalBoolean('COOKIE_SECURE', nodeEnv === 'production')
                : nodeEnv === 'production',
        databaseUrl: requiredEnv('DATABASE_URL'),
        encryptionSecret:
            process.env['DATA_ENCRYPTION_KEY']?.trim() || sessionSecret,
        nodeEnv,
        port: optionalNumber('PORT', 3334),
        publicCorsOrigins: (process.env['APP_CORS_ORIGINS'] ?? '*')
            .split(',')
            .map((origin) => origin.trim())
            .filter(Boolean),
        runMigrationsOnStart: optionalBoolean('RUN_MIGRATIONS_ON_START', false),
        sessionSecret,
        xtreamHostTimeoutMs: optionalNumber('XTREAM_HOST_TIMEOUT_MS', 2500),
    };
}
