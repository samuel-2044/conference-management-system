-- Performance indexes for common lookups and registration counts

-- Conference registrations (counts, lookups, "my registrations")
CREATE INDEX IF NOT EXISTS idx_conference_attendees_conference_status
  ON conference_attendees(conference_id, status);
CREATE INDEX IF NOT EXISTS idx_conference_attendees_attendee_status
  ON conference_attendees(attendee_id, status);
CREATE INDEX IF NOT EXISTS idx_conference_attendees_attendee_conference
  ON conference_attendees(attendee_id, conference_id);

-- Session registrations and conflict checks
CREATE INDEX IF NOT EXISTS idx_attendee_sessions_session_status
  ON attendee_sessions(session_id, status);
CREATE INDEX IF NOT EXISTS idx_attendee_sessions_attendee_status
  ON attendee_sessions(attendee_id, status);
CREATE INDEX IF NOT EXISTS idx_attendee_sessions_attendee_session
  ON attendee_sessions(attendee_id, session_id);

-- Sessions: by conference and time-range/venue lookups
CREATE INDEX IF NOT EXISTS idx_sessions_conference_start
  ON sessions(conference_id, start_time);
CREATE INDEX IF NOT EXISTS idx_sessions_venue_time
  ON sessions(venue_id, start_time, end_time);

-- Conferences listing/sorting
CREATE INDEX IF NOT EXISTS idx_conferences_start_date
  ON conferences(start_date);

-- Venues by conference
CREATE INDEX IF NOT EXISTS idx_venues_conference_name
  ON venues(conference_id, name);

-- Users by role (dashboard/filters)
CREATE INDEX IF NOT EXISTS idx_users_role_name
  ON users(role_name);

-- Conference attendee rows back reference
CREATE INDEX IF NOT EXISTS idx_attendees_user
  ON attendees(user_id);
