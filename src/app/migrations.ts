import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ProviderAdminConfig, loadConfig } from './config.js';
import { getPool } from './database.js';

function getMigrationDir(): string {
    const candidates = [
        join(process.cwd(), 'apps/provider-admin/migrations'),
        join(process.cwd(), 'migrations'),
        join(__dirname, 'migrations'),
    ];

    const found = candidates.find((candidate) => existsSync(candidate));
    if (!found) {
        throw new Error('Provider admin migrations directory was not found');
    }

    return found;
}

export async function runMigrations(
    config: ProviderAdminConfig = loadConfig()
): Promise<void> {
    const pool = getPool(config);
    const migrationDir = getMigrationDir();
    const files = readdirSync(migrationDir)
        .filter((file) => file.endsWith('.sql'))
        .sort();

    await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
            id TEXT PRIMARY KEY,
            applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    `);

    for (const file of files) {
        const migrationId = file.replace(/\.sql$/, '');
        const applied = await pool.query(
            'SELECT id FROM schema_migrations WHERE id = $1',
            [migrationId]
        );
        if (applied.rowCount) {
            continue;
        }

        const sql = readFileSync(join(migrationDir, file), 'utf8');
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(sql);
            await client.query(
                'INSERT INTO schema_migrations (id) VALUES ($1) ON CONFLICT DO NOTHING',
                [migrationId]
            );
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}
