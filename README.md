# KURN

KURN is a Pan-India gym and personal-trainer discovery and membership marketplace.

## Start

    pnpm install
    cp .env.example .env
    pnpm db:validate
    pnpm typecheck
    pnpm --filter @kurn/api dev

For database-backed development, run `pnpm db:up`, apply the migration and seed commands in `docs/DATABASE.md`, then start the API with `DATA_SOURCE=database`.

The API defaults to http://localhost:4000. The Expo client and admin portal can be started with pnpm --filter @kurn/mobile dev and pnpm --filter @kurn/admin dev.

The repository currently contains the foundation and database-backed marketplace core. External OTP, payment, maps, storage and notification services still require credentials and provider-specific adapters before a production deployment can be declared ready.
