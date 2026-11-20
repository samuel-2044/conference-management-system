import { useState } from "react";
import { CalendarDays, Mail, Phone, Building2, FileText, XCircle, CheckCircle2, Clock3 } from "lucide-react";
import { useListMyConferenceRegistrations, useCancelConferenceRegistration } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "sonner";

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
};

export function MyRegistrationsPage() {
  const query = useListMyConferenceRegistrations();
  const cancelMutation = useCancelConferenceRegistration();
  const [busyId, setBusyId] = useState<string | null>(null);

  const registrations = query.data ?? [];

  const handleCancel = (conferenceId: string) => {
    setBusyId(conferenceId);
    cancelMutation.mutate(
      { conferenceId },
      {
        onSuccess: () => {
          toast.success("Registration withdrawn");
          query.refetch();
        },
        onError: (err: any) => toast.error(err?.message || "Failed to withdraw registration"),
        onSettled: () => setBusyId(null),
      },
    );
  };

  return (
    <div className="space-y-6">
      <Toaster />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My registrations</h1>
        <p className="text-sm text-muted-foreground">
          Review the details you provided for each conference and withdraw if needed.
        </p>
      </div>

      {query.isLoading && (
        <div className="h-64 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {!query.isLoading && registrations.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <CalendarDays className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h3 className="font-semibold">No registrations yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            When you register for a conference, it will appear here.
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {registrations.map((reg: any) => {
          const cancelled = reg.status === "cancelled";
          return (
            <div key={reg.id} className={`rounded-xl border bg-card p-5 ${cancelled ? "border-border opacity-75" : "border-border"}`}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold">{reg.conferenceTitle}</h2>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      cancelled ? "bg-secondary text-muted-foreground" : "bg-emerald-50 text-emerald-700"
                    }`}>
                      {cancelled ? <XCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                      {reg.status}
                    </span>
                    {reg.conferenceStatus && (
                      <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                        {reg.conferenceStatus}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{formatDate(reg.conferenceStartDate)} – {formatDate(reg.conferenceEndDate)}</span>
                    <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />Registered {formatDate(reg.registrationDate)}</span>
                  </div>
                  <div className="grid gap-1 text-sm">
                    <div className="font-semibold">Registration details</div>
                    <div className="grid gap-1 text-muted-foreground sm:grid-cols-2">
                      <span>{reg.fullName || "—"}</span>
                      <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{reg.email || "—"}</span>
                      <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{reg.phone || "—"}</span>
                      <span className="inline-flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{reg.organization || "—"}</span>
                    </div>
                    {reg.specialRequirements ? (
                      <div className="mt-1 text-muted-foreground">
                        <span className="inline-flex items-center gap-1 font-medium text-foreground"><FileText className="h-3.5 w-3.5" />Special requirements</span>
                        <div className="mt-0.5 whitespace-pre-wrap">{reg.specialRequirements}</div>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="shrink-0">
                  {!cancelled ? (
                    <Button
                      variant="destructive"
                      disabled={busyId === reg.conferenceId || cancelMutation.isPending}
                      onClick={() => handleCancel(reg.conferenceId)}
                    >
                      Withdraw
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground">Withdrawn</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
