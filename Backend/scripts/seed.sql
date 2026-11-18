-- Convene seed accounts.
--
-- Apply with:
--   wrangler d1 execute convene_db --remote --file=./scripts/seed.sql
--
-- Idempotent: existing rows are updated in place, missing rows are inserted.
-- Password hashes are PBKDF2-SHA256 (see Backend/src/middleware/auth.ts).
-- Regenerate a hash with: node scripts/hash-password.mjs "YourPassword"

INSERT OR IGNORE INTO roles (id, name, created_at) VALUES ('role-1', 'admin', datetime('now'));
INSERT OR IGNORE INTO roles (id, name, created_at) VALUES ('role-2', 'organiser', datetime('now'));
INSERT OR IGNORE INTO roles (id, name, created_at) VALUES ('role-3', 'speaker', datetime('now'));
INSERT OR IGNORE INTO roles (id, name, created_at) VALUES ('role-4', 'attendee', datetime('now'));

-- Samuel Makokha — Administrator
INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar_url, role_name, status, created_at)
VALUES ('seed-admin-2', 'role-1', 'Samuel Makokha', 'samuel@convene.com',
        'pbkdf2$10000$uHm9ZCE8T8SAVJ/lyIynuA==$L/c253wGU7KURtbQHlsOAapSXDIT39fePPs7o+HSkz8=',
        '+254700111222', NULL, 'admin', 'active', datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  email = excluded.email,
  password_hash = excluded.password_hash,
  role_id = excluded.role_id,
  role_name = excluded.role_name,
  status = excluded.status;

-- Austin Omondi — Organiser
INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar_url, role_name, status, created_at)
VALUES ('seed-organiser-2', 'role-2', 'Austin Omondi', 'austin@convene.com',
        'pbkdf2$10000$OQD+sKv1hMbNkmZCdsyVxg==$sCTVkiOQRU4QfkosMQCYlCUg1zjziPCVMQU60dvO6OY=',
        '+254700333444', NULL, 'organiser', 'active', datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  email = excluded.email,
  password_hash = excluded.password_hash,
  role_id = excluded.role_id,
  role_name = excluded.role_name,
  status = excluded.status;

-- Stephen — Speaker
INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar_url, role_name, status, created_at)
VALUES ('demo-speaker-1', 'role-3', 'Stephen Mwangi', 'stephen@convene.com',
        'pbkdf2$10000$NXNzkHZsal0pTG43roe1zw==$xy6IfWXMaAahk6ONLynMAgAMTX9d9jIGOcP0A1x1Khs=',
        '+254700222333', NULL, 'speaker', 'active', datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  email = excluded.email,
  password_hash = excluded.password_hash,
  role_id = excluded.role_id,
  role_name = excluded.role_name,
  status = excluded.status;

-- Sean — Attendee
INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar_url, role_name, status, created_at)
VALUES ('demo-attendee-1', 'role-4', 'Sean Omondi', 'sean@convene.com',
        'pbkdf2$10000$yqH1PltDNTgANzHSO9IhfA==$jXWdSMiM87hU/R9lORcfVCazYF6aKJDOp5WFALA9Tw4=',
        '+254700444555', NULL, 'attendee', 'active', datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  email = excluded.email,
  password_hash = excluded.password_hash,
  role_id = excluded.role_id,
  role_name = excluded.role_name,
  status = excluded.status;

-- Fred — Attendee
INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar_url, role_name, status, created_at)
VALUES ('demo-attendee-2', 'role-4', 'Fred Otieno', 'fred@convene.com',
        'pbkdf2$10000$acOicUxtWABAffqv4rv2Aw==$4P6gTRyemeykVadq0C5X0I+GFerppt0FnIjkelkyKsY=',
        '+254700666777', NULL, 'attendee', 'active', datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  email = excluded.email,
  password_hash = excluded.password_hash,
  role_id = excluded.role_id,
  role_name = excluded.role_name,
  status = excluded.status;

-- Demo conference
INSERT INTO conferences (id, title, description, start_date, end_date, created_by, created_at, capacity, status)
VALUES ('conf-demo-1', 'Convene Conference 2026',
        'Annual gathering for the Convene community — talks, workshops and networking.',
        '2026-12-03T09:00:00.000Z', '2026-12-04T17:00:00.000Z', 'seed-organiser-2', datetime('now'), 300, 'upcoming')
ON CONFLICT(id) DO UPDATE SET
  title = excluded.title,
  description = excluded.description,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  capacity = excluded.capacity,
  status = excluded.status;

-- Venues for the demo conference
INSERT INTO venues (id, conference_id, name, building, room, capacity, created_at)
VALUES ('venue-demo-1', 'conf-demo-1', 'Main Auditorium', 'Main Building', 'AUD-01', 850, datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  building = excluded.building,
  room = excluded.room,
  capacity = excluded.capacity;

INSERT INTO venues (id, conference_id, name, building, room, capacity, created_at)
VALUES ('venue-demo-2', 'conf-demo-1', 'Microsoft Auditorium', 'ICT Building', 'AUD-02', 300, datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  building = excluded.building,
  room = excluded.room,
  capacity = excluded.capacity;

INSERT INTO venues (id, conference_id, name, building, room, capacity, created_at)
VALUES ('venue-demo-3', 'conf-demo-1', 'STMB Basement 5', 'STMB', 'B5-05', 120, datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  building = excluded.building,
  room = excluded.room,
  capacity = excluded.capacity;

-- Speaker profile for Stephen
INSERT INTO speakers (id, user_id, bio, photo_url, created_at)
VALUES ('spk-demo-1', 'demo-speaker-1',
        'Software engineer and long-time organiser of developer meetups in Nairobi.',
        NULL, datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  user_id = excluded.user_id,
  bio = excluded.bio;

-- Sessions for the demo conference
INSERT INTO sessions (id, conference_id, venue_id, title, description, start_time, end_time, created_at, capacity)
VALUES ('sess-demo-1', 'conf-demo-1', 'venue-demo-1',
        'Opening keynote: The future of AI',
        'Where artificial intelligence is heading and what it means for people building software today.',
        '2026-12-03T09:00:00.000Z', '2026-12-03T10:00:00.000Z', datetime('now'), 850)
ON CONFLICT(id) DO UPDATE SET
  venue_id = excluded.venue_id,
  title = excluded.title,
  description = excluded.description,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  capacity = excluded.capacity;

INSERT INTO sessions (id, conference_id, venue_id, title, description, start_time, end_time, created_at, capacity)
VALUES ('sess-demo-2', 'conf-demo-1', 'venue-demo-2',
        'Building AI products that actually ship',
        'A practical walkthrough of taking an AI feature from prototype to production.',
        '2026-12-03T11:00:00.000Z', '2026-12-03T12:00:00.000Z', datetime('now'), 300)
ON CONFLICT(id) DO UPDATE SET
  venue_id = excluded.venue_id,
  title = excluded.title,
  description = excluded.description,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  capacity = excluded.capacity;

INSERT INTO sessions (id, conference_id, venue_id, title, description, start_time, end_time, created_at, capacity)
VALUES ('sess-demo-3', 'conf-demo-1', 'venue-demo-3',
        'University life in a digital age',
        'How students use technology to learn, collaborate and organise campus life.',
        '2026-12-03T14:00:00.000Z', '2026-12-03T15:00:00.000Z', datetime('now'), 120)
ON CONFLICT(id) DO UPDATE SET
  venue_id = excluded.venue_id,
  title = excluded.title,
  description = excluded.description,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  capacity = excluded.capacity;

INSERT INTO sessions (id, conference_id, venue_id, title, description, start_time, end_time, created_at, capacity)
VALUES ('sess-demo-4', 'conf-demo-1', 'venue-demo-1',
        'Careers in technology: an open panel',
        'Hiring managers and engineers discuss what they look for and how to get started.',
        '2026-12-04T09:00:00.000Z', '2026-12-04T10:30:00.000Z', datetime('now'), 850)
ON CONFLICT(id) DO UPDATE SET
  venue_id = excluded.venue_id,
  title = excluded.title,
  description = excluded.description,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  capacity = excluded.capacity;

-- Speaker assignments
INSERT INTO session_speakers (id, session_id, speaker_id, speaker_role, created_at)
VALUES ('ss-demo-1', 'sess-demo-1', 'spk-demo-1', 'keynote', datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  speaker_role = excluded.speaker_role;

INSERT INTO session_speakers (id, session_id, speaker_id, speaker_role, created_at)
VALUES ('ss-demo-2', 'sess-demo-2', 'spk-demo-1', 'speaker', datetime('now'))
ON CONFLICT(id) DO UPDATE SET
  speaker_role = excluded.speaker_role;