# Database Design

**Tech stack:** Cloudflare D1 (SQLite-compatible serverless) with Drizzle ORM.

---

## Entity Relationship Diagram

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
                         ┌─────────────┼───────────────┐
                         │             │               │
                         ▼             ▼               ▼
                  ┌────────────┐  ┌────────────┐  ┌─────────────┐
                  │ CONFERENCES│  │   VENUES   │  │ATTENDEE_    │
                  ├────────────┤  ├────────────┤  │SESSIONS     │
                  │conference_ │  │ venue_id PK│  ├─────────────┤
                  │  id PK     │  │conference_ │  │ id PK       │
                  │ title      │  │  id FK     │  │ attendee_id │
                  │description │  │ name       │  │  FK         │
                  │ start_date │  │ building   │  │ session_id  │
                  │ end_date   │  │ room       │  │  FK         │
                  │ created_by │  │ capacity   │  │ registered_at│
                  │ created_at │  │ created_at │  │ checked_in_at│
                  └────────────┘  └────────────┘  │ status      │
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

---

## Table Descriptions

### roles

Stores the system's available user roles.

| Column     | Type   | Constraints              | Description                                  |
| ---------- | ------ | ------------------------ | -------------------------------------------- |
| id         | TEXT   | PRIMARY KEY              | Unique role ID                               |
| name       | TEXT   | NOT NULL, UNIQUE         | Role name (admin, organiser, speaker, attendee) |
| created_at | TEXT   | DEFAULT CURRENT_TIMESTAMP | Creation timestamp                          |

### users

The central authentication/user table.

| Column         | Type   | Constraints              | Description                |
| -------------- | ------ | ------------------------ | -------------------------- |
| id             | TEXT   | PRIMARY KEY              | Unique user ID             |
| role_id        | TEXT   | NOT NULL, FK → roles(id) | User's role                |
| name           | TEXT   | NOT NULL                 | Full name                  |
| email          | TEXT   | NOT NULL, UNIQUE         | Login email                |
| password_hash  | TEXT   | -                        | Hashed password            |
| phone          | TEXT   | -                        | Phone number               |
| avatar_url     | TEXT   | -                        | Profile image URL          |
| created_at     | TEXT   | DEFAULT CURRENT_TIMESTAMP | Account creation time     |

### conferences

Represents each conference/event.

| Column      | Type   | Constraints              | Description                            |
| ----------- | ------ | ------------------------ | -------------------------------------- |
| id          | TEXT   | PRIMARY KEY              | Unique conference ID                   |
| title       | TEXT   | NOT NULL                 | Conference name                        |
| description | TEXT   | DEFAULT ''               | Conference description                 |
| start_date  | TEXT   | NOT NULL                 | Conference start date                  |
| end_date    | TEXT   | NOT NULL                 | Conference end date                    |
| created_by  | TEXT   | FK → users(id)           | Organizer who created it               |
| created_at  | TEXT   | DEFAULT CURRENT_TIMESTAMP | Creation timestamp                   |

### venues

Stores physical locations.

| Column        | Type    | Constraints              | Description                       |
| ------------- | ------- | ------------------------ | --------------------------------- |
| id            | TEXT    | PRIMARY KEY              | Unique venue ID                   |
| conference_id | TEXT    | NOT NULL, FK → conferences(id) | Conference using venue        |
| name          | TEXT    | NOT NULL                 | Venue name                        |
| building      | TEXT    | DEFAULT ''               | Building name                     |
| room          | TEXT    | DEFAULT ''               | Room number/name                  |
| capacity      | INTEGER | DEFAULT 0                | Maximum capacity                  |
| created_at    | TEXT    | DEFAULT CURRENT_TIMESTAMP | Creation timestamp               |

### sessions

The actual conference timetable.

| Column        | Type   | Constraints              | Description                          |
| ------------- | ------ | ------------------------ | ------------------------------------ |
| id            | TEXT   | PRIMARY KEY              | Unique session ID                    |
| conference_id | TEXT   | NOT NULL, FK → conferences(id) | Conference                    |
| venue_id      | TEXT   | FK → venues(id)          | Where session occurs                 |
| title         | TEXT   | NOT NULL                 | Session title                        |
| description   | TEXT   | DEFAULT ''               | Session description                  |
| start_time    | TEXT   | NOT NULL                 | Starting date/time                   |
| end_time      | TEXT   | NOT NULL                 | Ending date/time                     |
| created_at    | TEXT   | DEFAULT CURRENT_TIMESTAMP | Creation timestamp                 |

### speakers

Speaker profiles linked to users.

| Column     | Type | Constraints              | Description                     |
| ---------- | ---- | ------------------------ | ------------------------------- |
| id         | TEXT | PRIMARY KEY              | Speaker profile ID              |
| user_id    | TEXT | FK → users(id)           | Related user account            |
| bio        | TEXT | DEFAULT ''               | Speaker biography               |
| photo_url  | TEXT | -                        | Speaker photo URL               |
| created_at | TEXT | DEFAULT CURRENT_TIMESTAMP | Profile creation time          |

### attendees

Attendee profiles linked to users.

| Column      | Type | Constraints                | Description                  |
| ----------- | ---- | -------------------------- | ---------------------------- |
| id          | TEXT | PRIMARY KEY                | Attendee profile ID          |
| user_id     | TEXT | NOT NULL, FK → users(id)   | Related user account         |
| created_at  | TEXT | DEFAULT CURRENT_TIMESTAMP | Profile creation time       |

### conference_attendees

Junction table for attendee conference registrations.

| Column            | Type   | Constraints                      | Description                          |
| ----------------- | ------ | -------------------------------- | ------------------------------------ |
| id                | TEXT   | PRIMARY KEY                      | Unique registration ID               |
| attendee_id       | TEXT   | NOT NULL, FK → attendees(id)     | Attendee                             |
| conference_id     | TEXT   | NOT NULL, FK → conferences(id)   | Conference                           |
| registration_date | TEXT   | DEFAULT CURRENT_TIMESTAMP        | Registration time                    |
| status            | TEXT   | DEFAULT 'pending'                | pending, confirmed, cancelled        |

### attendee_sessions

Junction table for attendee session registrations.

| Column         | Type   | Constraints                      | Description                          |
| -------------- | ------ | -------------------------------- | ------------------------------------ |
| id             | TEXT   | PRIMARY KEY                      | Unique record ID                     |
| attendee_id    | TEXT   | NOT NULL, FK → attendees(id)     | Attendee                             |
| session_id     | TEXT   | NOT NULL, FK → sessions(id)      | Session                              |
| registered_at  | TEXT   | DEFAULT CURRENT_TIMESTAMP        | Session registration time            |
| checked_in_at  | TEXT   | -                                | Actual session check-in              |
| status         | TEXT   | DEFAULT 'registered'             | registered, attended, cancelled, no_show |

### session_speakers

Junction table for session-speaker assignments.

| Column        | Type   | Constraints                    | Description                              |
| ------------- | ------ | ------------------------------ | ---------------------------------------- |
| id            | TEXT   | PRIMARY KEY                    | Unique assignment ID                     |
| session_id    | TEXT   | NOT NULL, FK → sessions(id)    | Session                                  |
| speaker_id    | TEXT   | NOT NULL, FK → speakers(id)    | Speaker                                  |
| speaker_role  | TEXT   | DEFAULT 'speaker'              | keynote, speaker, panelist, moderator    |
| created_at    | TEXT   | DEFAULT CURRENT_TIMESTAMP      | Assignment time                          |

### documents

Uploaded files and documents stored in Cloudflare R2.

| Column        | Type   | Constraints                    | Description                              |
| ------------- | ------ | ------------------------------ | ---------------------------------------- |
| id            | TEXT   | PRIMARY KEY                    | Unique document ID                       |
| user_id       | TEXT   | NOT NULL, FK → users(id)       | Uploader                                 |
| conference_id | TEXT   | FK → conferences(id)           | Associated conference                    |
| session_id    | TEXT   | FK → sessions(id)              | Associated session                       |
| type          | TEXT   | NOT NULL                       | Document type                            |
| file_key      | TEXT   | NOT NULL                       | Storage key (R2 object key)              |
| file_url      | TEXT   | -                              | Access URL (may be signed)               |
| file_name     | TEXT   | NOT NULL                       | Original filename                        |
| file_size     | INTEGER | DEFAULT 0                     | File size in bytes                       |
| content_type  | TEXT   | DEFAULT 'application/octet-stream' | MIME type                          |
| created_at    | TEXT   | DEFAULT CURRENT_TIMESTAMP      | Upload timestamp                         |

### permissions & role_permissions

Role-based access control system.

**permissions table:**

| Column       | Type   | Constraints              | Description                |
| ------------ | ------ | ------------------------ | -------------------------- |
| id           | TEXT   | PRIMARY KEY              | Unique permission ID       |
| name         | TEXT   | NOT NULL, UNIQUE         | Permission name            |
| description  | TEXT   | -                        | Permission description     |
| created_at   | TEXT   | DEFAULT CURRENT_TIMESTAMP | Creation timestamp       |

**role_permissions table:**

| Column        | Type   | Constraints                      | Description                      |
| ------------- | ------ | -------------------------------- | -------------------------------- |
| role_id       | TEXT   | NOT NULL, FK → roles(id)         | Reference to role                |
| permission_id | TEXT   | NOT NULL, FK → permissions(id)   | Reference to permission          |
| -             | -      | PRIMARY KEY (role_id, permission_id) | Composite primary key         |
