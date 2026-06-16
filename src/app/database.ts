import pg from 'pg';
import { ProviderAdminConfig, loadConfig } from './config.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(config: ProviderAdminConfig = loadConfig()): pg.Pool {
    if (!pool) {
        pool = new Pool({
            connectionString: config.databaseUrl,
            ssl:
                config.databaseUrl.includes('sslmode=disable') ||
                config.nodeEnv === 'development'
                    ? undefined
                    : { rejectUnauthorized: false },
        });
    }
    return pool;
}

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    params: unknown[] = [],
    config?: ProviderAdminConfig
): Promise<pg.QueryResult<T>> {
    return getPool(config).query<T>(text, params);
}
