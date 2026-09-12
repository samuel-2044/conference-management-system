# Conference Management System

A full-stack conference management system built with React, TypeScript, and Tailwind CSS, with a Cloudflare Workers backend (Cloudflare D1 database, Cloudflare R2 storage) deployed on Cloudflare Pages. This application helps universities manage conferences from planning to execution.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database Design](#database-design)
- [API Documentation](#api-documentation)
- [Development Workflow](#development-workflow)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Section B — Course Requirements & Group Deliverables](#section-b--course-requirements--group-deliverables)
- [License](#license)

---

## Project Overview

The Conference Management System is a web application that allows users to:

- **Manage Conferences**: Create, update, and track conferences
- **Manage Speakers**: Add and organize speakers for conferences
- **Manage Attendees**: Track registrations and attendance
- **Manage Venues**: Organize venues and room bookings
- **Schedule Sessions**: Create and manage conference sessions
- **Handle Documents**: Upload and organize conference documents
- **Generate Reports**: View registration and attendance reports

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Backend | Cloudflare Workers, TypeScript |
| Database | Cloudflare D1 (SQLite-based serverless) via Drizzle ORM |
| Storage | Cloudflare R2 (file/document storage & image URLs) |
| Hosting | Cloudflare Pages (frontend) + Cloudflare Workers (backend/API) |
| UI Components | Radix UI primitives |
| State Management | TanStack React Query |
| Routing | Wouter |
| Logging | Pino |
| Build Tool | esbuild (Backend), Vite (Frontend) |
| Deployment | Wrangler CLI, GitHub Actions CI/CD |

---

## Prerequisites

Before you begin, ensure you have the following tools installed on your system:

### Required Tools

1. **Node.js** (version 20 or higher)
2. **npm** (version 10 or higher, comes with Node.js)
3. **Git** (version 2.0 or higher)

### Verify Your Installations

Open your terminal (VS Code integrated terminal or system terminal) and run:

```bash
# Check Node.js version
node -v
# Expected output: v20.x.x or higher

# Check npm version
npm -v
# Expected output: 10.x.x or higher

# Check Git version
git --version
# Expected output: git version 2.x.x or higher
```

### Installing Node.js and npm

If Node.js is not installed:

**macOS (using Homebrew):**
```bash
brew install node
```

**Windows:**
1. Download the installer from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the prompts

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install nodejs npm
```

### Installing Git

**macOS:**
```bash
brew install git
```

**Windows:**
1. Download from [git-scm.com](https://git-scm.com/)
2. Run the installer

**Linux:**
```bash
sudo apt install git
```

---

## Getting Started

### Cloning the Repository

```bash
# Clone the repository
git clone https://github.com/samuel-2044/conference-management-system.git

# Navigate into the project directory
cd conference-management-system
```

### Installing Dependencies

```bash
# Install Backend dependencies
cd Backend && npm install && cd ..

# Install Frontend dependencies
cd Frontend && npm install && cd ..
```

### Running the Project

Open two terminal windows in VS Code:

**Terminal 1 - Backend:**
```bash
cd Backend && npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Frontend && npm run dev
```

### Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| Frontend (prod) | https://convene.pages.dev | React application (Cloudflare Pages) |
| Backend API (prod) | https://api.convene.pages.dev | Cloudflare Workers API server |
| API Health Check | https://api.convene.pages.dev/api/healthz | Health endpoint |
| Frontend (local) | http://localhost:5173 | React application |
| Backend API (local) | http://localhost:3000 | API server (via `npm run dev` or `wrangler dev`) |
| API Health Check (local) | http://localhost:3000/api/healthz | Health endpoint |

---

## Project Structure

```
conference-management-system/
├── Frontend/                          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                   # Reusable UI components (Radix UI)
│   │   │   └── error-boundary.tsx    # Error handling component
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # Utility functions
│   │   ├── pages/                    # Page components
│   │   ├── App.tsx                   # Main application component
│   │   ├── main.tsx                  # Application entry point
│   │   └── index.css                 # Global styles (Tailwind)
│   ├── lib/
│   │   └── api-client-react/         # API client library
│   ├── public/                       # Static assets
│   ├── index.html                    # HTML entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── Backend/                          # Express backend application
│   ├── src/
│   │   ├── routes/
│   │   │   ├── index.ts              # Route aggregation
│   │   │   ├── health.ts             # Health check endpoint
│   │   │   └── conference.ts         # Main API routes
│   │   ├── lib/
│   │   │   └── logger.ts             # Pino logger configuration
│   │   ├── storage/
│   │   │   └── r2.ts                 # Cloudflare R2 storage helpers
│   │   ├── app.ts                    # Express app configuration
│   │   └── index.ts                  # Server entry point
│   ├── lib/
│   │   ├── api-zod/                  # Zod schema definitions
│   │   ├── db/                       # Database schema and config
│   │   └── api-spec/                 # OpenAPI specification
│   ├── migrations/                   # SQL migration files
│   ├── build.mjs                     # esbuild configuration
│   ├── package.json
│   └── tsconfig.json
│
├── package.json                      # Root workspace configuration
├── README.md                         # This file
└── .gitignore
```

---

## Database Design

The system uses PostgreSQL as its database with Drizzle ORM for database operations.

### Entity Relationship Diagram

```
                         ┌──────────────┐
                         │    ROLES     │
                         ├──────────────┤
                         │ role_id PK   │
                         │ role_name    │
                         │ created_at   │
                         └──────┬───────┘
                                │
                              1 │
                                │ *
                         ┌──────▼───────┐
                         │    USERS     │
                         ├──────────────┤
                         │ user_id PK   │
                         │ role_id FK   │
                         │ name         │
                         │ email        │
                         │ password_hash│
                         │ phone        │
                         │ avatar_url   │
                         │ created_at   │
                         └──┬────────┬──┘
                            │        │
                          1 │        │ 1
                            │        │
                       ┌────▼───┐ ┌─▼──────────┐
                       │SPEAKERS│ │ ATTENDEES  │
                       ├────────┤ ├────────────┤
                       │speaker_│ │attendee_id │
                       │  id PK │ │  PK        │
                       │user_id │ │user_id FK  │
                       │  FK    │ │created_at  │
                       │bio     │ └─────┬──────┘
                       │photo_  │       │
                       │  url   │       │
                       └────┬───┘       │
                            │           │
                            │           │
                            │           │ *
                            │           ▼
                            │    ┌──────────────────┐
                            │    │CONFERENCE_ATTENDEES
                            │    ├──────────────────┤
                            │    │ id PK            │
                            │    │ attendee_id FK   │
                            │    │ conference_id FK │
                            │    │ registration_date│
                            │    │ status           │
                            │    └────────┬─────────┘
                            │             │
                            │             │ *
                            │             ▼
                            │      ┌─────────────┐
                            └─────►│  SESSIONS   │
                                   ├─────────────┤
                                   │ session_id  │
                                   │  PK         │
                                   │ conference_ │
                                   │  id FK      │
                                   │ venue_id FK │
                                   │ title       │
                                   │ description │
                                   │ start_time  │
                                   │ end_time    │
                                   │ created_at  │
                                   └──────┬──────┘
                                          │
                         ┌────────────────┼───────────────┐
                         │                │               │
                         ▼                ▼               ▼
                  ┌────────────┐   ┌────────────┐  ┌─────────────┐
                  │ CONFERENCES│   │   VENUES   │  │ATTENDEE_    │
                  ├────────────┤   ├────────────┤  │SESSIONS     │
                  │conference_ │   │ venue_id PK│  ├─────────────┤
                  │  id PK     │   │conference_ │  │ id PK       │
                  │ title      │   │  id FK     │  │ attendee_id │
                  │description │   │ name       │  │  FK         │
                  │ start_date │   │ building   │  │ session_id  │
                  │ end_date   │   │ room       │  │  FK         │
                  │ created_by │   │ capacity   │  │ registered_at│
                  │ created_at │   │ created_at │  │ checked_in_at│
                  └────────────┘   └────────────┘  │ status      │
                                                  └─────────────┘

                  ┌─────────────────┐
                  │ SESSION_SPEAKERS│
                  ├─────────────────┤
                  │ id PK           │
                  │ session_id FK   │
                  │ speaker_id FK   │
                  │ speaker_role    │
                  │ created_at      │
                  └─────────────────┘

                  ┌─────────────────┐
                  │   DOCUMENTS     │
                  ├─────────────────┤
                  │ id PK           │
                  │ user_id FK      │
                  │ conference_id FK│
                  │ session_id FK   │
                  │ type            │
                  │ file_key        │
                  │ file_url        │
                  │ file_name       │
                  │ file_size       │
                  │ content_type    │
                  │ created_at      │
                  └─────────────────┘
```

### Table Descriptions

#### roles
Stores the system's available user roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | Unique role ID |
| name | TEXT | NOT NULL, UNIQUE | Role name (admin, organiser, speaker, attendee) |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

#### users
The central authentication/user table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | Unique user ID |
| role_id | TEXT | NOT NULL, FK → roles(id) | User's role |
| name | TEXT | NOT NULL | Full name |
| email | TEXT | NOT NULL, UNIQUE | Login email |
| password_hash | TEXT | - | Hashed password |
| phone | TEXT | - | Phone number |
| avatar_url | TEXT | - | Profile image URL |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Account creation time |

#### conferences
Represents each conference/event.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | Unique conference ID |
| title | TEXT | NOT NULL | Conference name |
| description | TEXT | DEFAULT '' | Conference description |
| start_date | TEXT | NOT NULL | Conference start date |
| end_date | TEXT | NOT NULL | Conference end date |
| created_by | TEXT | FK → users(id) | Organizer who created it |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

#### venues
Stores physical locations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | Unique venue ID |
| conference_id | TEXT | NOT NULL, FK → conferences(id) | Conference using venue |
| name | TEXT | NOT NULL | Venue name |
| building | TEXT | DEFAULT '' | Building name |
| room | TEXT | DEFAULT '' | Room number/name |
| capacity | INTEGER | DEFAULT 0 | Maximum capacity |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

#### sessions
The actual conference timetable.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | Unique session ID |
| conference_id | TEXT | NOT NULL, FK → conferences(id) | Conference |
| venue_id | TEXT | FK → venues(id) | Where session occurs |
| title | TEXT | NOT NULL | Session title |
| description | TEXT | DEFAULT '' | Session description |
| start_time | TEXT | NOT NULL | Starting date/time |
| end_time | TEXT | NOT NULL | Ending date/time |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

#### speakers
Speaker profiles linked to users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | Speaker profile ID |
| user_id | TEXT | FK → users(id) | Related user account |
| bio | TEXT | DEFAULT '' | Speaker biography |
| photo_url | TEXT | - | Speaker photo URL |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Profile creation time |

#### attendees
Attendee profiles linked to users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | Attendee profile ID |
| user_id | TEXT | NOT NULL, FK → users(id) | Related user account |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Profile creation time |

#### conference_attendees
Junction table for attendee conference registrations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | Unique registration ID |
| attendee_id | TEXT | NOT NULL, FK → attendees(id) | Attendee |
| conference_id | TEXT | NOT NULL, FK → conferences(id) | Conference |
| registration_date | TEXT | DEFAULT CURRENT_TIMESTAMP | Registration time |
| status | TEXT | DEFAULT 'pending' | pending, confirmed, cancelled |

#### attendee_sessions
Junction table for attendee session registrations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | Unique record ID |
| attendee_id | TEXT | NOT NULL, FK → attendees(id) | Attendee |
| session_id | TEXT | NOT NULL, FK → sessions(id) | Session |
| registered_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Session registration time |
| checked_in_at | TEXT | - | Actual session check-in |
| status | TEXT | DEFAULT 'registered' | registered, attended, cancelled, no_show |

#### session_speakers
Junction table for session-speaker assignments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | Unique assignment ID |
| session_id | TEXT | NOT NULL, FK → sessions(id) | Session |
| speaker_id | TEXT | NOT NULL, FK → speakers(id) | Speaker |
| speaker_role | TEXT | DEFAULT 'speaker' | keynote, speaker, panelist, moderator |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Assignment time |

#### documents
Uploaded files and documents.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | Unique document ID |
| user_id | TEXT | NOT NULL, FK → users(id) | Uploader |
| conference_id | TEXT | FK → conferences(id) | Associated conference |
| session_id | TEXT | FK → sessions(id) | Associated session |
| type | TEXT | NOT NULL | Document type |
| file_key | TEXT | NOT NULL | Storage key |
| file_url | TEXT | - | Access URL |
| file_name | TEXT | NOT NULL | Original filename |
| file_size | INTEGER | DEFAULT 0 | File size in bytes |
| content_type | TEXT | DEFAULT 'application/octet-stream' | MIME type |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Upload timestamp |

#### permissions & role_permissions
Role-based access control system.

**permissions table:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | TEXT | PRIMARY KEY | Unique permission ID |
| name | TEXT | NOT NULL, UNIQUE | Permission name |
| description | TEXT | - | Permission description |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**role_permissions table:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| role_id | TEXT | NOT NULL, FK → roles(id) | Reference to role |
| permission_id | TEXT | NOT NULL, FK → permissions(id) | Reference to permission |
| - | - | PRIMARY KEY (role_id, permission_id) | Composite primary key |

---

## API Documentation

### Base URL
```
https://api.convene.pages.dev/api
```

### Endpoints

#### Health Check
```
GET /api/healthz
```

#### Dashboard
```
GET /api/dashboard/summary
GET /api/reports/registration
GET /api/reports/attendance
```

#### Conferences
```
GET    /api/conferences
POST   /api/conferences
GET    /api/conferences/:conferenceId
PATCH  /api/conferences/:conferenceId
DELETE /api/conferences/:conferenceId
```

#### Venues
```
GET    /api/venues
POST   /api/venues
PATCH  /api/venues/:venueId
DELETE /api/venues/:venueId
```

#### Sessions
```
GET    /api/sessions
POST   /api/sessions
PATCH  /api/sessions/:sessionId
DELETE /api/sessions/:sessionId
```

#### Speakers
```
GET    /api/speakers
POST   /api/speakers
PATCH  /api/speakers/:speakerId
DELETE /api/speakers/:speakerId
```

#### Attendees
```
GET    /api/attendees
POST   /api/attendees
```

#### Attendee Sessions
```
POST   /api/attendee-sessions/register
POST   /api/attendee-sessions/:attendeeSessionId/check-in
```

#### Session Speakers
```
POST   /api/session-speakers
DELETE /api/session-speakers/:sessionSpeakerId
```

#### Documents
```
GET    /api/documents
```

---

## Development Workflow

### Git Workflow

We use a feature branch workflow:

1. **Get latest changes:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

4. **Push changes:**
   ```bash
   git push -u origin feature/your-feature-name
   ```

5. **Create Pull Request on GitHub**

### Branch Naming Conventions

| Prefix | Use Case | Example |
|--------|----------|---------|
| `feature/` | New features | `feature/add-search` |
| `bugfix/` | Bug fixes | `bugfix/fix-login-error` |
| `hotfix/` | Critical fixes | `hotfix/fix-security-issue` |
| `refactor/` | Code refactoring | `refactor/cleanup-api` |
| `docs/` | Documentation | `docs/update-readme` |

### Commit Message Guidelines

```
<type>: <description>
```

**Types:** feat, fix, docs, style, refactor, test, chore

---

## Environment Variables

### Backend (`Backend/.dev.vars` / Cloudflare Worker bindings)
```env
NODE_ENV=development
# Cloudflare D1 binding is configured in wrangler.json (no DATABASE_URL needed locally)
# Cloudflare R2 binding is configured in wrangler.json
```

### Frontend (.env)
```env
VITE_API_URL=https://api.convene.pages.dev
```

---

## Deployment

### Cloudflare Configuration

The production deployment uses the **Convene** domain (`convene.pages.dev`):

| Resource | Provider Service | Purpose |
|----------|------------------|---------|
| `convene.pages.dev` | Cloudflare Pages | Frontend hosting (React SPA) |
| `api.convene.pages.dev` | Cloudflare Workers (Pages Function) | Backend API |
| `CONFERENCE_DB` | Cloudflare D1 | SQL database (SQLite-compatible) |
| `CONFERENCE_IMAGES` | Cloudflare R2 | Image/document storage & signed URLs |

### Production Deployment Flow

1. **Push** to the `main` branch triggers the GitHub Actions CI/CD pipeline.
2. **Build** the frontend (`Frontend/`) and backend (`Backend/`) via Vite and esbuild.
3. **Deploy frontend** to Cloudflare Pages at `convene.pages.dev`.
4. **Deploy backend** as a Cloudflare Worker with D1 and R2 bindings.
5. **Migrate database** using DrizzleKit `db push` against the D1 instance.

### Local Development / Preview

- `npm run dev` (in `Backend/`) — runs the Worker via `wrangler dev` with a local D1 database.
- `npm run dev` (in `Frontend/`) — runs the Vite dev server against the local/Preview API.

---

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

### Node Modules Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
```bash
npm run typecheck
rm -rf dist/
npm run build
```

---

# Section B — Course Requirements & Group Deliverables

This section addresses the teacher's task for **Task 2**: Requirements Analysis, Work Plan, Tool/Technique agreement, and Task Subdivision among group members.

---

## 1. Problem Statement & Proposed Solution

**Problem:** Conference organizers (universities, departments) struggle to manage conferences efficiently — juggling speaker coordination, attendee registration, session scheduling, venue booking, and document distribution across disconnected tools and spreadsheets, leading to double bookings, missed communications, and poor visibility.

**Proposed Solution:** **Convene** is an all-in-one conference management web application (deployed at `convene.pages.dev`) that lets organizers create and track conferences, manage speakers and attendees, schedule sessions into venues, handle document uploads to cloud storage, and generate attendance/registration reports — all in a single, centralized, role-based platform.

---

## 2. Requirements Analysis

### 2.1 Functional Requirements (FR)

| ID | Requirement | Covered By |
|----|-------------|------------|
| FR-01 | Create, update, delete, and list conferences | `/api/conferences` |
| FR-02 | Manage speakers (add bio, photo, assign to sessions) | `/api/speakers`, `/api/session-speakers` |
| FR-03 | Register attendees and track their status | `/api/attendees`, `/api/attendee-sessions` |
| FR-04 | Check-in attendees for sessions | `/api/attendee-sessions/:id/check-in` |
| FR-05 | Manage venues and room bookings | `/api/venues` |
| FR-06 | Create and manage session schedules (time, venue, speakers) | `/api/sessions` |
| FR-07 | Upload and retrieve conference/session documents & images | `/api/documents` (Cloudflare R2) |
| FR-08 | Role-based access control (admin, organiser, speaker, attendee) | `roles`, `permissions` tables |
| FR-09 | Dashboard summary and registration/attendance reports | `/api/dashboard/summary`, `/api/reports/*` |
| FR-10 | Health check for service monitoring | `/api/healthz` |

### 2.2 Non-Functional Requirements (NFR)

| ID | Requirement | How It's Met |
|----|-------------|--------------|
| NFR-01 | **Performance** — API responses < 200ms | Cloudflare Workers edge runtime |
| NFR-02 | **Scalability** — handle traffic spikes | Serverless Workers + D1 auto-scaling |
| NFR-03 | **Reliability** — 99.9% uptime SLA | Cloudflare global network |
| NFR-04 | **Security** — hashed passwords, RBAC | bcrypt hashing, role/permission tables |
| NFR-05 | **Availability** — global CDN edge delivery | Cloudflare Pages + Workers edge |
| NFR-06 | **Durability** — no data loss on uploads | Cloudflare R2 99.99% object durability |
| NFR-07 | **Maintainability** — modular, typed codebase | TypeScript, feature-branch git workflow |
| NFR-08 | **Portability** — easy local dev & deploy | `wrangler dev` + `wrangler deploy` |
| NFR-09 | **Usability** — responsive, accessible UI | Radix UI primitives, Tailwind CSS |
| NFR-10 | **Observability** — structured logs | Pino logging with Worker bindings |

---

## 3. Work Plan

> Our class is **Group C**. The key milestones and their dates:

| Milestone / Date | Group C (Us) | Group D | Deliverable |
|------------------|--------------|---------|-------------|
| Requirements & Planning | 18/09/2025 | 15/09/2025 | Problem identified, Section A & B drafted |
| Designs | **16/10/2025** | 13/10/2025 | System designs (ERD, UI wireframes, API contracts) |
| Implementation & Testing | **6/11/2025** | 3/11/2025 | Code complete, tests passing, progress presented |
| Final Presentations | **20/11/2025** | 24/11/2025 | Completed system demo, learnings & challenges |

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1: Requirements & Planning (current) | Weeks 1–2 | This README Section B, role assignments, tool lock-in |
| Phase 2: Designs | Weeks 3–5 | ERD, UI wireframes, API/OpenAPI contracts |
| Phase 3: Infrastructure & CI/CD | Weeks 4–6 | Cloudflare Workers, D1 schema, R2 buckets, GitHub Actions |
| Phase 4: Frontend & UI | Weeks 5–8 | React pages, Radix UI components, Wouter routing |
| Phase 5: Backend API & DB | Weeks 6–9 | CRUD endpoints for all entities, Drizzle migrations |
| Phase 6: Features (sessions, attendees, docs) | Weeks 9–10 | Registration flow, check-in, document upload to R2 |
| Phase 7: Testing & Polishing | Weeks 10–11 | Integration tests, bug fixes |
| Phase 8: Final Prep & Presentation | Week 12 (by 20/11/2025) | Final demo, learnings & challenges |

---

## 4. Agreed Tools & Techniques

| Category | Choice | Rationale |
|----------|--------|-----------|
| Version Control | Git + GitHub | Standard, branch-based collaboration |
| Frontend Framework | React 19 + TypeScript + Vite + Tailwind CSS 4 | Fast HMR, modern component model |
| UI Library | Radix UI primitives | Accessible, unstyled components |
| Routing | Wouter | Lightweight, hooks-based routing |
| State Management | TanStack React Query | Server-state syncing with caching |
| Backend | Cloudflare Workers (TypeScript) | Edge runtime, low-latency, serverless |
| Database | Cloudflare D1 (SQLite) + Drizzle ORM | Serverless SQL, familiar SQL via SQLite |
| File/Image Storage | Cloudflare R2 | S3-compatible, no egress fees for Pages |
| Hosting | Cloudflare Pages (`convene.pages.dev`) | Global CDN, integrates with Workers |
| Validation | Zod | Schema-driven API validation |
| API Docs | OpenAPI / Swagger | Documented `@ts` schemas in `Backend/lib/api-zod` |
| Logging | Pino | Structured, performant logging |
| Build | esbuild (backend), Vite (frontend) | Fast bundling |
| CI/CD | GitHub Actions + Wrangler CLI | Automated deploy on push to `main` |
| Communication | WhatsApp group + GitHub Issues | Real-time chat + async task tracking |
| Project Board | GitHub Projects (Kanban) | Sprint planning & task visibility |

---

## 5. Task Subdivision — Group Members & Roles

The project has **8 members**. Each member leads a distinct responsibility area, with collaboration shared across the team.

| # | Member | Role | Responsibilities |
|---|--------|------|------------------|
| 1 | **Samuel** (Project Leader) | Lead Technical Architect & DevOps Engineer | Overall architecture, Cloudflare Workers/D1/R2 setup, CI/CD pipeline (GitHub Actions + Wrangler), API design & Zod schemas, Drizzle ORM migrations, wrangler.json bindings, deployment to `api.convene.pages.dev` |
| 2 | **Austin** (Group Leader) | Project Manager & Frontend Coordinator | Team organization, sprint planning, requirements tracking, frontend component coordination, liaising with all subteams, presentation lead |
| 3 | **Adachi** | Frontend UI Developer | Build React UI components with Radix UI + Tailwind, page layouts, responsive design, App.tsx routing (Wouter), global styles |
| 4 | **Larry** | Database Engineer | Design D1 schema, write Drizzle ORM models & migrations, seed data, performance tuning of queries |
| 5 | **Jeff** | Conference & Session Features Lead | Implement conference CRUD (`/api/conferences`), session scheduling (`/api/sessions`), timezone handling |
| 6 | **Sean** | Attendee & Registration Lead | Attendee profiles (`/api/attendees`), registration flow (`/api/attendee-sessions`), check-in logic, status management |
| 7 | **Steve** | Speaker & Venue Features Lead | Speaker management (`/api/speakers`), venue/room booking (`/api/venues`), session-speaker assignments (`/api/session-speakers`) |
| 8 | **Fred** | Documents, Storage & Reporting Lead | Document upload pipeline to R2 (`/api/documents`), image URL generation, dashboard summary (`/api/dashboard/summary`), registration/attendance reports |

### Shared Responsibilities
- **All members:** Code review via GitHub PRs, writing commit messages per Conventional Commits, updating project documentation.
- **Architecture pair:** Samuel, Larry & Jeff collaborate on API-endpoint ↔ DB-table wiring.
- **Full-stack pair:** Adachi & Fred collaborate on document/image display UI.

---

## 6. Deliverables Mapping (Teacher's Checklist)

| Teacher Task | Status | Date (Group C) | Where Documented |
|--------------|--------|-----------------|------------------|
| Identify a problem & proposed solution | ✅ Done | 18/09/2025 | Section B §1 |
| Share project description | ✅ Done | 18/09/2025 | Section A §Project Overview |
| Analyse & document requirements | ✅ Done | 18/09/2025 | Section B §2 |
| Present functional & non-functional requirements | ✅ Done | 18/09/2025 | Section B §2.1 & §2.2 |
| Prepare Work Plan | ✅ Done | 18/09/2025 | Section B §3 |
| Subdivide tasks among group members | ✅ Done | 18/09/2025 | Section B §5 |
| Agree on tools & techniques | ✅ Done | 18/09/2025 | Section B §4 |
| Prepare designs for proposed system | ⏳ Next | **16/10/2025** | Section B §3 (Phase 2) |
| Implementation and testing | 📅 Planned | **6/11/2025** | Section B §3 (Phases 3–7) |
| Final presentations | 📅 Planned | **20/11/2025** | Section B §3 (Phase 8) |

---

## License

This project is licensed under the MIT License.

---

**Last Updated:** September 2026
