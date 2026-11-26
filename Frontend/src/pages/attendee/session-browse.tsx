import { useMemo, useState } from "react";
import { CalendarDays, Clock3, UsersRound, AlertCircle, Building2, CheckCircle } from "lucide-react";
import {
  useListAvailableSessions,
  useListMyConferenceRegistrations,
  useRegisterSession,
  useCancelSessionRegistration,
} from "@workspace/api-client-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "sonner";

export function SessionBrowsePage() {
  const query = useListAvailableSessions();
  const myRegsQuery = useListMyConferenceRegistrations();
  const registerMutation = useRegisterSession();
  const cancelMutation = useCancelSessionRegistration();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [registeredSessionIds, setRegisteredSessionIds] = useState<Set<string>>(new Set());

  const sessions = query.data ?? [];
  const myRegs = myRegsQuery.data ?? [];

  const registeredConferenceIds = useMemo(
    () => new Set(myRegs.filter((r: any) => r.status !== "cancelled").map((r: any) => r.conferenceId)),
    [myRegs],
  );

  const visibleSessions = useMemo(() => {
    return sessions.filter((s: any) => s.registrationOpen || s.status === "upcoming" || s.status === "ongoing" || registeredConferenceIds.has(s.conferenceId));
  }, [sessions, registeredConferenceIds]);

  const handleRegister = (sessionId: string) => {
    setBusyId(sessionId);
    registerMutation.mutate(
      { sessionId, data: { sessionId } as any },
      {
        onSuccess: () => {
          toast.success("Registered for session");
          setRegisteredSessionIds((prev) => new Set(prev).add(sessionId));
          query.refetch();
        },
        onError: (err: any) => toast.error(err?.message || "Failed to register for session"),
        onSettled: () => setBusyId(null),
      },
    );
  };

  const handleCancel = (sessionId: string) => {
    setBusyId(sessionId);
    cancelMutation.mutate(
      { sessionId },
      {
        onSuccess: () => {
          toast.success("Session registration withdrawn");
          setRegisteredSessionIds((prev) => {
            const next = new Set(prev);
            next.delete(sessionId);
            return next;
          });
          query.refetch();
        },
        onError: (err: any) => toast.error(err?.message || "Failed to withdraw session registration"),
        onSettled: () => setBusyId(null),
      },
    );
  };

  return (
    <div className="space-y-6">
      <Toaster />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sessions</h1>
        <p className="text-sm text-muted-foreground">
          Register for sessions in conferences you are registered for. You can withdraw session registration here.
        </p>
      </div>

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
              <p className="mt-1 text-sm text-muted-foreground">Sessions appear here when conferences publish them.</p>
            </div>
          ) : (
            visibleSessions.map((session: any) => {
              const inMyConference = registeredConferenceIds.has(session.conferenceId);
              const isSessionRegistered = registeredSessionIds.has(session.sessionId);
              const canRegister = inMyConference && session.registrationOpen && !session.isFull && !isSessionRegistered;
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
                        {isSessionRegistered ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                            Registered for session
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
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {isSessionRegistered ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={busyId === session.sessionId}
                        onClick={() => handleCancel(session.sessionId)}
                      >
                        {busyId === session.sessionId ? "Withdrawing…" : "Withdraw session registration"}
                      </Button>
                    ) : canRegister ? (
                      <Button
                        size="sm"
                        disabled={busyId === session.sessionId}
                        onClick={() => handleRegister(session.sessionId)}
                      >
                        {busyId === session.sessionId ? "Registering…" : "Register for session"}
                      </Button>
                    ) : !inMyConference ? (
                      <div className="text-xs text-muted-foreground">
                        Register for the conference first to register for its sessions.{" "}
                        <Link href="/conferences" className="font-semibold text-[hsl(var(--primary))] hover:underline">
                          Browse conferences
                        </Link>
                      </div>
                    ) : session.isFull ? (
                      <span className="text-xs text-muted-foreground">Session is full.</span>
                    ) : !session.registrationOpen ? (
                      <span className="text-xs text-muted-foreground">Session registration is closed.</span>
                    ) : null}
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
