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
-- Users. All share the development password Convene@2026.
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

-- sk-9 · Sarah Wanjiku — Organiser
INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar_url, role_name, status, created_at)
VALUES ('sk-9', 'role-2', 'Sarah Wanjiku', 'sarah@convene.com',
        'pbkdf2$10000$uHm9ZCE8T8SAVJ/lyIynuA==$L/c253wGU7KURtbQHlsOAapSXDIT39fePPs7o+HSkz8=',
        '+254700555666', NULL, 'organiser', 'active', datetime('now'));

-- sk-10 · Brian Otieno — Speaker
INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar_url, role_name, status, created_at)
VALUES ('sk-10', 'role-3', 'Brian Otieno', 'brian@convene.com',
        'pbkdf2$10000$uHm9ZCE8T8SAVJ/lyIynuA==$L/c253wGU7KURtbQHlsOAapSXDIT39fePPs7o+HSkz8=',
        NULL, NULL, 'speaker', 'active', datetime('now'));

-- sk-11 · Grace Achieng — Attendee
INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar_url, role_name, status, created_at)
VALUES ('sk-11', 'role-4', 'Grace Achieng', 'grace@convene.com',
        'pbkdf2$10000$uHm9ZCE8T8SAVJ/lyIynuA==$L/c253wGU7KURtbQHlsOAapSXDIT39fePPs7o+HSkz8=',
        NULL, NULL, 'attendee', 'active', datetime('now'));

-- sk-12 · Kevin Mutua — Attendee
INSERT INTO users (id, role_id, name, email, password_hash, phone, avatar_url, role_name, status, created_at)
VALUES ('sk-12', 'role-4', 'Kevin Mutua', 'kevin@convene.com',
        'pbkdf2$10000$uHm9ZCE8T8SAVJ/lyIynuA==$L/c253wGU7KURtbQHlsOAapSXDIT39fePPs7o+HSkz8=',
        NULL, NULL, 'attendee', 'active', datetime('now'));

-- ---------------------------------------------------------------------------
-- Conferences
-- ---------------------------------------------------------------------------

-- Conference 1: Convene Conference 2026 (upcoming)
INSERT INTO conferences (id, title, description, start_date, end_date, created_by, created_at, capacity, status)
VALUES ('conf-1', 'Convene Conference 2026',
        'Annual gathering for the Convene community — talks, workshops and networking.',
        '2026-12-03T09:00:00.000Z', '2026-12-04T17:00:00.000Z', 'sk-2', datetime('now'), 300, 'upcoming');

-- Conference 2: Tech Summit Africa 2026 (upcoming)
INSERT INTO conferences (id, title, description, start_date, end_date, created_by, created_at, capacity, status)
VALUES ('conf-2', 'Tech Summit Africa 2026',
        'Premier technology conference covering AI, cloud, and mobile development across Africa.',
        '2027-02-15T08:00:00.000Z', '2027-02-17T18:00:00.000Z', 'sk-9', datetime('now'), 500, 'upcoming');

-- Conference 3: Nairobi Developer Week (ongoing)
INSERT INTO conferences (id, title, description, start_date, end_date, created_by, created_at, capacity, status)
VALUES ('conf-3', 'Nairobi Developer Week',
        'A week-long celebration of software development with hackathons, talks, and workshops.',
        '2026-11-18T09:00:00.000Z', '2026-11-22T17:00:00.000Z', 'sk-2', datetime('now'), 200, 'ongoing');

-- ---------------------------------------------------------------------------
-- Venues
-- ---------------------------------------------------------------------------

-- Venues for Conference 1
INSERT INTO venues (id, conference_id, name, building, room, capacity, created_at)
VALUES ('venue-1', 'conf-1', 'Main Auditorium', 'Main Building', 'AUD-01', 850, datetime('now'));
INSERT INTO venues (id, conference_id, name, building, room, capacity, created_at)
VALUES ('venue-2', 'conf-1', 'Microsoft Auditorium', 'ICT Building', 'AUD-02', 300, datetime('now'));
INSERT INTO venues (id, conference_id, name, building, room, capacity, created_at)
VALUES ('venue-3', 'conf-1', 'STMB Basement 5', 'STMB', 'B5-05', 120, datetime('now'));

-- Venues for Conference 2
INSERT INTO venues (id, conference_id, name, building, room, capacity, created_at)
VALUES ('venue-4', 'conf-2', 'KICC Plenary Hall', 'KICC', 'PLN-01', 1500, datetime('now'));
INSERT INTO venues (id, conference_id, name, building, room, capacity, created_at)
VALUES ('venue-5', 'conf-2', 'KICC Room 1', 'KICC', 'RM-101', 400, datetime('now'));
INSERT INTO venues (id, conference_id, name, building, room, capacity, created_at)
VALUES ('venue-6', 'conf-2', 'KICC Room 2', 'KICC', 'RM-102', 250, datetime('now'));

-- Venues for Conference 3
INSERT INTO venues (id, conference_id, name, building, room, capacity, created_at)
VALUES ('venue-7', 'conf-3', 'iHub Auditorium', 'iHub', 'AUD-01', 200, datetime('now'));
INSERT INTO venues (id, conference_id, name, building, room, capacity, created_at)
VALUES ('venue-8', 'conf-3', 'Nairobi Garage', 'Ruaraka', 'GAR-01', 150, datetime('now'));

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
INSERT INTO speakers (id, user_id, bio, photo_url, created_at)
VALUES ('spk-3', 'sk-10',
        'Cloud architect specialising in serverless and edge computing.',
        NULL, datetime('now'));

-- ---------------------------------------------------------------------------
-- Sessions — Conference 1 (Dec 3-4, 2026)
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

INSERT INTO sessions (id, conference_id, venue_id, title, description, start_time, end_time, created_at, capacity)
VALUES ('sess-5', 'conf-1', 'venue-2',
        'Hands-on: Deploying to the edge',
        'Live coding session deploying a full-stack app to Cloudflare Workers.',
        '2026-12-04T11:00:00.000Z', '2026-12-04T13:00:00.000Z', datetime('now'), 300);

INSERT INTO sessions (id, conference_id, venue_id, title, description, start_time, end_time, created_at, capacity)
VALUES ('sess-6', 'conf-1', 'venue-3',
        'Networking & closing remarks',
        'Wrap up the conference with networking and final thoughts.',
        '2026-12-04T15:00:00.000Z', '2026-12-04T17:00:00.000Z', datetime('now'), 120);

-- Sessions — Conference 2 (Feb 15-17, 2027)
INSERT INTO sessions (id, conference_id, venue_id, title, description, start_time, end_time, created_at, capacity)
VALUES ('sess-7', 'conf-2', 'venue-4',
        'Keynote: Africa as the next tech hub',
        'Why Africa is poised to lead the next wave of technology innovation.',
        '2027-02-15T08:00:00.000Z', '2027-02-15T09:30:00.000Z', datetime('now'), 1500);

INSERT INTO sessions (id, conference_id, venue_id, title, description, start_time, end_time, created_at, capacity)
VALUES ('sess-8', 'conf-2', 'venue-5',
        'Scaling startups on a budget',
        'How to build and scale your tech startup with limited resources.',
        '2027-02-15T10:00:00.000Z', '2027-02-15T11:30:00.000Z', datetime('now'), 400);

INSERT INTO sessions (id, conference_id, venue_id, title, description, start_time, end_time, created_at, capacity)
VALUES ('sess-9', 'conf-2', 'venue-6',
        'Mobile-first design patterns',
        'Best practices for building mobile-first web applications.',
        '2027-02-16T09:00:00.000Z', '2027-02-16T12:00:00.000Z', datetime('now'), 250);

INSERT INTO sessions (id, conference_id, venue_id, title, description, start_time, end_time, created_at, capacity)
VALUES ('sess-10', 'conf-2', 'venue-4',
        'Panel: The future of work in tech',
        'Industry leaders discuss remote work, AI, and the changing workplace.',
        '2027-02-17T09:00:00.000Z', '2027-02-17T10:30:00.000Z', datetime('now'), 1500);

-- Sessions — Conference 3 (Nov 18-22, 2026 — ongoing)
INSERT INTO sessions (id, conference_id, venue_id, title, description, start_time, end_time, created_at, capacity)
VALUES ('sess-11', 'conf-3', 'venue-7',
        'Hackathon kickoff',
        'Teams compete to build the best solution to real-world problems.',
        '2026-11-18T09:00:00.000Z', '2026-11-18T12:00:00.000Z', datetime('now'), 200);

INSERT INTO sessions (id, conference_id, venue_id, title, description, start_time, end_time, created_at, capacity)
VALUES ('sess-12', 'conf-3', 'venue-8',
        'Open source: giving back',
        'How to contribute to open source and why it matters.',
        '2026-11-19T10:00:00.000Z', '2026-11-19T11:00:00.000Z', datetime('now'), 150);

INSERT INTO sessions (id, conference_id, venue_id, title, description, start_time, end_time, created_at, capacity)
VALUES ('sess-13', 'conf-3', 'venue-7',
        'Demos & judging',
        'Teams demo their hackathon projects to judges.',
        '2026-11-22T14:00:00.000Z', '2026-11-22T17:00:00.000Z', datetime('now'), 200);

-- ---------------------------------------------------------------------------
-- Speaker assignments
-- ---------------------------------------------------------------------------

-- Conference 1 sessions
INSERT INTO session_speakers (id, session_id, speaker_id, speaker_role, created_at)
VALUES ('ss-1', 'sess-1', 'spk-1', 'keynote', datetime('now'));
INSERT INTO session_speakers (id, session_id, speaker_id, speaker_role, created_at)
VALUES ('ss-2', 'sess-2', 'spk-2', 'speaker', datetime('now'));
INSERT INTO session_speakers (id, session_id, speaker_id, speaker_role, created_at)
VALUES ('ss-3', 'sess-4', 'spk-1', 'moderator', datetime('now'));
INSERT INTO session_speakers (id, session_id, speaker_id, speaker_role, created_at)
VALUES ('ss-4', 'sess-5', 'spk-2', 'speaker', datetime('now'));

-- Conference 2 sessions
INSERT INTO session_speakers (id, session_id, speaker_id, speaker_role, created_at)
VALUES ('ss-5', 'sess-7', 'spk-1', 'keynote', datetime('now'));
INSERT INTO session_speakers (id, session_id, speaker_id, speaker_role, created_at)
VALUES ('ss-6', 'sess-8', 'spk-2', 'speaker', datetime('now'));
INSERT INTO session_speakers (id, session_id, speaker_id, speaker_role, created_at)
VALUES ('ss-7', 'sess-9', 'spk-3', 'speaker', datetime('now'));
INSERT INTO session_speakers (id, session_id, speaker_id, speaker_role, created_at)
VALUES ('ss-8', 'sess-10', 'spk-1', 'moderator', datetime('now'));

-- Conference 3 sessions
INSERT INTO session_speakers (id, session_id, speaker_id, speaker_role, created_at)
VALUES ('ss-9', 'sess-12', 'spk-2', 'speaker', datetime('now'));

-- ---------------------------------------------------------------------------
-- Attendees (legacy standalone attendee records for directory)
-- ---------------------------------------------------------------------------

INSERT INTO attendees (id, user_id, created_at)
VALUES ('att-1', 'sk-3', datetime('now'));
INSERT INTO attendees (id, user_id, created_at)
VALUES ('att-2', 'sk-5', datetime('now'));
INSERT INTO attendees (id, user_id, created_at)
VALUES ('att-3', 'sk-7', datetime('now'));
INSERT INTO attendees (id, user_id, created_at)
VALUES ('att-4', 'sk-8', datetime('now'));
INSERT INTO attendees (id, user_id, created_at)
VALUES ('att-5', 'sk-11', datetime('now'));
INSERT INTO attendees (id, user_id, created_at)
VALUES ('att-6', 'sk-12', datetime('now'));

-- ---------------------------------------------------------------------------
-- Conference attendees (registrations)
-- ---------------------------------------------------------------------------

INSERT INTO conference_attendees (id, conference_id, attendee_id, status, registration_date)
VALUES ('ca-1', 'conf-1', 'att-1', 'confirmed', datetime('now'));
INSERT INTO conference_attendees (id, conference_id, attendee_id, status, registration_date)
VALUES ('ca-2', 'conf-1', 'att-2', 'confirmed', datetime('now'));
INSERT INTO conference_attendees (id, conference_id, attendee_id, status, registration_date)
VALUES ('ca-3', 'conf-1', 'att-3', 'pending', datetime('now'));
INSERT INTO conference_attendees (id, conference_id, attendee_id, status, registration_date)
VALUES ('ca-4', 'conf-1', 'att-4', 'confirmed', datetime('now'));
INSERT INTO conference_attendees (id, conference_id, attendee_id, status, registration_date)
VALUES ('ca-5', 'conf-1', 'att-5', 'confirmed', datetime('now'));
INSERT INTO conference_attendees (id, conference_id, attendee_id, status, registration_date)
VALUES ('ca-6', 'conf-1', 'att-6', 'pending', datetime('now'));

INSERT INTO conference_attendees (id, conference_id, attendee_id, status, registration_date)
VALUES ('ca-7', 'conf-2', 'att-1', 'confirmed', datetime('now'));
INSERT INTO conference_attendees (id, conference_id, attendee_id, status, registration_date)
VALUES ('ca-8', 'conf-2', 'att-2', 'confirmed', datetime('now'));
INSERT INTO conference_attendees (id, conference_id, attendee_id, status, registration_date)
VALUES ('ca-9', 'conf-2', 'att-3', 'confirmed', datetime('now'));
INSERT INTO conference_attendees (id, conference_id, attendee_id, status, registration_date)
VALUES ('ca-10', 'conf-2', 'att-4', 'pending', datetime('now'));
INSERT INTO conference_attendees (id, conference_id, attendee_id, status, registration_date)
VALUES ('ca-11', 'conf-2', 'att-5', 'confirmed', datetime('now'));
INSERT INTO conference_attendees (id, conference_id, attendee_id, status, registration_date)
VALUES ('ca-12', 'conf-2', 'att-6', 'confirmed', datetime('now'));

INSERT INTO conference_attendees (id, conference_id, attendee_id, status, registration_date)
VALUES ('ca-13', 'conf-3', 'att-1', 'confirmed', datetime('now'));
INSERT INTO conference_attendees (id, conference_id, attendee_id, status, registration_date)
VALUES ('ca-14', 'conf-3', 'att-2', 'confirmed', datetime('now'));
INSERT INTO conference_attendees (id, conference_id, attendee_id, status, registration_date)
VALUES ('ca-15', 'conf-3', 'att-3', 'confirmed', datetime('now'));
INSERT INTO conference_attendees (id, conference_id, attendee_id, status, registration_date)
VALUES ('ca-16', 'conf-3', 'att-4', 'confirmed', datetime('now'));

-- ---------------------------------------------------------------------------
-- Attendee session registrations
-- ---------------------------------------------------------------------------

INSERT INTO attendee_sessions (id, attendee_id, session_id, registered_at)
VALUES ('as-1', 'att-1', 'sess-1', datetime('now'));
INSERT INTO attendee_sessions (id, attendee_id, session_id, registered_at)
VALUES ('as-2', 'att-1', 'sess-2', datetime('now'));
INSERT INTO attendee_sessions (id, attendee_id, session_id, registered_at)
VALUES ('as-3', 'att-1', 'sess-4', datetime('now'));

INSERT INTO attendee_sessions (id, attendee_id, session_id, registered_at)
VALUES ('as-4', 'att-2', 'sess-1', datetime('now'));
INSERT INTO attendee_sessions (id, attendee_id, session_id, registered_at)
VALUES ('as-5', 'att-2', 'sess-5', datetime('now'));

INSERT INTO attendee_sessions (id, attendee_id, session_id, registered_at)
VALUES ('as-6', 'att-3', 'sess-2', datetime('now'));
INSERT INTO attendee_sessions (id, attendee_id, session_id, registered_at)
VALUES ('as-7', 'att-3', 'sess-3', datetime('now'));

INSERT INTO attendee_sessions (id, attendee_id, session_id, registered_at)
VALUES ('as-8', 'att-4', 'sess-1', datetime('now'));
INSERT INTO attendee_sessions (id, attendee_id, session_id, registered_at)
VALUES ('as-9', 'att-4', 'sess-6', datetime('now'));

INSERT INTO attendee_sessions (id, attendee_id, session_id, registered_at)
VALUES ('as-10', 'att-5', 'sess-7', datetime('now'));
INSERT INTO attendee_sessions (id, attendee_id, session_id, registered_at)
VALUES ('as-11', 'att-5', 'sess-8', datetime('now'));

INSERT INTO attendee_sessions (id, attendee_id, session_id, registered_at)
VALUES ('as-12', 'att-6', 'sess-10', datetime('now'));

-- ---------------------------------------------------------------------------
-- Documents
-- ---------------------------------------------------------------------------

INSERT INTO documents (id, user_id, conference_id, type, file_key, file_url, file_name, file_size, content_type, created_at)
VALUES ('doc-1', 'sk-2', 'conf-1', 'programme', 'docs/programme.pdf', '/docs/programme.pdf', 'Conference Programme', 1024000, 'application/pdf', datetime('now'));
INSERT INTO documents (id, user_id, conference_id, type, file_key, file_url, file_name, file_size, content_type, created_at)
VALUES ('doc-2', 'sk-2', 'conf-1', 'venue_map', 'docs/venue-map.pdf', '/docs/venue-map.pdf', 'Venue Map', 512000, 'application/pdf', datetime('now'));
INSERT INTO documents (id, user_id, conference_id, type, file_key, file_url, file_name, file_size, content_type, created_at)
VALUES ('doc-3', 'sk-9', 'conf-2', 'sponsor_pack', 'docs/sponsor-pack.pdf', '/docs/sponsor-pack.pdf', 'Sponsor Pack', 2048000, 'application/pdf', datetime('now'));
INSERT INTO documents (id, user_id, conference_id, type, file_key, file_url, file_name, file_size, content_type, created_at)
VALUES ('doc-4', 'sk-2', 'conf-3', 'hackathon_rules', 'docs/hackathon-rules.pdf', '/docs/hackathon-rules.pdf', 'Hackathon Rules', 256000, 'application/pdf', datetime('now'));