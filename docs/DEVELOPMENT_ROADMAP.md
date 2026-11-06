# Development roadmap

## Milestone 1 — Foundation

- [x] Monorepo and workspace configuration
- [x] Shared design tokens and validation
- [x] Initial Prisma relational model
- [x] API envelope and health/auth provider boundaries
- [x] Authenticated local session flow with OTP adapter boundary
- [x] Gym/trainer discovery, profiles and filters
- [x] Enquiries, trainer connections and booking conflict checks
- [x] Membership order idempotency boundary
- [x] Consumer navigation shell
- [x] Mobile session-aware role routing and native iOS bundle export
- [x] Secure mobile session persistence and startup hydration
- [x] Admin overview shell

## Milestone 2 — Marketplace

- [x] OTP provider boundary, persisted challenges and sessions
- [ ] Configure and verify a real OTP provider in production
- [ ] Consumer onboarding and location selection
- [x] Gym-owner gym/plan management and trainer profile operations
- [x] India-wide geospatial discovery foundation with PostGIS radius queries
- [x] Enquiries, connections and messaging persistence foundation
- [x] Membership plan/order lifecycle foundation with idempotency and webhook activation

## Milestone 3 — Business operations

- [x] Availability and booking transactions foundation
- [x] Payment lifecycle with pending memberships and signed webhooks
- [x] Admin OTP access, overview metrics and verification decisions
- [x] Admin verification persistence and audit-ready review fields
- [x] Attendance validation foundation
- [ ] Configure live marketplace payment provider and merchant settlement
- [ ] Physical-device release QA, accessibility checks and store builds

Social feed, advanced rewards, subscriptions and AI features remain post-MVP.
