ALTER TABLE conference_attendees ADD COLUMN full_name TEXT;
ALTER TABLE conference_attendees ADD COLUMN email TEXT;
ALTER TABLE conference_attendees ADD COLUMN phone TEXT;
ALTER TABLE conference_attendees ADD COLUMN organization TEXT;
ALTER TABLE conference_attendees ADD COLUMN special_requirements TEXT;

-- Backfill from users where possible
UPDATE conference_attendees
SET
  full_name = (SELECT name FROM users WHERE users.id = conference_attendees.attendee_id),
  email = (SELECT email FROM users WHERE users.id = conference_attendees.attendee_id),
  phone = (SELECT phone FROM users WHERE users.id = conference_attendees.attendee_id)
WHERE full_name IS NULL OR email IS NULL;
