import { createProviderAdminApp } from './app/provider-admin-app.js';
import { loadConfig } from './app/config.js';
import { runMigrations } from './app/migrations.js';
import { ensureConfiguredAdminUser } from './app/repositories.js';

async function bootstrap(): Promise<void> {
    const config = loadConfig();

    if (config.runMigrationsOnStart) {
        await runMigrations(config);
    }

    await ensureConfiguredAdminUser(config);

    const app = createProviderAdminApp(config);
    app.listen(config.port, () => {
        console.log(
            `Apex provider admin listening on http://localhost:${config.port}`
        );
    });
}

bootstrap().catch((error) => {
    console.error(
        `Apex provider admin failed to start: ${
            error instanceof Error ? error.message : String(error)
        }`
    );
    process.exit(1);
});
