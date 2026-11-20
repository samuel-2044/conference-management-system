import { useMemo } from "react";
import { CalendarDays, Clock3, UsersRound, AlertCircle, Building2, CheckCircle } from "lucide-react";
import { useListAvailableSessions, useListMyConferenceRegistrations } from "@workspace/api-client-react";
import { Link } from "wouter";

export function SessionBrowsePage() {
  const query = useListAvailableSessions();
  const myRegsQuery = useListMyConferenceRegistrations();
  const sessions = query.data ?? [];
  const myRegs = myRegsQuery.data ?? [];

  const registeredConferenceIds = useMemo(
    () => new Set(myRegs.filter((r: any) => r.status !== "cancelled").map((r: any) => r.conferenceId)),
    [myRegs],
  );

  const visibleSessions = useMemo(() => {
    // Show sessions for conferences the user is registered for; if none, show all upcoming sessions as informational
    const mine = sessions.filter((s: any) => registeredConferenceIds.has(s.conferenceId));
    if (mine.length > 0) return mine;
    return sessions.filter((s: any) => s.registrationOpen || s.status === "upcoming" || s.status === "ongoing");
  }, [sessions, registeredConferenceIds]);

  const hasConferenceRegistration = registeredConferenceIds.size > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conference sessions</h1>
        <p className="text-sm text-muted-foreground">
          Sessions are part of a conference. Register for a conference first to attend its sessions—session
          registration is not done separately.
        </p>
      </div>

      {!hasConferenceRegistration && !query.isLoading && !myRegsQuery.isLoading && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          You are not registered for any conference yet.{" "}
          <Link href="/conferences" className="font-semibold underline underline-offset-2">
            Browse conferences
          </Link>{" "}
          and register to access conference sessions.
        </div>
      )}

      {(query.isLoading || myRegsQuery.isLoading) && (
        <div className="h-64 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!query.isLoading && !myRegsQuery.isLoading && (
        <div className="grid gap-4">
          {visibleSessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <Clock3 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <h3 className="font-semibold">No sessions to show</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Sessions appear here when conferences publish them.
              </p>
            </div>
          ) : (
            visibleSessions.map((session: any) => {
              const inMyConference = registeredConferenceIds.has(session.conferenceId);
              return (
                <div
                  key={session.sessionId}
                  className="rounded-xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold">{session.title}</h2>
                        {inMyConference ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                            <CheckCircle className="h-3.5 w-3.5" /> Your conference
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Conference: <span className="font-medium text-foreground">{session.conferenceTitle}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 capitalize text-muted-foreground">
                        {session.status}
                      </span>
                      {session.isFull && (
                        <span className="inline-flex items-center gap-1 text-destructive">
                          <AlertCircle className="h-3.5 w-3.5" /> Full
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>{new Date(session.startTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-3.5 w-3.5" />
                      <span>
                        {new Date(session.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                        {new Date(session.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5" />
                      <span>{session.venueName ?? "Venue TBD"}</span>
                    </div>
                    <p className="flex items-center gap-1">
                      <UsersRound className="h-3.5 w-3.5" />
                      {session.registeredCount}
                      {session.capacity != null ? ` / ${session.capacity}` : ""} registered
                    </p>
                  </div>
                  <div className="mt-4 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
                    {inMyConference
                      ? "You’re registered for this conference—attend sessions as scheduled (no separate session sign-up)."
                      : "Register for the conference to participate in its sessions."}{" "}
                    <Link href="/conferences" className="font-semibold text-[hsl(var(--primary))] hover:underline">
                      View conferences
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
