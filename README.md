# Blood Donor App

This repository contains a low-resource MVP implementation of BloodConnect using:

- Backend: ASP.NET Core 10 Minimal API with clean architecture boundaries
- Frontend: React 19 + Vite + TypeScript + Chakra UI
- Database: PostgreSQL 16 (Docker for local development)

## Structure

- `backend/BloodDonor.API/src/BloodDonor.Api`
- `backend/BloodDonor.API/src/BloodDonor.Application`
- `backend/BloodDonor.API/src/BloodDonor.Domain`
- `backend/BloodDonor.API/src/BloodDonor.Infrastructure`
- `backend/BloodDonor.API/tests`
- `frontend/blood-donor-web`
- `deployment`

## Local Setup

1. Start database:
   - `docker compose -f deployment/docker-compose.yml up -d`
2. Run API:
   - `dotnet run --project backend/BloodDonor.API/src/BloodDonor.Api/BloodDonor.Api.csproj`
3. Run frontend:
   - `cd frontend/blood-donor-web`
   - `npm install`
   - `npm run dev`

## Testing

- Backend build: `dotnet build BloodDonor.slnx`
- Application tests: `dotnet test backend/BloodDonor.API/tests/BloodDonor.Application.Tests/BloodDonor.Application.Tests.csproj`
- API integration tests: `dotnet test backend/BloodDonor.API/tests/BloodDonor.Api.IntegrationTests/BloodDonor.Api.IntegrationTests.csproj`
- Frontend build check: `npm run build` in `frontend/blood-donor-web`

## Notes

- The current backend includes auth, donor profile, request workflow, donor search, and in-app notification pipeline.
- The frontend provides initial pages for auth, donor profile, requests, search, notifications, and dashboard.
- For Oracle free-tier usage, keep PostgreSQL memory and connection settings conservative.
