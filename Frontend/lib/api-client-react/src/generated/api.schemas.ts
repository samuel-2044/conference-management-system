/**
 * Conference Management System API
 * OpenAPI spec version 0.2.0
 */

export interface Role {
  id: string;
  name: string;
  createdAt: string;
}

export interface User {
  id: string;
  roleId: string;
  name: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface Conference {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  /** @nullable */
  createdBy?: string | null;
  createdAt: string;
  /** @nullable */
  capacity?: number | null;
  status: string;
}

export interface Venue {
  id: string;
  conferenceId: string;
  name: string;
  building: string;
  room: string;
  capacity: number;
  createdAt: string;
}

export interface Session {
  id: string;
  conferenceId: string;
  venueId?: string | null;
  venueName?: string | null;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  /** @nullable */
  capacity?: number | null;
}

export interface Speaker {
  id: string;
  userId: string;
  name: string;
  email: string;
  bio: string;
  photoUrl?: string | null;
  createdAt: string;
  sessionCount: number;
}

export interface Attendee {
  id: string;
  userId: string;
  name: string;
  email: string;
  photoUrl?: string | null;
  registrationDate: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'cancelled';
  createdAt: string;
}

export interface ConferenceAttendee {
  id: string;
  attendeeId: string;
  conferenceId: string;
  registrationDate: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface AttendeeSession {
  id: string;
  attendeeId: string;
  sessionId: string;
  registeredAt: string;
  /** @nullable */
  checkedInAt?: string | null;
  status: 'registered' | 'attended' | 'cancelled' | 'no_show';
}

export interface SessionSpeaker {
  id: string;
  sessionId: string;
  speakerId: string;
  speakerRole: 'keynote' | 'speaker' | 'panelist' | 'moderator';
  createdAt: string;
}

export interface Document {
  id: string;
  userId: string;
  /** @nullable */
  conferenceId?: string | null;
  /** @nullable */
  sessionId?: string | null;
  type: string;
  fileKey: string;
  /** @nullable */
  fileUrl?: string | null;
  fileName: string;
  fileSize: number;
  contentType: string;
  createdAt: string;
}

export type ConferenceStatus = typeof ConferenceStatus[keyof typeof ConferenceStatus];

export const ConferenceStatus = {
  planning: 'planning',
  published: 'published',
  live: 'live',
  completed: 'completed',
} as const;

export type AttendeeStatus = typeof AttendeeStatus[keyof typeof AttendeeStatus];

export const AttendeeStatus = {
  pending: 'pending',
  confirmed: 'confirmed',
  cancelled: 'cancelled',
} as const;

export type SessionRole = typeof SessionRole[keyof typeof SessionRole];

export const SessionRole = {
  keynote: 'keynote',
  speaker: 'speaker',
  panelist: 'panelist',
  moderator: 'moderator',
} as const;

export type AttendeeSessionStatus = typeof AttendeeSessionStatus[keyof typeof AttendeeSessionStatus];

export const AttendeeSessionStatus = {
  registered: 'registered',
  attended: 'attended',
  cancelled: 'cancelled',
  no_show: 'no_show',
} as const;

export interface SpeakerWithDetails {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  bio: string;
  photoUrl?: string | null;
  sessionCount: number;
}

export interface AttendeeWithDetails {
  id: string;
  userId: string;
  name: string;
  email: string;
  conferenceId: string;
  conferenceTitle: string;
  registrationDate: string;
  status: AttendeeStatus;
}

export interface SessionWithDetails {
  id: string;
  conferenceId: string;
  venueId?: string | null;
  venueName?: string | null;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  speakers: SessionSpeakerInfo[];
  attendees: SessionAttendeeInfo[];
}

export interface SessionSpeakerInfo {
  id: string;
  name: string;
  bio: string;
  speakerRole: string;
}

export interface SessionAttendeeInfo {
  id: string;
  name: string;
  email: string;
  status: string;
}

export interface ConferenceDetail extends Conference {
  speakers: SpeakerInfo[];
  venues: VenueInfo[];
  sessions: SessionInfo[];
  documents: DocumentInfo[];
  speakersCount?: number;
  sessionsCount?: number;
  attendeesCount?: number;
}

export interface SpeakerInfo {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  bio: string;
  photoUrl?: string | null;
}

export interface AttendeeInfo {
  id: string;
  userId: string;
  name: string;
  email: string;
  photoUrl?: string | null;
  registrationDate: string;
  status: string;
}

export interface VenueInfo {
  id: string;
  name: string;
  building: string;
  room: string;
  capacity: number;
}

export interface SessionInfo {
  id: string;
  venueId?: string | null;
  venueName?: string | null;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

export interface DocumentInfo {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  fileUrl: string;
}

export interface Activity {
  id: string;
  title: string;
  detail: string;
  time: string;
  kind: string;
}

export interface HealthStatus {
  status: string;
  timestamp: string;
}

export type DashboardSummaryRegistrationTrendItem = {
  label: string;
  value: number;
};

export interface DashboardSummary {
  activeConferences: number;
  totalOrganisers: number;
  totalAttendees: number;
  totalSpeakers: number;
  totalVenues: number;
  totalSessions: number;
  registrationTrend: DashboardSummaryRegistrationTrendItem[];
  activities: Activity[];
  upcomingSessions: UpcomingSession[];
}

export interface UpcomingSession {
  id: string;
  title: string;
  description: string;
  venueName: string;
  conferenceId: string;
  startTime: string;
  endTime: string;
}

export type RegistrationReportByConferenceItem = {
  conference: string;
  registrations: number;
};

export interface RegistrationReport {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  byConference: RegistrationReportByConferenceItem[];
}

export interface AttendanceReport {
  totalSessions: number;
  averageAttendance: number;
  bySession: SessionAttendance[];
}

export interface SessionAttendance {
  session: string;
  registered: number;
  attended: number;
}

export type ListConferencesParams = {
search?: string;
};

export type ListSpeakersParams = {
search?: string;
conferenceId?: string;
};

export type ListAttendeesParams = {
search?: string;
conferenceId?: string;
};

export type ListSessionsParams = {
conferenceId?: string;
};

export type ListDocumentsParams = {
type?: ListDocumentsType;
conferenceId?: string;
};

export type ListDocumentsType = typeof ListDocumentsType[keyof typeof ListDocumentsType];

export const ListDocumentsType = {
  all: 'all',
  paper: 'paper',
  'id-card': 'id-card',
  certificate: 'certificate',
  image: 'image',
} as const;

export interface ConferenceInput {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  /** @nullable */
  capacity?: number | null;
  status?: string;
}

export interface ConferenceUpdate {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface VenueInput {
  name: string;
  building: string;
  room: string;
  capacity: number;
  conferenceId: string;
}

export interface VenueUpdate {
  name?: string;
  building?: string;
  room?: string;
  capacity?: number;
}

export interface SessionInput {
  title: string;
  description: string;
  conferenceId: string;
  venueId?: string;
  startTime: string;
  endTime: string;
  /** @nullable */
  capacity?: number | null;
}

export interface SessionUpdate {
  venueId?: string;
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
}

export interface SpeakerInput {
  userId?: string;
  bio: string;
}

export interface SpeakerUpdate {
  bio?: string;
}

export interface AttendeeInput {
  userId: string;
  conferenceId: string;
}

export interface DocumentInput {
  conferenceId?: string;
  sessionId?: string;
  type: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

// ========== CONFERENCE REGISTRATION ==========

export interface ConferenceRegistration {
  id: string;
  attendeeId: string;
  conferenceId: string;
  registrationDate: string;
  status: string;
}

export interface ConferenceAvailability {
  conferenceId: string;
  title: string;
  status: string;
  /** @nullable */
  capacity?: number | null;
  registeredCount: number;
  /** @nullable */
  availableCount?: number | null;
  isFull: boolean;
  registrationOpen: boolean;
}

export interface RegisterConferenceBody {
  conferenceId: string;
}

export type ListConferenceRegistrationsResponse = ConferenceRegistration[];

// ========== SESSION REGISTRATION ==========

export interface SessionRegistration {
  id: string;
  attendeeId: string;
  sessionId: string;
  registeredAt: string;
  status: string;
}

export interface SessionAvailability {
  sessionId: string;
  title: string;
  conferenceId: string;
  conferenceTitle: string;
  startTime: string;
  endTime: string;
  /** @nullable */
  venueName?: string | null;
  status: string;
  /** @nullable */
  capacity?: number | null;
  registeredCount: number;
  /** @nullable */
  availableCount?: number | null;
  isFull: boolean;
  registrationOpen: boolean;
}

export interface RegisterSessionBody {
  sessionId: string;
}

export type ListSessionRegistrationsResponse = SessionRegistration[];

export type ListAvailableConferencesResponse = ConferenceAvailability[];

export type ListAvailableSessionsResponse = SessionAvailability[];
