import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseQueryOptions,
  type MutationFunction,
  type QueryFunction,
  type QueryKey,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";
import type { ErrorType, BodyType } from "./custom-fetch";
import type {
  ConferenceRegistration,
  ConferenceAvailability,
  RegisterConferenceBody,
  ListConferenceRegistrationsResponse,
  MyConferenceRegistration,
  ListMyConferenceRegistrationsResponse,
  SessionRegistration,
  SessionAvailability,
  RegisterSessionBody,
  ListSessionRegistrationsResponse,
  ListAvailableConferencesResponse,
  ListAvailableSessionsResponse,
} from "./generated/api.schemas";

export interface SessionSpeakerAssignment {
  id: string;
  sessionId: string;
  speakerId: string;
  speakerRole: "keynote" | "speaker" | "panelist" | "moderator";
  createdAt: string;
}
export interface AddSessionSpeakerBody {
  sessionId: string;
  speakerId: string;
  speakerRole?: "keynote" | "speaker" | "panelist" | "moderator";
}

type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

const withQueryKey = <T extends object, K>(query: T, queryKey: K): T & { queryKey: K } => {
  const result = { queryKey } as T & { queryKey: K };
  for (const key of Object.keys(query)) {
    if (key === "queryKey") continue;
    Object.defineProperty(result, key, {
      enumerable: true,
      configurable: true,
      get: () => (query as Record<string, unknown>)[key],
    });
  }
  return result;
};

// ========== CONFERENCE REGISTRATION ==========

export const getListAvailableConferencesUrl = () => "/api/conferences/available";

export const listAvailableConferences = async (
  options?: Parameters<typeof customFetch>[1],
): Promise<ListAvailableConferencesResponse> => {
  return customFetch<ListAvailableConferencesResponse>(getListAvailableConferencesUrl(), {
    ...options,
    method: "GET",
  });
};

export const getListAvailableConferencesQueryKey = () => [
  "/api/conferences/available",
] as const;

export const getListAvailableConferencesQueryOptions = <
  TData = Awaited<ReturnType<typeof listAvailableConferences>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof listAvailableConferences>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getListAvailableConferencesQueryKey();
  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof listAvailableConferences>>
  > = ({ signal }) =>
    listAvailableConferences({ signal, ...requestOptions });

  return {
    queryKey,
    queryFn,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof listAvailableConferences>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type ListAvailableConferencesQueryResult = NonNullable<
  Awaited<ReturnType<typeof listAvailableConferences>>
>;
export type ListAvailableConferencesQueryError = ErrorType<unknown>;

export function useListAvailableConferences<
  TData = Awaited<ReturnType<typeof listAvailableConferences>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof listAvailableConferences>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getListAvailableConferencesQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };
  return withQueryKey(query, queryOptions.queryKey);
}

// POST /conferences/:conferenceId/register
export const getRegisterConferenceUrl = (conferenceId: string) =>
  `/api/conferences/${conferenceId}/register`;

export const registerConference = async (
  conferenceId: string,
  body: RegisterConferenceBody,
  options?: Parameters<typeof customFetch>[1],
): Promise<ConferenceRegistration> => {
  return customFetch<ConferenceRegistration>(getRegisterConferenceUrl(conferenceId), {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(body),
  });
};

export const getRegisterConferenceMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof registerConference>>,
      TError,
      { conferenceId: string; data: BodyType<RegisterConferenceBody> },
      TContext
    >;
    request?: SecondParameter<typeof customFetch>;
  },
): UseMutationOptions<
  Awaited<ReturnType<typeof registerConference>>,
  TError,
  { conferenceId: string; data: BodyType<RegisterConferenceBody> },
  TContext
> => {
  const mutationKey = ["registerConference"];
  const { mutation: mutationOptions, request: requestOptions } = options ??
    {};
  const merged = options ?
    options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
    options
    : {...options, mutation: {...options.mutation, mutationKey}}
    : {mutation: { mutationKey, }, request: undefined};
  const { mutation: finalMutationOptions, request: finalRequestOptions } =
    merged ?? { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof registerConference>>,
    { conferenceId: string; data: BodyType<RegisterConferenceBody> }
  > = (props) => {
    const { conferenceId, data } = props ?? {};
    return registerConference(conferenceId, data, finalRequestOptions);
  };

  return { mutationFn, ...finalMutationOptions };
};

export type RegisterConferenceMutationResult = NonNullable<
  Awaited<ReturnType<typeof registerConference>>
>;
export type RegisterConferenceMutationError = ErrorType<unknown>;

export function useRegisterConference<
  TError = ErrorType<unknown>,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof registerConference>>,
      TError,
      { conferenceId: string; data: BodyType<RegisterConferenceBody> },
      TContext
    >;
    request?: SecondParameter<typeof customFetch>;
  },
): UseMutationResult<
  Awaited<ReturnType<typeof registerConference>>,
  TError,
  { conferenceId: string; data: BodyType<RegisterConferenceBody> },
  TContext
> {
  return useMutation(getRegisterConferenceMutationOptions(options));
}

// DELETE /conferences/:conferenceId/cancel
export const getCancelConferenceRegistrationUrl = (conferenceId: string) =>
  `/api/conferences/${conferenceId}/cancel`;

export const cancelConferenceRegistration = async (
  conferenceId: string,
  options?: Parameters<typeof customFetch>[1],
): Promise<void> => {
  return customFetch<void>(getCancelConferenceRegistrationUrl(conferenceId), {
    ...options,
    method: "DELETE",
  });
};

export const getCancelConferenceRegistrationMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof cancelConferenceRegistration>>,
      TError,
      { conferenceId: string },
      TContext
    >;
    request?: SecondParameter<typeof customFetch>;
  },
): UseMutationOptions<
  Awaited<ReturnType<typeof cancelConferenceRegistration>>,
  TError,
  { conferenceId: string },
  TContext
> => {
  const mutationKey = ["cancelConferenceRegistration"];
  const { mutation: mutationOptions, request: requestOptions } = options ??
    {};
  const merged = options ?
    options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
    options
    : {...options, mutation: {...options.mutation, mutationKey}}
    : {mutation: { mutationKey, }, request: undefined};
  const { mutation: finalMutationOptions, request: finalRequestOptions } =
    merged ?? { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof cancelConferenceRegistration>>,
    { conferenceId: string }
  > = (props) => {
    const { conferenceId } = props ?? {};
    return cancelConferenceRegistration(conferenceId, finalRequestOptions);
  };

  return { mutationFn, ...finalMutationOptions };
};

export type CancelConferenceRegistrationMutationResult = NonNullable<
  Awaited<ReturnType<typeof cancelConferenceRegistration>>
>;
export type CancelConferenceRegistrationMutationError = ErrorType<unknown>;

export function useCancelConferenceRegistration<
  TError = ErrorType<unknown>,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof cancelConferenceRegistration>>,
      TError,
      { conferenceId: string },
      TContext
    >;
    request?: SecondParameter<typeof customFetch>;
  },
): UseMutationResult<
  Awaited<ReturnType<typeof cancelConferenceRegistration>>,
  TError,
  { conferenceId: string },
  TContext
> {
  return useMutation(getCancelConferenceRegistrationMutationOptions(options));
}

// GET /conferences/:conferenceId/registrations
export const getListConferenceRegistrationsUrl = (conferenceId: string) =>
  `/api/conferences/${conferenceId}/registrations`;

export const listConferenceRegistrations = async (
  conferenceId: string,
  options?: Parameters<typeof customFetch>[1],
): Promise<ListConferenceRegistrationsResponse> => {
  return customFetch<ListConferenceRegistrationsResponse>(
    getListConferenceRegistrationsUrl(conferenceId),
    {
      ...options,
      method: "GET",
    },
  );
};

export const getListConferenceRegistrationsQueryKey = (conferenceId: string) =>
  [`/api/conferences/${conferenceId}/registrations`] as const;

export const getListConferenceRegistrationsQueryOptions = <
  TData = Awaited<ReturnType<typeof listConferenceRegistrations>>,
  TError = ErrorType<unknown>,
>(
  conferenceId: string,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof listConferenceRegistrations>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey =
    queryOptions?.queryKey ?? getListConferenceRegistrationsQueryKey(conferenceId);
  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof listConferenceRegistrations>>
  > = ({ signal }) =>
    listConferenceRegistrations(conferenceId, { signal, ...requestOptions });

  return {
    queryKey,
    queryFn,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof listConferenceRegistrations>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type ListConferenceRegistrationsQueryResult = NonNullable<
  Awaited<ReturnType<typeof listConferenceRegistrations>>
>;
export type ListConferenceRegistrationsQueryError = ErrorType<unknown>;

export function useListConferenceRegistrations<
  TData = Awaited<ReturnType<typeof listConferenceRegistrations>>,
  TError = ErrorType<unknown>,
>(
  conferenceId: string,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof listConferenceRegistrations>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getListConferenceRegistrationsQueryOptions(
    conferenceId,
    options,
  );
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };
  return withQueryKey(query, queryOptions.queryKey);
}

// GET /conferences/registrations/me
export const getListMyConferenceRegistrationsUrl = () =>
  `/api/conferences/registrations/me`;

export const listMyConferenceRegistrations = async (
  options?: Parameters<typeof customFetch>[1],
): Promise<ListMyConferenceRegistrationsResponse> => {
  return customFetch<ListMyConferenceRegistrationsResponse>(
    getListMyConferenceRegistrationsUrl(),
    {
      ...options,
      method: "GET",
    },
  );
};

export const getListMyConferenceRegistrationsQueryKey = () =>
  ["/api/conferences/registrations/me"] as const;

export const getListMyConferenceRegistrationsQueryOptions = <
  TData = Awaited<ReturnType<typeof listMyConferenceRegistrations>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof listMyConferenceRegistrations>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey =
    queryOptions?.queryKey ?? getListMyConferenceRegistrationsQueryKey();
  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof listMyConferenceRegistrations>>
  > = ({ signal }) =>
    listMyConferenceRegistrations({ signal, ...requestOptions });

  return {
    queryKey,
    queryFn,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof listMyConferenceRegistrations>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type ListMyConferenceRegistrationsQueryResult = NonNullable<
  Awaited<ReturnType<typeof listMyConferenceRegistrations>>
>;
export type ListMyConferenceRegistrationsQueryError = ErrorType<unknown>;

export function useListMyConferenceRegistrations<
  TData = Awaited<ReturnType<typeof listMyConferenceRegistrations>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof listMyConferenceRegistrations>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getListMyConferenceRegistrationsQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };
  return withQueryKey(query, queryOptions.queryKey);
}

// ========== SESSION REGISTRATION ==========

export const getListAvailableSessionsUrl = () => "/api/sessions/available";

export const listAvailableSessions = async (
  options?: Parameters<typeof customFetch>[1],
): Promise<ListAvailableSessionsResponse> => {
  return customFetch<ListAvailableSessionsResponse>(getListAvailableSessionsUrl(), {
    ...options,
    method: "GET",
  });
};

export const getListAvailableSessionsQueryKey = () => [
  "/api/sessions/available",
] as const;

export const getListAvailableSessionsQueryOptions = <
  TData = Awaited<ReturnType<typeof listAvailableSessions>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof listAvailableSessions>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey = queryOptions?.queryKey ?? getListAvailableSessionsQueryKey();
  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof listAvailableSessions>>
  > = ({ signal }) => listAvailableSessions({ signal, ...requestOptions });

  return {
    queryKey,
    queryFn,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof listAvailableSessions>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type ListAvailableSessionsQueryResult = NonNullable<
  Awaited<ReturnType<typeof listAvailableSessions>>
>;
export type ListAvailableSessionsQueryError = ErrorType<unknown>;

export function useListAvailableSessions<
  TData = Awaited<ReturnType<typeof listAvailableSessions>>,
  TError = ErrorType<unknown>,
>(
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof listAvailableSessions>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getListAvailableSessionsQueryOptions(options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };
  return withQueryKey(query, queryOptions.queryKey);
}

// POST /sessions/:sessionId/register
export const getRegisterSessionUrl = (sessionId: string) =>
  `/api/sessions/${sessionId}/register`;

export const registerSession = async (
  sessionId: string,
  body: RegisterSessionBody,
  options?: Parameters<typeof customFetch>[1],
): Promise<SessionRegistration> => {
  return customFetch<SessionRegistration>(getRegisterSessionUrl(sessionId), {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(body),
  });
};

export const getRegisterSessionMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof registerSession>>,
      TError,
      { sessionId: string; data: BodyType<RegisterSessionBody> },
      TContext
    >;
    request?: SecondParameter<typeof customFetch>;
  },
): UseMutationOptions<
  Awaited<ReturnType<typeof registerSession>>,
  TError,
  { sessionId: string; data: BodyType<RegisterSessionBody> },
  TContext
> => {
  const mutationKey = ["registerSession"];
  const { mutation: mutationOptions, request: requestOptions } = options ??
    {};
  const merged = options ?
    options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
    options
    : {...options, mutation: {...options.mutation, mutationKey}}
    : {mutation: { mutationKey, }, request: undefined};
  const { mutation: finalMutationOptions, request: finalRequestOptions } =
    merged ?? { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof registerSession>>,
    { sessionId: string; data: BodyType<RegisterSessionBody> }
  > = (props) => {
    const { sessionId, data } = props ?? {};
    return registerSession(sessionId, data, finalRequestOptions);
  };

  return { mutationFn, ...finalMutationOptions };
};

export type RegisterSessionMutationResult = NonNullable<
  Awaited<ReturnType<typeof registerSession>>
>;
export type RegisterSessionMutationError = ErrorType<unknown>;

export function useRegisterSession<
  TError = ErrorType<unknown>,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof registerSession>>,
      TError,
      { sessionId: string; data: BodyType<RegisterSessionBody> },
      TContext
    >;
    request?: SecondParameter<typeof customFetch>;
  },
): UseMutationResult<
  Awaited<ReturnType<typeof registerSession>>,
  TError,
  { sessionId: string; data: BodyType<RegisterSessionBody> },
  TContext
> {
  return useMutation(getRegisterSessionMutationOptions(options));
}

// DELETE /sessions/:sessionId/cancel
export const getCancelSessionRegistrationUrl = (sessionId: string) =>
  `/api/sessions/${sessionId}/cancel`;

export const cancelSessionRegistration = async (
  sessionId: string,
  options?: Parameters<typeof customFetch>[1],
): Promise<void> => {
  return customFetch<void>(getCancelSessionRegistrationUrl(sessionId), {
    ...options,
    method: "DELETE",
  });
};

export const getCancelSessionRegistrationMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof cancelSessionRegistration>>,
      TError,
      { sessionId: string },
      TContext
    >;
    request?: SecondParameter<typeof customFetch>;
  },
): UseMutationOptions<
  Awaited<ReturnType<typeof cancelSessionRegistration>>,
  TError,
  { sessionId: string },
  TContext
> => {
  const mutationKey = ["cancelSessionRegistration"];
  const { mutation: mutationOptions, request: requestOptions } = options ??
    {};
  const merged = options ?
    options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
    options
    : {...options, mutation: {...options.mutation, mutationKey}}
    : {mutation: { mutationKey, }, request: undefined};
  const { mutation: finalMutationOptions, request: finalRequestOptions } =
    merged ?? { mutation: { mutationKey }, request: undefined };

  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof cancelSessionRegistration>>,
    { sessionId: string }
  > = (props) => {
    const { sessionId } = props ?? {};
    return cancelSessionRegistration(sessionId, finalRequestOptions);
  };

  return { mutationFn, ...finalMutationOptions };
};

export type CancelSessionRegistrationMutationResult = NonNullable<
  Awaited<ReturnType<typeof cancelSessionRegistration>>
>;
export type CancelSessionRegistrationMutationError = ErrorType<unknown>;

export function useCancelSessionRegistration<
  TError = ErrorType<unknown>,
  TContext = unknown,
>(
  options?: {
    mutation?: UseMutationOptions<
      Awaited<ReturnType<typeof cancelSessionRegistration>>,
      TError,
      { sessionId: string },
      TContext
    >;
    request?: SecondParameter<typeof customFetch>;
  },
): UseMutationResult<
  Awaited<ReturnType<typeof cancelSessionRegistration>>,
  TError,
  { sessionId: string },
  TContext
> {
  return useMutation(getCancelSessionRegistrationMutationOptions(options));
}

// GET /sessions/:sessionId/registrations
export const getListSessionRegistrationsUrl = (sessionId: string) =>
  `/api/sessions/${sessionId}/registrations`;

export const listSessionRegistrations = async (
  sessionId: string,
  options?: Parameters<typeof customFetch>[1],
): Promise<ListSessionRegistrationsResponse> => {
  return customFetch<ListSessionRegistrationsResponse>(
    getListSessionRegistrationsUrl(sessionId),
    {
      ...options,
      method: "GET",
    },
  );
};

export const getListSessionRegistrationsQueryKey = (sessionId: string) =>
  [`/api/sessions/${sessionId}/registrations`] as const;

export const getListSessionRegistrationsQueryOptions = <
  TData = Awaited<ReturnType<typeof listSessionRegistrations>>,
  TError = ErrorType<unknown>,
>(
  sessionId: string,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof listSessionRegistrations>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
) => {
  const { query: queryOptions, request: requestOptions } = options ?? {};
  const queryKey =
    queryOptions?.queryKey ?? getListSessionRegistrationsQueryKey(sessionId);
  const queryFn: QueryFunction<
    Awaited<ReturnType<typeof listSessionRegistrations>>
  > = ({ signal }) =>
    listSessionRegistrations(sessionId, { signal, ...requestOptions });

  return {
    queryKey,
    queryFn,
    ...queryOptions,
  } as UseQueryOptions<
    Awaited<ReturnType<typeof listSessionRegistrations>>,
    TError,
    TData
  > & { queryKey: QueryKey };
};

export type ListSessionRegistrationsQueryResult = NonNullable<
  Awaited<ReturnType<typeof listSessionRegistrations>>
>;
export type ListSessionRegistrationsQueryError = ErrorType<unknown>;

export function useListSessionRegistrations<
  TData = Awaited<ReturnType<typeof listSessionRegistrations>>,
  TError = ErrorType<unknown>,
>(
  sessionId: string,
  options?: {
    query?: UseQueryOptions<
      Awaited<ReturnType<typeof listSessionRegistrations>>,
      TError,
      TData
    >;
    request?: SecondParameter<typeof customFetch>;
  },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
  const queryOptions = getListSessionRegistrationsQueryOptions(sessionId, options);
  const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
  };
  return withQueryKey(query, queryOptions.queryKey);
}


// ========== SESSION SPEAKERS (ASSIGNMENT) ==========

export const addSessionSpeaker = async (
  data: BodyType<AddSessionSpeakerBody>,
  options?: Parameters<typeof customFetch>[1],
): Promise<SessionSpeakerAssignment> => {
  return customFetch<SessionSpeakerAssignment>("/api/session-speakers", {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(data),
  });
};

export const getAddSessionSpeakerMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof addSessionSpeaker>>,
    TError,
    { data: BodyType<AddSessionSpeakerBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}) => {
  const mutationKey = ["addSessionSpeaker"];
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};
  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof addSessionSpeaker>>,
    { data: BodyType<AddSessionSpeakerBody> }
  > = (props) => addSessionSpeaker(props.data, requestOptions);
  return { mutationFn, mutationKey, ...mutationOptions };
};

export function useAddSessionSpeaker<TError = ErrorType<unknown>, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof addSessionSpeaker>>,
    TError,
    { data: BodyType<AddSessionSpeakerBody> },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}) {
  return useMutation(getAddSessionSpeakerMutationOptions(options));
}

export const removeSessionSpeaker = async (
  sessionSpeakerId: string,
  options?: Parameters<typeof customFetch>[1],
): Promise<void> => {
  return customFetch<void>(`/api/session-speakers/${sessionSpeakerId}`, {
    ...options,
    method: "DELETE",
  });
};

export const getRemoveSessionSpeakerMutationOptions = <
  TError = ErrorType<unknown>,
  TContext = unknown,
>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof removeSessionSpeaker>>,
    TError,
    { sessionSpeakerId: string },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}) => {
  const mutationKey = ["removeSessionSpeaker"];
  const { mutation: mutationOptions, request: requestOptions } = options ?? {};
  const mutationFn: MutationFunction<
    Awaited<ReturnType<typeof removeSessionSpeaker>>,
    { sessionSpeakerId: string }
  > = (props) => removeSessionSpeaker(props.sessionSpeakerId, requestOptions);
  return { mutationFn, mutationKey, ...mutationOptions };
};

export function useRemoveSessionSpeaker<TError = ErrorType<unknown>, TContext = unknown>(options?: {
  mutation?: UseMutationOptions<
    Awaited<ReturnType<typeof removeSessionSpeaker>>,
    TError,
    { sessionSpeakerId: string },
    TContext
  >;
  request?: SecondParameter<typeof customFetch>;
}) {
  return useMutation(getRemoveSessionSpeakerMutationOptions(options));
}
