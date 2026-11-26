import { Router, type IRouter, type NextFunction } from "express";
import {
  GetDashboardSummaryResponse,
  ListConferencesResponse,
  CreateConferenceBody,
  CreateConferenceResponse,
  GetConferenceParams,
  GetConferenceResponse,
  UpdateConferenceBody,
  UpdateConferenceParams,
  UpdateConferenceResponse,
  ListVenuesResponse,
  CreateVenueBody,
  CreateVenueResponse,
  UpdateVenueBody,
  UpdateVenueParams,
  UpdateVenueResponse,
  DeleteVenueParams,
  ListSessionsResponse,
  ListSessionsQueryParams,
  CreateSessionBody,
  CreateSessionResponse,
  UpdateSessionBody,
  UpdateSessionParams,
  UpdateSessionResponse,
  DeleteSessionParams,
  ListSpeakersQueryParams,
  ListSpeakersResponse,
  CreateSpeakerBody,
  CreateSpeakerResponse,
  UpdateSpeakerBody,
  UpdateSpeakerParams,
  UpdateSpeakerResponse,
  DeleteSpeakerParams,
  ListAttendeesQueryParams,
  ListAttendeesResponse,
  CreateAttendeeBody,
  CreateAttendeeResponse,
  ListDocumentsQueryParams,
  ListDocumentsResponse,
  GetRegistrationReportResponse,
  GetAttendanceReportResponse,
  RegisterAttendeeSessionBody,
  RegisterAttendeeSessionResponse,
  AddSessionSpeakerBody,
  AddSessionSpeakerResponse,
  RemoveSessionSpeakerParams,
  ListAvailableConferencesResponse,
  ConferenceAvailability,
  RegisterConferenceBody,
  ListConferenceRegistrationsResponse,
  ListAvailableSessionsResponse,
  SessionAvailability,
  RegisterSessionBody,
  ListSessionRegistrationsResponse,
} from "@workspace/api-zod";
import type {
  Conference,
  Venue,
  Session,
  Speaker,
  Attendee,
  ConferenceAttendee,
  AttendeeSession,
  SessionSpeaker,
  Document,
  Activity,
  ConferenceRegistration,
  SessionRegistration,
} from "@workspace/api-zod";
import { authenticate, authorize } from "../middleware/auth";

const router: IRouter = Router();

function asyncHandler(
  fn: (req: any, res: any, next: NextFunction) => any,
) {
  return (req: any, res: any, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error("Route error:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    });
  };
}

const iso = (value: string) => new Date(`${value}T12:00:00.000Z`);
const dateOnly = (date: Date) => date.toISOString().slice(0, 10);
const id = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

function getDb(req: any): D1Database {
  return req.env?.convene_db;
}

function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function parseDateOnly(value: string | Date): Date {
  const d = value instanceof Date ? value : new Date(value);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}


function toCamel(obj: any): any {
  if (Array.isArray(obj)) return obj.map(toCamel);
  if (obj !== null && typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const camelKey = key.replace(/([_][a-z])/g, (g) => g[1].toUpperCase());
      result[camelKey] = toCamel(value);
    }
    return result;
  }
  return obj;
}

// ========== HELPERS ==========

const computeConferenceStatus = (conference: any): string => {
  const now = new Date();
  const startDate = new Date(conference.start_date);
  const endDate = new Date(conference.end_date);

  if (conference.status === "cancelled") return "cancelled";
  if (conference.status === "draft") return "draft";
  if (now < startDate) return "upcoming";
  if (now >= startDate && now <= endDate) return "ongoing";
  if (now > endDate) return "completed";
  return "upcoming";
};

const computeSessionStatus = (session: any): string => {
  const now = new Date();
  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);

  if (now < startTime) return "upcoming";
  if (now >= startTime && now <= endTime) return "ongoing";
  if (now > endTime) return "completed";
  return "upcoming";
};

const getConferenceRegistrationCount = async (
  db: D1Database,
  conferenceId: string,
): Promise<number> => {
  const result = await db
    .prepare(
      "SELECT COUNT(*) as count FROM conference_attendees WHERE conference_id = ? AND status != 'cancelled'",
    )
    .bind(conferenceId)
    .first();
  return (result as { count: number } | null)?.count ?? 0;
};

const getSessionRegistrationCount = async (
  db: D1Database,
  sessionId: string,
): Promise<number> => {
  const result = await db
    .prepare(
      "SELECT COUNT(*) as count FROM attendee_sessions WHERE session_id = ? AND status != 'cancelled'",
    )
    .bind(sessionId)
    .first();
  return (result as { count: number } | null)?.count ?? 0;
};

const isVenueAvailable = async (
  db: D1Database,
  venueId: string,
  startTime: string,
  endTime: string,
  excludeSessionId?: string,
): Promise<boolean> => {
  let sql = `
    SELECT id FROM sessions
    WHERE venue_id = ? AND start_time < ? AND end_time > ?
  `;
  const values: unknown[] = [venueId, endTime, startTime];

  if (excludeSessionId) {
    sql += ` AND id != ?`;
    values.push(excludeSessionId);
  }

  const result = await db.prepare(sql).bind(...values).all();
  return (result.results as any[]).length === 0;
};

const isSpeakerAvailable = async (
  db: D1Database,
  speakerId: string,
  startTime: string,
  endTime: string,
  excludeSessionId?: string,
): Promise<boolean> => {
  const speaker = await db
    .prepare("SELECT id FROM speakers WHERE user_id = ? OR id = ?")
    .bind(speakerId, speakerId)
    .first();

  if (!speaker) return true;

  let sql = `
    SELECT s.id FROM sessions s
    INNER JOIN session_speakers ss ON ss.session_id = s.id
    WHERE ss.speaker_id = ? AND s.start_time < ? AND s.end_time > ?
  `;
  const values: unknown[] = [speaker.id, endTime, startTime];

  if (excludeSessionId) {
    sql += ` AND s.id != ?`;
    values.push(excludeSessionId);
  }

  const result = await db.prepare(sql).bind(...values).all();
  return (result.results as any[]).length === 0;
};

const isAttendeeAvailableForSession = async (
  db: D1Database,
  attendeeId: string,
  startTime: string,
  endTime: string,
): Promise<boolean> => {
  const result = await db
    .prepare(`
      SELECT s.id FROM attendee_sessions a
      INNER JOIN sessions s ON s.id = a.session_id
      WHERE a.attendee_id = ? AND a.status != 'cancelled' AND s.start_time < ? AND s.end_time > ?
    `)
    .bind(attendeeId, endTime, startTime)
    .all();
  return (result.results as any[]).length === 0;
};

// ========== DASHBOARD ==========

router.get("/dashboard/summary", authenticate, asyncHandler(async (_req, res) => {
  const db = getDb(_req);

  const [confResult, speakerResult, sessionResult, attendeeResult, registrationResult] = await Promise.all([
    db.prepare("SELECT COUNT(*) as count FROM conferences").first(),
    db.prepare("SELECT COUNT(*) as count FROM speakers").first(),
    db.prepare("SELECT COUNT(*) as count FROM sessions").first(),
    db.prepare("SELECT COUNT(*) as count FROM users WHERE role_name = 'attendee'").first(),
    db.prepare("SELECT COUNT(*) as count FROM conference_attendees WHERE status != 'cancelled'").first(),
  ]);

  const activities: Activity[] = [
    { id: "activity-1", title: "New registration", detail: "New user registered", time: "12 min ago", kind: "registration" },
    { id: "activity-2", title: "Speaker confirmed", detail: "Speaker accepted session invitation", time: "1 hr ago", kind: "speaker" },
    { id: "activity-3", title: "Document uploaded", detail: "Document added to programme", time: "3 hrs ago", kind: "document" },
    { id: "activity-4", title: "Venue updated", detail: "Venue capacity updated", time: "Yesterday", kind: "venue" },
  ];

  const conferences = await db.prepare("SELECT * FROM conferences").all();
  const sessions = await db.prepare("SELECT * FROM sessions").all();

  res.json(
    GetDashboardSummaryResponse.parse({
      activeConferences: (confResult as { count: number })?.count ?? (conferences.results as any[]).length,
      totalAttendees: (attendeeResult as { count: number })?.count ?? 0,
      totalSpeakers: (speakerResult as { count: number })?.count ?? 0,
      totalSessions: (sessionResult as { count: number })?.count ?? 0,
      registrationTrend: [
        { label: "Mar 1", value: 42 },
        { label: "Mar 8", value: 66 },
        { label: "Mar 15", value: 58 },
        { label: "Mar 22", value: 91 },
        { label: "Mar 29", value: 84 },
        { label: "Apr 5", value: 112 },
        { label: "Apr 12", value: 138 },
      ],
      activities,
      upcomingSessions: sessions.results.slice(0, 4).map((s: any) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        venueName: "Unknown",
        conferenceId: s.conference_id,
        startTime: s.start_time,
        endTime: s.end_time,
      })),
    }),
  );
}));

// ========== CONFERENCES ==========

router.get("/conferences", authenticate, async (_req, res) => {
  const db = getDb(_req);
  const result = await db.prepare("SELECT * FROM conferences ORDER BY created_at DESC").all();
  res.json(ListConferencesResponse.parse(toCamel(result.results)));
});

router.post("/conferences", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const body = CreateConferenceBody.parse(req.body);

  const startDate = parseDateOnly(body.startDate as any);
  const endDate = parseDateOnly(body.endDate as any);
  if (startDate < startOfTodayUtc()) {
    res.status(400).json({ success: false, message: "Conference start date cannot be in the past" });
    return;
  }
  if (endDate < startDate) {
    res.status(400).json({ success: false, message: "Conference end date must be on or after the start date" });
    return;
  }

  const created = {
    id: id("conf"),
    title: body.title,
    description: body.description,
    start_date: new Date(body.startDate).toISOString(),
    end_date: new Date(body.endDate).toISOString(),
    created_by: null,
    created_at: new Date().toISOString(),
    capacity: body.capacity ?? null,
    status: body.status ?? "draft",
  };

  await db
    .prepare(
      `INSERT INTO conferences (id, title, description, start_date, end_date, created_by, created_at, capacity, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      created.id,
      created.title,
      created.description,
      created.start_date,
      created.end_date,
      created.created_by,
      created.created_at,
      created.capacity,
      created.status,
    )
    .run();

  res.status(201).json(
    CreateConferenceResponse.parse({
      id: created.id,
      title: created.title,
      description: created.description,
      startDate: created.start_date,
      endDate: created.end_date,
      createdBy: created.created_by,
      createdAt: created.created_at,
      capacity: created.capacity,
      status: created.status,
    }),
  );
});

router.get("/conferences/available", authenticate, asyncHandler(async (_req, res) => {
  const db = getDb(_req);

  const [conferences, counts] = await Promise.all([
    db.prepare("SELECT * FROM conferences").all(),
    db
      .prepare(
        "SELECT conference_id, COUNT(*) as count FROM conference_attendees WHERE status != 'cancelled' GROUP BY conference_id",
      )
      .all(),
  ]);

  const countMap = new Map<string, number>();
  for (const row of (counts.results as any[])) {
    countMap.set(row.conference_id, Number(row.count) || 0);
  }

  const result = (conferences.results as any[]).map((conference) => {
    const registeredCount = countMap.get(conference.id) ?? 0;
    const capacity = conference.capacity ?? null;
    const isFull = capacity !== null && registeredCount >= capacity;
    const status = computeConferenceStatus(conference);
    const registrationOpen = status === "upcoming" || status === "ongoing";
    return ConferenceAvailability.parse({
      conferenceId: conference.id,
      title: conference.title,
      status,
      capacity,
      registeredCount,
      availableCount: capacity !== null ? Math.max(0, capacity - registeredCount) : 0,
      isFull,
      registrationOpen,
    });
  });

  res.json(ListAvailableConferencesResponse.parse(result));
}));

router.get("/conferences/:conferenceId", authenticate, asyncHandler(async (req, res) => {
  const db = getDb(req);
  const params = GetConferenceParams.parse(req.params);
  const conference = await db
    .prepare("SELECT * FROM conferences WHERE id = ?")
    .bind(params.conferenceId)
    .first();

  if (!conference) {
    res.status(404).json({ error: "Conference not found" });
    return;
  }

  const conferenceSpeakers = await db
    .prepare(`
      SELECT s.* FROM speakers s
      INNER JOIN session_speakers ss ON ss.speaker_id = s.id
      INNER JOIN sessions ses ON ses.id = ss.session_id
      WHERE ses.conference_id = ?
    `)
    .bind(params.conferenceId)
    .all();

  const conferenceVenues = await db
    .prepare("SELECT * FROM venues WHERE conference_id = ?")
    .bind(params.conferenceId)
    .all();

  const conferenceSessions = await db
    .prepare("SELECT * FROM sessions WHERE conference_id = ?")
    .bind(params.conferenceId)
    .all();

  const conferenceDocuments = await db
    .prepare("SELECT * FROM documents WHERE conference_id = ?")
    .bind(params.conferenceId)
    .all();

  res.json(GetConferenceResponse.parse({
    ...toCamel(conference),
    speakers: (conferenceSpeakers.results as any[]).map((s: any) => ({
      id: s.id,
      userId: s.user_id,
      name: s.user_id ? "Unknown" : "Unknown",
      email: "",
      bio: s.bio,
      photoUrl: s.photo_url,
    })),
    venues: (conferenceVenues.results as any[]).map((v: any) => ({
      id: v.id,
      name: v.name,
      building: v.building,
      room: v.room,
      capacity: v.capacity,
    })),
    sessions: (conferenceSessions.results as any[]).map((s: any) => ({
      id: s.id,
      venueId: s.venue_id,
      venueName: null,
      title: s.title,
      description: s.description,
      startTime: s.start_time,
      endTime: s.end_time,
    })),
    documents: (conferenceDocuments.results as any[]).map((d: any) => ({
      id: d.id,
      name: d.file_name,
      type: d.type,
      size: `${(d.file_size / 1024 / 1024).toFixed(1)} MB`,
      uploadedAt: d.created_at,
      uploadedBy: "Unknown",
      fileUrl: d.file_url ?? "",
    })),
  }));
}));

router.patch("/conferences/:conferenceId", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const params = UpdateConferenceParams.parse(req.params);
  const body = UpdateConferenceBody.parse(req.body);

  const existing = await db
    .prepare("SELECT * FROM conferences WHERE id = ?")
    .bind(params.conferenceId)
    .first() as any;

  if (!existing) {
    res.status(404).json({ error: "Conference not found" });
    return;
  }

  const nextStart = body.startDate !== undefined ? parseDateOnly(body.startDate as any) : parseDateOnly(existing.start_date);
  const nextEnd = body.endDate !== undefined ? parseDateOnly(body.endDate as any) : parseDateOnly(existing.end_date);
  if (body.startDate !== undefined && nextStart < startOfTodayUtc()) {
    res.status(400).json({ success: false, message: "Conference start date cannot be in the past" });
    return;
  }
  if (nextEnd < nextStart) {
    res.status(400).json({ success: false, message: "Conference end date must be on or after the start date" });
    return;
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (body.title !== undefined) { fields.push("title = ?"); values.push(body.title); }
  if (body.description !== undefined) { fields.push("description = ?"); values.push(body.description); }
  if (body.startDate !== undefined) { fields.push("start_date = ?"); values.push(new Date(body.startDate as any).toISOString()); }
  if (body.endDate !== undefined) { fields.push("end_date = ?"); values.push(new Date(body.endDate as any).toISOString()); }

  if (fields.length > 0) {
    values.push(params.conferenceId);
    await db
      .prepare(`UPDATE conferences SET ${fields.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  const updated = await db
    .prepare("SELECT * FROM conferences WHERE id = ?")
    .bind(params.conferenceId)
    .first();

  res.json(UpdateConferenceResponse.parse(toCamel(updated)));
});

router.delete("/conferences/:conferenceId", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const params = UpdateConferenceParams.parse(req.params);
  await db.prepare("DELETE FROM conferences WHERE id = ?").bind(params.conferenceId).run();
  res.status(204).send();
});

// ========== VENUES ==========

router.get("/venues", authenticate, async (_req, res) => {
  const db = getDb(_req);
  const result = await db.prepare("SELECT * FROM venues ORDER BY created_at DESC").all();
  res.json(ListVenuesResponse.parse(toCamel(result.results)));
});

router.post("/venues", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const body = CreateVenueBody.parse(req.body);
  const created: Venue = {
    id: id("venue"),
    conference_id: body.conferenceId,
    name: body.name,
    building: body.building,
    room: body.room,
    capacity: body.capacity,
    created_at: new Date().toISOString(),
  };

  await db
    .prepare(
      `INSERT INTO venues (id, conference_id, name, building, room, capacity, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      created.id,
      created.conference_id,
      created.name,
      created.building,
      created.room,
      created.capacity,
      created.created_at,
    )
    .run();

  res.status(201).json(CreateVenueResponse.parse(toCamel(created)));
});

router.patch("/venues/:venueId", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const params = UpdateVenueParams.parse(req.params);
  const body = UpdateVenueBody.parse(req.body);

  const existing = await db
    .prepare("SELECT id FROM venues WHERE id = ?")
    .bind(params.venueId)
    .first();

  if (!existing) {
    res.status(404).json({ error: "Venue not found" });
    return;
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (body.name !== undefined) { fields.push("name = ?"); values.push(body.name); }
  if (body.building !== undefined) { fields.push("building = ?"); values.push(body.building); }
  if (body.room !== undefined) { fields.push("room = ?"); values.push(body.room); }
  if (body.capacity !== undefined) { fields.push("capacity = ?"); values.push(body.capacity); }
  if (body.conferenceId !== undefined) { fields.push("conference_id = ?"); values.push(body.conferenceId); }

  if (fields.length > 0) {
    values.push(params.venueId);
    await db
      .prepare(`UPDATE venues SET ${fields.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  const updated = await db
    .prepare("SELECT * FROM venues WHERE id = ?")
    .bind(params.venueId)
    .first();

  res.json(UpdateVenueResponse.parse(toCamel(updated)));
});

router.delete("/venues/:venueId", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const params = DeleteVenueParams.parse(req.params);
  await db.prepare("DELETE FROM venues WHERE id = ?").bind(params.venueId).run();
  res.status(204).send();
});

// ========== SESSIONS ==========

router.get("/sessions", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const query = ListSessionsQueryParams.parse(req.query);
  let sql = "SELECT * FROM sessions";
  const values: unknown[] = [];

  if (query.conferenceId) {
    sql += ` WHERE conference_id = ?`;
    values.push(query.conferenceId);
  }

  sql += ` ORDER BY start_time ASC`;

  const result = await db.prepare(sql).bind(...values).all();
  res.json(ListSessionsResponse.parse(toCamel(result.results)));
});

router.post("/sessions", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const body = CreateSessionBody.parse(req.body);

  if (body.venueId) {
    const venueAvailable = await isVenueAvailable(
      db,
      body.venueId,
      body.startTime,
      body.endTime,
    );
    if (!venueAvailable) {
      res.status(400).json({ error: "Venue is not available at this time" });
      return;
    }
  }

  const created = {
    id: id("session"),
    conference_id: body.conferenceId,
    venue_id: body.venueId ?? null,
    title: body.title,
    description: body.description,
    start_time: body.startTime,
    end_time: body.endTime,
    created_at: new Date().toISOString(),
    capacity: body.capacity ?? null,
  };

  await db
    .prepare(
      `INSERT INTO sessions (id, conference_id, venue_id, title, description, start_time, end_time, created_at, capacity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      created.id,
      created.conference_id,
      created.venue_id,
      created.title,
      created.description,
      created.start_time,
      created.end_time,
      created.created_at,
      created.capacity,
    )
    .run();

  res.status(201).json(
    CreateSessionResponse.parse({
      id: created.id,
      conferenceId: created.conference_id,
      venueId: created.venue_id,
      title: created.title,
      description: created.description,
      startTime: created.start_time,
      endTime: created.end_time,
      createdAt: created.created_at,
      capacity: created.capacity,
    }),
  );
});

router.patch("/sessions/:sessionId", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const params = UpdateSessionParams.parse(req.params);
  const body = UpdateSessionBody.parse(req.body);

  const existing = await db
    .prepare("SELECT id FROM sessions WHERE id = ?")
    .bind(params.sessionId)
    .first();

  if (!existing) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (body.title !== undefined) { fields.push("title = ?"); values.push(body.title); }
  if (body.description !== undefined) { fields.push("description = ?"); values.push(body.description); }
  if (body.startTime !== undefined) { fields.push("start_time = ?"); values.push(body.startTime); }
  if (body.endTime !== undefined) { fields.push("end_time = ?"); values.push(body.endTime); }
  if (body.venueId !== undefined) { fields.push("venue_id = ?"); values.push(body.venueId); }

  if (fields.length > 0) {
    values.push(params.sessionId);
    await db
      .prepare(`UPDATE sessions SET ${fields.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  const updated = await db
    .prepare("SELECT * FROM sessions WHERE id = ?")
    .bind(params.sessionId)
    .first();

  res.json(UpdateSessionResponse.parse(toCamel(updated)));
});

router.delete("/sessions/:sessionId", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const params = DeleteSessionParams.parse(req.params);
  await db.prepare("DELETE FROM sessions WHERE id = ?").bind(params.sessionId).run();
  res.status(204).send();
});

// ========== SPEAKERS ==========

router.get("/speakers", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const query = ListSpeakersQueryParams.parse(req.query);

  let sql = `
    SELECT s.*, u.name, u.email FROM speakers s
    LEFT JOIN users u ON s.user_id = u.id
  `;
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (query.conferenceId) {
    const sessionIds = await db
      .prepare("SELECT id FROM sessions WHERE conference_id = ?")
      .bind(query.conferenceId)
      .all();
    const sessionIdList = (sessionIds.results as any[]).map((s: any) => s.id);

    if (sessionIdList.length > 0) {
      const placeholders = sessionIdList.map(() => "?").join(", ");
      conditions.push(`s.id IN (SELECT speaker_id FROM session_speakers WHERE session_id IN (${placeholders}))`);
      values.push(...sessionIdList);
    } else {
      conditions.push("1 = 0");
    }
  }

  if (query.search) {
    conditions.push("(u.name LIKE ? OR u.email LIKE ? OR s.bio LIKE ?)");
    const search = `%${query.search.toLowerCase()}%`;
    values.push(search, search, search);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  sql += ` ORDER BY s.created_at DESC`;

  const result = await db.prepare(sql).bind(...values).all();
  const rows = result.results as any[];
  const speakerIds = rows.map((r: any) => r.id).filter(Boolean);
  let countMap = new Map<string, number>();
  if (speakerIds.length > 0) {
    const placeholders = speakerIds.map(() => "?").join(",");
    const counts = await db
      .prepare(`SELECT speaker_id, COUNT(*) as count FROM session_speakers WHERE speaker_id IN (${placeholders}) GROUP BY speaker_id`)
      .bind(...speakerIds)
      .all();
    for (const c of (counts.results as any[])) countMap.set(c.speaker_id, Number(c.count) || 0);
  }
  res.json(ListSpeakersResponse.parse(toCamel(rows.map((s: any) => ({
    id: s.id,
    user_id: s.user_id,
    name: s.name ?? "Unknown",
    email: s.email ?? "",
    bio: s.bio,
    photo_url: s.photo_url,
    session_count: countMap.get(s.id) ?? 0,
  })))));
});

router.post("/speakers", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const body = CreateSpeakerBody.parse(req.body);
  const created = {
    id: id("spk"),
    user_id: body.userId ?? null,
    bio: body.bio,
    photo_url: body.photoUrl ?? null,
    created_at: new Date().toISOString(),
  };

  await db
    .prepare(
      `INSERT INTO speakers (id, user_id, bio, photo_url, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(
      created.id,
      created.user_id,
      created.bio,
      created.photo_url,
      created.created_at,
    )
    .run();

  res.status(201).json(
    CreateSpeakerResponse.parse({
      id: created.id,
      userId: created.user_id,
      bio: created.bio,
      photoUrl: created.photo_url,
      createdAt: created.created_at,
    }),
  );
});

router.patch("/speakers/:speakerId", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const params = UpdateSpeakerParams.parse(req.params);
  const body = UpdateSpeakerBody.parse(req.body);

  const existing = await db
    .prepare("SELECT id FROM speakers WHERE id = ?")
    .bind(params.speakerId)
    .first();

  if (!existing) {
    res.status(404).json({ error: "Speaker not found" });
    return;
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (body.bio !== undefined) { fields.push("bio = ?"); values.push(body.bio); }
  if (body.photoUrl !== undefined) { fields.push("photo_url = ?"); values.push(body.photoUrl); }
  if (body.userId !== undefined) { fields.push("user_id = ?"); values.push(body.userId); }

  if (fields.length > 0) {
    values.push(params.speakerId);
    await db
      .prepare(`UPDATE speakers SET ${fields.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  const updated = await db
    .prepare("SELECT * FROM speakers WHERE id = ?")
    .bind(params.speakerId)
    .first();

  res.json(UpdateSpeakerResponse.parse(toCamel(updated)));
});

router.delete("/speakers/:speakerId", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const params = DeleteSpeakerParams.parse(req.params);
  await db.prepare("DELETE FROM speakers WHERE id = ?").bind(params.speakerId).run();
  res.status(204).send();
});

// ========== ATTENDEES ==========

router.get("/attendees", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const query = ListAttendeesQueryParams.parse(req.query);

  let sql = `
    SELECT ca.*, u.name as user_name, u.email as user_email, u.phone as user_phone, c.title as conference_title
    FROM conference_attendees ca
    INNER JOIN users u ON u.id = ca.attendee_id
    INNER JOIN conferences c ON c.id = ca.conference_id
  `;
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (query.conferenceId) {
    conditions.push("ca.conference_id = ?");
    values.push(query.conferenceId);
  }

  if (query.search) {
    conditions.push("(COALESCE(ca.full_name, u.name) LIKE ? OR COALESCE(ca.email, u.email) LIKE ? OR COALESCE(ca.phone, u.phone, '') LIKE ?)");
    const search = `%${query.search.toLowerCase()}%`;
    values.push(search, search, search);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }
  sql += " ORDER BY ca.registration_date DESC";

  const result = await db.prepare(sql).bind(...values).all();
  res.json(ListAttendeesResponse.parse(toCamel((result.results as any[]).map((ca: any) => ({
    id: ca.id,
    user_id: ca.attendee_id,
    name: ca.full_name ?? ca.user_name ?? "Unknown",
    email: ca.email ?? ca.user_email ?? "",
    phone: ca.phone ?? ca.user_phone ?? null,
    organization: ca.organization ?? null,
    special_requirements: ca.special_requirements ?? null,
    conference_id: ca.conference_id,
    conference_title: ca.conference_title ?? "Unknown",
    registration_date: ca.registration_date,
    status: ca.status,
  })))));
});

router.post("/attendees", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const body = CreateAttendeeBody.parse(req.body);

  const attendeeId = id("att");
  const registrationId = id("ca");

  // Ensure an attendees row exists (conference_attendees.attendee_id → attendees.id)
  await db
    .prepare(
      "INSERT OR IGNORE INTO attendees (id, user_id, created_at) VALUES (?, ?, ?)",
    )
    .bind(body.userId, body.userId, new Date().toISOString())
    .run();

  await db
    .prepare(
      `INSERT INTO conference_attendees (id, attendee_id, conference_id, registration_date, status)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(
      registrationId,
      body.userId,
      body.conferenceId,
      new Date().toISOString(),
      "pending",
    )
    .run();

  res.status(201).json(
    CreateAttendeeResponse.parse({
      id: registrationId,
      userId: body.userId,
      conferenceId: body.conferenceId,
      registrationDate: new Date().toISOString(),
      status: "pending",
    }),
  );
});

// ========== CONFERENCE REGISTRATION ==========

router.post("/conferences/:conferenceId/register", authenticate, async (req, res) => {
  const db = getDb(req);
  const body = RegisterConferenceBody.parse(req.body);
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const conference = await db
    .prepare("SELECT * FROM conferences WHERE id = ?")
    .bind(body.conferenceId)
    .first();

  if (!conference) {
    res.status(404).json({ error: "Conference not found" });
    return;
  }

  const status = computeConferenceStatus(conference);
  if (status !== "upcoming" && status !== "ongoing") {
    res.status(400).json({ error: "Registration is not open for this conference" });
    return;
  }

  const existing = await db
    .prepare(
      "SELECT id FROM conference_attendees WHERE attendee_id = ? AND conference_id = ? AND status != 'cancelled'",
    )
    .bind(userId, body.conferenceId)
    .first();

  if (existing) {
    res.status(400).json({ error: "Already registered for this conference" });
    return;
  }

  const capacity = conference.capacity ?? null;
  const registeredCount = await getConferenceRegistrationCount(db, body.conferenceId);
  if (capacity !== null && registeredCount >= capacity) {
    res.status(400).json({ error: "Conference is at full capacity" });
    return;
  }

  const user = await db
    .prepare("SELECT id, name, email, phone FROM users WHERE id = ?")
    .bind(userId)
    .first<any>();

  const fullName = (body.fullName ?? user?.name ?? "").trim();
  const email = (body.email ?? user?.email ?? "").trim().toLowerCase();
  const phone = (body.phone ?? user?.phone ?? "").trim();
  const organization = (body.organization ?? "").trim();
  const specialRequirements = (body.specialRequirements ?? "").trim();

  if (!fullName || !email || !phone) {
    res.status(400).json({ error: "Full name, email, and phone number are required" });
    return;
  }

  await db
    .prepare(
      "INSERT OR IGNORE INTO attendees (id, user_id, created_at) VALUES (?, ?, ?)",
    )
    .bind(userId, userId, new Date().toISOString())
    .run();

  // Keep user contact details in sync for convenience
  await db
    .prepare("UPDATE users SET name = ?, email = COALESCE(NULLIF(?, ''), email), phone = ? WHERE id = ?")
    .bind(fullName, email, phone || null, userId)
    .run()
    .catch(() => {});

  const registrationId = id("cr");
  const registrationDate = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO conference_attendees
        (id, attendee_id, conference_id, registration_date, status, full_name, email, phone, organization, special_requirements)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      registrationId,
      userId,
      body.conferenceId,
      registrationDate,
      "confirmed",
      fullName,
      email,
      phone,
      organization || null,
      specialRequirements || null,
    )
    .run();

  res.status(201).json({
    id: registrationId,
    attendeeId: userId,
    conferenceId: body.conferenceId,
    registrationDate,
    status: "confirmed",
    fullName,
    email,
    phone,
    organization: organization || null,
    specialRequirements: specialRequirements || null,
  });
});

router.get("/conferences/registrations/me", authenticate, async (req, res) => {
  const db = getDb(req);
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const rows = await db
    .prepare(`
      SELECT ca.*, c.title as conference_title, c.start_date, c.end_date, c.status as conference_status,
             u.name as user_name, u.email as user_email, u.phone as user_phone
      FROM conference_attendees ca
      INNER JOIN conferences c ON c.id = ca.conference_id
      INNER JOIN users u ON u.id = ca.attendee_id
      WHERE ca.attendee_id = ?
      ORDER BY ca.registration_date DESC
    `)
    .bind(userId)
    .all();

  res.json((rows.results as any[]).map((cr: any) => ({
    id: cr.id,
    attendeeId: cr.attendee_id,
    conferenceId: cr.conference_id,
    conferenceTitle: cr.conference_title ?? "Unknown",
    conferenceStartDate: cr.start_date ?? null,
    conferenceEndDate: cr.end_date ?? null,
    conferenceStatus: cr.conference_status ?? null,
    registrationDate: cr.registration_date,
    status: cr.status,
    fullName: cr.full_name ?? cr.user_name ?? "",
    email: cr.email ?? cr.user_email ?? "",
    phone: cr.phone ?? cr.user_phone ?? "",
    organization: cr.organization ?? null,
    specialRequirements: cr.special_requirements ?? null,
  })));
});

router.get("/conferences/:conferenceId/registrations", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const { conferenceId } = req.params;

  const registrations = await db
    .prepare(`
      SELECT ca.*, u.name as user_name, u.email as user_email, u.phone as user_phone
      FROM conference_attendees ca
      INNER JOIN users u ON u.id = ca.attendee_id
      WHERE ca.conference_id = ?
      ORDER BY ca.registration_date DESC
    `)
    .bind(conferenceId)
    .all();

  res.json(ListConferenceRegistrationsResponse.parse((registrations.results as any[]).map((cr: any) => ({
    id: cr.id,
    attendeeId: cr.attendee_id,
    conferenceId: cr.conference_id,
    registrationDate: cr.registration_date,
    status: cr.status,
    fullName: cr.full_name ?? cr.user_name ?? "Unknown",
    email: cr.email ?? cr.user_email ?? "",
    phone: cr.phone ?? cr.user_phone ?? null,
    organization: cr.organization ?? null,
    specialRequirements: cr.special_requirements ?? null,
  }))));
});
router.delete("/conferences/:conferenceId/cancel", authenticate, async (req, res) => {
  const db = getDb(req);
  const userId = req.user?.id;
  const { conferenceId } = req.params;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const result = await db
    .prepare(
      "DELETE FROM conference_attendees WHERE attendee_id = ? AND conference_id = ?",
    )
    .bind(userId, conferenceId)
    .run();

  if (result.changes === 0) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }

  // Sessions belong to the conference; remove this attendee's session registrations for it
  await db
    .prepare(
      `DELETE FROM attendee_sessions
       WHERE attendee_id = ?
         AND session_id IN (SELECT id FROM sessions WHERE conference_id = ?)`,
    )
    .bind(userId, conferenceId)
    .run();

  res.status(204).send();
});

// ========== SESSION REGISTRATION ==========

router.get("/sessions/available", authenticate, asyncHandler(async (_req, res) => {
  const db = getDb(_req);

  const [sessions, conferences, venues, counts] = await Promise.all([
    db.prepare("SELECT * FROM sessions").all(),
    db.prepare("SELECT id, title, start_date, end_date, status FROM conferences").all(),
    db.prepare("SELECT id, name FROM venues").all(),
    db
      .prepare(
        "SELECT session_id, COUNT(*) as count FROM attendee_sessions WHERE status != 'cancelled' GROUP BY session_id",
      )
      .all(),
  ]);

  const confMap = new Map<string, any>();
  for (const c of (conferences.results as any[])) confMap.set(c.id, c);
  const venueMap = new Map<string, any>();
  for (const v of (venues.results as any[])) venueMap.set(v.id, v);
  const countMap = new Map<string, number>();
  for (const row of (counts.results as any[])) countMap.set(row.session_id, Number(row.count) || 0);

  const result = (sessions.results as any[]).map((session) => {
    const conference = confMap.get(session.conference_id);
    const venue = session.venue_id ? venueMap.get(session.venue_id) : null;
    const registeredCount = countMap.get(session.id) ?? 0;
    const capacity = session.capacity ?? null;
    const isFull = capacity !== null && registeredCount >= capacity;
    const sessionStatus = computeSessionStatus(session);
    const conferenceStatus = conference ? computeConferenceStatus(conference) : "draft";
    const registrationOpen =
      sessionStatus === "upcoming" && (conferenceStatus === "upcoming" || conferenceStatus === "ongoing");

    return SessionAvailability.parse({
      sessionId: session.id,
      title: session.title,
      conferenceId: session.conference_id,
      conferenceTitle: conference?.title ?? "Unknown",
      startTime: session.start_time,
      endTime: session.end_time,
      venueName: venue?.name ?? null,
      status: sessionStatus,
      capacity,
      registeredCount,
      availableCount: capacity !== null ? Math.max(0, capacity - registeredCount) : 0,
      isFull,
      registrationOpen,
    });
  });

  res.json(ListAvailableSessionsResponse.parse(result));
}));

router.post("/sessions/:sessionId/register", authenticate, async (req, res) => {
  const db = getDb(req);
  const body = RegisterSessionBody.parse(req.body);
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const session = await db
    .prepare("SELECT * FROM sessions WHERE id = ?")
    .bind(body.sessionId)
    .first();

  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const sessionStatus = computeSessionStatus(session);
  if (sessionStatus !== "upcoming") {
    res.status(400).json({ error: "Registration is not open for this session" });
    return;
  }

  const conference = await db
    .prepare("SELECT * FROM conferences WHERE id = ?")
    .bind(session.conference_id)
    .first();

  const conferenceStatus = conference ? computeConferenceStatus(conference) : "draft";
  if (conferenceStatus !== "upcoming" && conferenceStatus !== "ongoing") {
    res.status(400).json({ error: "Conference is not open for registration" });
    return;
  }

  // Sessions belong to a conference: attendee must be registered for the conference first
  const conferenceRegistration = await db
    .prepare(
      "SELECT id FROM conference_attendees WHERE attendee_id = ? AND conference_id = ? AND status != 'cancelled'",
    )
    .bind(userId, session.conference_id)
    .first();

  if (!conferenceRegistration) {
    res.status(400).json({ error: "Register for the conference before registering for its sessions" });
    return;
  }

  const existing = await db
    .prepare(
      "SELECT id FROM attendee_sessions WHERE attendee_id = ? AND session_id = ? AND status != 'cancelled'",
    )
    .bind(userId, body.sessionId)
    .first();

  if (existing) {
    res.status(400).json({ error: "Already registered for this session" });
    return;
  }

  const capacity = session.capacity ?? null;
  const registeredCount = await getSessionRegistrationCount(db, body.sessionId);
  if (capacity !== null && registeredCount >= capacity) {
    res.status(400).json({ error: "Session is at full capacity" });
    return;
  }

  const isAvailable = await isAttendeeAvailableForSession(db, userId, session.start_time, session.end_time);
  if (!isAvailable) {
    res.status(400).json({ error: "You have a scheduling conflict with another registered session" });
    return;
  }

  // attendee_sessions.attendee_id references attendees(id) — ensure the row exists.
  await db
    .prepare(
      "INSERT OR IGNORE INTO attendees (id, user_id, created_at) VALUES (?, ?, ?)",
    )
    .bind(userId, userId, new Date().toISOString())
    .run();

  const registrationId = id("as");
  await db
    .prepare(
      `INSERT INTO attendee_sessions (id, attendee_id, session_id, registered_at, checked_in_at, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      registrationId,
      userId,
      body.sessionId,
      new Date().toISOString(),
      null,
      "registered",
    )
    .run();

  res.status(201).json(
    RegisterAttendeeSessionResponse.parse({
      id: registrationId,
      attendeeId: userId,
      sessionId: body.sessionId,
      registeredAt: new Date().toISOString(),
      checkedInAt: null,
      status: "registered",
    }),
  );
});

router.get("/sessions/:sessionId/registrations", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const { sessionId } = req.params;

  const registrations = await db
    .prepare(`
      SELECT asess.*, u.name, u.email, s.title as session_title FROM attendee_sessions asess
      INNER JOIN users u ON u.id = asess.attendee_id
      INNER JOIN sessions s ON s.id = asess.session_id
      WHERE asess.session_id = ? AND asess.status != 'cancelled'
    `)
    .bind(sessionId)
    .all();

  res.json(ListSessionRegistrationsResponse.parse((registrations.results as any[]).map((as: any) => ({
    id: as.id,
    attendeeId: as.attendee_id,
    name: as.name ?? "Unknown",
    email: as.email ?? "",
    sessionId: as.session_id,
    sessionTitle: as.session_title ?? "Unknown",
    registeredAt: as.registered_at,
    status: as.status,
  }))));
});

router.delete("/sessions/:sessionId/cancel", authenticate, async (req, res) => {
  const db = getDb(req);
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const result = await db
    .prepare(
      "DELETE FROM attendee_sessions WHERE attendee_id = ? AND session_id = ?",
    )
    .bind(userId, req.params.sessionId)
    .run();

  if (result.changes === 0) {
    res.status(404).json({ error: "Registration not found" });
    return;
  }

  res.status(204).send();
});

// ========== SESSION SPEAKERS ==========

router.post("/session-speakers", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const body = AddSessionSpeakerBody.parse(req.body);

  const existingAssignment = await db
    .prepare(
      "SELECT id FROM session_speakers WHERE session_id = ? AND speaker_id = ?",
    )
    .bind(body.sessionId, body.speakerId)
    .first();

  if (existingAssignment) {
    res.status(409).json({ error: "Speaker is already assigned to this session" });
    return;
  }

  const created = {
    id: id("ss"),
    session_id: body.sessionId,
    speaker_id: body.speakerId,
    speaker_role: body.speakerRole,
    created_at: new Date().toISOString(),
  };

  await db
    .prepare(
      `INSERT INTO session_speakers (id, session_id, speaker_id, speaker_role, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(
      created.id,
      created.session_id,
      created.speaker_id,
      created.speaker_role,
      created.created_at,
    )
    .run();

  res.status(201).json(
    AddSessionSpeakerResponse.parse({
      id: created.id,
      sessionId: created.session_id,
      speakerId: created.speaker_id,
      speakerRole: created.speaker_role,
      createdAt: created.created_at,
    }),
  );
});

router.delete("/session-speakers/:sessionSpeakerId", authenticate, authorize("organiser", "admin"), async (req, res) => {
  const db = getDb(req);
  const params = RemoveSessionSpeakerParams.parse(req.params);
  await db.prepare("DELETE FROM session_speakers WHERE id = ?").bind(params.sessionSpeakerId).run();
  res.status(204).send();
});

router.get("/sessions/:sessionId/speakers", authenticate, async (req, res) => {
  const db = getDb(req);
  const sessionId = req.params.sessionId;
  const rows = await db
    .prepare(`
      SELECT ss.id, ss.session_id, ss.speaker_id, ss.speaker_role, ss.created_at,
             u.name as speaker_name, u.email as speaker_email
      FROM session_speakers ss
      INNER JOIN speakers sp ON sp.id = ss.speaker_id
      INNER JOIN users u ON u.id = sp.user_id
      WHERE ss.session_id = ?
      ORDER BY ss.created_at ASC
    `)
    .bind(sessionId)
    .all();
  res.json((rows.results as any[]).map((r: any) => ({
    id: r.id,
    sessionId: r.session_id,
    speakerId: r.speaker_id,
    speakerRole: r.speaker_role,
    createdAt: r.created_at,
    speakerName: r.speaker_name ?? "Unknown",
    speakerEmail: r.speaker_email ?? "",
  })));
});

router.get("/speakers/me/sessions", authenticate, authorize("speaker"), async (req, res) => {
  const db = getDb(req);
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const speaker = await db
    .prepare("SELECT id FROM speakers WHERE user_id = ?")
    .bind(userId)
    .first<any>();

  if (!speaker) {
    res.json([]);
    return;
  }

  const result = await db
    .prepare(`
      SELECT
        s.*,
        c.title as conference_title,
        c.start_date as conference_start_date,
        c.end_date as conference_end_date,
        c.status as conference_status,
        v.name as venue_name,
        ss.speaker_role
      FROM session_speakers ss
      INNER JOIN sessions s ON s.id = ss.session_id
      INNER JOIN conferences c ON c.id = s.conference_id
      LEFT JOIN venues v ON v.id = s.venue_id
      WHERE ss.speaker_id = ?
      ORDER BY s.start_time ASC
    `)
    .bind(speaker.id)
    .all();

  res.json((result.results as any[]).map((row: any) => ({
    id: row.id,
    conferenceId: row.conference_id,
    conferenceTitle: row.conference_title ?? "Unknown",
    conferenceStatus: row.conference_status ?? null,
    venueId: row.venue_id ?? null,
    venueName: row.venue_name ?? null,
    title: row.title,
    description: row.description ?? "",
    startTime: row.start_time,
    endTime: row.end_time,
    speakerRole: row.speaker_role ?? "speaker",
  })));
});

router.get("/speakers/me", authenticate, authorize("speaker"), async (req, res) => {
  const db = getDb(req);
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const row = await db
    .prepare(`
      SELECT s.*, u.name, u.email
      FROM speakers s
      INNER JOIN users u ON u.id = s.user_id
      WHERE s.user_id = ?
    `)
    .bind(userId)
    .first<any>();
  if (!row) {
    res.status(404).json({ error: "Speaker profile not found" });
    return;
  }
  res.json({
    id: row.id,
    userId: row.user_id,
    name: row.name ?? "",
    email: row.email ?? "",
    bio: row.bio ?? "",
    photoUrl: row.photo_url ?? null,
  });
});

// ========== DOCUMENTS ==========

router.get("/documents", authenticate, async (req, res) => {
  const db = getDb(req);
  const query = ListDocumentsQueryParams.parse(req.query);

  let sql = "SELECT * FROM documents";
  const values: unknown[] = [];
  const conditions: string[] = [];

  if (query.conferenceId) {
    conditions.push("conference_id = ?");
    values.push(query.conferenceId);
  }

  if (query.type && query.type !== "all") {
    conditions.push("type = ?");
    values.push(query.type);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(" AND ")}`;
  }

  const result = await db.prepare(sql).bind(...values).all();
  res.json(ListDocumentsResponse.parse(toCamel(result.results)));
});

// ========== REPORTS ==========

router.get("/reports/registration", authenticate, authorize("organiser", "admin"), async (_req, res) => {
  const db = getDb(_req);

  const totalResult = await db.prepare("SELECT COUNT(*) as count FROM conference_attendees").first();
  const confirmedResult = await db.prepare("SELECT COUNT(*) as count FROM conference_attendees WHERE status = 'confirmed'").first();
  const pendingResult = await db.prepare("SELECT COUNT(*) as count FROM conference_attendees WHERE status = 'pending'").first();
  const cancelledResult = await db.prepare("SELECT COUNT(*) as count FROM conference_attendees WHERE status = 'cancelled'").first();

  const conferences = await db.prepare("SELECT * FROM conferences").all();
  const byConference = await Promise.all((conferences.results as any[]).map(async (c: any) => {
    const count = await db
      .prepare("SELECT COUNT(*) as count FROM conference_attendees WHERE conference_id = ?")
      .bind(c.id)
      .first();
    return {
      conference: c.title,
      registrations: (count as { count: number })?.count ?? 0,
    };
  }));

  const report = {
    total: (totalResult as { count: number })?.count ?? 0,
    confirmed: (confirmedResult as { count: number })?.count ?? 0,
    pending: (pendingResult as { count: number })?.count ?? 0,
    cancelled: (cancelledResult as { count: number })?.count ?? 0,
    byConference,
  };

  res.json(GetRegistrationReportResponse.parse(report));
});

router.get("/reports/attendance", authenticate, authorize("organiser", "admin"), async (_req, res) => {
  const db = getDb(_req);

  const sessions = await db.prepare("SELECT * FROM sessions").all();
  const bySession = await Promise.all((sessions.results as any[]).map(async (s: any) => {
    const registered = await db
      .prepare("SELECT COUNT(*) as count FROM attendee_sessions WHERE session_id = ?")
      .bind(s.id)
      .first();
    const attended = await db
      .prepare("SELECT COUNT(*) as count FROM attendee_sessions WHERE session_id = ? AND status = 'attended'")
      .bind(s.id)
      .first();
    return {
      session: s.title,
      registered: (registered as { count: number })?.count ?? 0,
      attended: (attended as { count: number })?.count ?? 0,
    };
  }));

  const report = {
    totalSessions: sessions.results.length,
    averageAttendance: 45,
    bySession,
  };

  res.json(GetAttendanceReportResponse.parse(report));
});

export default router;