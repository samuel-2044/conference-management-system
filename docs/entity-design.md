# Entity Design

This document describes the core entities of the Convene conference management system, their attributes, relationships, and business rules.

**Persistence layer:** Cloudflare D1 (SQLite-compatible) via Drizzle ORM.
**File/image storage:** Cloudflare R2 (see `docs/storage.md`).

---

## Core Entities

### User
A system user account. Every member of the system (organiser, speaker, attendee, admin) is a `User`.

| Attribute       | Type   | Notes                                  |
| --------------- | ------ | -------------------------------------- |
| id              | TEXT   | Primary key                            |
| role_id         | TEXT   | Foreign key → Role                      |
| name            | TEXT   | Full name                              |
| email           | TEXT   | Unique, used for login                 |
| password_hash   | TEXT   | Bcrypt-hashed password                 |
| phone           | TEXT   | Optional contact number                |
| avatar_url      | TEXT   | Profile image URL (R2-backed)          |

### Role
Defines permission tiers for users.

| Attribute  | Type   | Notes                                           |
| ---------- | ------ | ----------------------------------------------- |
| id         | TEXT   | Primary key                                     |
| name       | TEXT   | admin, organiser, speaker, attendee            |

### Permission
A granular action right (e.g. `conference:create`). Tied to roles via the `role_permissions` join table.

| Attribute   | Type   | Notes                 |
| ----------- | ------ | --------------------- |
| id          | TEXT   | Primary key           |
| name        | TEXT   | Unique                |
| description | TEXT   | Optional explanation  |

### Conference
The top-level event managed by an organiser.

| Attribute     | Type   | Notes                              |
| ------------- | ------ | ---------------------------------- |
| id            | TEXT   | Primary key                        |
| title         | TEXT   | Conference name                    |
| description   | TEXT   | Full description                   |
| start_date    | TEXT   | ISO date                           |
| end_date      | TEXT   | ISO date                           |
| created_by    | TEXT   | Foreign key → User (organiser)     |

### Venue
A physical location (building + room) booked by a conference.

| Attribute        | Type    | Notes                                  |
| ---------------- | ------- | -------------------------------------- |
| id               | TEXT    | Primary key                            |
| conference_id    | TEXT    | Foreign key → Conference               |
| name             | TEXT    | Venue name                             |
| building         | TEXT    | Building name                          |
| room             | TEXT    | Room number/name                       |
| capacity         | INTEGER | Max occupants                          |

### Session
A scheduled event slot within a conference (talks, panels, etc.).

| Attribute        | Type   | Notes                                  |
| ---------------- | ------ | -------------------------------------- |
| id               | TEXT   | Primary key                            |
| conference_id    | TEXT   | Foreign key → Conference               |
| venue_id         | TEXT   | Foreign key → Venue (nullable)         |
| title            | TEXT   | Session title                          |
| description      | TEXT   | Full description                       |
| start_time       | TEXT   | ISO datetime                           |
| end_time         | TEXT   | ISO datetime                           |

### Speaker
Profile extensions for users who present at sessions.

| Attribute  | Type               | Notes                        |
| ---------- | ------------------ | ---------------------------- |
| id         | TEXT               | Primary key                  |
| user_id    | TEXT               | Foreign key → User (nullable)  |
| bio        | TEXT               | Speaker biography            |
| photo_url  | TEXT               | Speaker photo URL (R2-backed)|

### Attendee
Profile extensions for users registered to attend conferences.

| Attribute   | Type   | Notes                          |
| ----------- | ------ | ------------------------------ |
| id          | TEXT   | Primary key                    |
| user_id     | TEXT   | Foreign key → User             |

### Document
A file (slides, paper, image) uploaded by a user, attached to a conference, session, or standalone.

| Attribute      | Type    | Notes                                       |
| -------------- | ------- | ------------------------------------------- |
| id             | TEXT    | Primary key                                 |
| user_id        | TEXT    | Foreign key → User (uploader)               |
| conference_id  | TEXT    | Foreign key → Conference (nullable)         |
| session_id     | TEXT    | Foreign key → Session (nullable)            |
| type           | TEXT    | E.g. slide, paper, image, attachment        |
| file_key       | TEXT    | R2 object key                               |
| file_url       | TEXT    | Signed/public URL                            |
| file_name      | TEXT    | Original filename                           |
| file_size      | INTEGER | Size in bytes                                |
| content_type   | TEXT    | MIME type                                    |

---

## Relationships & Cardinality

```
Role          1 ———— *       User
User          1 ———— 1       Speaker
User          1 ———— 1       Attendee
User          1 ———— *       Document (as uploader)
User          1 ———— *       Conference (as organiser)

Conference    1 ———— *       Venue
Conference    1 ———— *       Session
Conference    1 ———— *       ConferenceAttendee
Conference    1 ———— *       Document (nullable)

Attendee      1 ———— *       ConferenceAttendee  (registration)
Attendee      1 ———— *       AttendeeSession     (session registration + check-in)

Session       1 ———— *       AttendeeSession
Session       1 ———— *       SessionSpeaker
Session       1 ———— *       Document (nullable)
Session       1 ———— 1       Venue (nullable)

Speaker       1 ———— *       SessionSpeaker

Role          * ———— *       Permission   (via role_permissions)
```

### Cardinality Notes

- A **Conference** has many **Venues** and many **Sessions**; each Session belongs to exactly one Conference and optionally one Venue.
- An **Attendee** registers for many Conferences (via `conference_attendees`) and for many Sessions (via `attendee_sessions`), with a check-in status per session.
- A **Session** links many **Speakers** (via `session_speakers`) and many **Attendees** (via `attendee_sessions`).
- **Documents** can attach to a Conference, a Session, neither, or be user-scoped uploads; stored in R2.

---

## Business Rules

1. A user can have only one role.
2. A speaker/attendee record extends an existing user.
3. An attendee's registration status defaults to `pending` and transitions to `confirmed` / `cancelled`.
4. An attendee's session status defaults to `registered`; check-in sets `checked_in_at` and status to `attended`.
5. A session cannot overlap the same venue for the same time window (enforced at app layer).
6. Document `file_key` maps 1:1 to an R2 object; `file_url` is resolved via the Worker (signed or public).
7. Passwords are never stored in plain text — `password_hash` only.
