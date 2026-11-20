import { useMemo, useState } from "react";
import { CalendarDays, Clock3, UsersRound, AlertCircle, Building2, CheckCircle } from "lucide-react";
import {
  useListAvailableSessions,
  useRegisterSession,
  useCancelSessionRegistration,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "sonner";

export function SessionBrowsePage() {
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const query = useListAvailableSessions();
  const sessions = query.data ?? [];
  const registerMutation = useRegisterSession();
  const cancelMutation = useCancelSessionRegistration();

  const visibleSessions = useMemo(
    () => sessions.filter((s) => registeredIds.has(s.sessionId) || (s.registrationOpen && !s.isFull)),
    [sessions, registeredIds],
  );

  const handleRegister = (sessionId: string) => {
    setBusyId(sessionId);
    registerMutation.mutate(
      { sessionId, data: { sessionId } },
      {
        onSuccess: () => {
          setRegisteredIds((prev) => new Set(prev).add(sessionId));
          toast.success("Registered for session");
          query.refetch();
        },
        onError: (err: any) => {
          toast.error(err?.message || "Registration failed");
        },
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
          setRegisteredIds((prev) => {
            const next = new Set(prev);
            next.delete(sessionId);
            return next;
          });
          toast.success("Registration cancelled");
          query.refetch();
        },
        onError: (err: any) => {
          toast.error(err?.message || "Cancellation failed");
        },
        onSettled: () => setBusyId(null),
      },
    );
  };

  return (
    <div className="space-y-6">
      <Toaster />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Browse sessions</h1>
        <p className="text-sm text-muted-foreground">
          Register for sessions to reserve your seat. You cannot register for sessions that conflict with your schedule.
        </p>
      </div>

      {query.isLoading && (
        <div className="h-64 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!query.isLoading && (
        <div className="grid gap-4">
          {visibleSessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <Clock3 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <h3 className="font-semibold">No sessions open for registration</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Check back later for upcoming sessions.
              </p>
            </div>
          ) : (
            visibleSessions.map((session) => {
              const isRegistered = registeredIds.has(session.sessionId);
              const closed = session.isFull || !session.registrationOpen;
              return (
                <div
                  key={session.sessionId}
                  className={`rounded-xl border p-5 transition ${
                    closed && !isRegistered
                      ? "border-border bg-secondary/30 opacity-80"
                      : "border-border bg-card hover:border-primary hover:shadow-md"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold">{session.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {session.conferenceTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      {session.isFull && (
                        <span className="inline-flex items-center gap-1 text-destructive">
                          <AlertCircle className="h-3.5 w-3.5" /> Full
                        </span>
                      )}
                      {isRegistered && (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle className="h-3.5 w-3.5" /> Registered
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
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
                      <span>{session.venueName ?? "TBD"}</span>
                    </div>
                    <p className="flex items-center gap-1">
                      <UsersRound className="h-3.5 w-3.5" />
                      {session.registeredCount}
                      {session.capacity != null ? ` / ${session.capacity}` : ""} registered
                      {session.capacity != null ? ` · ${session.availableCount} spots available` : ""}
                    </p>
                  </div>
                  <div className="mt-4">
                    {isRegistered ? (
                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={busyId === session.sessionId}
                        onClick={() => handleCancel(session.sessionId)}
                      >
                        Cancel registration
                      </Button>
                    ) : closed ? (
                      <Button variant="outline" disabled className="w-full">
                        {session.isFull ? "Full" : "Closed"}
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        disabled={busyId === session.sessionId}
                        onClick={() => handleRegister(session.sessionId)}
                      >
                        Register
                      </Button>
                    )}
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