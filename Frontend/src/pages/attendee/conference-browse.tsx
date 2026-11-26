import { useState } from "react";
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
  const [selectedConference, setSelectedConference] = useState<string | null>(null);
  const query = useListAvailableConferences();
  const conferences = query.data ?? [];
  const registerMutation = useRegisterConference();
  const cancelMutation = useCancelConferenceRegistration();

  const handleRegister = (conferenceId: string) => {
    registerMutation.mutate(
      { conferenceId, data: { conferenceId } },
      {
        onSuccess: () => {
          toast.success("Registered for conference");
          query.refetch();
          setSelectedConference(null);
        },
        onError: (err) => {
          toast.error(err.message || "Registration failed");
        },
      },
    );
  };

  const handleCancel = (conferenceId: string) => {
    cancelMutation.mutate(
      { conferenceId },
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
        <h1 className="text-2xl font-bold tracking-tight">Available Conferences</h1>
        <p className="text-sm text-muted-foreground" data-testid="browse-description">
          Browse and register for upcoming conferences.
        </p>
      </div>

      {query.isLoading && (
        <div className="h-64 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

 {!query.isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="conference-grid">
          {conferences.length === 0 ? (
            <div className="col-span-3 rounded-xl border border-dashed border-border bg-card p-12 text-center" data-testid="conference-empty">
              <Clock3 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <h3 className="font-semibold">No conferences available</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Check back later for upcoming conferences.
              </p>
            </div>
          ) : (
            conferences.map((conference) => {
              const isRegistered = selectedConference === conference.conferenceId;
              return (
                <div
                  key={conference.conferenceId}
                  className={`rounded-xl border p-5 transition ${
                    conference.isFull || !conference.registrationOpen
                      ? "border-border bg-secondary/30 opacity-60"
                      : "border-border bg-card hover:border-primary hover:shadow-md"
                  }`}
                >
                  <div className="mb-4 flex items-center gap-2 text-xs font-semibold">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>
                      {conference.status}
                    </span>
                    {conference.isFull && (
                      <span className="ml-auto text-destructive">
                        <AlertCircle className="h-3.5 w-3.5" /> Full
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold">{conference.title}</h2>
                  <div className="mt-3 space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      {conference.registeredCount}{" "}
                      {conference.capacity !== null
                        ? `/ ${conference.capacity}`
                        : ""} registered
                    </p>
                    {conference.availableCount !== null && (
                      <p className="text-muted-foreground">
                        {conference.availableCount} spots available
                      </p>
                    )}
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    {conference.isFull || !conference.registrationOpen ? (
                      <Button variant="outline" disabled>
                        {conference.isFull ? "Full" : "Closed"}
                      </Button>
                    ) : isRegistered ? (
                      <Button variant="destructive" onClick={() => handleCancel(conference.conferenceId)}>
                        Cancel registration
                      </Button>
                    ) : (
                      <Button onClick={() => handleRegister(conference.conferenceId)}>
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