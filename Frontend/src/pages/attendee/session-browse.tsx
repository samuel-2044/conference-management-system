import { useState } from "react";
import { CalendarDays, Clock3, UsersRound, AlertCircle, Building2 } from "lucide-react";
import {
  useListAvailableSessions,
  useRegisterSession,
  useCancelSessionRegistration,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "sonner";

export function SessionBrowsePage() {
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const query = useListAvailableSessions();
  const sessions = query.data ?? [];
  const registerMutation = useRegisterSession();
  const cancelMutation = useCancelSessionRegistration();

  const handleRegister = (sessionId: string) => {
    registerMutation.mutate(
      { sessionId, data: { sessionId } },
      {
        onSuccess: () => {
          toast.success("Registered for session");
          query.refetch();
          setSelectedSession(null);
        },
        onError: (err) => {
          toast.error(err.message || "Registration failed");
        },
      },
    );
  };

  const handleCancel = (sessionId: string) => {
    cancelMutation.mutate(
      { sessionId },
      {
        onSuccess: () => {
          toast.success("Registration cancelled");
          query.refetch();
        },
        onError: (err) => {
          toast.error(err.message || "Cancellation failed");
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <Toaster />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Available Sessions</h1>
        <p className="text-sm text-muted-foreground" data-testid="session-browse-description">
          Browse and register for sessions. Registering for a session reserves your seat.
        </p>
      </div>

      {query.isLoading && (
        <div className="h-64 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!query.isLoading && (
        <div className="grid gap-4" data-testid="session-grid">
          {sessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center" data-testid="session-empty">
              <Clock3 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <h3 className="font-semibold">No sessions available</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Check back later for upcoming sessions.
              </p>
            </div>
          ) : (
            sessions.map((session) => {
              const isRegistered = selectedSession === session.sessionId;
              return (
                <div
                  key={session.sessionId}
                  className={`rounded-xl border p-5 transition ${
                    session.isFull || !session.registrationOpen
                      ? "border-border bg-secondary/30 opacity-60"
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
                    {session.isFull && (
                      <span className="text-destructive">
                        <AlertCircle className="h-3.5 w-3.5" /> Full
                      </span>
                    )}
                  </div>
                  <div className="mt-3 space-y-1 text-sm">
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
                    <p className="text-muted-foreground">
                      {session.registeredCount}{" "}
                      {session.capacity !== null ? `/ ${session.capacity}` : ""} registered
                    </p>
                    {session.availableCount !== null && (
                      <p className="text-muted-foreground">
                        {session.availableCount} spots available
                      </p>
                    )}
                  </div>
                  <div className="mt-4">
                    {session.isFull || !session.registrationOpen ? (
                      <Button variant="outline" disabled className="w-full">
                        {session.isFull ? "Full" : "Closed"}
                      </Button>
                    ) : isRegistered ? (
                      <Button variant="destructive" onClick={() => handleCancel(session.sessionId)} className="w-full">
                        Cancel registration
                      </Button>
                    ) : (
                      <Button onClick={() => handleRegister(session.sessionId)} className="w-full">
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