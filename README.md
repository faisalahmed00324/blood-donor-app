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
- Protected routes: `/dashboard`, `/donor/profile` (Donor only), `/requests` (Seeker/Hospital), `/search` (Seeker/Hospital), `/notifications`

### Roles
- **Donor**: Can manage their donor profile and availability
- **Seeker**: Can create blood requests and search for donors
- **Hospital**: Can create blood requests and search for donors

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

- The current backend includes auth, donor profile, request workflow, donor search, and in-app notification pipeline.
- The frontend provides a modern UI with role-based navigation, form validation, toast notifications, and proper state management using React Context.
- For Oracle free-tier usage, keep PostgreSQL memory and connection settings conservative.
