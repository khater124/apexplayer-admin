import { runMigrations } from '../src/app/migrations.js';

runMigrations()
    .then(() => {
        console.log('Provider admin migrations completed.');
    })
    .catch((error) => {
        console.error(
            `Provider admin migrations failed: ${
                error instanceof Error ? error.message : String(error)
            }`
        );
        process.exit(1);
    });
