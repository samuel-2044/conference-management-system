import { useMemo, useState } from "react";
import { CalendarDays, Clock3, UsersRound, AlertCircle, CheckCircle } from "lucide-react";
import {
  useListAvailableConferences,
  useRegisterConference,
  useCancelConferenceRegistration,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "sonner";

export function ConferenceBrowsePage() {
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const query = useListAvailableConferences();
  const conferences = query.data ?? [];
  const registerMutation = useRegisterConference();
  const cancelMutation = useCancelConferenceRegistration();

  const visibleConferences = useMemo(
    () => conferences.filter((c) => registeredIds.has(c.conferenceId) || (c.registrationOpen && !c.isFull)),
    [conferences, registeredIds],
  );

  const handleRegister = (conferenceId: string) => {
    setBusyId(conferenceId);
    registerMutation.mutate(
      { conferenceId, data: { conferenceId } },
      {
        onSuccess: () => {
          setRegisteredIds((prev) => new Set(prev).add(conferenceId));
          toast.success("Registered for conference");
          query.refetch();
        },
        onError: (err: any) => {
          toast.error(err?.message || "Registration failed");
        },
        onSettled: () => setBusyId(null),
      },
    );
  };

  const handleCancel = (conferenceId: string) => {
    setBusyId(conferenceId);
    cancelMutation.mutate(
      { conferenceId },
      {
        onSuccess: () => {
          setRegisteredIds((prev) => {
            const next = new Set(prev);
            next.delete(conferenceId);
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
        <h1 className="text-2xl font-bold tracking-tight">Browse conferences</h1>
        <p className="text-sm text-muted-foreground">
          View open conferences and register or cancel your registration.
        </p>
      </div>

      {query.isLoading && (
        <div className="h-64 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!query.isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleConferences.length === 0 ? (
            <div className="col-span-3 rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <Clock3 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <h3 className="font-semibold">No conferences open for registration</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Check back later for upcoming conferences.
              </p>
            </div>
          ) : (
            visibleConferences.map((conference) => {
              const isRegistered = registeredIds.has(conference.conferenceId);
              const closed = conference.isFull || !conference.registrationOpen;
              return (
                <div
                  key={conference.conferenceId}
                  className={`rounded-xl border p-5 transition ${
                    closed && !isRegistered
                      ? "border-border bg-secondary/30 opacity-80"
                      : "border-border bg-card hover:border-primary hover:shadow-md"
                  }`}
                >
                  <div className="mb-4 flex items-center gap-2 text-xs font-semibold capitalize">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>{conference.status}</span>
                    {conference.isFull && (
                      <span className="ml-auto inline-flex items-center gap-1 text-destructive">
                        <AlertCircle className="h-3.5 w-3.5" /> Full
                      </span>
                    )}
                    {isRegistered && (
                      <span className="ml-auto inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle className="h-3.5 w-3.5" /> Registered
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold">{conference.title}</h2>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <UsersRound className="h-3.5 w-3.5" />
                      {conference.registeredCount}
                      {conference.capacity != null ? ` / ${conference.capacity}` : ""} registered
                    </p>
                    {conference.capacity != null && (
                      <p>{conference.availableCount} spots available</p>
                    )}
                  </div>
                  <div className="mt-5">
                    {isRegistered ? (
                      <Button
                        variant="destructive"
                        className="w-full"
                        disabled={busyId === conference.conferenceId}
                        onClick={() => handleCancel(conference.conferenceId)}
                      >
                        Cancel registration
                      </Button>
                    ) : closed ? (
                      <Button variant="outline" disabled className="w-full">
                        {conference.isFull ? "Full" : "Closed"}
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        disabled={busyId === conference.conferenceId}
                        onClick={() => handleRegister(conference.conferenceId)}
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