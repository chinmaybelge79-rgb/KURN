# KURN architecture

KURN is a modular monolith with three clients sharing a versioned REST API:

- apps/mobile: Expo Router consumer, gym-owner and trainer experiences.
- apps/admin: responsive Next.js operations portal.
- apps/api: Express API with domain modules and server-side authorization.

PostgreSQL is the system of record. Prisma owns the relational model and the API now has a shared Prisma client boundary with a health check. PostGIS-backed coordinates are represented in the first schema as indexed latitude/longitude fields so the geospatial migration can be introduced with the production database extension enabled.

External providers are adapter boundaries: OTP, maps, object storage, notifications and marketplace payments must be configured through environment variables and verified webhooks.
