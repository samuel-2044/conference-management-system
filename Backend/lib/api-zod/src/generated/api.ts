/**
 * Conference Management System API
 * OpenAPI spec version 0.2.0
 */
import * as zod from 'zod';


/**
 * Returns server health status
 * @summary Health check
 */
export const HealthCheckResponse = zod.object({
  "status": zod.string()
})


/**
 * @summary Get dashboard summary
 */
export const GetDashboardSummaryResponse = zod.object({
  "activeConferences": zod.number(),
  "totalOrganisers": zod.number(),
  "totalAttendees": zod.number(),
  "totalSpeakers": zod.number(),
  "totalVenues": zod.number(),
  "totalSessions": zod.number(),
  "registrationTrend": zod.array(zod.object({
  "label": zod.string(),
  "value": zod.number()
})),
  "activities": zod.array(zod.object({
  "id": zod.string(),
  "title": zod.string(),
  "detail": zod.string(),
  "time": zod.string(),
  "kind": zod.string()
})),
  "upcomingSessions": zod.array(zod.object({
  "id": zod.string(),
  "title": zod.string(),
  "description": zod.string(),
  "venueName": zod.string(),
  "conferenceId": zod.string(),
  "startTime": zod.string(),
  "endTime": zod.string()
}))
})


// ========== ROLES ==========

export const Role = zod.object({
  "id": zod.string(),
  "name": zod.string(),
  "createdAt": zod.coerce.date()
})

export const ListRolesResponse = zod.array(Role)

export const CreateRoleBody = zod.object({
  "name": zod.string().min(1)
})

export const CreateRoleResponse = Role


// ========== USERS ==========

export const User = zod.object({
  "id": zod.string(),
  "roleId": zod.string(),
  "name": zod.string(),
  "email": zod.string(),
  "phone": zod.string().nullish(),
  "avatarUrl": zod.string().nullish(),
  "createdAt": zod.coerce.date()
})

export const ListUsersResponse = zod.array(User)

export const CreateUserBody = zod.object({
  "roleId": zod.string(),
  "name": zod.string().min(1),
  "email": zod.string().email(),
  "password": zod.string().min(8),
  "phone": zod.string().optional(),
  "avatarUrl": zod.string().optional()
})

export const CreateUserResponse = User

export const GetUserParams = zod.object({
  "userId": zod.coerce.string()
})

export const GetUserResponse = User

export const UpdateUserBody = zod.object({
  "roleId": zod.string().optional(),
  "name": zod.string().optional(),
  "email": zod.string().email().optional(),
  "phone": zod.string().optional(),
  "avatarUrl": zod.string().optional()
})

export const UpdateUserParams = zod.object({
  "userId": zod.coerce.string()
})

export const UpdateUserResponse = User


// ========== CONFERENCES ==========

export const Conference = zod.object({
  "id": zod.string(),
  "title": zod.string(),
  "description": zod.string(),
  "startDate": zod.coerce.date(),
  "endDate": zod.coerce.date(),
  "createdBy": zod.string().nullish(),
  "createdAt": zod.coerce.date(),
  "capacity": zod.number().nullish(),
  "status": zod.string()
})

export const ListConferencesResponse = zod.array(Conference)

export const CreateConferenceBody = zod.object({
  "title": zod.string().min(1),
  "description": zod.string(),
  "startDate": zod.coerce.date(),
  "endDate": zod.coerce.date(),
  "capacity": zod.number().optional(),
  "status": zod.string().optional()
})

export const CreateConferenceResponse = Conference

export const GetConferenceParams = zod.object({
  "conferenceId": zod.coerce.string()
})

export const GetConferenceResponse = Conference.and(zod.object({
  "speakers": zod.array(zod.object({
  "id": zod.string(),
  "userId": zod.string().nullish(),
  "name": zod.string(),
  "email": zod.string(),
  "bio": zod.string(),
  "photoUrl": zod.string().nullish()
})),
  "venues": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string(),
  "building": zod.string(),
  "room": zod.string(),
  "capacity": zod.number()
})),
  "sessions": zod.array(zod.object({
  "id": zod.string(),
  "venueId": zod.string().nullish(),
  "venueName": zod.string().nullish(),
  "title": zod.string(),
  "description": zod.string(),
  "startTime": zod.string(),
  "endTime": zod.string()
})),
  "documents": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string(),
  "type": zod.string(),
  "size": zod.string(),
  "uploadedAt": zod.coerce.date(),
  "uploadedBy": zod.string(),
  "fileUrl": zod.string()
}))
}))

export const UpdateConferenceBody = zod.object({
  "title": zod.string().min(1).optional(),
  "description": zod.string().optional(),
  "startDate": zod.coerce.date().optional(),
  "endDate": zod.coerce.date().optional()
})

export const UpdateConferenceParams = zod.object({
  "conferenceId": zod.coerce.string()
})

export const UpdateConferenceResponse = Conference

export const DeleteConferenceParams = zod.object({
  "conferenceId": zod.coerce.string()
})

export const DeleteConferenceResponse = zod.void()


// ========== VENUES ==========

export const Venue = zod.object({
  "id": zod.string(),
  "conferenceId": zod.string(),
  "name": zod.string(),
  "building": zod.string(),
  "room": zod.string(),
  "capacity": zod.number(),
  "createdAt": zod.coerce.date()
})

export const ListVenuesResponse = zod.array(Venue)

export const CreateVenueBody = zod.object({
  "conferenceId": zod.string(),
  "name": zod.string().min(1),
  "building": zod.string(),
  "room": zod.string(),
  "capacity": zod.number()
})

export const CreateVenueResponse = Venue

export const GetVenueParams = zod.object({
  "venueId": zod.coerce.string()
})

export const GetVenueResponse = Venue

export const UpdateVenueBody = zod.object({
  "name": zod.string().optional(),
  "building": zod.string().optional(),
  "room": zod.string().optional(),
  "capacity": zod.number().optional()
})

export const UpdateVenueParams = zod.object({
  "venueId": zod.coerce.string()
})

export const UpdateVenueResponse = Venue

export const DeleteVenueParams = zod.object({
  "venueId": zod.coerce.string()
})

export const DeleteVenueResponse = zod.void()


// ========== SESSIONS ==========

export const Session = zod.object({
  "id": zod.string(),
  "conferenceId": zod.string(),
  "venueId": zod.string().nullish(),
  "title": zod.string(),
  "description": zod.string(),
  "startTime": zod.string(),
  "endTime": zod.string(),
  "createdAt": zod.coerce.date(),
  "capacity": zod.number().nullish()
})

export const ListSessionsQueryParams = zod.object({
  "conferenceId": zod.coerce.string().optional()
})

export const ListSessionsResponse = zod.array(Session)

export const CreateSessionBody = zod.object({
  "conferenceId": zod.string(),
  "venueId": zod.string().optional(),
  "title": zod.string().min(1),
  "description": zod.string(),
  "startTime": zod.string(),
  "endTime": zod.string(),
  "capacity": zod.number().optional()
})

export const CreateSessionResponse = Session

export const GetSessionParams = zod.object({
  "sessionId": zod.coerce.string()
})

export const GetSessionResponse = Session.and(zod.object({
  "speakers": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string(),
  "bio": zod.string(),
  "speakerRole": zod.string()
})),
  "attendees": zod.array(zod.object({
  "id": zod.string(),
  "name": zod.string(),
  "email": zod.string(),
  "status": zod.string()
}))
}))

export const UpdateSessionBody = zod.object({
  "venueId": zod.string().optional(),
  "title": zod.string().optional(),
  "description": zod.string().optional(),
  "startTime": zod.string().optional(),
  "endTime": zod.string().optional()
})

export const UpdateSessionParams = zod.object({
  "sessionId": zod.coerce.string()
})

export const UpdateSessionResponse = Session

export const DeleteSessionParams = zod.object({
  "sessionId": zod.coerce.string()
})

export const DeleteSessionResponse = zod.void()


// ========== SPEAKERS ==========

export const Speaker = zod.object({
  "id": zod.string(),
  "userId": zod.string().nullish(),
  "bio": zod.string(),
  "photoUrl": zod.string().nullish(),
  "createdAt": zod.coerce.date()
})

export const ListSpeakersQueryParams = zod.object({
  "search": zod.coerce.string().optional(),
  "conferenceId": zod.coerce.string().optional()
})

export const ListSpeakersResponse = zod.array(zod.object({
  "id": zod.string(),
  "userId": zod.string().nullish(),
  "name": zod.string(),
  "email": zod.string(),
  "bio": zod.string(),
  "photoUrl": zod.string().nullish(),
  "sessionCount": zod.number()
}))

export const CreateSpeakerBody = zod.object({
  "userId": zod.string().optional(),
  "bio": zod.string(),
  "photoUrl": zod.string().optional()
})

export const CreateSpeakerResponse = Speaker

export const GetSpeakerParams = zod.object({
  "speakerId": zod.coerce.string()
})

export const GetSpeakerResponse = zod.object({
  "id": zod.string(),
  "userId": zod.string().nullish(),
  "name": zod.string(),
  "email": zod.string(),
  "bio": zod.string(),
  "photoUrl": zod.string().nullish(),
  "sessions": zod.array(zod.object({
  "id": zod.string(),
  "title": zod.string(),
  "startTime": zod.string(),
  "endTime": zod.string(),
  "speakerRole": zod.string()
}))
})

export const UpdateSpeakerBody = zod.object({
  "bio": zod.string().optional(),
  "photoUrl": zod.string().optional()
})

export const UpdateSpeakerParams = zod.object({
  "speakerId": zod.coerce.string()
})

export const UpdateSpeakerResponse = Speaker

export const DeleteSpeakerParams = zod.object({
  "speakerId": zod.coerce.string()
})

export const DeleteSpeakerResponse = zod.void()


// ========== ATTENDEES ==========

export const Attendee = zod.object({
  "id": zod.string(),
  "userId": zod.string(),
  "createdAt": zod.coerce.date()
})

export const ListAttendeesQueryParams = zod.object({
  "search": zod.coerce.string().optional(),
  "conferenceId": zod.coerce.string().optional()
})

export const ListAttendeesResponse = zod.array(zod.object({
  "id": zod.string(),
  "userId": zod.string(),
  "name": zod.string(),
  "email": zod.string(),
  "conferenceId": zod.string(),
  "conferenceTitle": zod.string(),
  "registrationDate": zod.coerce.date(),
  "status": zod.enum(['pending', 'confirmed', 'cancelled'])
}))

export const CreateAttendeeBody = zod.object({
  "userId": zod.string(),
  "conferenceId": zod.string()
})

export const CreateAttendeeResponse = zod.object({
  "id": zod.string(),
  "userId": zod.string(),
  "conferenceId": zod.string(),
  "registrationDate": zod.coerce.date(),
  "status": zod.string()
})

export const GetAttendeeParams = zod.object({
  "attendeeId": zod.coerce.string()
})

export const GetAttendeeResponse = zod.object({
  "id": zod.string(),
  "userId": zod.string(),
  "name": zod.string(),
  "email": zod.string(),
  "registrations": zod.array(zod.object({
  "conferenceId": zod.string(),
  "conferenceTitle": zod.string(),
  "registrationDate": zod.coerce.date(),
  "status": zod.string()
})),
  "sessions": zod.array(zod.object({
  "sessionId": zod.string(),
  "sessionTitle": zod.string(),
  "startTime": zod.string(),
  "endTime": zod.string(),
  "status": zod.string()
}))
})


// ========== ATTENDEE SESSIONS ==========

export const AttendeeSession = zod.object({
  "id": zod.string(),
  "attendeeId": zod.string(),
  "sessionId": zod.string(),
  "registeredAt": zod.coerce.date(),
  "checkedInAt": zod.coerce.date().nullish(),
  "status": zod.enum(['registered', 'attended', 'cancelled', 'no_show'])
})

export const RegisterAttendeeSessionBody = zod.object({
  "attendeeId": zod.string(),
  "sessionId": zod.string()
})

export const RegisterAttendeeSessionResponse = AttendeeSession

export const CheckInAttendeeSessionParams = zod.object({
  "attendeeSessionId": zod.coerce.string()
})

export const CheckInAttendeeSessionResponse = AttendeeSession


// ========== SESSION SPEAKERS ==========

export const SessionSpeaker = zod.object({
  "id": zod.string(),
  "sessionId": zod.string(),
  "speakerId": zod.string(),
  "speakerRole": zod.enum(['keynote', 'speaker', 'panelist', 'moderator']),
  "createdAt": zod.coerce.date()
})

export const AddSessionSpeakerBody = zod.object({
  "sessionId": zod.string(),
  "speakerId": zod.string(),
  "speakerRole": zod.enum(['keynote', 'speaker', 'panelist', 'moderator']).default('speaker')
})

export const AddSessionSpeakerResponse = SessionSpeaker

export const RemoveSessionSpeakerParams = zod.object({
  "sessionSpeakerId": zod.coerce.string()
})

export const RemoveSessionSpeakerResponse = zod.void()


// ========== DOCUMENTS ==========

export const Document = zod.object({
  "id": zod.string(),
  "userId": zod.string(),
  "conferenceId": zod.string().nullish(),
  "sessionId": zod.string().nullish(),
  "type": zod.string(),
  "fileKey": zod.string(),
  "fileUrl": zod.string().nullish(),
  "fileName": zod.string(),
  "fileSize": zod.number(),
  "contentType": zod.string(),
  "createdAt": zod.coerce.date()
})

export const ListDocumentsQueryParams = zod.object({
  "type": zod.enum(['all', 'paper', 'id-card', 'certificate', 'image']).default('all'),
  "conferenceId": zod.coerce.string().optional()
})

export const ListDocumentsResponse = zod.array(Document)

export const UploadDocumentBody = zod.object({
  "conferenceId": zod.string().optional(),
  "sessionId": zod.string().optional(),
  "type": zod.string(),
  "fileName": zod.string(),
  "fileSize": zod.number(),
  "contentType": zod.string()
})

export const UploadDocumentResponse = Document

export const DeleteDocumentParams = zod.object({
  "documentId": zod.coerce.string()
})

export const DeleteDocumentResponse = zod.void()


// ========== REPORTS ==========

export const GetRegistrationReportResponse = zod.object({
  "total": zod.number(),
  "confirmed": zod.number(),
  "pending": zod.number(),
  "cancelled": zod.number(),
  "byConference": zod.array(zod.object({
  "conference": zod.string(),
  "registrations": zod.number()
}))
})

export const GetAttendanceReportResponse = zod.object({
  "totalSessions": zod.number(),
  "averageAttendance": zod.number(),
  "bySession": zod.array(zod.object({
  "session": zod.string(),
  "registered": zod.number(),
  "attended": zod.number()
}))
})

// ========== MEMBERS ==========

export const Member = zod.object({
  "id": zod.string(),
  "name": zod.string(),
  "email": zod.string(),
  "role": zod.string(),
  "status": zod.string(),
  "createdAt": zod.coerce.date()
})

export const ListMembersResponse = zod.array(Member)

export const MemberStatsResponse = zod.object({
  "totalAttendees": zod.number(),
  "totalSpeakers": zod.number(),
  "activeMembers": zod.number(),
  "inactiveMembers": zod.number()
})

export const AddMemberBody = zod.object({
  "name": zod.string().min(1),
  "email": zod.string().email(),
  "password": zod.string().min(8),
  "role": zod.enum(["attendee", "speaker"])
})

export const UpdateMemberBody = zod.object({
  "name": zod.string().min(1).optional(),
  "email": zod.string().email().optional(),
  "role": zod.enum(["attendee", "speaker"]).optional()
})

export const UpdateMemberStatusBody = zod.object({
  "status": zod.enum(["active", "inactive"])
})

// ========== CONFERENCE REGISTRATION ==========

export const ConferenceRegistration = zod.object({
  "id": zod.string(),
  "attendeeId": zod.string(),
  "conferenceId": zod.string(),
  "registrationDate": zod.coerce.date(),
  "status": zod.string(),
  "fullName": zod.string().nullish(),
  "email": zod.string().nullish(),
  "phone": zod.string().nullish(),
  "organization": zod.string().nullish(),
  "specialRequirements": zod.string().nullish(),
  "conferenceTitle": zod.string().nullish(),
  "conferenceStartDate": zod.string().nullish(),
  "conferenceEndDate": zod.string().nullish(),
  "conferenceStatus": zod.string().nullish()
})

export const ListConferenceRegistrationsResponse = zod.array(ConferenceRegistration)

export const RegisterConferenceBody = zod.object({
  "conferenceId": zod.string(),
  "fullName": zod.string().min(1),
  "email": zod.string().email(),
  "phone": zod.string().min(1),
  "organization": zod.string().optional(),
  "specialRequirements": zod.string().optional()
})

export const MyConferenceRegistration = ConferenceRegistration.extend({
  "conferenceTitle": zod.string(),
  "conferenceStartDate": zod.string().nullish(),
  "conferenceEndDate": zod.string().nullish(),
  "conferenceStatus": zod.string().nullish()
})

export const ListMyConferenceRegistrationsResponse = zod.array(MyConferenceRegistration)

export const ConferenceAvailability = zod.object({
  "conferenceId": zod.string(),
  "title": zod.string(),
  "status": zod.string(),
  "capacity": zod.number().nullish(),
  "registeredCount": zod.number(),
  "availableCount": zod.number(),
  "isFull": zod.boolean(),
  "registrationOpen": zod.boolean()
})

export const ListAvailableConferencesResponse = zod.array(ConferenceAvailability)

// ========== SESSION REGISTRATION ==========

export const SessionRegistration = zod.object({
  "id": zod.string(),
  "attendeeId": zod.string(),
  "sessionId": zod.string(),
  "registeredAt": zod.coerce.date(),
  "status": zod.string()
})

export const ListSessionRegistrationsResponse = zod.array(SessionRegistration)

export const RegisterSessionBody = zod.object({
  "sessionId": zod.string()
})

export const SessionAvailability = zod.object({
  "sessionId": zod.string(),
  "title": zod.string(),
  "conferenceId": zod.string(),
  "conferenceTitle": zod.string(),
  "startTime": zod.string(),
  "endTime": zod.string(),
  "venueName": zod.string().nullish(),
  "status": zod.string(),
  "capacity": zod.number().nullish(),
  "registeredCount": zod.number(),
  "availableCount": zod.number(),
  "isFull": zod.boolean(),
  "registrationOpen": zod.boolean()
})

export const ListAvailableSessionsResponse = zod.array(SessionAvailability)
