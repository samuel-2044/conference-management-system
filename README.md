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
* [Team](#team)
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

## License

This project is developed as an academic group project.

---

**Last Updated:** September 2026