# Database foundation

prisma/schema.prisma defines the first relational foundation for users, role profiles, gyms, trainers, connections, enquiries, conversations, memberships, bookings, payments and audit logs.

Financial values are stored as integer paise. All primary keys are UUIDs. Owner and role access must be enforced in service/repository methods, not trusted from client input.

Before a shared database is used:

1. Set DATABASE_URL.
2. Run pnpm db:validate.
3. Run pnpm prisma migrate dev --name foundation.
4. Enable PostGIS and add geography indexes for production nearby search.

The repository includes a repeatable local PostGIS service on port `55432` because many macOS installations already use port `5432`:

    pnpm db:up
    DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:55432/kurn?schema=public" pnpm db:migrate
    DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:55432/kurn?schema=public" pnpm db:seed
