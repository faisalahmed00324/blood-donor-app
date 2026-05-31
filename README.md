# Blood Donor App

This repository contains a low-resource MVP implementation of BloodConnect using:

- Backend: ASP.NET Core 10 Minimal API with clean architecture boundaries
- Frontend: React 19 + Vite + TypeScript + Chakra UI v3
- Database: PostgreSQL 16 (Docker for local development)

## Structure

- `backend/BloodDonor.API/src/BloodDonor.Api`
- `backend/BloodDonor.API/src/BloodDonor.Application`
- `backend/BloodDonor.API/src/BloodDonor.Domain`
- `backend/BloodDonor.API/src/BloodDonor.Infrastructure`
- `backend/BloodDonor.API/tests`
- `frontend/blood-donor-web`
- `deployment`

## Frontend Architecture

### State Management
- **AuthContext** (`useContext` + `useAuth` hook): Manages authentication state with localStorage persistence, automatic token expiry checks, cross-tab synchronization, role helpers (`isAuthenticated`, `userRole`, `hasRole`), and logout functionality.
- **ToastContext** (`useContext` + `useToast` hook): Provides a centralized toast notification system with `success`, `error`, `warning`, and `info` methods for user feedback across all pages.

### Routing & Navigation
- **React Router v7** with nested route layout using `<Outlet />`
- **ProtectedRoute** component guards authenticated routes and enforces role-based access control
- **AppLayout** provides a responsive top navigation bar with role-aware menu items
- Public routes: `/auth/login`, `/auth/register`
- Protected routes: `/dashboard`, `/donor/profile` (Donor or donor-capable user), `/requests` (seek-capable roles), `/search` (seek-capable roles), `/notifications`, `/admin/users`, `/admin/requests`, `/admin/donors`

### Roles
- **Donor**: Can manage their donor profile and availability
- **Seeker**: Can create blood requests and search for donors
- **Hospital**: Can create blood requests and search for donors
- **Admin**: Can view all users, all requests, all donor profiles, and deactivate users

### Request And Contact Features
- Seekers and hospitals can create and manage blood requests
- Donors can browse compatible open requests and accept, decline, or withdraw their response
- Request owners can mark requests as fulfilled or cancelled
- Request screens show accepted donor responses and contact details when shared
- Donor search shows direct phone contact when the donor allows it
- If a donor hides their phone number, seekers can send an in-app contact request to the donor

## Recent Updates

- Completed donor response workflow for blood requests on web and mobile
- Added request status management for request owners (`Fulfilled` and `Cancelled`)
- Added richer request summaries with accepted donor response details
- Added donor contact options in search results
- Added in-app donor contact request flow when donor phone is hidden
- Updated product and implementation docs to match the current feature set

### UI Features
- Modern card-based layouts with Chakra UI v3
- Form validation with inline error messages on all forms
- Toast notifications for all success/error/warning states
- Responsive design with mobile hamburger menu
- Loading states and empty state placeholders
- Lazy-loaded pages with code splitting via `React.lazy`

## Local Setup

1. Start database:
   - `docker compose -f deployment/docker-compose.yml up -d`
2. Run API:
   - `dotnet run --project backend/BloodDonor.API/src/BloodDonor.Api/BloodDonor.Api.csproj`
3. Run frontend:
   - `cd frontend/blood-donor-web`
   - `npm install`
   - Ensure `VITE_API_URL` is set in `.env` if your API is not running on `https://localhost:7186`
   - `npm run dev`

Frontend env example:
- `frontend/blood-donor-web/.env.example`
- Default local API URL: `https://localhost:7186`

## Testing

- Backend build: `dotnet build BloodDonor.slnx`
- Application tests: `dotnet test backend/BloodDonor.API/tests/BloodDonor.Application.Tests/BloodDonor.Application.Tests.csproj`
- API integration tests: `dotnet test backend/BloodDonor.API/tests/BloodDonor.Api.IntegrationTests/BloodDonor.Api.IntegrationTests.csproj`
- Frontend build check: `npm run build` in `frontend/blood-donor-web`

## Notes

- The current backend includes auth, donor profile, request workflow, donor search, donor contact requests, in-app notifications, and admin listing/deactivation endpoints.
- The frontend provides a modern UI with role-based navigation, form validation, toast notifications, donor response workflows, hidden-phone donor contact requests, proper state management using React Context, and admin pages for users, requests, and donor profiles.
- For Oracle free-tier usage, keep PostgreSQL memory and connection settings conservative.
