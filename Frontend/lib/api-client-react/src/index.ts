export * from "./generated/api";
export * from "./generated/api.schemas";
export * from "./registration";
export { setBaseUrl, setAuthTokenGetter } from "./custom-fetch";
export type { AuthTokenGetter } from "./custom-fetch";

export { getListMyConferenceRegistrationsUrl, listMyConferenceRegistrations, getListMyConferenceRegistrationsQueryKey, getListMyConferenceRegistrationsQueryOptions, useListMyConferenceRegistrations } from "./registration";
export type { ListMyConferenceRegistrationsQueryResult, ListMyConferenceRegistrationsQueryError } from "./registration";
export { useAddSessionSpeaker, useRemoveSessionSpeaker } from "./registration";
export type { SessionSpeakerAssignment, AddSessionSpeakerBody } from "./registration";
