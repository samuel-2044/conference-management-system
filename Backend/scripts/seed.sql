-- Convene seed data.
--
-- Apply with:
--   wrangler d1 execute convene_db --remote --file=./scripts/seed.sql
--
-- Resets the conference data and re-inserts it with stable sk-N ids, so the
-- script is safe to re-run and never creates duplicates.
-- Password hashes are PBKDF2-SHA256 (see Backend/src/middleware/auth.ts).
-- Regenerate a hash with: node scripts/hash-password.mjs "YourPassword"

-- ---------------------------------------------------------------------------
-- Clear previous data (children before parents)
-- ---------------------------------------------------------------------------

DELETE FROM session_speakers;
DELETE FROM attendee_sessions;
DELETE FROM conference_attendees;
DELETE FROM speakers;
DELETE FROM sessions;
DELETE FROM venues;
DELETE FROM conferences;
DELETE FROM attendees;
DELETE FROM users;

INSERT OR IGNORE INTO roles (id, name, created_at) VALUES ('role-1', 'admin', datetime('now'));
INSERT OR IGNORE INTO roles (id, name, created_at) VALUES ('role-2', 'organiser', datetime('now'));
INSERT OR IGNORE INTO roles (id, name, created_at) VALUES ('role-3', 'speaker', datetime('now'));
INSERT OR IGNORE INTO roles (id, name, created_at) VALUES ('role-4', 'attendee', datetime('now'));

-- ---------------------------------------------------------------------------
-- Group members. All share the development password Convene@2026.
-- ---------------------------------------------------------------------------

-- sk-1 · Makokha Samuel — Administrator
INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar_url, role_name, status, created_at)
VALUES ('sk-1', 'role-1', 'Makokha Samuel', 'samuel@convene.com',
        'pbkdf2$10000$uHm9ZCE8T8SAVJ/lyIynuA==$L/c253wGU7KURtbQHlsOAapSXDIT39fePPs7o+HSkz8=',
        '+254700111222', NULL, 'admin', 'active', datetime('now'));

-- sk-2 · Austin Omondi — Organiser
INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar_url, role_name, status, created_at)
VALUES ('sk-2', 'role-2', 'Austin Omondi', 'austin@convene.com',
        'pbkdf2$10000$OQD+sKv1hMbNkmZCdsyVxg==$sCTVkiOQRU4QfkosMQCYlCUg1zjziPCVMQU60dvO6OY=',
        '+254700333444', NULL, 'organiser', 'active', datetime('now'));

-- sk-3 · Larry Kosgey — Attendee
INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar_url, role_name, status, created_at)
VALUES ('sk-3', 'role-4', 'Larry Kosgey', 'larry@convene.com',
        'pbkdf2$10000$4YshViYefVGMPRnkVSrXyg==$XfkMnutEyAGoar0htoz8FvLxqN1Ts5ja2vCh1TC8f6E=',
        NULL, NULL, 'attendee', 'active', datetime('now'));

-- sk-4 · Jeff Muiruri — Speaker
INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar_url, role_name, status, created_at)
VALUES ('sk-4', 'role-3', 'Jeff Muiruri', 'jeff@convene.com',
        'pbkdf2$10000$8spViqgOqQZ0i1qkbKzC9g==$Gl0BVFW3CdpCMEfnm184tZd9gdFpzDr9zAAEBCTl+v4=',
        NULL, NULL, 'speaker', 'active', datetime('now'));

-- sk-5 · Sean Mwangi — Attendee
INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar_url, role_name, status, created_at)
VALUES ('sk-5', 'role-4', 'Sean Mwangi', 'sean@convene.com',
        'pbkdf2$10000$yqH1PltDNTgANzHSO9IhfA==$jXWdSMiM87hU/R9lORcfVCazYF6aKJDOp5WFALA9Tw4=',
        NULL, NULL, 'attendee', 'active', datetime('now'));

-- sk-6 · Stephen Njoroge — Speaker
INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar_url, role_name, status, created_at)
VALUES ('sk-6', 'role-3', 'Stephen Njoroge', 'stephen@convene.com',
        'pbkdf2$10000$NXNzkHZsal0pTG43roe1zw==$xy6IfWXMaAahk6ONLynMAgAMTX9d9jIGOcP0A1x1Khs=',
        NULL, NULL, 'speaker', 'active', datetime('now'));

-- sk-7 · Wilfred Maina — Attendee
INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar_url, role_name, status, created_at)
VALUES ('sk-7', 'role-4', 'Wilfred Maina', 'wilfred@convene.com',
        'pbkdf2$10000$Ai++1ED/A8RmP7OlfMwwtg==$G9GP56pOjquZ4hdJRogrMer0lMZqvsAShFm/sLnvvi0=',
        NULL, NULL, 'attendee', 'active', datetime('now'));

-- sk-8 · Elvis Adachi — Attendee
INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar_url, role_name, status, created_at)
VALUES ('sk-8', 'role-4', 'Elvis Adachi', 'elvis@convene.com',
        'pbkdf2$10000$DG/Jn3TuViZ2UmhcDj2qAQ==$oEBPkIpiqoZiPtcozEvcYBHVkUmernGaEyfGkoxWWo8=',
        NULL, NULL, 'attendee', 'active', datetime('now'));

-- ---------------------------------------------------------------------------
-- Conference
-- ---------------------------------------------------------------------------

INSERT INTO conferences (id, title, description, start_date, end_date, created_by, created_at, capacity, status)
VALUES ('conf-1', 'Convene Conference 2026',
        'Annual gathering for the Convene community — talks, workshops and networking.',
        '2026-12-03T09:00:00.000Z', '2026-12-04T17:00:00.000Z', 'sk-2', datetime('now'), 300, 'upcoming');

-- Venues
INSERT INTO venues (id, conference_id, name, building, room, capacity, created_at)
VALUES ('venue-1', 'conf-1', 'Main Auditorium', 'Main Building', 'AUD-01', 850, datetime('now'));

INSERT INTO venues (id, conference_id, name, building, room, capacity, created_at)
VALUES ('venue-2', 'conf-1', 'Microsoft Auditorium', 'ICT Building', 'AUD-02', 300, datetime('now'));

INSERT INTO venues (id, conference_id, name, building, room, capacity, created_at)
VALUES ('venue-3', 'conf-1', 'STMB Basement 5', 'STMB', 'B5-05', 120, datetime('now'));

-- ---------------------------------------------------------------------------
-- Speakers
-- ---------------------------------------------------------------------------

INSERT INTO speakers (id, user_id, bio, photo_url, created_at)
VALUES ('spk-1', 'sk-6',
        'Engineer working across AI and web platforms, and a regular meetup organiser.',
        NULL, datetime('now'));

INSERT INTO speakers (id, user_id, bio, photo_url, created_at)
VALUES ('spk-2', 'sk-4',
        'Builds developer tools and speaks on practical software delivery.',
        NULL, datetime('now'));

-- ---------------------------------------------------------------------------
-- Sessions
-- ---------------------------------------------------------------------------

INSERT INTO sessions (id, conference_id, venue_id, title, description, start_time, end_time, created_at, capacity)
VALUES ('sess-1', 'conf-1', 'venue-1',
        'Opening keynote: The future of AI',
        'Where artificial intelligence is heading and what it means for people building software today.',
        '2026-12-03T09:00:00.000Z', '2026-12-03T10:00:00.000Z', datetime('now'), 850);

INSERT INTO sessions (id, conference_id, venue_id, title, description, start_time, end_time, created_at, capacity)
VALUES ('sess-2', 'conf-1', 'venue-2',
        'Building AI products that actually ship',
        'A practical walkthrough of taking an AI feature from prototype to production.',
        '2026-12-03T11:00:00.000Z', '2026-12-03T12:00:00.000Z', datetime('now'), 300);

INSERT INTO sessions (id, conference_id, venue_id, title, description, start_time, end_time, created_at, capacity)
VALUES ('sess-3', 'conf-1', 'venue-3',
        'University life in a digital age',
        'How students use technology to learn, collaborate and organise campus life.',
        '2026-12-03T14:00:00.000Z', '2026-12-03T15:00:00.000Z', datetime('now'), 120);

INSERT INTO sessions (id, conference_id, venue_id, title, description, start_time, end_time, created_at, capacity)
VALUES ('sess-4', 'conf-1', 'venue-1',
        'Careers in technology: an open panel',
        'Hiring managers and engineers discuss what they look for and how to get started.',
        '2026-12-04T09:00:00.000Z', '2026-12-04T10:30:00.000Z', datetime('now'), 850);

-- ---------------------------------------------------------------------------
-- Speaker assignments
-- ---------------------------------------------------------------------------

INSERT INTO session_speakers (id, session_id, speaker_id, speaker_role, created_at)
VALUES ('ss-1', 'sess-1', 'spk-1', 'keynote', datetime('now'));

INSERT INTO session_speakers (id, session_id, speaker_id, speaker_role, created_at)
VALUES ('ss-2', 'sess-2', 'spk-2', 'speaker', datetime('now'));

INSERT INTO session_speakers (id, session_id, speaker_id, speaker_role, created_at)
VALUES ('ss-3', 'sess-4', 'spk-1', 'moderator', datetime('now'));