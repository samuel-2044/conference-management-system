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
* [Requirements Analysis](#2-requirements-analysis)
* [Work Plan](#3-work-plan)
* [Group Members & Responsibilities](#4-group-members--responsibilities)
* [Deliverables Status](#5-deliverables-status)
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

Requirements are split into **user requirements** (high-level) and **system requirements** (detailed), and classified as **functional** or **non-functional**.

**Key Terms:** *Functional Requirement* = what the system does; *Non-Functional Requirement* = how the system behaves; *MOSCOW* = Must/Should/Could/Would prioritisation; *Verifiable* = measurable and testable.

## 2.1 User Requirements (High-Level)

* Allow organisers to create/manage conferences
* Manage speakers, attendees, venues, and sessions
* Let attendees register for conferences/sessions and check in
* Let speakers view assigned sessions and profile
* Let organisers upload documents and images
* Show dashboards and reports on registrations/attendance
* Restrict features to authorised users (RBAC)

## 2.2 Functional Requirements (System-Level, MOSCOW-Prioritised)

| Priority | Requirement |
|----------|-------------|
| Must     | CRUD conferences (title, description, dates) |
| Must     | List conferences with search/filter |
| Must     | CRUD venues (name, building, room, capacity) |
| Must     | CRUD sessions (title, time, venue, speakers) |
| Must     | Assign speakers to sessions with roles |
| Must     | Manage speaker profiles (bio, photo) |
| Must     | Register attendees for conferences (pending/confirmed/cancelled) |
| Must     | Register attendees for sessions with check-in |
| Must     | Upload documents (file_key, file_url via R2) |
| Must     | Dashboard summary (counts) |
| Must     | Registration & attendance reports |
| Must     | Role-based access control |
| Must     | Health-check endpoint |
| Should   | Prevent overlapping venue bookings |
| Could    | Email notifications |

## 2.3 Non-Functional Requirements (Measurable, Categorised)

| Category | Must | Should | Could |
|----------|------|--------|-------|
| **Product** | 95% API ≤300ms; auto-scale 1k users; bcrypt≥10; task ≤3min; upload ≤10MB | — | — |
| **Organizational** | Email/password auth; RBAC per request; Git+GitHub versioning | Structured audit logs | — |
| **External** | Cloudflare Pages+Workers+D1+R2; HTTPS only (A+) | ≥99.5% monthly uptime | Swahili interface |

---

# 3. Work Plan

**Group C** — Task 2 submission deadline: **28/09/2026**.

### Presentation Schedule

| Milestone | Date | Deliverable |
|-----------|------|-------------|
| Requirements & Planning | 18/09/2026 | Requirements and project planning ✅ |
| System Design | 16/10/2026 | ERD, UI designs, API design |
| Implementation & Testing | 06/11/2026 | Completed implementation and testing |
| Final Presentation | 20/11/2026 | System demo and presentation |

### Module-Based Work Plan (2+ members per module)

| Module | Assigned Members | Deadline |
|--------|-----------------|----------|
| User Authentication & Access Control | Samuel, Austin | 18/10/2026 |
| Conference Management | Austin, Adachi | 18/10/2026 |
| Venue & Session Scheduling | Jeff, Steve | 06/11/2026 |
| Speaker Management | Steve, Fred | 06/11/2026 |
| Attendee Registration & Check-in | Sean, Adachi | 13/11/2026 |
| Documents & Storage | Fred, Larry | 13/11/2026 |
| Database & API Layer | Larry, Samuel | 13/11/2026 |
| Dashboard & Reporting | Sean, Fred | 20/11/2026 |

### Tools, Communication & Development Approach

| Category | Choice |
|----------|--------|
| Version Control | Git + GitHub (protected `main`, PR workflow) |
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS 4 |
| Backend | Cloudflare Workers + TypeScript |
| Database | Cloudflare D1 + Drizzle ORM |
| Storage | Cloudflare R2 |
| CI/CD | GitHub Actions + Wrangler |
| Hosting | Cloudflare Pages + Workers |
| Communication | WhatsApp + GitHub Issues |
| Project Management | GitHub Projects (Kanban) |
| Development Approach | Feature-branch PR workflow; incremental per module; weekly syncs |

---

# 4. Group Members & Responsibilities

The project consists of **8 members**. Each member leads one or more modules (see §3).

| # | Member | Primary Module(s) |
|---|--------|-------------------|
| 1 | **Samuel** | User Authentication & Access Control, Database & API Layer |
| 2 | **Austin** | User Authentication & Access Control, Conference Management |
| 3 | **Adachi** | Conference Management, Attendee Registration & Check-in |
| 4 | **Larry** | Documents & Storage, Database & API Layer |
| 5 | **Jeff** | Venue & Session Scheduling |
| 6 | **Sean** | Attendee Registration & Check-in, Dashboard & Reporting |
| 7 | **Steve** | Venue & Session Scheduling, Speaker Management |
| 8 | **Fred** | Documents & Storage, Speaker Management, Dashboard & Reporting |

**Shared (all members):** complete assigned tasks, write Conventional Commits, test work, keep team informed (WhatsApp), follow PR workflow, update docs.

---

# 5. Deliverables Status

| Deliverable | Status | Date |
|-------------|--------|------|
| Problem identification | Completed | 18/09/2026 |
| Project description | Completed | 18/09/2026 |
| Requirements analysis | Completed | 28/09/2026 |
| User & system requirements | Completed | 28/09/2026 |
| Functional requirements | Completed | 28/09/2026 |
| Non-functional requirements | Completed | 28/09/2026 |
| Work plan | Completed | 28/09/2026 |
| Task subdivision | Completed | 18/10/2026 |
| System design (ERD + UI) | In progress | 16/10/2026 |
| Implementation | Planned | 06/11/2026 |
| Testing | Planned | 06/11/2026 |
| Final presentation | Planned | 20/11/2026 |

---

# License

This project is developed as an academic group project.

---

**Last Updated:** September 2026
