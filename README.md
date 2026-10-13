# Conference Management System

A full-stack web application for managing academic and professional conferences. The system provides a centralized platform for managing conferences, speakers, attendees, venues, sessions, documents, registrations, attendance, and reports.

## Table of Contents

* [Project Overview](#project-overview)
* [Requirements](#requirements)
* [Technology Stack](#technology-stack)
* [Prerequisites](#prerequisites)
* [Getting Started](#getting-started)
* [Project Structure](#project-structure)
* [Database Design](#database-design)
* [API Documentation](#api-documentation)
* [Git & Team Workflow](#git--team-workflow)
* [Environment Variables](#environment-variables)
* [Deployment](#deployment)
* [Troubleshooting](#troubleshooting)
* [Team](#team)
* [Work Plan](#work-plan)
* [License](#license)

---

## Project Overview

The Conference Management System, **Convene**, is designed to help universities and conference organizers manage conferences from planning through execution.

### Main Features

* Conference management
* Speaker management
* Attendee registration
* Venue and room management
* Session scheduling
* Speaker-to-session assignment
* Attendee session registration
* Session check-in
* Document and image management
* Registration and attendance reports
* Role-based access control

---

## Requirements

Requirements describe what the system should do, the services it provides, and the constraints on its operation. They are classified as **user requirements** (high-level), **functional requirements** (system-level), and **non-functional requirements** (constraints).

**Key terms:** *Functional Requirement* = what the system does; *Non-Functional Requirement* = how the system behaves; *MOSCOW* = Must/Should/Could/Would prioritisation; *Verifiable* = measurable and testable.

### User Requirements (High-Level)

1. The system shall allow organisers to create and manage conferences (title, description, dates).
2. The system shall allow management of speakers, attendees, venues, and sessions.
3. The system shall let attendees register for conferences and sessions and check in on the day of a session.
4. The system shall let speakers view their assigned sessions and profile.
5. The system shall let organisers upload documents and images for conferences and sessions.
6. The system shall show organisers dashboards and reports on registrations and attendance.
7. The system shall restrict features to authorised users only.

### Functional Requirements

Each functional requirement is written as "The system shall …" and prioritised using MOSCOW.

| Priority | Functional Requirement |
|----------|------------------------|
| Must     | The system shall create, retrieve, update, and delete a conference (title, description, start_date, end_date). |
| Must     | The system shall list all conferences with search/filter by title and date range. |
| Must     | The system shall create, update, and delete venues (name, building, room, capacity) for a conference. |
| Must     | The system shall create, update, and delete sessions (title, description, start_time, end_time, venue, speakers) for a conference. |
| Must     | The system shall assign one or more speakers to a session and set their role (keynote, speaker, panelist, moderator). |
| Must     | The system shall create and update speaker profiles (bio, photo). |
| Must     | The system shall register an attendee for a conference (status: pending, confirmed, cancelled). |
| Must     | The system shall register an attendee for a session and record a check-in timestamp (status: registered, attended, cancelled, no_show). |
| Must     | The system shall upload a document and store it, returning a file_key and file_url. |
| Must     | The system shall return a dashboard summary (counts of conferences, attendees, speakers, sessions). |
| Must     | The system shall return registration and attendance reports filtered by conference and date. |
| Must     | The system shall enforce role-based access (admin, organiser, speaker, attendee) on every request. |
| Must     | The system shall expose a health-check endpoint. |
| Should   | The system shall prevent a session from being scheduled in a venue that is already booked for overlapping times. |
| Could    | The system shall send email notifications on registration and check-in. |

### Non-Functional Requirements

Non-functional requirements constrain the system. They are categorised as Product, Organizational, or External, prioritised via MOSCOW, and written to be measurable.

**Product Requirements**

| Priority | Requirement | Metric / Test |
|----------|-------------|---------------|
| Must     | The system shall return 95% of API responses within 300 ms. | Load test 500 concurrent requests; 95% p95 latency ≤ 300 ms. |
| Must     | The system shall scale automatically to 1000 concurrent users. | Run a 1000-user simultaneous load test with ≤ 5% errors. |
| Must     | Passwords shall be hashed using bcrypt with cost factor ≥ 10. | Inspect stored hashes; no plaintext passwords in the database. |
| Must     | A new organiser shall complete conference creation in ≤ 3 minutes. | Time-to-task test with 3 new users; average ≤ 3 min. |
| Must     | Uploaded documents shall be limited to 10 MB each. | Attempt upload of an 11 MB file; upload is rejected with HTTP 413. |

**Organizational Requirements**

| Priority | Requirement | Metric / Test |
|----------|-------------|---------------|
| Must     | The system shall authenticate users with a unique email and password. | Validate login with invalid credentials fails; valid succeeds. |
| Must     | The system shall enforce role-based access control per request. | Verify a speaker cannot access admin endpoints (HTTP 403). |
| Must     | The system shall be version-controlled with Git and GitHub. | All changes present in GitHub commit history with Conventional Commits. |
| Should   | The system shall log structured events for audit. | Verify logs contain event type, user id, and timestamp. |

**External Requirements**

| Priority | Requirement | Metric / Test |
|----------|-------------|---------------|
| Must     | The system shall be hosted on Cloudflare (Pages + Workers + D1 + R2). | Confirm wrangler.json binds pages.dev, Workers, D1, R2. |
| Must     | The system shall be reachable only over HTTPS. | Run SSL Labs test; score A+ and no HTTP downgrade. |
| Should   | The system shall achieve ≥ 99.5% monthly uptime. | Uptime monitoring over one month; ≤ 3.65 hours of downtime. |
| Could    | The system shall support English and one Swahili interface. | Language toggle switches UI text without errors. |

---

## Technology Stack

| Layer             | Technology                 |
| ----------------- | -------------------------- |
| Frontend          | React 19, TypeScript, Vite |
| Styling           | Tailwind CSS 4             |
| UI Components     | Radix UI                   |
| Routing           | Wouter                     |
| State Management  | TanStack React Query       |
| Backend           | Cloudflare Workers         |
| Database          | Cloudflare D1 (SQLite)     |
| ORM               | Drizzle ORM                |
| File Storage      | Cloudflare R2              |
| Validation        | Zod                        |
| API Documentation | OpenAPI                    |
| Logging           | Pino                       |
| Frontend Hosting  | Cloudflare Pages           |
| Backend Hosting   | Cloudflare Workers         |
| Version Control   | Git + GitHub               |
| CI/CD             | GitHub Actions + Wrangler  |

---

## Prerequisites

Install the following before working on the project:

* Node.js 20 or higher
* npm 10 or higher
* Git 2.x or higher
* VS Code recommended

Check your versions:

```bash
node -v
npm -v
git --version
```

---

## Getting Started

### 1. Clone the Repository

Open the VS Code terminal and run:

```bash
git clone https://github.com/samuel-2044/conference-management-system.git
```

Enter the project:

```bash
cd conference-management-system
```

Open the project in VS Code:

```bash
code .
```

### 2. Install Dependencies

Install the backend dependencies:

```bash
cd Backend
npm install
```

Install the frontend dependencies:

```bash
cd ../Frontend
npm install
```

### 3. Run the Application

#### Backend

From the `Backend` directory:

```bash
npm run dev
```

#### Frontend

Open another VS Code terminal and run:

```bash
cd Frontend
npm run dev
```

### Local URLs

| Service          | URL                                 |
| ---------------- | ----------------------------------- |
| Frontend         | `http://localhost:5173`             |
| Backend API      | `http://localhost:3000`             |
| API Health Check | `http://localhost:3000/api/healthz` |

---

## Project Structure

```text
conference-management-system/
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   └── error-boundary.tsx
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── Backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── lib/
│   │   ├── storage/
│   │   ├── app.ts
│   │   └── index.ts
│   ├── lib/
│   │   ├── api-zod/
│   │   ├── db/
│   │   └── api-spec/
│   ├── migrations/
│   ├── build.mjs
│   ├── package.json
│   └── tsconfig.json
│
├── package.json
├── README.md
└── .gitignore
```

---

## Database Design

The application uses **Cloudflare D1**, which is based on SQLite, with **Drizzle ORM** for database operations.

### Main Entities

```text
ROLES
  │
  └── USERS
       ├── SPEAKERS
       └── ATTENDEES
              │
              ├── CONFERENCE_ATTENDEES
              │
              └── ATTENDEE_SESSIONS

CONFERENCES
  │
  ├── VENUES
  │
  └── SESSIONS
       │
       ├── SESSION_SPEAKERS
       └── ATTENDEE_SESSIONS

USERS
  │
  └── DOCUMENTS

ROLES
  │
  └── ROLE_PERMISSIONS
       │
       └── PERMISSIONS
```

### Main Tables

| Table                  | Purpose                             |
| ---------------------- | ----------------------------------- |
| `roles`                | System user roles                   |
| `permissions`          | Available system permissions        |
| `role_permissions`     | Maps roles to permissions           |
| `users`                | User accounts                       |
| `conferences`          | Conference information              |
| `venues`               | Conference venues and rooms         |
| `sessions`             | Conference sessions                 |
| `speakers`             | Speaker profiles                    |
| `attendees`            | Attendee profiles                   |
| `conference_attendees` | Conference registrations            |
| `attendee_sessions`    | Session registrations and check-ins |
| `session_speakers`     | Speaker/session assignments         |
| `documents`            | Uploaded documents and files        |

---

## API Documentation

## Base URL

Production:

```text
https://api.convene.pages.dev/api
```

### Health

```text
GET /api/healthz
```

### Dashboard & Reports

```text
GET /api/dashboard/summary
GET /api/reports/registration
GET /api/reports/attendance
```

### Conferences

```text
GET    /api/conferences
POST   /api/conferences
GET    /api/conferences/:conferenceId
PATCH  /api/conferences/:conferenceId
DELETE /api/conferences/:conferenceId
```

### Venues

```text
GET    /api/venues
POST   /api/venues
PATCH  /api/venues/:venueId
DELETE /api/venues/:venueId
```

### Sessions

```text
GET    /api/sessions
POST   /api/sessions
PATCH  /api/sessions/:sessionId
DELETE /api/sessions/:sessionId
```

### Speakers

```text
GET    /api/speakers
POST   /api/speakers
PATCH  /api/speakers/:speakerId
DELETE /api/speakers/:speakerId
```

### Attendees

```text
GET  /api/attendees
POST /api/attendees
```

### Attendee Sessions

```text
POST /api/attendee-sessions/register
POST /api/attendee-sessions/:attendeeSessionId/check-in
```

### Session Speakers

```text
POST   /api/session-speakers
DELETE /api/session-speakers/:sessionSpeakerId
```

### Documents

```text
GET /api/documents
```

---

## Git & Team Workflow

This project uses **GitHub for version control and collaboration**.

The `main` branch is protected.

Members must not directly push to `main`.

### Basic Workflow

Before starting work:

```bash
git pull origin main
```

Make your changes.

Then:

```bash
git add .
git commit -m "Describe what you changed"
git push
```

The changes are then submitted for review.

The project leader reviews the changes and merges approved work into `main`.

After changes are merged, update your local project:

```bash
git pull origin main
```

### Important Rules

* Do not force push.
* Do not delete the `main` branch.
* Do not push directly to `main`.
* Always get the latest changes before starting new work.
* Make small, clear commits.
* Do not modify another member's work unnecessarily.
* If Git shows an error, ask the project leader before running random commands.

### Commit Message Examples

```bash
git commit -m "Add speaker management"
```

```bash
git commit -m "Fix attendee registration"
```

```bash
git commit -m "Update conference dashboard"
```

---

## Environment Variables

Environment variables must not be committed to GitHub.

### Backend

Backend environment variables and Cloudflare bindings are configured through the project's Cloudflare/Wrangler configuration.

### Frontend

Example:

```env
VITE_API_URL=https://api.convene.pages.dev
```

Do not commit passwords, API keys, tokens, or other secrets.

---

## Deployment

The project uses Cloudflare services.

| Resource                | Service            | Purpose                |
| ----------------------- | ------------------ | ---------------------- |
| `convene.pages.dev`     | Cloudflare Pages   | Frontend               |
| `api.convene.pages.dev` | Cloudflare Workers | Backend API            |
| `CONFERENCE_DB`         | Cloudflare D1      | Database               |
| `CONFERENCE_IMAGES`     | Cloudflare R2      | File and image storage |

### Deployment Flow

```text
Developer
    ↓
GitHub
    ↓
Pull Request
    ↓
Review
    ↓
Merge to main
    ↓
GitHub Actions
    ↓
Build & Deploy
    ↓
Cloudflare
```

---

## Troubleshooting

### Port Already in Use

Check port 3000:

```bash
lsof -i :3000
```

Stop the process:

```bash
kill -9 <PID>
```

### Dependencies Not Working

Remove dependencies and reinstall:

```bash
rm -rf node_modules
npm install
```

### Git Is Behind `main`

Run:

```bash
git pull origin main
```

If Git reports a conflict, stop and contact the project leader before continuing.

---

## Team

The project consists of **8 members** working across 8 modules (2+ members per module):

| Member | Role | Primary Modules |
|--------|------|-----------------|
| **Samuel** | Project Leader | Auth & Access Control, Database & API Layer |
| **Austin** | Group Leader | Auth & Access Control, Conference Management |
| **Adachi** | Frontend Developer | Conference Management, Attendee Registration & Check-in |
| **Larry** | Database Engineer | Documents & Storage, Database & API Layer |
| **Jeff** | Backend Developer | Venue & Session Scheduling |
| **Sean** | Backend Developer | Attendee Registration & Check-in, Dashboard & Reporting |
| **Steve** | Backend Developer | Venue & Session Scheduling, Speaker Management |
| **Fred** | Backend Developer | Documents & Storage, Speaker Management, Dashboard & Reporting |

**Shared responsibilities (all members):**
* Complete assigned tasks in their modules
* Write clear commit messages (Conventional Commits)
* Test their work
* Keep the team informed of progress (WhatsApp)
* Follow the GitHub PR workflow
* Update relevant documentation

---

## Work Plan

Each module is assigned to **two or more** group members and includes a deliverable and deadline.

| Module | Description | Assigned Members (2+) | Deliverables | Deadline |
|--------|-------------|----------------------|--------------|----------|
| User Authentication & Access Control | Login, registration, role-based access control | Samuel, Austin | Auth system + RBAC implementation | 18/10/2026 |
| Conference Management | Create, update, delete, list conferences | Austin, Adachi | Conferences API + UI | 18/10/2026 |
| Venue & Session Scheduling | Manage venues, rooms, and session timetable | Jeff, Steve | Venues API + Sessions API | 06/11/2026 |
| Speaker Management | Speaker profiles and session assignments | Steve, Fred | Speakers API + assignments | 06/11/2026 |
| Attendee Registration & Check-in | Attendee profiles, registration flow, check-in logic | Sean, Adachi | Registration API + check-in | 13/11/2026 |
| Documents & Storage | Upload pipeline to R2 and image/document URLs | Fred, Larry | Documents API + R2 integration | 13/11/2026 |
| Database & API Layer | D1 schema, Drizzle migrations, API contracts | Larry, Samuel | D1 schema + OpenAPI spec | 13/11/2026 |
| Dashboard & Reporting | Dashboard summary and registration/attendance reports | Sean, Fred | Reports API + dashboard UI | 20/11/2026 |

### Tools, Communication & Development Approach

| Category | Technology / Approach |
|----------|----------------------|
| Version Control | Git + GitHub (protected main branch, PR-based workflow) |
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS 4 |
| UI Components | Radix UI primitives |
| Routing | Wouter |
| State Management | TanStack React Query |
| Backend | Cloudflare Workers (TypeScript) |
| Database | Cloudflare D1 (SQLite) + Drizzle ORM |
| File Storage | Cloudflare R2 |
| Validation | Zod schemas |
| API Documentation | OpenAPI / Swagger |
| Logging | Pino structured logging |
| CI/CD | GitHub Actions + Wrangler CLI |
| Hosting | Cloudflare Pages (frontend) + Cloudflare Workers (backend) |
| Communication | WhatsApp group + GitHub Issues |
| Project Management | GitHub Projects (Kanban board) |
| Development Approach | Feature-branch workflow with PR reviews; incremental delivery per module; weekly sync meetings |

---

## License

This project is developed as an academic group project.

---

**Last Updated:** September 2026