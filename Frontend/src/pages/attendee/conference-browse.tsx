import { useEffect, useMemo, useState } from "react";
import { CalendarDays, UsersRound, AlertCircle, CheckCircle, ClipboardList, Mic2 } from "lucide-react";
import {
  useListAvailableConferences,
  useRegisterConference,
  useCancelConferenceRegistration,
  useListMyConferenceRegistrations,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  specialRequirements: string;
};

const emptyForm = (user?: { name?: string; email?: string } | null): FormState => ({
  fullName: user?.name ?? "",
  email: user?.email ?? "",
  phone: "",
  organization: "",
  specialRequirements: "",
});

export function ConferenceBrowsePage() {
  const { user } = useAuth();
  const isSpeaker = user?.role === "speaker";
  const query = useListAvailableConferences();
  const myRegsQuery = useListMyConferenceRegistrations({ query: { enabled: !isSpeaker } as any });
  const conferences = query.data ?? [];
  const myRegs = isSpeaker ? [] : (myRegsQuery.data ?? []);
  const [speakerAllocatedConferenceIds, setSpeakerAllocatedConferenceIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isSpeaker) return;
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    let cancelled = false;
    fetch(`${apiUrl}/api/speakers/me/sessions`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        if (cancelled) return;
        const ids = new Set<string>();
        (Array.isArray(rows) ? rows : []).forEach((row: any) => {
          if (row?.conferenceId) ids.add(row.conferenceId);
        });
        setSpeakerAllocatedConferenceIds(ids);
      })
      .catch(() => {
        if (!cancelled) setSpeakerAllocatedConferenceIds(new Set());
      });
    return () => { cancelled = true; };
  }, [isSpeaker]);

  const registeredIds = useMemo(
    () => new Set(myRegs.filter((r: any) => r.status !== "cancelled").map((r: any) => r.conferenceId)),
    [myRegs],
  );

  const [openFormId, setOpenFormId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(user));

  const registerMutation = useRegisterConference();
  const cancelMutation = useCancelConferenceRegistration();

  const visibleConferences = useMemo(() => {
    if (isSpeaker) return conferences;
    return conferences.filter((c) => registeredIds.has(c.conferenceId) || (c.registrationOpen && !c.isFull));
  }, [conferences, registeredIds, isSpeaker]);

  const openForm = (conferenceId: string) => {
    setForm((prev) => ({
      ...emptyForm(user),
      phone: prev.phone, // keep if user typed before
    }));
    setOpenFormId(conferenceId);
  };

  const handleRegister = (conferenceId: string) => {
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Full name, email, and phone number are required");
      return;
    }
    setBusyId(conferenceId);
    registerMutation.mutate(
      {
        conferenceId,
        data: {
          conferenceId,
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          organization: form.organization.trim() || undefined,
          specialRequirements: form.specialRequirements.trim() || undefined,
        } as any,
      },
      {
        onSuccess: () => {
          toast.success("Registered for conference");
          setOpenFormId(null);
          query.refetch();
          myRegsQuery.refetch();
        },
        onError: (err: any) => toast.error(err?.message || "Registration failed"),
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
          toast.success("Registration withdrawn");
          query.refetch();
          myRegsQuery.refetch();
        },
        onError: (err: any) => toast.error(err?.message || "Withdrawal failed"),
        onSettled: () => setBusyId(null),
      },
    );
  };

  return (
    <div className="space-y-6">
      <Toaster />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Browse conferences</h1>
        <p className="text-sm text-muted-foreground" data-testid="browse-description">
          {isSpeaker
            ? "View all conferences and see whether you have been allocated to present. Organisers assign speakers to conference sessions."
            : "Register for open conferences by providing your details. You can withdraw from My registrations."}
        </p>
      </div>

      {(query.isLoading || (!isSpeaker && myRegsQuery.isLoading)) && (
        <div className="h-64 flex items-center justify-center" data-testid="conference-loading">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

{!query.isLoading && (isSpeaker || !myRegsQuery.isLoading) && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="conference-grid">
          {visibleConferences.length === 0 ? (
            <div className="col-span-3 rounded-xl border border-dashed border-border bg-card p-12 text-center" data-testid="conference-empty">
            </div>
          ) : (
            visibleConferences.map((conference) => {
              const isRegistered = registeredIds.has(conference.conferenceId);
              const closed = conference.isFull || !conference.registrationOpen;
              const formOpen = openFormId === conference.conferenceId;
              return (
                <div
                  key={conference.conferenceId}
                  className={`rounded-xl border p-5 transition ${
                    closed && !isRegistered ? "border-border bg-secondary/30 opacity-90" : "border-border bg-card hover:border-primary hover:shadow-md"
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
                    {isSpeaker ? (
                      speakerAllocatedConferenceIds.has(conference.conferenceId) ? (
                        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                          <CheckCircle className="h-3.5 w-3.5" /> Allocated to present
                        </span>
                      ) : (
                        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
                          Not allocated
                        </span>
                      )
                    ) : isRegistered ? (
                      <span className="ml-auto inline-flex items-center gap-1 text-emerald-700">
                        <CheckCircle className="h-3.5 w-3.5" /> Registered
                      </span>
                    ) : null}
                  </div>
                  <h2 className="text-lg font-bold">{conference.title}</h2>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-1">
                      <UsersRound className="h-3.5 w-3.5" />
                      {conference.registeredCount}
                      {conference.capacity != null ? ` / ${conference.capacity}` : ""} registered
                    </p>
                    {conference.capacity != null && <p>{conference.availableCount} spots available</p>}
                  </div>

                  <div className="mt-5 space-y-3">
                    {isSpeaker ? (
                      speakerAllocatedConferenceIds.has(conference.conferenceId) ? (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                          <div className="flex items-center gap-2 font-medium">
                            <Mic2 className="h-4 w-4" /> Allocated to present
                          </div>
                          <p className="mt-1 text-xs">You have been assigned to present in this conference. Check My schedule for your sessions.</p>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2 font-medium text-foreground">
                            <Mic2 className="h-4 w-4 text-[hsl(var(--primary))]" /> Not allocated
                          </div>
                          <p className="mt-1 text-xs">You have not been assigned to present in this conference.</p>
                        </div>
                      )
                    ) : isRegistered ? (
                      <Button variant="destructive" className="w-full" disabled={busyId === conference.conferenceId} onClick={() => handleCancel(conference.conferenceId)}>
                        {busyId === conference.conferenceId ? "Withdrawing…" : "Withdraw registration"}
                      </Button>
                    ) : closed ? (
                      <Button variant="outline" disabled className="w-full">
                        {conference.isFull ? "Full" : "Closed"}
                      </Button>
                    ) : formOpen ? (
                      <div className="space-y-3 rounded-lg border border-border bg-secondary/20 p-3">
                        <div className="text-sm font-semibold">Registration details</div>
                        <div className="grid gap-2">
                          <label className="grid gap-1 text-xs font-medium">
                            Full name *
                            <input className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                          </label>
                          <label className="grid gap-1 text-xs font-medium">
                            Email * <span className="font-normal text-muted-foreground">(from your account)</span>
                            <input type="email" className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                          </label>
                          <label className="grid gap-1 text-xs font-medium">
                            Phone number *
                            <input className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="e.g. +254..." />
                          </label>
                          <label className="grid gap-1 text-xs font-medium">
                            Organization
                            <input className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
                          </label>
                          <label className="grid gap-1 text-xs font-medium">
                            Special requirements
                            <textarea className="min-h-16 rounded-md border border-input bg-background px-2 py-1.5 text-sm" value={form.specialRequirements} onChange={(e) => setForm({ ...form, specialRequirements: e.target.value })} />
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <Button className="flex-1" disabled={busyId === conference.conferenceId} onClick={() => handleRegister(conference.conferenceId)}>
                            {busyId === conference.conferenceId ? "Submitting…" : "Submit registration"}
                          </Button>
                          <Button variant="outline" onClick={() => setOpenFormId(null)} disabled={busyId === conference.conferenceId}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button className="w-full" onClick={() => openForm(conference.conferenceId)}>
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
