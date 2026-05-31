# Low-RAM Implementation Blueprint (Oracle Free x86)

## Goals
- Add Chakra UI to the frontend with minimal server impact.
- Implement clean-code backend architecture in ASP.NET Core.
- Keep the app stable on a low-resource Oracle Free x86 VM.

## Expected Impact on Server Requirements
- Chakra UI impact on server: negligible (mostly client-side bundle impact).
- Clean-code backend impact: small overhead, usually acceptable for MVP.
- Major resource drivers remain:
  - PostgreSQL memory + connection settings
  - Concurrent API traffic
  - SignalR connection count and fan-out
  - Background jobs and notification bursts

Conclusion: No major server upgrade is typically required for MVP if tuned properly.

## Recommended Lean Architecture
Use a single deployable API with clear internal boundaries:

- Domain
  - Entities, enums, core business rules
- Application
  - Use cases, DTOs, validation, interfaces
- Infrastructure
  - EF Core persistence, JWT/auth, email/SMS adapters
- API
  - Minimal API endpoints, middleware, policies, mappings

Guidelines:
- Prefer feature-folder organization plus use-case handlers.
- Add interfaces where substitution/testing is useful.
- Avoid over-engineering and excessive abstraction in MVP.

## Chakra UI Integration Plan
- Install Chakra UI in frontend app.
- Wrap app with `ChakraProvider`.
- Define a lightweight theme with design tokens.
- Use Chakra primitives (`Box`, `Stack`, `Button`, form components) for consistency.
- Apply route-level code splitting for heavy pages.
- Avoid importing unused icon packs/components.

## Production Setup (Low-RAM Friendly)
- Serve React build as static files behind Nginx.
- Do not run a Node.js frontend server in production.
- Keep API and DB processes minimal and observable.

## Practical RAM Budget (1GB-class VM)
Approximate baseline:
- OS: 180-250MB
- Nginx: 5-20MB
- ASP.NET API: 120-220MB
- PostgreSQL: 150-300MB
- Headroom: ~200MB+ for bursts

## PostgreSQL Tuning (Starting Point)
- `shared_buffers = 128MB`
- `effective_cache_size = 384MB`
- `work_mem = 4MB`
- `maintenance_work_mem = 64MB`
- `max_connections = 30` (or lower with pooling)

## API / Runtime Tuning
- Add rate limiting for auth/OTP endpoints.
- Enable pagination everywhere list endpoints exist.
- Cache read-mostly endpoints (FAQ, compatibility, hospital directory).
- Set request size/time limits and validate all input.
- Keep logs structured with retention controls.
- Delay non-critical background workers until needed.

## SignalR / Notifications Guidance
- Keep event set minimal in MVP.
- Avoid high-frequency broadcast patterns.
- Prefer targeted notifications over global fan-out.
- Add queue/backoff behavior for SMS/email spikes.

## Implementation Phases

### Phase 1: Foundation
- Establish clean folder structure and boundaries.
- Set up DI, error handling, validation pipeline, auth skeleton.
- Add base observability (logs, health checks).

### Phase 2: Core MVP
- Auth flows (register/login/refresh/email verify/OTP).
- Donor profile management and availability logic.
- Blood request lifecycle is implemented:
  - request creation
  - request listing for owners and compatible donors
  - donor accept/decline/withdraw response flow
  - requester fulfilled/cancelled status management
- Donor search and matching basics are implemented:
  - compatible donor search by radius
  - donor availability filtering
  - donor contact metadata in search results

### Phase 3: Communication and Admin
- In-app notifications are implemented.
- Donor contact request workflow is implemented for donors who hide phone numbers in search.
- Email/SMS integration remains future work.
- Admin web module is partially implemented:
  - list all users
  - deactivate users
  - view all requests
  - view all donor profiles
- Remaining admin work:
  - activate/reactivate users if needed
  - request moderation actions beyond listing
  - admin analytics/dashboard metrics
  - richer pagination and management workflows in admin UI
  - richer notification management and delivery tracking

### Phase 4: Hardening
- Add DB indexes based on real query patterns.
- Profile memory and response times.
- Run lightweight load tests and adjust limits.

## Success Criteria
- Stable operation within 1GB memory envelope.
- P95 API latency target maintained for MVP paths.
- Frontend remains responsive on mobile and low bandwidth.
- Notification workflows and donor contact requests remain reliable under moderate spikes.
