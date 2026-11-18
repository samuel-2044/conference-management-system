# Convene — Conference Management System

Convene lets an organising team run a conference end to end: create conferences and
venues, schedule sessions, assign speakers, and let attendees register — with capacity
limits enforced and role-based access throughout.

The system is deployed and live on Cloudflare. Public signup is limited to **attendee**
and **speaker**; admin and organiser accounts are created by the team.

---

## 1. Live URLs

| Service | URL |
|---------|-----|
| Frontend | https://convene-management.pages.dev |
| Backend API | https://convene_backend.conference-management-system-backend.workers.dev |
| Health check | https://convene_backend.conference-management-system-backend.workers.dev/api/healthz |
| D1 database | `convene_db` (`37d69981-e179-41e1-994a-78c48872caad`) |

---

## 2. Accounts

| Name | Email | Password | Role |
|------|-------|----------|------|
| Samuel Makokha | samuel@convene.com | Convene@2026 | Admin |
| Austin Omondi | austin@convene.com | Convene@2026 | Organiser |
| Stephen Mwangi | stephen@convene.com | Convene@2026 | Speaker |
| Sean Omondi | sean@convene.com | Convene@2026 | Attendee |
| Fred Otieno | fred@convene.com | Convene@2026 | Attendee |

Admin and organiser accounts are seeded. Attendees and speakers can also sign themselves
up through the signup page.

Passwords are stored as PBKDF2-SHA256 hashes. The session cookie is
`HttpOnly; Secure; SameSite=None`, because the frontend (`*.pages.dev`) and the backend
(`*.workers.dev`) are on different sites.

### Demo data

The seed also creates a sample conference — **Convene Conference 2026** — with three
venues (Main Auditorium, Microsoft Auditorium, STMB Basement 5) and four sessions on AI,
technology and university life. Admins and organisers can edit or delete all of it from
the dashboard.

---

## 3. Roles and permissions

| Capability | Admin | Organiser | Speaker | Attendee |
|------------|:-----:|:---------:|:-------:|:--------:|
| View dashboard | ✓ | ✓ | ✓ | ✓ |
| Create / edit / delete conferences | ✓ | ✓ | — | — |
| Create / edit / delete venues | ✓ | ✓ | — | — |
| Create / edit / delete sessions | ✓ | ✓ | — | — |
| Manage speakers and assignments | ✓ | ✓ | — | — |
| Manage members | ✓ | ✓ | — | — |
| View reports | ✓ | ✓ | — | — |
| Browse conferences and sessions | ✓ | ✓ | ✓ | ✓ |
| Register / cancel a registration | ✓ | ✓ | ✓ | ✓ |

Public signup only accepts `attendee` and `speaker`. Attempting to sign up as `admin`
or `organiser` is rejected.

---

## 4. Features

**Authentication** — signup, login, logout, session cookies, blocked sign-in for inactive
accounts, role-based route protection.

**Member management** — list, search and filter members; add, update, deactivate and
remove attendees and speakers. Admin and organiser accounts cannot be changed here.

**Conferences** — create with capacity and status (`draft`, `upcoming`, `ongoing`,
`completed`, `cancelled`), edit, delete, and view a detail page with its venues,
sessions, speakers and documents.

**Venues** — create, edit and delete rooms with a seating capacity.

**Sessions** — schedule within a conference, assign a venue and capacity, and list
sessions per conference.

**Speakers** — speaker records with a biography and photo, assignable to sessions as
keynote, speaker, panelist or moderator.

**Registration** — attendees register for conferences and sessions. Duplicate
registration, full capacity and scheduling conflicts are all rejected. Cancelling
releases the seat.

**Capacity** — both conferences and sessions refuse registrations once full.

**Documents** — listing endpoint only. File upload needs R2, which is not enabled yet.

---

## 5. Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS 4, Radix UI, TanStack Query, Wouter |
| Backend | Express 5, TypeScript, Zod |
| Runtime | Cloudflare Workers (`convene_backend`) |
| Database | Cloudflare D1 (`convene_db`), 16 SQL migrations |
| Storage | Cloudflare R2 — seam defined, not enabled |
| Auth | `session_id` cookie, PBKDF2-SHA256 via Web Crypto |
| Tests | Bash + cURL |

Express does not run natively on Workers, so `Backend/src/worker-adapter.ts` translates
between the Worker `fetch` API and Express `req`/`res`. Session lookup happens in that
adapter, before Express runs.

---

## 6. Project structure

```
Convene-SE/
├── Backend/
│   ├── src/
│   │   ├── app.ts              Express app, CORS, cookies, routes, error handler
│   │   ├── index.ts            Local development entry point
│   │   ├── index.worker.ts     Cloudflare Workers entry point
│   │   ├── worker-adapter.ts   Express ↔ fetch adapter, session lookup
│   │   ├── types.ts            Cloudflare bindings (D1, R2)
│   │   ├── controllers/
│   │   │   └── auth.ts         Signup, login, members
│   │   ├── middleware/
│   │   │   └── auth.ts         authenticate, authorize, password hashing
│   │   ├── routes/
│   │   │   ├── index.ts        Mounts all routers
│   │   │   ├── auth.ts         /api/auth/*
│   │   │   ├── conference.ts   /api/conferences, venues, sessions, speakers, reports
│   │   │   └── health.ts       /api/healthz
│   │   ├── storage/
│   │   │   └── r2.ts           R2 seam (not wired up)
│   │   └── lib/
│   │       └── logger.ts
│   ├── migrations/             001_roles.sql … 016_role_name_on_users.sql
│   ├── scripts/
│   │   ├── seed.sql            Idempotent staff-account seed
│   │   └── hash-password.mjs   PBKDF2 hash generator
│   └── wrangler.toml
│
├── Frontend/
│   ├── src/
│   │   ├── App.tsx             Router and shared page components
│   │   ├── main.tsx            React entry point, sets the API base URL
│   │   ├── context/
│   │   │   └── auth-context.tsx
│   │   ├── components/
│   │   │   ├── layout/dashboard-layout.tsx
│   │   │   └── ui/             Shared UI components
│   │   ├── pages/
│   │   │   ├── auth/           login, signup
│   │   │   ├── admin/          admin dashboard
│   │   │   ├── organiser/      organiser dashboard
│   │   │   ├── speaker/        speaker dashboard
│   │   │   └── attendee/       attendee dashboard, conference browse, session browse
│   │   ├── hooks/
│   │   └── lib/
│   └── wrangler.toml
│
├── tests/                      cURL API tests + TESTS.md
├── package.json
└── README.md
```

---

## 7. Team responsibilities

Each member owns distinct files. Where a member is listed against a section of a large
file, they own those routes only.

### Samuel — Project Leader

Setup, backend core, API layer, app shell, tests and deployment.

| File | Responsibility |
|------|----------------|
| `Backend/src/app.ts` | Express setup, CORS, cookies, routing, error handling |
| `Backend/src/index.ts` | Local server entry point |
| `Backend/src/index.worker.ts` | Cloudflare Workers entry point |
| `Backend/src/worker-adapter.ts` | Express ↔ fetch adapter, session lookup |
| `Backend/src/types.ts` | D1 and R2 bindings |
| `Backend/src/routes/index.ts` | Router registration |
| `Backend/src/routes/health.ts` | Health check |
| `Backend/src/controllers/auth.ts` | Signup, login, member CRUD |
| `Backend/src/lib/logger.ts` | Logging |
| `Backend/scripts/seed.sql` | Staff-account seed |
| `Backend/scripts/hash-password.mjs` | Password hash generator |
| `Backend/wrangler.toml` | Worker config |
| `Frontend/src/main.tsx` | React entry point, API base URL |
| `Frontend/src/components/layout/dashboard-layout.tsx` | App shell and navigation |
| `Frontend/src/components/error-boundary.tsx` | Error boundary |
| `Frontend/src/lib/`, `Frontend/src/hooks/` | Shared utilities |
| `Frontend/wrangler.toml` | Pages config |
| `tests/` | API test suite |

### Austin — Group Leader

Authentication screens and the organiser dashboard.

| File | Responsibility |
|------|----------------|
| `Frontend/src/pages/auth/login.tsx` | Login page |
| `Frontend/src/pages/auth/signup.tsx` | Signup page with role selection |
| `Frontend/src/pages/organiser/dashboard.tsx` | Organiser dashboard |

### Adachi — Frontend Developer

Attendee-facing pages and registration screens.

| File | Responsibility |
|------|----------------|
| `Frontend/src/pages/attendee/conference-browse.tsx` | Browse conferences, register and cancel |
| `Frontend/src/pages/attendee/session-browse.tsx` | Browse sessions, register and cancel |
| `Frontend/src/pages/attendee/dashboard.tsx` | Attendee dashboard |

### Larry — Database Engineer

Schema, migrations, auth endpoints and shared schemas.

| File | Responsibility |
|------|----------------|
| `Backend/migrations/*.sql` | All 16 migrations |
| `Backend/src/routes/auth.ts` | Auth and member endpoints |
| `Backend/src/middleware/auth.ts` | authenticate, authorize, password hashing |
| `Backend/src/storage/r2.ts` | R2 storage seam |
| `Backend/lib/api-zod/` | Shared Zod schemas and TypeScript types |

### Jeff — Backend Developer

Venue and session scheduling, plus the main router.

| File | Responsibility |
|------|----------------|
| `Backend/src/routes/conference.ts` | Venue CRUD and session scheduling routes |
| `Frontend/src/App.tsx` | Router and shared pages |

### Sean — Backend Developer

Attendee registration, capacity enforcement and check-in.

| File | Responsibility |
|------|----------------|
| `Backend/src/routes/conference.ts` | Conference and session registration, capacity checks, check-in, cancellation |

### Steve — Backend Developer

Speakers, speaker-to-session assignments and auth state.

| File | Responsibility |
|------|----------------|
| `Backend/src/routes/conference.ts` | Speaker CRUD and session-speaker assignment routes |
| `Frontend/src/context/auth-context.tsx` | Auth state |
| `Frontend/src/pages/speaker/dashboard.tsx` | Speaker dashboard |

### Fred — Backend Developer

Documents and reporting.

| File | Responsibility |
|------|----------------|
| `Backend/src/routes/conference.ts` | Document listing and report routes |
| `Frontend/src/pages/admin/dashboard.tsx` | Admin dashboard |
| `Frontend/src/pages/not-found.tsx` | Not-found page |

Several of these files are still placeholders. Members will send their completed work
and Samuel will merge it in.

---

## 8. Git workflow

Everyone pushes to `main`. Samuel reviews what comes in and merges or corrects it.

```bash
git pull origin main

# make your changes, then:
git add <your-files>
git commit -m "feat: add conference capacity checks"
git push origin main
```

- Only change files you own.
- Pull before you start.
- Do not commit `.env` files, tokens or passwords.
- Run `npx tsc --noEmit` and `npm run build` before pushing.

---

## 9. Running locally

```bash
# 1. Install
npm run install:all

# 2. Backend (terminal 1)
cd Backend
export PORT=3000
npm run dev

# 3. Frontend (terminal 2)
cd Frontend
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3000 |
| Health | http://localhost:3000/api/healthz |

Log in with `samuel@convene.com` / `Convene@2026`.

---

## 10. Deployment

**Backend**

```bash
cd Backend
wrangler deploy
```

**Frontend**

```bash
cd Frontend
npm run build
wrangler pages deploy dist --project-name=convene-management --branch=main
```

**Database** (once, in order)

```bash
cd Backend
for f in migrations/*.sql; do
  wrangler d1 execute convene_db --remote --file=$f
done
wrangler d1 execute convene_db --remote --file=./scripts/seed.sql
```

**R2** is not enabled yet. To turn it on: enable R2 in the Cloudflare Dashboard, create a
bucket named `convene-bucket`, uncomment the `[[r2_buckets]]` block in
`Backend/wrangler.toml`, then redeploy.

---

## 11. Tests

The suite in `tests/` runs 67 assertions against the live Worker using Bash and cURL.

```bash
chmod +x tests/*.sh
./tests/run_all.sh
```

| Suite | Covers |
|-------|--------|
| `auth_test.sh` | Login, bad password, unauthenticated access, role restrictions, logout |
| `conference_test.sh` | List, create, fetch, update, unauthorised create, availability |
| `attendee_registration_test.sh` | Signup, registration, duplicates, capacity |
| `session_test.sh` | Session creation, filtering, capacity, registration |
| `speaker_test.sh` | Speaker records, assignment, permissions |

`tests/TESTS.md` documents every test, the exact command, and the expected result.

---

## 12. API summary

All endpoints are under `/api`. Protected routes need the `session_id` cookie.

| Method | Path | Access |
|--------|------|--------|
| GET | `/healthz` | Public |
| POST | `/auth/signup` | Public (attendee, speaker) |
| POST | `/auth/login`, `/auth/logout` | Public |
| GET | `/auth/me` | Authenticated |
| GET/POST | `/auth/members` | Admin, organiser |
| PATCH/DELETE | `/auth/members/:id` | Admin, organiser |
| GET/POST | `/conferences` | GET: authenticated · POST: admin, organiser |
| GET/PATCH/DELETE | `/conferences/:id` | GET: authenticated · write: admin, organiser |
| GET | `/conferences/available` | Authenticated |
| POST | `/conferences/:id/register` | Authenticated |
| DELETE | `/conferences/:id/cancel` | Authenticated |
| GET | `/conferences/:id/registrations` | Admin, organiser |
| GET/POST | `/venues` | GET: authenticated · POST: admin, organiser |
| GET/POST | `/sessions` | GET: authenticated · POST: admin, organiser |
| GET | `/sessions/available` | Authenticated |
| POST | `/sessions/:id/register` | Authenticated |
| DELETE | `/sessions/:id/cancel` | Authenticated |
| GET | `/sessions/:id/registrations` | Admin, organiser |
| GET/POST | `/speakers` | GET: authenticated · POST: admin, organiser |
| POST | `/session-speakers` | Admin, organiser |
| GET | `/attendees` | Authenticated |
| GET | `/documents` | Authenticated |
| GET | `/reports/registration`, `/reports/attendance` | Admin, organiser |
| GET | `/dashboard/summary` | Authenticated |

Status codes: `200` success, `201` created, `400` validation or business rule,
`401` not signed in, `403` wrong role, `404` not found, `409` conflict.

---

## 13. Known gaps

- **R2 / document upload** — the storage seam exists but R2 is not enabled, so upload is
  not implemented. Documents can be listed.
- **Scheduling conflict detection** — capacity and duplicate checks are enforced;
  venue and speaker time-overlap detection is only partially wired.
- **Check-in** — the data model supports it; there is no check-in screen yet.
- **No payments, ticketing or invoicing** — out of scope.