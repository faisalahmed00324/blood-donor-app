# BloodConnect - Blood Donor Platform

## Requirements & Architecture Document

---

## 1. Project Overview

### Mission

Build a free, secure, and accessible online platform that connects blood donors with people in need, making it easy to find matching donors quickly — especially in emergencies.

### Vision

Become the most trusted and widely-used blood donor network, reducing preventable deaths caused by blood shortages through technology and community.

### Stakeholders

| Stakeholder          | Role                                            |
| -------------------- | ----------------------------------------------- |
| Donors               | Healthy individuals willing to donate blood     |
| Seekers              | Patients, families, or hospitals in need        |
| Hospitals/Blood Banks| Institutional partners listing inventory & needs|
| Admins               | Platform moderators and operators                |
| NGOs/Volunteers      | Organizations coordinating blood drives         |

---

## 2. Tech Stack

| Layer           | Technology                        | Justification                                                  |
| --------------- | --------------------------------- | -------------------------------------------------------------- |
| Backend API     | ASP.NET Core 10 Minimal API       | Lightweight, high-performance, low memory (~120MB)             |
| Frontend        | React 19 + Vite + TypeScript      | Fast SPA, served as static files via Nginx                     |
| Database        | PostgreSQL 16                     | Relational data, PostGIS for geospatial, low RAM (~100MB)      |
| ORM             | Entity Framework Core 10          | First-class PostgreSQL support via Npgsql                      |
| Authentication  | ASP.NET Identity + JWT            | No external dependency, secure                                 |
| Real-time       | SignalR (WebSocket)               | Built into ASP.NET, zero extra cost                            |
| Maps            | Leaflet.js + OpenStreetMap        | Completely free, no API billing                                |
| SMS             | Twilio free tier / local gateway  | OTP & urgent alerts                                            |
| Email           | Resend free tier / Gmail SMTP     | Transactional emails                                           |
| Reverse Proxy   | Nginx                             | Serves React static files + proxies API (~5MB RAM)             |
| CI/CD           | GitHub Actions                    | Free for public repos                                          |

### Infrastructure (Oracle Cloud Free Tier)

- **Server**: 1 x86 VM (1 CPU, 1GB RAM)
- **Storage**: 200GB block volume
- **Estimated RAM usage**: ~425MB (OS 200MB + .NET 120MB + PostgreSQL 100MB + Nginx 5MB)
- **Headroom**: ~575MB for spikes, caching, connections

---

## 3. User Roles & Permissions

| Feature                  | Donor | Seeker | Hospital | Admin |
| ------------------------ | ----- | ------ | -------- | ----- |
| Register / Login         | ✅    | ✅     | ✅       | ✅    |
| Create donor profile     | ✅    | ❌     | ❌       | ❌    |
| Search donors            | ❌    | ✅     | ✅       | ✅    |
| Create blood request     | ❌    | ✅     | ✅       | ✅    |
| Respond to request       | ✅    | ❌     | ❌       | ❌    |
| Manage blood drives      | ❌    | ❌     | ✅       | ✅    |
| Moderate users/content   | ❌    | ❌     | ❌       | ✅    |
| View analytics           | ❌    | ❌     | ❌       | ✅    |

---

## 4. Features by Phase

### Phase 1 — MVP

#### 4.1 User Registration & Authentication

- Email + password registration with role selection (Donor / Seeker)
- Email verification (confirmation link)
- Phone number with OTP verification
- Login with JWT tokens (access + refresh)
- Password reset flow
- Profile management (name, photo, contact info)

#### 4.2 Donor Profile Management

- Blood group selection (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Location (city, area + GPS coordinates via browser geolocation)
- Age, weight, gender
- Medical eligibility questionnaire (auto-screen based on standard criteria)
- Availability status: Available / Temporarily Unavailable / On Cooldown
- Auto-cooldown enforcement (56 days after donation for whole blood)
- Last donation date tracking
- Preferred contact method (call, SMS, in-app)
- Privacy controls (hide phone number until request accepted)

#### 4.3 Blood Request System

- **Urgent Request**: immediate need, triggers push/SMS to matching donors
- **Scheduled Request**: future date (e.g., planned surgery)
- Request fields:
  - Blood group needed
  - Units required
  - Hospital name & address
  - Patient name (optional, for reference)
  - Contact person name & phone
  - Urgency level: Critical / Urgent / Normal
  - Required by date
  - Additional notes
  - Prescription/document upload (image/PDF) for verification
- Request statuses: Open → Partially Fulfilled → Fulfilled → Expired → Cancelled
- Auto-expiry after configurable days (default: 7 days)
- Seeker can close/cancel request manually

#### 4.4 Smart Search & Matching

- Search donors by:
  - Blood group (exact match + compatible types)
  - Location radius (5km, 10km, 25km, 50km, city-wide)
  - Availability status
- Blood compatibility matching:
  - O- → universal donor (shown for all requests)
  - AB+ → universal recipient (can receive from all)
  - Full compatibility matrix enforced
- Sort results by: distance, last active, donation count
- Auto-notification: when a new request is created, all matching available donors within radius are notified

#### 4.5 Request Response Workflow

1. Donor receives notification of matching request
2. Donor views request details (hospital, urgency, units needed)
3. Donor accepts or declines
4. On accept → seeker is notified, contact info exchanged
5. After donation → donor marks as donated, cooldown starts
6. Seeker confirms donation received, request units updated

#### 4.6 Notifications

- In-app notification center (bell icon with unread count)
- Email notifications:
  - New matching blood request in your area
  - Your request has been accepted by a donor
  - Donation cooldown ended — you're eligible again
  - Welcome email on registration
- SMS notifications (urgent requests only, opt-in)
- Notification preferences page (toggle by type and channel)

#### 4.7 Blood Compatibility Guide & Education

- Interactive blood type compatibility chart
- Self-eligibility checker (questionnaire: age, weight, medications, recent tattoos, travel, etc.)
- FAQ section (myths vs facts about blood donation)
- Pre-donation and post-donation care tips
- Static content pages (About, How It Works, Contact)

#### 4.8 Basic Admin Panel

- Dashboard with key metrics (total donors, active requests, fulfillment rate)
- User list with search/filter, ability to suspend/ban
- Request moderation queue (flagged/reported requests)
- Content management for FAQ/articles

#### 4.9 Non-Functional (MVP)

- Mobile-responsive design (mobile-first)
- Page load < 3 seconds on 3G
- API response < 200ms (p95)
- HTTPS everywhere
- Input validation & sanitization
- Rate limiting on auth endpoints
- CORS properly configured

---

### Phase 2 — Enhanced Platform

#### 4.10 In-App Messaging

- Chat between seeker and donor (after donor expresses interest)
- No phone number exposure until mutual consent
- Message history preserved per request

#### 4.11 Blood Drive / Camp Management

- Create blood donation events (title, date, time, venue, organizer, target units)
- Event listing page with map view
- Donor RSVP / registration
- Event reminders (1 day before, 2 hours before)
- Post-event summary (units collected, donors participated)

#### 4.12 Gamification & Donor Retention

- Badges: First Donation, 5 Donations, 10 Donations, Rare Blood Hero, Lifesaver
- Donation streak tracking
- Shareable donation certificates (PDF generation)
- Thank-you notes from seekers
- Social media sharing ("I donated blood today!")
- Optional public leaderboard (top donors by city, opt-in)

#### 4.13 Hospital & Blood Bank Directory

- Verified hospital/blood bank listings
- Contact info, address, map pin
- Admin-approved submissions
- Donor ratings/reviews of hospitals

#### 4.14 Donation History & Records

- Full donation history for donors (date, hospital, request, certificate)
- Health tracking (hemoglobin levels if entered)
- Exportable records (PDF)

---

### Phase 3 — Scale & Integrate

#### 4.15 Hospital Integration API

- REST API for hospitals to:
  - Post blood shortage alerts
  - Query available donors
  - Update inventory levels
- API key authentication
- Webhook support for real-time updates

#### 4.16 Advanced Analytics Dashboard (Admin)

- Donors by blood type & region (heat map)
- Request fulfillment rate & average response time
- Most in-demand blood types by area
- Donor retention & churn metrics
- Seasonal trends analysis
- Exportable reports (CSV, PDF)

#### 4.17 Multi-Language Support

- i18n framework (react-intl or i18next)
- Initial languages: English, Hindi, Bengali (configurable)
- RTL support ready

#### 4.18 PWA & Offline Support

- Service worker for offline access
- Push notifications via Web Push API
- Installable on mobile home screen

#### 4.19 Bot Integrations

- WhatsApp bot for blood requests & donor search
- Telegram bot
- SMS-based interaction for feature phones

---

## 5. Data Model

### Entity Relationship Overview

```
User (1) ──── (1) DonorProfile
User (1) ──── (N) BloodRequest        [as seeker]
User (1) ──── (N) RequestResponse     [as donor]
User (1) ──── (N) DonationRecord
User (1) ──── (N) Notification
BloodRequest (1) ──── (N) RequestResponse
BloodRequest (1) ──── (N) DonationRecord
Hospital (1) ──── (N) BloodRequest
Hospital (1) ──── (N) DonationRecord
BloodDrive (N) ──── (1) User           [as organizer]
BloodDrive (N) ──── (N) User           [as attendees]
```

### Entity Definitions

#### Users

| Column          | Type         | Constraints              |
| --------------- | ------------ | ------------------------ |
| Id              | UUID         | PK                       |
| Email           | varchar(255) | Unique, Not Null         |
| PasswordHash    | varchar(512) | Not Null                 |
| FullName        | varchar(100) | Not Null                 |
| Phone           | varchar(20)  | Unique                   |
| Role            | enum         | Donor, Seeker, Hospital, Admin |
| AvatarUrl       | varchar(500) | Nullable                 |
| IsEmailVerified | bool         | Default false            |
| IsPhoneVerified | bool         | Default false            |
| IsActive        | bool         | Default true             |
| CreatedAt       | timestamp    | Not Null                 |
| UpdatedAt       | timestamp    | Not Null                 |

#### DonorProfiles

| Column                 | Type           | Constraints                      |
| ---------------------- | -------------- | -------------------------------- |
| Id                     | UUID           | PK                               |
| UserId                 | UUID           | FK → Users, Unique               |
| BloodGroup             | enum           | A+, A-, B+, B-, AB+, AB-, O+, O-|
| DateOfBirth            | date           | Not Null                         |
| Gender                 | enum           | Male, Female, Other              |
| Weight                 | decimal        | Kg, min 50                       |
| Latitude               | decimal(10,7)  | Not Null                         |
| Longitude              | decimal(10,7)  | Not Null                         |
| City                   | varchar(100)   | Not Null                         |
| Area                   | varchar(200)   | Nullable                         |
| AvailabilityStatus     | enum           | Available, Unavailable, Cooldown |
| LastDonationDate       | date           | Nullable                         |
| CooldownUntilDate      | date           | Nullable (auto-calculated)       |
| PreferredContactMethod | enum           | Call, SMS, InApp                 |
| IsPhoneVisible         | bool           | Default false                    |
| MedicalNotes           | text           | Nullable (private)               |
| TotalDonations         | int            | Default 0                        |
| CreatedAt              | timestamp      | Not Null                         |
| UpdatedAt              | timestamp      | Not Null                         |

#### BloodRequests

| Column             | Type           | Constraints                                    |
| ------------------ | -------------- | ---------------------------------------------- |
| Id                 | UUID           | PK                                             |
| SeekerId           | UUID           | FK → Users                                     |
| BloodGroup         | enum           | Required                                       |
| UnitsNeeded        | int            | Min 1                                          |
| UnitsFulfilled     | int            | Default 0                                      |
| UrgencyLevel       | enum           | Critical, Urgent, Normal                       |
| RequestType        | enum           | Urgent, Scheduled                              |
| PatientName        | varchar(100)   | Nullable                                       |
| HospitalName       | varchar(200)   | Not Null                                       |
| HospitalAddress    | varchar(500)   | Not Null                                       |
| Latitude           | decimal(10,7)  | Not Null                                       |
| Longitude          | decimal(10,7)  | Not Null                                       |
| ContactPersonName  | varchar(100)   | Not Null                                       |
| ContactPersonPhone | varchar(20)    | Not Null                                       |
| RequiredByDate     | date           | Not Null                                       |
| Notes              | text           | Nullable                                       |
| PrescriptionUrl    | varchar(500)   | Nullable                                       |
| Status             | enum           | Open, PartiallyFulfilled, Fulfilled, Expired, Cancelled |
| ExpiresAt          | timestamp      | Not Null                                       |
| CreatedAt          | timestamp      | Not Null                                       |
| UpdatedAt          | timestamp      | Not Null                                       |

#### RequestResponses

| Column      | Type      | Constraints                                        |
| ----------- | --------- | -------------------------------------------------- |
| Id          | UUID      | PK                                                 |
| RequestId   | UUID      | FK → BloodRequests                                 |
| DonorId     | UUID      | FK → Users                                         |
| Status      | enum      | Pending, Accepted, Declined, Completed, Withdrawn  |
| RespondedAt | timestamp | Not Null                                           |
| CompletedAt | timestamp | Nullable                                           |
| Notes       | text      | Nullable                                           |

#### DonationRecords

| Column         | Type         | Constraints                    |
| -------------- | ------------ | ------------------------------ |
| Id             | UUID         | PK                             |
| DonorId        | UUID         | FK → Users                     |
| RequestId      | UUID         | FK → BloodRequests, Nullable   |
| HospitalId     | UUID         | FK → Hospitals, Nullable       |
| DonatedAt      | date         | Not Null                       |
| UnitsDonated   | int          | Default 1                      |
| CertificateUrl | varchar(500) | Nullable                       |
| CreatedAt      | timestamp    | Not Null                       |

#### Hospitals

| Column     | Type           | Constraints      |
| ---------- | -------------- | ---------------- |
| Id         | UUID           | PK               |
| Name       | varchar(200)   | Not Null         |
| Address    | varchar(500)   | Not Null         |
| Phone      | varchar(20)    | Not Null         |
| Email      | varchar(255)   | Nullable         |
| Latitude   | decimal(10,7)  | Not Null         |
| Longitude  | decimal(10,7)  | Not Null         |
| City       | varchar(100)   | Not Null         |
| IsVerified | bool           | Default false    |
| CreatedAt  | timestamp      | Not Null         |

#### BloodDrives

| Column         | Type           | Constraints                              |
| -------------- | -------------- | ---------------------------------------- |
| Id             | UUID           | PK                                       |
| OrganizerId    | UUID           | FK → Users                               |
| Title          | varchar(200)   | Not Null                                 |
| Description    | text           | Nullable                                 |
| EventDate      | timestamp      | Not Null                                 |
| EndDate        | timestamp      | Not Null                                 |
| Venue          | varchar(300)   | Not Null                                 |
| Latitude       | decimal(10,7)  | Not Null                                 |
| Longitude      | decimal(10,7)  | Not Null                                 |
| TargetUnits    | int            | Not Null                                 |
| CollectedUnits | int            | Default 0                                |
| Status         | enum           | Upcoming, Ongoing, Completed, Cancelled  |
| CreatedAt      | timestamp      | Not Null                                 |

#### BloodDriveAttendees

| Column       | Type      | Constraints              |
| ------------ | --------- | ------------------------ |
| Id           | UUID      | PK                       |
| BloodDriveId | UUID      | FK → BloodDrives         |
| DonorId      | UUID      | FK → Users               |
| RsvpStatus   | enum      | Going, Maybe, NotGoing   |
| AttendedAt   | timestamp | Nullable                 |

#### Notifications

| Column    | Type         | Constraints                                          |
| --------- | ------------ | ---------------------------------------------------- |
| Id        | UUID         | PK                                                   |
| UserId    | UUID         | FK → Users                                           |
| Type      | enum         | BloodRequest, RequestAccepted, CooldownEnded, General|
| Title     | varchar(200) | Not Null                                             |
| Message   | text         | Not Null                                             |
| ActionUrl | varchar(500) | Nullable                                             |
| IsRead    | bool         | Default false                                        |
| Channel   | enum         | InApp, Email, SMS                                    |
| CreatedAt | timestamp    | Not Null                                             |

---

## 6. API Endpoints (MVP)

### Authentication

| Method | Endpoint                    | Description                |
| ------ | --------------------------- | -------------------------- |
| POST   | /api/auth/register          | Register new user          |
| POST   | /api/auth/login             | Login, returns JWT         |
| POST   | /api/auth/refresh           | Refresh access token       |
| POST   | /api/auth/forgot-password   | Send password reset email  |
| POST   | /api/auth/reset-password    | Reset password with token  |
| POST   | /api/auth/verify-email      | Verify email with token    |
| POST   | /api/auth/send-otp          | Send phone OTP             |
| POST   | /api/auth/verify-otp        | Verify phone OTP           |

### Donor Profile

| Method | Endpoint                    | Description                                     |
| ------ | --------------------------- | ----------------------------------------------- |
| GET    | /api/donors/me              | Get my donor profile                            |
| PUT    | /api/donors/me              | Update my donor profile                         |
| PUT    | /api/donors/me/availability | Toggle availability                             |
| GET    | /api/donors/me/history      | My donation history                             |
| GET    | /api/donors/search          | Search donors (by blood group, location, radius) |
| GET    | /api/donors/{id}            | Get donor public profile                        |

### Blood Requests

| Method | Endpoint                           | Description                   |
| ------ | ---------------------------------- | ----------------------------- |
| POST   | /api/requests                      | Create blood request          |
| GET    | /api/requests                      | List requests (with filters)  |
| GET    | /api/requests/{id}                 | Get request details           |
| PUT    | /api/requests/{id}                 | Update request                |
| PUT    | /api/requests/{id}/cancel          | Cancel request                |
| POST   | /api/requests/{id}/respond         | Donor responds to request     |
| PUT    | /api/requests/{id}/responses/{rid} | Update response status        |
| GET    | /api/requests/my                   | My created requests (seeker)  |
| GET    | /api/requests/my-responses         | My responses (donor)          |

### Donations

| Method | Endpoint         | Description          |
| ------ | ---------------- | -------------------- |
| POST   | /api/donations   | Record a donation    |
| GET    | /api/donations/my| My donation records  |

### Notifications

| Method | Endpoint                         | Description      |
| ------ | -------------------------------- | ---------------- |
| GET    | /api/notifications               | My notifications |
| PUT    | /api/notifications/{id}/read     | Mark as read     |
| PUT    | /api/notifications/read-all      | Mark all as read |
| GET    | /api/notifications/unread-count  | Unread count     |

### Hospitals

| Method | Endpoint            | Description      |
| ------ | ------------------- | ---------------- |
| GET    | /api/hospitals      | List hospitals   |
| GET    | /api/hospitals/{id} | Hospital details |

### Admin

| Method | Endpoint                         | Description                   |
| ------ | -------------------------------- | ----------------------------- |
| GET    | /api/admin/dashboard             | Dashboard stats               |
| GET    | /api/admin/users                 | List users (with filters)     |
| PUT    | /api/admin/users/{id}/suspend    | Suspend user                  |
| PUT    | /api/admin/users/{id}/activate   | Activate user                 |
| GET    | /api/admin/requests              | All requests (moderation)     |
| PUT    | /api/admin/requests/{id}/flag    | Flag request                  |

### Static Content

| Method | Endpoint                     | Description                      |
| ------ | ---------------------------- | -------------------------------- |
| GET    | /api/content/faq             | FAQ list                         |
| GET    | /api/content/eligibility     | Eligibility criteria             |
| GET    | /api/content/compatibility   | Blood compatibility chart data   |

---

## 7. Security & Privacy

### Authentication & Authorization

- Passwords hashed with bcrypt (min 12 rounds)
- JWT access tokens (15 min expiry) + refresh tokens (7 days, stored in HttpOnly cookie)
- Role-based authorization on all endpoints
- Rate limiting: 5 login attempts per 15 min per IP
- Account lockout after 10 failed attempts

### Data Privacy

- Donor phone numbers hidden until request is accepted by donor
- Personal medical info (weight, medical notes) never exposed via API to other users
- GDPR-compliant: users can export and delete their data
- Data encryption at rest (PostgreSQL TDE or disk encryption)
- All traffic over HTTPS (Let's Encrypt)
- Input sanitization against XSS and SQL injection (EF Core parameterized queries)

### Infrastructure Security

- Nginx as reverse proxy (no direct .NET exposure)
- Firewall: only ports 80, 443, 22 open
- SSH key-only authentication
- PostgreSQL bound to localhost only
- Regular automated backups (pg_dump to object storage)
- Fail2ban for SSH brute force protection

---

## 8. Project Structure

```
blood_doner_app/
├── REQUIREMENTS.md
├── docker-compose.yml              # Local dev environment
│
├── backend/
│   └── BloodDonor.API/
│       ├── BloodDonor.API.csproj
│       ├── Program.cs              # Minimal API setup
│       ├── appsettings.json
│       ├── Data/
│       │   ├── AppDbContext.cs
│       │   └── Migrations/
│       ├── Entities/
│       │   ├── User.cs
│       │   ├── DonorProfile.cs
│       │   ├── BloodRequest.cs
│       │   ├── RequestResponse.cs
│       │   ├── DonationRecord.cs
│       │   ├── Hospital.cs
│       │   ├── Notification.cs
│       │   └── Enums/
│       ├── Features/
│       │   ├── Auth/
│       │   ├── Donors/
│       │   ├── Requests/
│       │   ├── Notifications/
│       │   └── Admin/
│       ├── Services/
│       │   ├── JwtService.cs
│       │   ├── EmailService.cs
│       │   ├── SmsService.cs
│       │   ├── NotificationService.cs
│       │   └── GeoService.cs
│       ├── Middleware/
│       │   ├── ExceptionHandler.cs
│       │   └── RateLimiting.cs
│       └── Hubs/
│           └── NotificationHub.cs  # SignalR
│
├── frontend/
│   └── blood-donor-web/
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── index.html
│       ├── public/
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── api/                # API client (axios/fetch)
│           ├── components/         # Reusable UI components
│           ├── pages/
│           │   ├── Home/
│           │   ├── Auth/           # Login, Register, ForgotPassword
│           │   ├── Dashboard/      # Donor/Seeker dashboard
│           │   ├── DonorProfile/
│           │   ├── SearchDonors/
│           │   ├── BloodRequests/
│           │   ├── Notifications/
│           │   ├── Education/      # FAQ, Eligibility, Compatibility
│           │   └── Admin/
│           ├── hooks/
│           ├── context/            # Auth context, theme
│           ├── types/
│           ├── utils/
│           └── assets/
│
└── deployment/
    ├── nginx.conf
    ├── Dockerfile.api
    ├── Dockerfile.web
    └── setup.sh                    # Oracle free tier setup script
```

---

## 9. MVP Development Milestones

| Milestone                | Duration (est.) | Deliverable                                              |
| ------------------------ | --------------- | -------------------------------------------------------- |
| M1: Project Setup        | 2-3 days        | Repo, .NET project, React project, Docker, DB schema, CI |
| M2: Auth System          | 3-4 days        | Register, login, JWT, email verify, OTP                  |
| M3: Donor Profiles       | 2-3 days        | CRUD profile, location, availability, eligibility        |
| M4: Blood Requests       | 3-4 days        | Create/manage requests, status workflow                  |
| M5: Search & Matching    | 2-3 days        | Geo search, blood compatibility, auto-notify             |
| M6: Notifications        | 2-3 days        | In-app + email + SMS notifications                       |
| M7: Frontend Pages       | 5-7 days        | All MVP pages, responsive design                         |
| M8: Admin Panel          | 2-3 days        | Dashboard, user mgmt, request moderation                 |
| M9: Education Pages      | 1-2 days        | FAQ, eligibility checker, compatibility chart            |
| M10: Testing & Deploy    | 3-4 days        | Integration tests, Oracle deployment, SSL                |
| **Total**                | **~25-35 days** | **Production MVP**                                       |
