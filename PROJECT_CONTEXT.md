# Project Context

## Purpose

This file is a working context snapshot for future coding sessions in this repository.
It reflects the current implemented codebase, not just the original requirements.

Project name used in UI/docs: `BloodConnect`
Repo folder name: `Blood_doner_app`

## Stack

- Backend: ASP.NET Core 10 Minimal API
- Backend architecture: lean clean architecture split into `Api`, `Application`, `Domain`, `Infrastructure`
- ORM: EF Core with Npgsql
- Database: PostgreSQL
- Frontend: React 19 + Vite + TypeScript
- UI: Chakra UI v3
- Routing: React Router v7
- Testing:
  - Backend unit/application tests: xUnit
  - Backend integration tests: `WebApplicationFactory<Program>`
  - Frontend test runner configured: Vitest

## High-Level Status

Implemented now:

- Auth: register, login, refresh
- Donor profile: get mine, upsert mine, update availability
- Blood requests: create, list, update status, respond
- Donor search with blood compatibility and radius filtering
- Notifications: create in-app notification, list my notifications
- Admin module: list users, deactivate users, list all requests, list all donor profiles
- Frontend pages for auth, dashboard, donor profile, requests, donor search, notifications
- Frontend admin pages for users, requests, and donor profiles
- JWT auth, CORS, rate limiting, Swagger in development, exception middleware
- Auth capability flags for UI/feature access: `canSeek`, `canManageDonorProfile`, `hasDonorProfile`
- Seekers can become donors by creating a donor profile without losing seeker permissions
- Donors can also create blood requests
- Map-based location picker with browser geolocation + click-to-pin fallback on key frontend forms
- Admin-only authorization policy and inactive-user JWT rejection

Planned in docs but not implemented yet:

- Email verification
- OTP / phone verification
- Forgot/reset password
- Hospitals directory
- Donation history endpoints
- SignalR / real-time notifications
- SMS/email delivery adapters beyond in-app notification persistence
- Education/static content pages
- Blood drive features
- Advanced analytics

## Repository Layout

- `README.md`: current quick-start and basic architecture summary
- `REQUIREMENTS.md`: full product vision and target feature set, much broader than current code
- `IMPLEMENTATION_PLAN.md`: low-RAM deployment and architecture guidance
- `BACKEND_CLEAN_ARCH_STRUCTURE.md`: intended backend structure and conventions
- `PROJECT_CONTEXT.md`: this file

- `backend/BloodDonor.API/src/BloodDonor.Api`: HTTP entry point, endpoints, middleware
- `backend/BloodDonor.API/src/BloodDonor.Application`: handlers, DTOs, validators, common result types
- `backend/BloodDonor.API/src/BloodDonor.Domain`: entities, enums, business rules
- `backend/BloodDonor.API/src/BloodDonor.Infrastructure`: EF Core, JWT, password hashing, notification dispatcher, time provider
- `backend/BloodDonor.API/tests`: backend tests

- `frontend/blood-donor-web/src/api`: fetch wrappers and TS DTOs
- `frontend/blood-donor-web/src/context`: auth and toast providers
- `frontend/blood-donor-web/src/components`: layout and auth guard
- `frontend/blood-donor-web/src/pages`: route pages
- `frontend/blood-donor-web/src/theme`: Chakra theme
- `deployment/docker-compose.yml`: local PostgreSQL setup
- `mobile/blood-donor-mobile`: Expo React Native mobile client for Android and iOS

Ignore generated/vendor content when reading project context:

- `frontend/blood-donor-web/node_modules`
- `frontend/blood-donor-web/dist`
- backend `bin/` and `obj/`

## Backend Entry Flow

Main file: `backend/BloodDonor.API/src/BloodDonor.Api/Program.cs`

Startup sequence:

1. `AddApplication()`
2. `AddInfrastructure(builder.Configuration)`
3. `AddApi()`
4. Build app
5. Resolve `AppDbContext`
6. Call `Database.EnsureCreatedAsync()`
7. Add middleware: exception, CORS, rate limiter, auth, authorization
8. Map endpoints: root, health, auth, admin, donors, requests, search, notifications

Important note:

- The backend currently uses `EnsureCreated`, not EF migrations workflow.

## Backend Architecture

### API Layer

Key files:

- `BloodDonor.Api/Endpoints/Auth/AuthEndpoints.cs`
- `BloodDonor.Api/Endpoints/Donors/DonorEndpoints.cs`
- `BloodDonor.Api/Endpoints/Requests/RequestEndpoints.cs`
- `BloodDonor.Api/Endpoints/Search/SearchEndpoints.cs`
- `BloodDonor.Api/Endpoints/Notifications/NotificationEndpoints.cs`
- `BloodDonor.Api/Middleware/ExceptionMiddleware.cs`

API conventions:

- Minimal API groups
- Most feature groups use `.RequireAuthorization()`
- User id is read from JWT claim `ClaimTypes.NameIdentifier` or `sub`
- Errors usually return `BadRequest` with application `Error`
- Unhandled exceptions become 500 JSON with `correlationId`

### Application Layer

Pattern used:

- One handler per use case
- Command/query records passed from endpoints
- `Result` and `Result<T>` used for success/failure flow
- Pagination wrapped in `PagedResult<T>`

Registered handlers:

- `RegisterHandler`
- `LoginHandler`
- `RefreshHandler`
- `GetMyProfileHandler`
- `UpsertMyProfileHandler`
- `UpdateAvailabilityHandler`
- `CreateRequestHandler`
- `ListRequestsHandler`
- `UpdateRequestStatusHandler`
- `RespondToRequestHandler`
- `SearchDonorsHandler`
- `CreateInAppNotificationHandler`
- `ListMyNotificationsHandler`
- `ListUsersHandler`
- `DeactivateUserHandler`
- `ListAdminRequestsHandler`
- `ListDonorProfilesHandler`

### Domain Layer

Main entities:

- `User`
- `DonorProfile`
- `BloodRequest`
- `RequestResponse`
- `Notification`
- `RefreshToken`

Important domain logic:

- `DonorProfile.ApplyDonation(date)`:
  - sets `LastDonationDate`
  - sets `CooldownUntilDate = donationDate + 56 days`
  - sets `AvailabilityStatus = Cooldown`
  - increments `TotalDonations`
- `DonorProfile.RefreshAvailability(today)`:
  - if cooldown has passed, sets donor back to `Available`
- `BloodRequest.ExpireIfNeeded(nowUtc)`:
  - moves `Open` or `PartiallyFulfilled` to `Expired` when `ExpiresAtUtc <= nowUtc`
- `BloodRequest.RegisterFulfilledUnit()`:
  - increments `UnitsFulfilled`
  - sets `PartiallyFulfilled` or `Fulfilled`
- `BloodCompatibilityRules.GetCompatibleDonors(recipientBloodGroup)`:
  - returns compatible donor groups for recipient blood type

### Infrastructure Layer

Key responsibilities:

- `AppDbContext` exposes EF sets for users, donor profiles, requests, responses, notifications, refresh tokens
- `JwtTokenService` creates access and refresh tokens
- `PasswordHasherAdapter` handles password hashing
- `InAppNotificationDispatcher` is the only notification dispatcher wired now
- `DateTimeProvider` centralizes UTC time

## Backend Endpoint Map

### Root and Health

- `GET /`
  - returns service name and environment
- `GET /health`
  - returns `{ status: "ok", timestampUtc }`

### Auth

Group: `/api/auth`

- `POST /register`
  - rate limited by policy `auth`
  - creates user and refresh token
  - returns access token + refresh token + user summary
- `POST /login`
  - rate limited by policy `auth`
  - validates credentials
  - creates a new refresh token
- `POST /refresh`
  - rate limited by policy `auth`
  - revokes old refresh token and returns a new token pair

Auth response now also includes:

- `canSeek`
- `canManageDonorProfile`
- `hasDonorProfile`

### Donors

Group: `/api/donors` and requires auth

- `GET /me`
  - get authenticated user's donor profile
- `PUT /me`
  - create or update authenticated user's donor profile
  - allowed for base roles `Donor` and `Seeker`
- `PUT /me/availability`
  - update availability unless donor is still in cooldown
- `POST /{donorUserId}/contact-request`
  - send an in-app contact request to a donor
  - used when donor phone is hidden in search results

### Requests

Group: `/api/requests` and requires auth

- `POST /`
  - create blood request
  - allowed for users with seek capability, including `Donor`, `Seeker`, `Hospital`, `Admin`
- `GET /`
  - list requests with optional `page`, `pageSize`, `status`, `bloodGroup`, `mineOnly`, `availableForMe`
  - `mineOnly=true` returns requests created by current user
  - `availableForMe=true` returns open requests for compatible donors other than the current user
- `PUT /{requestId}`
  - update request status manually to `Cancelled` or `Fulfilled`
- `POST /{requestId}/respond`
  - donor response status update (`Accepted`, `Declined`, `Withdrawn`, `Completed`)
  - donor cannot respond to their own request

### Search

Group: `/api/search` and requires auth

- `GET /donors`
  - query params: `recipientBloodGroup`, `latitude`, `longitude`, `radiusKm`, `page`, `pageSize`
  - filters available donors by compatible blood group and radius
  - sorts by distance, then donation count desc
  - returns donor name and contact metadata
  - phone is only included when donor has chosen to make it visible

### Notifications

Group: `/api/notifications` and requires auth

- `GET /`
  - list current user's notifications paginated
- `POST /`
  - create in-app notification from body values

Important note:

- `POST /api/notifications` is authenticated but currently not restricted to creating notifications only for the caller; it accepts `body.UserId`.

### Admin

Group: `/api/admin` and requires admin role

- `GET /users`
  - list all users with optional `page`, `pageSize`, `role`, `isActive`, `search`
- `POST /users/{userId}/deactivate`
  - deactivates a user account
  - current admin cannot deactivate their own account
- `GET /requests`
  - list all requests with optional `page`, `pageSize`, `status`, `bloodGroup`, `search`
- `GET /donors`
  - list all donor profiles with optional `page`, `pageSize`, `bloodGroup`, `availabilityStatus`, `city`, `search`
  - donor phone is returned only when `IsPhoneVisible` is true

## Enum Values Used in Backend and Frontend

### UserRole

- `1 = Donor`
- `2 = Seeker`
- `3 = Hospital`
- `4 = Admin`

Important interpretation in the current app:

- `User.Role` is still a single stored base role.
- Donor capability is no longer treated as only a single-role gate in the frontend.
- A seeker can become donor-capable by creating a donor profile.

### BloodGroup

- `1 = ANegative`
- `2 = APositive`
- `3 = BNegative`
- `4 = BPositive`
- `5 = ABNegative`
- `6 = ABPositive`
- `7 = ONegative`
- `8 = OPositive`

### AvailabilityStatus

- `1 = Available`
- `2 = TemporarilyUnavailable`
- `3 = Cooldown`

### RequestStatus

- `1 = Open`
- `2 = PartiallyFulfilled`
- `3 = Fulfilled`
- `4 = Expired`
- `5 = Cancelled`

### RequestType

- `1 = Urgent`
- `2 = Scheduled`

### UrgencyLevel

- `1 = Critical`
- `2 = Urgent`
- `3 = Normal`

### ResponseStatus

- `1 = Pending`
- `2 = Accepted`
- `3 = Declined`
- `4 = Completed`
- `5 = Withdrawn`

### NotificationType

- `1 = BloodRequest`
- `2 = RequestAccepted`
- `3 = CooldownEnded`
- `4 = General`

### NotificationChannel

- `1 = InApp`
- `2 = Email`
- `3 = Sms`

## Frontend Architecture

Main app shell:

- `frontend/blood-donor-web/src/main.tsx`
- `frontend/blood-donor-web/src/App.tsx`

### Providers

- `AppChakraProvider`: wraps app with Chakra `createSystem(defaultConfig, appTheme)`
- `AuthProvider`:
  - stores auth payload in localStorage key `bloodconnect_auth`
  - loads persisted auth on startup
  - removes expired auth if access token expiry has passed
  - syncs auth state across tabs via `storage` event
  - exposes capability helpers from auth payload: `canSeek`, `canManageDonorProfile`, `hasDonorProfile`
- `ToastProvider`:
  - centralized Chakra toaster helpers: `success`, `error`, `warning`, `info`

### Routing

Public routes:

- `/auth/login`
- `/auth/register`

Protected routes:

- `/dashboard`
- `/donor/profile` for users who can manage donor profile or already have donor profile access
- `/requests` for users with seek capability
- `/search` for users with seek capability
- `/notifications`
- `/admin/users` for `Admin`
- `/admin/requests` for `Admin`
- `/admin/donors` for `Admin`

Fallback route:

- unknown paths redirect to `/dashboard`

### Layout

`AppLayout` provides:

- sticky top nav
- desktop nav + mobile hamburger menu
- role-filtered nav items
- capability-filtered nav items
- logout button
- current user email display

### Theme

Theme file: `frontend/blood-donor-web/src/theme/index.ts`

Current theme characteristics:

- custom `brand` red palette tokens
- `Inter` font for heading and body

## Mobile App Architecture

New mobile app root:

- `mobile/blood-donor-mobile`

Mobile stack:

- React Native with Expo
- Expo Router for file-based navigation
- AsyncStorage for auth persistence
- `react-native-maps` for location pinning
- `expo-location` for device location permission and current location lookup

Mobile structure:

- `mobile/blood-donor-mobile/app`: route entry files
- `mobile/blood-donor-mobile/api`: API wrappers mirroring web app endpoints
- `mobile/blood-donor-mobile/context`: auth and toast contexts
- `mobile/blood-donor-mobile/components`: protected screen, layout shell, form, location picker
- `mobile/blood-donor-mobile/screens`: screen implementations for auth, dashboard, donor profile, requests, search, notifications
- `mobile/blood-donor-mobile/constants`: shared enum label/option maps

Mobile routes currently created:

- `/auth/login`
- `/auth/register`
- `/dashboard`
- `/donor/profile`
- `/requests`
- `/search`
- `/notifications`

Mobile behavior mirrors the web app at a feature level:

- auth flow
- dashboard quick actions
- seeker-to-donor onboarding through donor profile
- request creation and listing
- donor search
- notification list
- capability-based route guarding
- location selection via device permission or map pinning

Mobile implementation notes:

- The mobile app is a separate client and not yet integrated into any monorepo build pipeline.
- Android and iOS targets are configured in `app.json` through Expo.
- Native `android/` and `ios/` folders are not committed yet; Expo can generate them later via prebuild/run if needed.
- Mobile API base URL defaults to `https://localhost:7186` and should usually be overridden for device testing.

## Frontend API Layer

Files:

- `src/api/config.ts`: development defaults to `https://localhost:7186`, production defaults to same-origin `""` unless `VITE_API_URL` is explicitly set
- `src/api/auth.ts`
- `src/api/donors.ts`
- `src/api/requests.ts`
- `src/api/search.ts`
- `src/api/notifications.ts`
- `src/api/types.ts`

Conventions:

- Uses native `fetch`, not axios
- Auth token sent as `Authorization: Bearer <token>`
- Error handling is simple and generic in most clients
- DTOs are mostly numeric enum-based payloads
- Production frontend can work behind Nginx on a public IP without a hardcoded API base URL because API requests can use same-origin `/api`

## Frontend Pages

### Login

File: `src/pages/auth/login-page.tsx`

- validates email format and password length
- calls `login()`
- stores auth in `AuthContext`
- redirects to prior route or `/dashboard`

### Register

File: `src/pages/auth/register-page.tsx`

- validates full name, email, password
- role select uses numeric values matching backend enum
- calls `register()`
- stores auth and redirects to `/dashboard`

### Dashboard

File: `src/pages/dashboard/dashboard-page.tsx`

- reads auth info from context
- shows simple stat cards from auth payload
- shows quick actions by role

### Donor Profile

File: `src/pages/donor/donor-profile-page.tsx`

- loads current donor profile if it exists
- supports seeker-to-donor onboarding through donor profile creation
- allows upsert of blood group, DOB, weight, city, area, lat/lng, phone visibility
- separately updates availability after save
- uses a map/geolocation picker instead of manual latitude/longitude text entry
- still keeps city and area as editable text fields

### Requests

File: `src/pages/requests/requests-page.tsx`

- loads request list on mount
- has inline form to create a request
- after create, reloads list
- available to seek-capable users, including donors
- uses a map/geolocation picker instead of manual latitude/longitude text entry

### Search

File: `src/pages/search/search-page.tsx`

- submits blood group + location + radius
- requires current location or map-pinned location
- shows donor cards with distance and total donations

### Notifications

File: `src/pages/notifications/notifications-page.tsx`

- loads notification list on mount
- shows unread state visually

### Shared location picker

File: `src/components/location/location-picker.tsx`

- uses `leaflet` + `react-leaflet`
- supports browser geolocation via `navigator.geolocation`
- supports manual click-to-pin fallback on the map
- used by donor profile, request creation, and donor search pages

## Known Gaps and Inconsistencies

These are important for future sessions.

### Docs vs code

- `REQUIREMENTS.md` describes a much larger system than what exists now.
- Use the actual source code as the source of truth for current implementation.

### Database initialization

- Backend uses `EnsureCreatedAsync()` instead of migrations.
- There is no production-safe migration workflow wired in startup.

### Security/configuration

- `backend/BloodDonor.API/src/BloodDonor.Api/appsettings.json` contains a concrete local PostgreSQL password.
- JWT signing key in `appsettings.json` is still placeholder text: `CHANGE_ME_TO_A_LONG_RANDOM_KEY_32_CHARS_MIN`.
- CORS policy currently allows any origin via `.SetIsOriginAllowed(_ => true)` and also allows credentials.

### Role enforcement

- Backend endpoints are authenticated, but most role restrictions are enforced only in frontend routing.
- This is now partially improved:
  - donor profile creation is restricted in application logic to `Donor` and `Seeker`
  - request creation is restricted in application logic to seek-capable roles
- Endpoint-level policy separation is still not fully modeled.

### Request status labeling mismatch in frontend

- Backend `RequestStatus` values are `1..5` starting at `Open`.
- `src/pages/requests/requests-page.tsx` uses a local label map with `0: Pending`, `1: Active`, `2: Fulfilled`, `3: Expired`, `4: Cancelled`.
- That mapping does not match backend enum values and can display incorrect labels.

### Availability labeling mismatch in frontend

- Backend has `Available`, `TemporarilyUnavailable`, `Cooldown`.
- Search page only maps `1: Available`, `2: Unavailable` and does not represent cooldown.

### Auth payload compatibility

- Older auth objects stored in localStorage before the capability update will not include capability flags.
- Users should log out and log back in after the update so the new auth payload shape is loaded.

### Mobile app status

- A separate Expo React Native mobile app now exists under `mobile/blood-donor-mobile`.
- Web app remains the more fully verified client at the moment.
- Mobile dependency install / runtime verification may still require local completion depending on package resolution and environment.

### Public IP deployment limitation

- The web app can be deployed and used via an Oracle public IP over plain HTTP.
- However, browser geolocation may not work reliably without HTTPS because many browsers require a secure context.
- The map pinning fallback still works in that setup.

### Notifications behavior

- In-app notification creation endpoint exists, but there is no full event-driven workflow yet connecting new requests to automatic donor notifications.

### Testing depth

- Backend tests exist, but current integration tests are mostly authorization/basic validation checks.
- Frontend has a test script configured, but no meaningful frontend test suite was found in `src`.

### Generated assets in repo

- `frontend/blood-donor-web/dist` and `node_modules` are present in the workspace.
- Avoid treating them as source-of-truth files during edits unless the task explicitly requires build output changes.

## Current Backend Test Coverage Snapshot

Integration tests found:

- auth invalid payload / missing refresh token
- donor endpoints unauthorized without token
- request endpoints unauthorized without token
- search and notifications unauthorized without token
- health endpoint tests exist

Application tests found:

- blood compatibility rules
- register validator
- donor profile domain tests
- blood request domain tests
- blood compatibility search tests

## Local Run Commands

### Database

Start PostgreSQL via Docker:

```powershell
docker compose -f deployment/docker-compose.yml up -d
```

### Backend

```powershell
dotnet run --project backend/BloodDonor.API/src/BloodDonor.Api/BloodDonor.Api.csproj
```

### Frontend

```powershell
npm install
npm run dev
```

Run from:

```text
frontend/blood-donor-web
```

Frontend API base URL:

- env var `VITE_API_URL`
- default fallback: `https://localhost:7186`

## Verification Commands

Backend build:

```powershell
dotnet build backend/BloodDonor.API/BloodDonor.slnx
```

Backend application tests:

```powershell
dotnet test backend/BloodDonor.API/tests/BloodDonor.Application.Tests/BloodDonor.Application.Tests.csproj
```

Backend integration tests:

```powershell
dotnet test backend/BloodDonor.API/tests/BloodDonor.Api.IntegrationTests/BloodDonor.Api.IntegrationTests.csproj
```

Frontend build:

```powershell
npm run build
```

Run from:

```text
frontend/blood-donor-web
```

Mobile app install and typecheck:

```powershell
npm install
npm run typecheck
```

Run from:

```text
mobile/blood-donor-mobile
```

Mobile app start:

```powershell
npm run start
```

Mobile Android run:

```powershell
npm run android
```

Mobile iOS run:

```powershell
npm run ios
```

Frontend map dependencies now include:

- `leaflet`
- `react-leaflet`
- `@types/leaflet`

## Practical Guidance For Future Sessions

- Prefer reading `PROJECT_CONTEXT.md` plus the relevant feature files before making changes.
- Treat backend role enforcement as incomplete unless explicitly added.
- Treat the product docs as roadmap documents, not a representation of current implementation.
- Preserve the existing lean style: small handlers, minimal abstractions, feature folders.
- Prefer editing source files only, not `dist` or generated folders.
- Be careful with numeric enum mappings in the frontend; several pages hardcode labels.
- If changing persistence strategy, account for current `EnsureCreated` startup behavior.

## Most Important Files By Area

Backend bootstrap:

- `backend/BloodDonor.API/src/BloodDonor.Api/Program.cs`
- `backend/BloodDonor.API/src/BloodDonor.Api/DependencyInjection/ApiServiceCollection.cs`
- `backend/BloodDonor.API/src/BloodDonor.Infrastructure/DependencyInjection/InfrastructureServiceCollection.cs`
- `backend/BloodDonor.API/src/BloodDonor.Application/DependencyInjection/ApplicationServiceCollection.cs`

Backend core domain:

- `backend/BloodDonor.API/src/BloodDonor.Domain/Entities/User.cs`
- `backend/BloodDonor.API/src/BloodDonor.Domain/Entities/DonorProfile.cs`
- `backend/BloodDonor.API/src/BloodDonor.Domain/Entities/BloodRequest.cs`
- `backend/BloodDonor.API/src/BloodDonor.Domain/Rules/BloodCompatibilityRules.cs`

Frontend app shell:

- `frontend/blood-donor-web/src/App.tsx`
- `frontend/blood-donor-web/src/context/auth-context.tsx`
- `frontend/blood-donor-web/src/context/toast-context.tsx`
- `frontend/blood-donor-web/src/components/layout/app-layout.tsx`

Frontend feature pages:

- `frontend/blood-donor-web/src/pages/auth/login-page.tsx`
- `frontend/blood-donor-web/src/pages/auth/register-page.tsx`
- `frontend/blood-donor-web/src/pages/dashboard/dashboard-page.tsx`
- `frontend/blood-donor-web/src/pages/donor/donor-profile-page.tsx`
- `frontend/blood-donor-web/src/pages/requests/requests-page.tsx`
- `frontend/blood-donor-web/src/pages/search/search-page.tsx`
- `frontend/blood-donor-web/src/pages/notifications/notifications-page.tsx`

## Session Shortcut

If a future session needs quick orientation, start by reading:

1. `PROJECT_CONTEXT.md`
2. `README.md`
3. the specific feature files being changed

This should be enough to work on the project without re-explaining the whole codebase.
