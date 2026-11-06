# API foundation

All client APIs are under /api/v1 and use:

{ success, message, data, meta }

Errors use:

{ success: false, message, error: { code, details } }

Implemented marketplace routes:

- GET /health
- POST /api/v1/auth/send-otp
- POST /api/v1/auth/verify-otp
- GET /api/v1/gyms
- GET /api/v1/trainers
- GET /api/v1/gyms/:id
- GET /api/v1/gyms/:id/plans
- POST /api/v1/gyms/:id/enquiries
- POST /api/v1/gyms
- PATCH /api/v1/gyms/:id
- GET /api/v1/gym-owner/gyms
- POST /api/v1/gyms/:id/plans
- PATCH /api/v1/gyms/:gymId/plans/:planId
- GET /api/v1/gym-owner/enquiries
- PATCH /api/v1/gym-owner/enquiries/:id
- GET /api/v1/gym-owner/memberships
- GET /api/v1/trainers/:id
- GET /api/v1/trainers/me
- PATCH /api/v1/trainers/me
- GET /api/v1/trainers/me/students
- POST /api/v1/connections/requests
- GET /api/v1/connections
- POST /api/v1/memberships/purchase
- GET /api/v1/users/me/memberships
- POST /api/v1/bookings
- GET /api/v1/bookings
- GET/POST /api/v1/conversations
- GET/POST /api/v1/conversations/:id/messages
- POST /api/v1/trainers/:id/availability
- POST /api/v1/attendance/check-in
- GET /api/v1/attendance/history
- GET /api/v1/activity/me
- GET /api/v1/streaks/me
- GET /api/v1/notifications
- POST /api/v1/notifications/:id/read
- POST /api/v1/verifications
- POST /api/v1/payments/webhook
- POST /api/v1/payments/create-order
- GET /api/v1/admin/overview
- GET /api/v1/admin/users
- GET /api/v1/admin/gyms
- GET /api/v1/admin/trainers
- GET /api/v1/admin/reports
- GET /api/v1/users/me
- POST /api/v1/users/me
- POST /api/v1/auth/logout
- GET/POST /api/v1/admin/verifications

The mobile client reads `EXPO_PUBLIC_API_URL` at bundle time; it falls back to `http://localhost:4000/api/v1` for local simulator development. The local runtime defaults to explicitly marked demo listings and an in-memory repository. Set `DATA_SOURCE=database` to use the Prisma/PostgreSQL repository. Gym-owner and trainer management routes require database mode. OTP delivery supports `console` for development and `http` with `OTP_PROVIDER_URL`/`OTP_PROVIDER_TOKEN` for an external delivery service. Memberships remain pending until a configured provider webhook is verified; set `PAYMENT_PROVIDER` and `PAYMENT_WEBHOOK_SECRET` for the webhook boundary.

Discovery accepts `page`, `limit`, `q`, `city`, `locality`, `pinCode`, price bounds, and latitude/longitude with `radiusKm`. Responses include `page`, `limit`, and `hasMore` metadata.

`POST /api/v1/users/me` validates email, date of birth, Indian PIN code, and the 16–70 age range. Users under 18 require `guardianConsent: true`.
