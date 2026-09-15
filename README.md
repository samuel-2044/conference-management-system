# Conference Management System

A full-stack web application for managing academic and professional conferences. The system provides a centralized platform for managing conferences, speakers, attendees, venues, sessions, documents, registrations, attendance, and reports.

## Table of Contents

* [Project Overview](#project-overview)
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
* [Course Requirements & Group Deliverables](#course-requirements--group-deliverables)
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

# Project Structure

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

# Database Design

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

# API Documentation

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

# Git & Team Workflow

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

# Environment Variables

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

# Deployment

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

# Troubleshooting

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

# Course Requirements & Group Deliverables

## 1. Problem Statement

Conference organizers often manage speakers, attendees, sessions, venues, registrations, and documents using separate systems or spreadsheets. This can lead to duplicated information, scheduling problems, poor communication, and difficulty tracking attendance.

## Proposed Solution

**Convene** provides a centralized conference management platform where organizers can manage conferences, speakers, attendees, venues, sessions, documents, registrations, attendance, and reports.

---

# 2. Requirements Analysis

Requirements describe what the system should do, the services it provides, and the constraints on its operation. They are split into **user requirements** (high-level) and **system requirements** (detailed), and classified as **functional** or **non-functional**.

## 2.1 User Requirements (High-Level)

These are high-level statements of the services the system is expected to provide to its users.

* The system shall allow organisers to create and manage conferences (title, description, dates).
* The system shall allow management of speakers, attendees, venues, and sessions.
* The system shall let attendees register for conferences and sessions and check in on the day of a session.
* The system shall let speakers view their assigned sessions and profile.
* The system shall let organisers upload documents and images for conferences and sessions.
* The system shall show organisers dashboards and reports on registrations and attendance.
* The system shall restrict features to authorised users only.

## 2.2 System Requirements (Functional, Detailed)

Detailed descriptions of system functions written as "The system shall ...". Each is prioritised using the MOSCOW method.

| ID    | Priority | Functional Requirement (System)                                                                                                                                         |
| ----- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-01 | Must     | The system shall create, retrieve, update, and delete a conference (title, description, start_date, end_date).                                                       |
| FR-02 | Must     | The system shall list all conferences with search/filter by title and date range.                                                                                       |
| FR-03 | Must     | The system shall create, update, and delete venues (name, building, room, capacity) for a conference.                                                                   |
| FR-04 | Must     | The system shall create, update, and delete sessions (title, description, start_time, end_time, venue, speakers) for a conference.                                  |
| FR-05 | Must     | The system shall assign one or more speakers to a session and set their role (keynote, speaker, panelist, moderator).                                                |
| FR-06 | Must     | The system shall create and update speaker profiles (bio, photo).                                                                                                       |
| FR-07 | Must     | The system shall register an attendee for a conference (status: pending, confirmed, cancelled).                                                                       |
| FR-08 | Must     | The system shall register an attendee for a session and record a check-in timestamp (status: registered, attended, cancelled, no_show).                              |
| FR-09 | Must     | The system shall upload a document and store it, returning a file_key and file_url.                                                                                   |
| FR-10 | Must     | The system shall return a dashboard summary (counts of conferences, attendees, speakers, sessions).                                                                   |
| FR-11 | Must     | The system shall return registration and attendance reports filtered by conference and date.                                                                          |
| FR-12 | Must     | The system shall enforce role-based access (admin, organiser, speaker, attendee) on every request.                                                                      |
| FR-13 | Must     | The system shall expose a health-check endpoint.                                                                                                                        |
| FR-14 | Should   | The system shall prevent a session from being scheduled in a venue that is already booked for overlapping times.                                                       |
| FR-15 | Could     | The system shall send email notifications on registration and check-in.                                                                                               |

## 2.3 Non-Functional Requirements

Non-functional requirements constrain the system. They are categorised (Product, Organizational, External), prioritised via MOSCOW, and written to be **measurable**.

### Product Requirements

| ID     | Priority | Requirement                                              | Metric / Test                                                              |
| ------ | -------- | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| NFR-01 | Must     | The system shall return 95% of API responses within 300 ms. | Load test 500 concurrent requests; 95% p95 latency ≤ 300 ms.          |
| NFR-02 | Must     | The system shall scale automatically to 1000 concurrent users. | Run a 1000-user simultaneous load test with ≤ 5% errors.              |
| NFR-03 | Must     | Passwords shall be hashed using bcrypt with cost factor ≥ 10. | Inspect stored hashes; no plaintext passwords in the database.      |
| NFR-04 | Must     | A new organiser shall complete conference creation in ≤ 3 minutes. | Time-to-task test with 3 new users; average ≤ 3 min.                  |
| NFR-05 | Must     | Uploaded documents shall be limited to 10 MB each.          | Attempt upload of an 11 MB file; upload is rejected with HTTP 413.    |

### Organizational Requirements

| ID     | Priority | Requirement                                              | Metric / Test                                                              |
| ------ | -------- | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| NFR-06 | Must     | The system shall authenticate users with a unique email and password. | Validate login with invalid credentials fails; valid succeeds.        |
| NFR-07 | Must     | The system shall enforce role-based access control per request. | Verify a speaker cannot access admin endpoints (HTTP 403).            |
| NFR-08 | Must     | The system shall be version-controlled with Git and GitHub. | All changes present in GitHub commit history with Conventional Commits.|
| NFR-09 | Should   | The system shall log structured events for audit.          | Verify logs contain event type, user id, and timestamp.                   |

### External Requirements

| ID     | Priority | Requirement                                              | Metric / Test                                                              |
| ------ | -------- | -------------------------------------------------------- | -------------------------------------------------------------------------- |
| NFR-10 | Must     | The system shall be hosted on Cloudflare (Pages + Workers + D1 + R2). | Confirm `wrangler.json` binds pages.dev, Workers, D1, R2.            |
| NFR-11 | Must     | The system shall be reachable only over HTTPS.            | Run SSL Labs test; score A+ and no HTTP downgrade.                         |
| NFR-12 | Should   | The system shall achieve ≥ 99.5% monthly uptime.           | Uptime monitoring over one month; ≤ 3.65 hours of downtime.                |
| NFR-13 | Could     | The system shall support English and one Swahili interface. | Language toggle switches UI text without errors.                           |

---

# 3. Work Plan

**Group C** — Task 2 submission deadline is **28/09/2026**.

### Presentation Schedule

| Milestone                |       Date | Group C | Group D | Deliverable                                  |
| ------------------------ | ---------: | ------: | ------: | -------------------------------------------- |
| Requirements & Planning  | 18/09/2026 |    ✅    | 15/09/2026 | Requirements and project planning            |
| System Design            | 16/10/2026 |         | 13/10/2026 | ERD, UI designs and API design              |
| Implementation & Testing | 06/11/2026 |         |  3/11/2026 | Completed implementation and testing        |
| Final Presentation       | 20/11/2026 |         | 24/11/2026 | System demonstration and presentation     |

### Module-Based Work Plan

Each module is assigned to **two or more** group members and includes a deliverable and deadline.

| Module                          | Description                                                          | Assigned Members        | Deliverables                       | Date        |
| ------------------------------- | -------------------------------------------------------------------- | ----------------------- | ---------------------------------- | ----------- |
| User Authentication & Access Control | Login, registration, role-based access control                    | Samuel, Austin        | Auth system + RBAC implementation  | 18/10/2026 |
| Conference Management           | Create, update, delete, list conferences                          | Austin, Adachi        | Conferences API + UI               | 18/10/2026 |
| Venue & Session Scheduling      | Manage venues, rooms, and session timetable                       | Jeff, Steve           | Venues API + Sessions API          | 06/11/2026 |
| Speaker Management              | Speaker profiles and session assignments                          | Steve, Fred           | Speakers API + assignments         | 06/11/2026 |
| Attendee Registration & Check-in | Attendee profiles, registration flow, check-in logic              | Sean, Adachi          | Registration API + check-in        | 13/11/2026 |
| Documents & Storage             | Upload pipeline to R2 and image/document URLs                     | Fred, Larry           | Documents API + R2 integration     | 13/11/2026 |
| Database & API Layer            | D1 schema, Drizzle migrations, API contracts                      | Larry, Samuel         | D1 schema + OpenAPI spec           | 13/11/2026 |
| Dashboard & Reporting           | Dashboard summary and registration/attendance reports             | Sean, Fred            | Reports API + dashboard UI         | 20/11/2026 |

---

# 4. Agreed Tools & Techniques

| Category           | Technology                 |
| ------------------ | -------------------------- |
| Version Control    | Git + GitHub               |
| Frontend           | React + TypeScript + Vite  |
| Styling            | Tailwind CSS               |
| UI                 | Radix UI                   |
| Routing            | Wouter                     |
| State Management   | TanStack React Query       |
| Backend            | Cloudflare Workers         |
| Database           | Cloudflare D1              |
| ORM                | Drizzle ORM                |
| Storage            | Cloudflare R2              |
| Validation         | Zod                        |
| API Documentation  | OpenAPI                    |
| Logging            | Pino                       |
| CI/CD              | GitHub Actions             |
| Deployment         | Cloudflare Pages + Workers |
| Communication      | WhatsApp + GitHub Issues   |
| Project Management | GitHub Projects            |

---

# 5. Group Members & Responsibilities

The project consists of **8 members**. Each member leads one or more modules (see the work plan in §3) and all members contribute across the modules they are assigned to.

| # | Member    | Primary Module(s)                          |
| - | --------- | ------------------------------------------ |
| 1 | **Samuel**  | User Authentication & Access Control, Database & API Layer |
| 2 | **Austin**  | User Authentication & Access Control, Conference Management |
| 3 | **Adachi**  | Frontend UI Development (shared across modules) |
| 4 | **Larry**   | Documents & Storage, Database & API Layer |
| 5 | **Jeff**    | Venue & Session Scheduling |
| 6 | **Sean**    | Attendee Registration & Check-in, Dashboard & Reporting |
| 7 | **Steve**   | Venue & Session Scheduling, Speaker Management |
| 8 | **Fred**    | Documents & Storage, Speaker Management, Dashboard & Reporting |

### Shared Responsibilities

All members are responsible for:

* Completing assigned tasks in their modules
* Writing clear commit messages (Conventional Commits)
* Testing their work
* Keeping the team informed of progress (WhatsApp)
* Following the GitHub workflow and code review via PRs
* Updating relevant documentation

---

# 6. Deliverables

| Deliverable                  | Status      | Date       |
| ---------------------------- | ----------- | ---------- |
| Problem identification       | Completed   | 18/09/2026 |
| Project description          | Completed   | 18/09/2026 |
| Requirements analysis        | Completed   | 28/09/2026 |
| User & system requirements   | Completed   | 28/09/2026 |
| Functional requirements      | Completed   | 28/09/2026 |
| Non-functional requirements  | Completed   | 28/09/2026 |
| Work plan                    | Completed   | 28/09/2026 |
| Task subdivision             | Completed   | 18/10/2026 |
| System design (ERD + UI)     | In progress | 16/10/2026 |
| Implementation               | Planned     | 06/11/2026 |
| Testing                      | Planned     | 06/11/2026 |
| Final presentation           | Planned     | 20/11/2026 |

---

# License

This project is developed as an academic group project.

---

**Last Updated:** September 2026
