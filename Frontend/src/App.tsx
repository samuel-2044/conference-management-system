import { useState, useEffect, type ReactNode, useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, Route, Switch, Router as WouterRouter, useLocation, useParams } from "wouter";
import {
  Activity, ArrowLeft, ArrowRight, BarChart3, Bell, Building2, CalendarDays, Check,
  ChevronDown, Clock3, CloudUpload, Download, FileText, Filter, LayoutDashboard, Library,
  ListFilter, Mail, MapPin, Menu, MoreHorizontal,
  Pencil, Plus, Search, Send, Settings2, ShieldCheck, Sparkles, Trash2, UserRound,
  UsersRound, X, Zap,
} from "lucide-react";
import {
  getGetConferenceQueryKey,
  getListConferencesQueryKey,
  getListSessionsQueryKey, getListSpeakersQueryKey, getListVenuesQueryKey,
  useCreateConference, useCreateSession, useCreateSpeaker, useCreateVenue,
  useDeleteConference, useDeleteSpeaker, useDeleteVenue, useGetConference,
  useGetDashboardSummary, useGetRegistrationReport, useListAttendees, useListConferences,
  useListDocuments, useListSessions, useListSpeakers, useListVenues, useUpdateConference,
  useAddSessionSpeaker, useRemoveSessionSpeaker,
} from "@workspace/api-client-react";
import type { Attendee, Conference, ConferenceDetail, ConferenceInput, Document as ConferenceDocument, Session, Speaker, SpeakerInput, Venue, VenueInput } from "@workspace/api-client-react";
import { ErrorBoundary } from "@/components/error-boundary";
import NotFound from "@/pages/not-found";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { LoginPage } from "@/pages/auth/login";
import { SignupPage } from "@/pages/auth/signup";
import { AdminDashboard } from "@/pages/admin/dashboard";
import { OrganiserDashboard } from "@/pages/organiser/dashboard";
import { SpeakerDashboard } from "@/pages/speaker/dashboard";
import { AttendeeDashboard } from "@/pages/attendee/dashboard";
import { ConferenceBrowsePage } from "@/pages/attendee/conference-browse";
import { SessionBrowsePage } from "@/pages/attendee/session-browse";
import { MyRegistrationsPage } from "@/pages/attendee/my-registrations";
import "./index.css";

const queryClient = new QueryClient();


const initials = (name = "") =>
  name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() || "CM";

const dateLabel = (date?: string) =>
  date
    ? new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(date))
    : "Date to be confirmed";

const timeLabel = (time?: string) =>
  time
    ? new Date(time.includes("T") ? time : `2024-01-01T${time}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

function Button({
  children,
  variant = "primary",
  className,
  onClick,
  type = "button",
  disabled,
  testId,
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost" | "danger" | "dark";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  testId?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold shadow-sm disabled:pointer-events-none disabled:opacity-45",
        variant === "primary" &&
          "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:-translate-y-0.5 hover:shadow-md",
        variant === "outline" &&
          "border border-border bg-card text-foreground hover:bg-secondary",
        variant === "ghost" &&
          "text-muted-foreground hover:bg-secondary hover:text-foreground",
        variant === "danger" &&
          "border border-[hsl(var(--destructive)/.3)] bg-[hsl(var(--destructive)/.08)] text-[hsl(var(--destructive))] hover:bg-[hsl(var(--destructive)/.14)]",
        variant === "dark" &&
          "bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] hover:-translate-y-0.5",
        className,
      )}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  multiline = false,
  testId,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  multiline?: boolean;
  testId?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>
        {label}
        {required && (
          <span className="ml-1 text-[hsl(var(--destructive))]">*</span>
        )}
      </span>
      {multiline ? (
        <textarea
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          data-testid={testId}
          className="min-h-24 resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      ) : (
        <input
          required={required}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          data-testid={testId}
          className="h-11 rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      )}
    </label>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const label = status?.replace("-", " ") || "Unknown";
  return (
    <span
      data-testid={`status-${status || "unknown"}`}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize tracking-wide",
        status === "live" || status === "checked-in"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : status === "published" || status === "confirmed"
            ? "border-sky-200 bg-sky-50 text-sky-700"
            : status === "planning" || status === "pending"
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-border bg-secondary text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
}

function Avatar({
  name,
  photoUrl,
  size = "md",
}: {
  name: string;
  photoUrl?: string;
  size?: "sm" | "md" | "lg";
}) {
  return photoUrl ? (
    <img
      src={photoUrl}
      alt={name}
      data-testid={`img-avatar-${name}`}
      className={cn(
        "rounded-full object-cover",
        size === "sm"
          ? "h-8 w-8"
          : size === "lg"
            ? "h-14 w-14"
            : "h-10 w-10",
      )}
    />
  ) : (
    <div
      data-testid={`avatar-${name}`}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-[hsl(var(--accent)/.24)] font-bold text-[hsl(var(--primary))]",
        size === "sm"
          ? "h-8 w-8 text-[10px]"
          : size === "lg"
            ? "h-14 w-14 text-base"
            : "h-10 w-10 text-xs",
      )}
    >
      {initials(name)}
    </div>
  );
}

function LoadingRows({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-lg bg-secondary/70"
        />
      ))}
    </div>
  );
}

function QueryState({
  loading,
  error,
  onRetry,
  children,
  empty = false,
  emptyTitle = "Nothing here yet",
  emptyBody = "When records are added, they will appear in this space.",
}: {
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
  children: React.ReactNode;
  empty?: boolean;
  emptyTitle?: string;
  emptyBody?: string;
}) {
  if (loading) return <LoadingRows />;
  if (error) {
    return (
      <div className="rounded-xl border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.05)] p-8 text-center">
        <ShieldCheck className="mx-auto mb-3 h-7 w-7 text-[hsl(var(--destructive))]" />
        <h3 className="font-semibold">We couldn't load this view</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          The workspace is still reachable. Try again in a moment.
        </p>
        <Button variant="outline" className="mt-4" onClick={onRetry} testId="button-retry">
          Retry
        </Button>
      </div>
    );
  }
  if (empty) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
          <Sparkles className="h-5 w-5 text-[hsl(var(--primary))]" />
        </div>
        <h3 className="font-semibold">{emptyTitle}</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          {emptyBody}
        </p>
      </div>
    );
  }
  return <>{children}</>;
}

function PageHeader({
  eyebrow,
  title,
  body,
  action,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div>
        <div className="mono-font mb-2 text-[10px] font-medium uppercase tracking-[.2em] text-[hsl(var(--primary))]">
          {eyebrow}
        </div>
        <h1
          data-testid={`heading-${title.toLowerCase().replaceAll(" ", "-")}`}
          className="display-font text-3xl font-bold tracking-tight text-foreground md:text-4xl"
        >
          {title}
        </h1>
        {body && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {body}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function PageFrame({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--sidebar)/.5)] p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-border bg-card p-6 shadow-2xl md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="display-font text-2xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"
            data-testid="button-close-modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConferenceModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const mutation = useCreateConference();
  const [form, setForm] = useState<{ title: string; description: string; startDate: string; endDate: string }>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const update = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <Modal title="Start a conference" onClose={onClose}>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const today = new Date().toISOString().split("T")[0];
          if (form.startDate < today) {
            alert("Conference start date cannot be in the past.");
            return;
          }
          mutation.mutate({ data: form as unknown as ConferenceInput }, { onSuccess: () => { onCreated(); onClose(); } });
        }}
      >
        <Field
          label="Conference title"
          value={form.title}
          onChange={update("title")}
          placeholder="Annual Research Assembly"
          required
          testId="input-conference-title"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Start date"
            value={form.startDate}
            onChange={update("startDate")}
            type="date"
            required
            testId="input-conference-start"
          />
          <Field
            label="End date"
            value={form.endDate}
            onChange={update("endDate")}
            type="date"
            required
            testId="input-conference-end"
          />
        </div>
        <Field
          label="Description"
          value={form.description}
          onChange={update("description")}
          placeholder="A short description for your team."
          multiline
          testId="input-conference-description"
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} testId="button-cancel-conference">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending}
            testId="button-create-conference"
          >
            {mutation.isPending ? "Creating…" : "Create conference"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Conferences() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const query = useListConferences({ search: search || undefined });
  const conferences = query.data ?? [];
  const { user } = useAuth();
  const canCreate = user?.role === "admin" || user?.role === "organiser";

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Portfolio"
        title="Conferences"
        body="A clear view of everything your team is bringing into the room."
        action={
          canCreate ? (
            <Button onClick={() => setShowCreate(true)} testId="button-open-create-conference">
              <Plus className="h-4 w-4" /> New conference
            </Button>
          ) : null
        }
      />
      <div className="mb-5 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conferences"
            data-testid="input-search-conferences"
            className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <Button variant="outline" className="h-10" testId="button-filter-conferences">
          <Filter className="h-4 w-4" /> Filters
        </Button>
      </div>
      <QueryState
        loading={query.isLoading}
        error={query.isError}
        onRetry={() => query.refetch()}
        empty={!query.isLoading && conferences.length === 0}
        emptyTitle="No conferences match that search"
        emptyBody="Try a different phrase or start a new conference for the workspace."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {conferences.map((conference) => (
            <ConferenceCard key={conference.id} conference={conference} />
          ))}
        </div>
      </QueryState>
      {showCreate && (
        <ConferenceModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            queryClient.invalidateQueries({
              queryKey: getListConferencesQueryKey(),
            });
          }}
        />
      )}
    </PageFrame>
  );
}

function ConferenceCard({ conference }: { conference: Conference }) {
  return (
    <Link
      href={`/conferences/${conference.id}`}
      data-testid={`card-conference-${conference.id}`}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/.35)] hover:shadow-md"
    >
      <div className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: "#0f6876" }} />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="mt-4 text-xl font-bold tracking-tight group-hover:text-[hsl(var(--primary))]">
            {conference.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {conference.description}
          </p>
        </div>
        <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div>
      <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
        <CalendarDays className="h-3.5 w-3.5 text-[hsl(var(--primary))]" />
        {dateLabel(conference.startDate as unknown as string)} –{" "}
        {dateLabel(conference.endDate as unknown as string)}
      </div>
    </Link>
  );
}

function ConferenceDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const [editing, setEditing] = useState(false);
  const [assignSessionId, setAssignSessionId] = useState<string>("");
  const [assignSpeakerId, setAssignSpeakerId] = useState<string>("");
  const [assignRole, setAssignRole] = useState<"keynote" | "speaker" | "panelist" | "moderator">("speaker");
  const [sessionSpeakers, setSessionSpeakers] = useState<Record<string, any[]>>({});
  const updateMutation = useUpdateConference();
  const deleteMutation = useDeleteConference();
  const addSessionSpeaker = useAddSessionSpeaker();
  const removeSessionSpeaker = useRemoveSessionSpeaker();
  const query = useGetConference(id, {
    query: { enabled: !!id, queryKey: getGetConferenceQueryKey(id) },
  });
  const sessionsQuery = useListSessions({ conferenceId: id }, { query: { enabled: !!id } });
  const speakersQuery = useListSpeakers();
  const venuesQuery = useListVenues({ conferenceId: id }, { query: { enabled: !!id } });
  const conference = query.data as ConferenceDetail | undefined;
  const sessions = (sessionsQuery.data ?? []) as Session[];
  const speakers = (speakersQuery.data ?? []) as Speaker[];
  const venues = (venuesQuery.data ?? []) as Venue[];

  const venueMap = useMemo(() => new Map(venues.map((v) => [v.id, v.name])), [venues]);
  const assignedSpeakerIds = useMemo(() => {
    const ids = new Set<string>();
    Object.values(sessionSpeakers).forEach((arr) => arr.forEach((a: any) => ids.add(a.speakerId)));
    return ids;
  }, [sessionSpeakers]);

  const loadSessionSpeakers = async (sessionId: string) => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const res = await fetch(`${apiUrl}/api/sessions/${sessionId}/speakers`, { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    setSessionSpeakers((prev) => ({ ...prev, [sessionId]: Array.isArray(data) ? data : [] }));
  };

  useEffect(() => {
    sessions.forEach((s) => { void loadSessionSpeakers(s.id); });
  }, [sessions.map((s) => s.id).join(",")]);

  if (query.isLoading) return <PageFrame><LoadingRows count={5} /></PageFrame>;
  if (query.isError || !conference)
    return (
      <PageFrame>
        <QueryState error onRetry={() => query.refetch()}>
          <div />
        </QueryState>
      </PageFrame>
    );

  const handleAssign = () => {
    if (!assignSessionId || !assignSpeakerId) {
      toast.error("Select a session and speaker");
      return;
    }
    addSessionSpeaker.mutate(
      { data: { sessionId: assignSessionId, speakerId: assignSpeakerId, speakerRole: assignRole } },
      {
        onSuccess: () => {
          toast.success("Speaker assigned to session");
          void loadSessionSpeakers(assignSessionId);
          setAssignSpeakerId("");
        },
        onError: (err: any) => toast.error(err?.message || "Failed to assign speaker"),
      },
    );
  };

  return (
    <PageFrame>
      <Link
        href="/conferences"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
        data-testid="link-back-conferences"
      >
        <ArrowLeft className="h-4 w-4" /> All conferences
      </Link>
      <div className="relative overflow-hidden rounded-2xl bg-[hsl(var(--sidebar))] p-7 text-[hsl(var(--sidebar-foreground))] md:p-10">
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-20" style={{ background: `radial-gradient(circle at 75% 40%, #d39b35, transparent 60%)` }} />
        <div className="relative">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
            <div>
              <h1 data-testid="heading-conference-detail" className="display-font mt-4 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">
                {conference.title}
              </h1>
              <p className="mt-4 max-w-2xl text-[hsl(var(--sidebar-foreground)/.65)] leading-7">
                {conference.description}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-white/20 bg-white text-gray-900 hover:bg-white/90"
                onClick={() => setEditing(true)}
                testId="button-edit-conference"
              >
                <Pencil className="h-4 w-4" /> Edit
              </Button>
              <Button
                variant="ghost"
                className="text-[hsl(var(--sidebar-foreground)/.65)]"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (!window.confirm("Delete this conference?")) return;
                  deleteMutation.mutate(
                    { conferenceId: id },
                    {
                      onSuccess: () => {
                        toast.success("Conference deleted");
                        setLocation("/conferences");
                      },
                      onError: (err: any) => toast.error(err?.message || "Failed to delete conference"),
                    },
                  );
                }}
                testId="button-delete-conference"
              >
                {deleteMutation.isPending ? "…" : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="mt-9 flex flex-wrap gap-6 text-sm text-[hsl(var(--sidebar-foreground)/.7)]">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[hsl(var(--accent))]" />
              {dateLabel(conference.startDate as unknown as string)} –{" "}
              {dateLabel(conference.endDate as unknown as string)}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <DetailStat label="Attendees" value={conference.attendeesCount || 0} icon={UsersRound} />
        <DetailStat label="Sessions" value={sessions.length} icon={CalendarDays} />
        <DetailStat label="Speakers assigned" value={assignedSpeakerIds.size} icon={UserRound} />
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold">Sessions</h2>
          <p className="mt-1 text-sm text-muted-foreground">Conference sessions and assigned speakers.</p>
          <div className="mt-4 grid gap-3">
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions yet. Add sessions from Schedule.</p>
            ) : sessions.map((session) => {
              const assigned = sessionSpeakers[session.id] ?? [];
              return (
                <div key={session.id} className="rounded-lg border border-border p-4">
                  <div className="font-semibold">{session.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {timeLabel(session.startTime)} – {timeLabel(session.endTime)} · {session.venueId ? (venueMap.get(session.venueId) ?? "TBD") : "TBD"}
                  </div>
                  <div className="mt-3 space-y-2">
                    {assigned.length === 0 ? (
                      <div className="text-xs text-muted-foreground">No speaker assigned.</div>
                    ) : assigned.map((a: any) => (
                      <div key={a.id} className="flex items-center justify-between gap-2 rounded-md bg-secondary/40 px-2 py-1.5 text-xs">
                        <span><span className="font-medium">{a.speakerName}</span> <span className="text-muted-foreground">({a.speakerRole})</span></span>
                        <button
                          className="text-destructive hover:underline"
                          disabled={removeSessionSpeaker.isPending}
                          onClick={() => removeSessionSpeaker.mutate({ sessionSpeakerId: a.id }, {
                            onSuccess: () => { toast.success("Speaker removed from session"); void loadSessionSpeakers(session.id); },
                            onError: (err: any) => toast.error(err?.message || "Failed to remove speaker"),
                          })}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold">Assign speaker to session</h2>
          <p className="mt-1 text-sm text-muted-foreground">Organisers/admins can assign speakers to conference sessions.</p>
          <div className="mt-4 grid gap-3">
            <label className="grid gap-1.5 text-sm font-medium">
              Session
              <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={assignSessionId} onChange={(e) => setAssignSessionId(e.target.value)}>
                <option value="">Select session</option>
                {sessions.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Speaker
              <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={assignSpeakerId} onChange={(e) => setAssignSpeakerId(e.target.value)}>
                <option value="">Select speaker</option>
                {speakers.map((sp) => <option key={sp.id} value={sp.id}>{sp.name} ({sp.email})</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium">
              Role
              <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={assignRole} onChange={(e) => setAssignRole(e.target.value as any)}>
                <option value="speaker">Speaker</option>
                <option value="keynote">Keynote</option>
                <option value="panelist">Panelist</option>
                <option value="moderator">Moderator</option>
              </select>
            </label>
            <Button onClick={handleAssign} disabled={addSessionSpeaker.isPending || !assignSessionId || !assignSpeakerId}>
              {addSessionSpeaker.isPending ? "Assigning…" : "Assign speaker"}
            </Button>
          </div>
        </div>
      </div>
      {editing && (
        <EditConferenceModal
          conference={conference}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            queryClient.invalidateQueries({ queryKey: getGetConferenceQueryKey(id) });
            queryClient.invalidateQueries({ queryKey: getListConferencesQueryKey() });
          }}
          updateMutation={updateMutation}
        />
      )}
    </PageFrame>
  );
}

function DetailStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof UsersRound;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <Icon className="h-5 w-5 text-[hsl(var(--primary))]" />
      <div className="mt-6 display-font text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function SimpleDetailList({
  sessions,
  empty,
  venueMap,
}: {
  sessions?: Session[];
  empty: string;
  venueMap?: Map<string, string>;
}) {
  return sessions?.length ? (
    <div className="grid gap-3">
      {sessions.map((session) => (
        <div
          key={session.id}
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center"
        >
          <div className="mono-font w-20 text-xs text-[hsl(var(--primary))]">
            {timeLabel(session.startTime)}
          </div>
          <div className="flex-1">
            <div className="font-semibold">{session.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {session.venueId ? (venueMap?.get(session.venueId) ?? "TBD") : "TBD"}
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <QueryState empty emptyTitle="No sessions yet" emptyBody={empty}>
      <div />
    </QueryState>
  );
}

function EditConferenceModal({
  conference,
  onClose,
  onSaved,
  updateMutation,
}: {
  conference: Conference;
  onClose: () => void;
  onSaved: () => void;
  updateMutation: ReturnType<typeof useUpdateConference>;
}) {
  const [title, setTitle] = useState(conference.title);
  const [description, setDescription] = useState(conference.description || "");
  const [startDate, setStartDate] = useState(String(conference.startDate).slice(0, 10));
  const [endDate, setEndDate] = useState(String(conference.endDate).slice(0, 10));
  const [capacity, setCapacity] = useState(conference.capacity != null ? String(conference.capacity) : "");
  const [status, setStatus] = useState(conference.status || "draft");

  return (
    <Modal title="Edit conference" onClose={onClose}>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          updateMutation.mutate(
            {
              conferenceId: conference.id,
              data: {
                title,
                description,
                startDate,
                endDate,
                status: status as any,
                ...(capacity ? { capacity: Number(capacity) } : {}),
              },
            },
            {
              onSuccess: () => { toast.success("Conference updated"); onSaved(); },
              onError: (err: any) => toast.error(err?.message || "Failed to update conference"),
            },
          );
        }}
      >
        <Field label="Conference title" value={title} onChange={setTitle} required testId="input-edit-conference-title" />
        <Field label="Description" value={description} onChange={setDescription} multiline testId="input-edit-conference-description" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date" type="date" value={startDate} onChange={setStartDate} required testId="input-edit-conference-start" />
          <Field label="End date" type="date" value={endDate} onChange={setEndDate} required testId="input-edit-conference-end" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium">
            Status
            <select className="h-10 rounded-lg border border-input bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)} data-testid="select-edit-conference-status">
              <option value="draft">Draft</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <Field label="Capacity" type="number" value={capacity} onChange={setCapacity} placeholder="e.g. 300" testId="input-edit-conference-capacity" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} testId="button-cancel-edit-conference">Cancel</Button>
          <Button type="submit" disabled={updateMutation.isPending} testId="button-save-conference">Save changes</Button>
        </div>
      </form>
    </Modal>
  );
}

function Speakers() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const query = useListSpeakers({ search: search || undefined });
  const speakers = query.data ?? [];
  const deleteMutation = useDeleteSpeaker();

  return (
    <PageFrame>
      <PageHeader
        eyebrow="People"
        title="Speakers"
        body="Keep every voice, affiliation, and session contribution within reach."
        action={
          <Button onClick={() => setShowCreate(true)} testId="button-open-create-speaker">
            <Plus className="h-4 w-4" /> Add speaker
          </Button>
        }
      />
      <div className="mb-5 relative max-w-lg">
        <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or organisation"
          data-testid="input-search-speakers"
          className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-primary"
        />
      </div>
      <QueryState
        loading={query.isLoading}
        error={query.isError}
        onRetry={() => query.refetch()}
        empty={!query.isLoading && speakers.length === 0}
        emptyTitle="No speakers found"
        emptyBody="Add your first speaker to begin shaping the programme."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {speakers.map((speaker) => (
            <div
              key={speaker.id}
              className="group rounded-xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-md"
              data-testid={`card-speaker-${speaker.id}`}
            >
              <div className="flex items-start justify-between">
                <Avatar
                  name={speaker.name}
                  photoUrl={speaker.photoUrl ?? undefined}
                  size="lg"
                />
                <button
                  disabled={deleteMutation.isPending}
                  onClick={() => {
                    if (!window.confirm(`Remove ${speaker.name || "speaker"}?`)) return;
                    deleteMutation.mutate(
                      { speakerId: speaker.id },
                      {
                        onSuccess: () => {
                          toast.success("Speaker removed");
                          queryClient.invalidateQueries({ queryKey: getListSpeakersQueryKey() });
                        },
                        onError: (err: any) => toast.error(err?.message || "Failed to remove speaker"),
                      },
                    );
                  }}
                  className="rounded-md p-2 text-muted-foreground opacity-0 hover:bg-secondary group-hover:opacity-100 disabled:opacity-50"
                  data-testid={`button-delete-speaker-${speaker.id}`}
                >
                  {deleteMutation.isPending ? "…" : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
              <h2 className="mt-5 font-bold">{speaker.name}</h2>
              <p className="mt-1 text-sm text-[hsl(var(--primary))]">
                {speaker.email}
              </p>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                {speaker.bio}
              </p>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[hsl(var(--primary))]">
                <span data-testid={`speaker-session-count-${speaker.id}`}>
                  {speaker.sessionCount} session{speaker.sessionCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </QueryState>
      {showCreate && (
        <SpeakerModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            queryClient.invalidateQueries({
              queryKey: getListSpeakersQueryKey(),
            });
          }}
        />
      )}
    </PageFrame>
  );
}

function SpeakerModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const mutation = useCreateSpeaker();
  const [form, setForm] = useState<{ userId: string; bio: string }>({ userId: "", bio: "" });
  const update = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <Modal title="Add a speaker" onClose={onClose}>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate(
            { data: form as unknown as SpeakerInput },
            {
              onSuccess: () => { toast.success("Speaker added"); onCreated(); onClose(); },
              onError: (err: any) => toast.error(err?.message || "Failed to add speaker"),
            },
          );
        }}
      >
        <Field
          label="User ID"
          value={form.userId}
          onChange={update("userId")}
          placeholder="User ID for the speaker"
          required
          testId="input-speaker-userId"
        />
        <Field
          label="Bio"
          value={form.bio}
          onChange={update("bio")}
          multiline
          testId="input-speaker-bio"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} testId="button-cancel-speaker">
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending} testId="button-create-speaker">
            Add speaker
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Attendees() {
  const [search, setSearch] = useState("");
  const query = useListAttendees({ search: search || undefined });
  const attendees = query.data ?? [];

  const exportCsv = () => {
    const csv = [
      "Name,Email,Phone,Organization,Conference,Status,Registered,Special requirements",
      ...attendees.map((a: any) =>
        [
          a.name || "",
          a.email || "",
          a.phone || "",
          a.organization || "",
          a.conferenceTitle || "",
          a.status || "",
          a.registrationDate || "",
          a.specialRequirements || "",
        ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "convene-attendees.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageFrame>
      <PageHeader
        eyebrow="People"
        title="Attendees"
        body="View attendee registrations with conference and submitted registration details."
        action={
          <Button variant="outline" onClick={exportCsv} testId="button-export-attendees">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        }
      />
      <div className="mb-5 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or phone"
            data-testid="input-search-attendees"
            className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>
      <QueryState
        loading={query.isLoading}
        error={query.isError}
        onRetry={() => query.refetch()}
        empty={!query.isLoading && attendees.length === 0}
        emptyTitle="No attendees found"
        emptyBody="Registrations will appear here with the details attendees provided."
      >
        <div className="grid gap-3">
          {attendees.map((attendee: any) => (
            <div
              key={attendee.id}
              className="rounded-xl border border-border bg-card p-4 md:p-5"
              data-testid={`row-attendee-${attendee.id}`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                  <Avatar name={attendee.name} />
                  <div>
                    <div className="font-semibold">{attendee.name}</div>
                    <div className="text-sm text-muted-foreground">{attendee.email}</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Conference: <span className="font-medium text-foreground">{attendee.conferenceTitle}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <StatusBadge status={attendee.status} />
                  <span className="text-muted-foreground">Registered {dateLabel(attendee.registrationDate as unknown as string)}</span>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
                <div><span className="font-medium text-foreground">Phone:</span> {attendee.phone || "—"}</div>
                <div><span className="font-medium text-foreground">Organization:</span> {attendee.organization || "—"}</div>
              </div>
              {attendee.specialRequirements ? (
                <div className="mt-2 rounded-lg bg-secondary/40 p-3 text-sm">
                  <span className="font-medium">Special requirements:</span>
                  <div className="mt-0.5 whitespace-pre-wrap text-muted-foreground">{attendee.specialRequirements}</div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </QueryState>
    </PageFrame>
  );
}

function Venues() {
  const query = useListVenues();
  const venues = query.data ?? [];
  const [showCreate, setShowCreate] = useState(false);
  const deleteMutation = useDeleteVenue();

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Places"
        title="Venues"
        body="Know what's booked, what's available, and where the next handoff happens."
        action={
          <Button onClick={() => setShowCreate(true)} testId="button-open-create-venue">
            <Plus className="h-4 w-4" /> Add venue
          </Button>
        }
      />
      <QueryState
        loading={query.isLoading}
        error={query.isError}
        onRetry={() => query.refetch()}
        empty={!query.isLoading && venues.length === 0}
        emptyTitle="No venues in the workspace"
        emptyBody="Create a venue to start mapping your conference footprint."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="rounded-xl border border-border bg-card p-5"
              data-testid={`card-venue-${venue.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]">
                  <Building2 className="h-5 w-5" />
                </div>
                <button
                  className="rounded-md p-2 text-muted-foreground hover:bg-secondary"
                  onClick={() => {
                    if (window.confirm(`Remove ${venue.name}?`))
                      deleteMutation.mutate(
                        { venueId: venue.id },
                        { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListVenuesQueryKey() }) },
                      );
                  }}
                  data-testid={`button-delete-venue-${venue.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h2 className="mt-5 font-bold">{venue.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {venue.building} · Room {venue.room}
              </p>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <div className="mono-font text-2xl font-medium">{venue.capacity}</div>
                  <div className="text-xs text-muted-foreground">capacity</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </QueryState>
      {showCreate && (
        <VenueModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            queryClient.invalidateQueries({
              queryKey: getListVenuesQueryKey(),
            });
          }}
        />
      )}
    </PageFrame>
  );
}

function VenueModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const mutation = useCreateVenue();
  const [form, setForm] = useState<{ name: string; building: string; room: string; capacity: string; conferenceId: string }>({
    name: "",
    building: "",
    room: "",
    capacity: "",
    conferenceId: "",
  });
  const update = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <Modal title="Add a venue" onClose={onClose}>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate({ data: { ...form, capacity: Number(form.capacity) } as unknown as VenueInput }, { onSuccess: () => { onCreated(); onClose(); } });
        }}
      >
        <Field
          label="Venue name"
          value={form.name}
          onChange={update("name")}
          placeholder="Marshall Hall"
          required
          testId="input-venue-name"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Building"
            value={form.building}
            onChange={update("building")}
            required
            testId="input-venue-building"
          />
          <Field
            label="Room"
            value={form.room}
            onChange={update("room")}
            required
            testId="input-venue-room"
          />
        </div>
        <Field
          label="Capacity"
          value={form.capacity}
          onChange={update("capacity")}
          type="number"
          required
          testId="input-venue-capacity"
        />
        <Field
          label="Conference ID"
          value={form.conferenceId}
          onChange={update("conferenceId")}
          required
          testId="input-venue-conference-id"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} testId="button-cancel-venue">
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending} testId="button-create-venue">
            Add venue
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Schedule() {
  const [conferenceId, setConferenceId] = useState<string | undefined>();
  const [showCreate, setShowCreate] = useState(false);
  const sessionQuery = useListSessions({ conferenceId });
  const conferenceQuery = useListConferences();
  const venueQuery = useListVenues();
  const sessions = sessionQuery.data ?? [];
  const venues = venueQuery.data ?? [];
  const venueMap = new Map(venues.map((v) => [v.id, v.name]));

  const grouped = sessions.reduce<Record<string, Session[]>>((acc, session) => {
    const date = session.startTime.split("T")[0];
    (acc[date] ||= []).push(session);
    return acc;
  }, {});

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Programme"
        title="Schedule"
        body="The day at a glance, with enough detail to keep it moving."
        action={
          <Button onClick={() => setShowCreate(true)} testId="button-open-create-session">
            <Plus className="h-4 w-4" /> Add session
          </Button>
        }
      />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <ListFilter className="h-4 w-4 text-[hsl(var(--primary))]" /> Viewing
        </div>
        <select
          value={conferenceId || ""}
          onChange={(event) => setConferenceId(event.target.value || undefined)}
          data-testid="select-schedule-conference"
          className="h-10 max-w-xs rounded-lg border border-input bg-card px-3 text-sm outline-none"
        >
          <option value="">All conferences</option>
          {(conferenceQuery.data ?? []).map((conference) => (
            <option key={conference.id} value={conference.id}>
              {conference.title}
            </option>
          ))}
        </select>
      </div>
      <QueryState
        loading={sessionQuery.isLoading}
        error={sessionQuery.isError}
        onRetry={() => sessionQuery.refetch()}
        empty={!sessionQuery.isLoading && sessions.length === 0}
        emptyTitle="Your programme is clear"
        emptyBody="Add a session to start building the run of show."
      >
        <div className="grid gap-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, daySessions]) => (
              <div key={date}>
                <div className="mb-3 flex items-center gap-3">
                  <div className="mono-font text-xs uppercase tracking-widest text-[hsl(var(--primary))]">
                    {dateLabel(date)}
                  </div>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid gap-3">
                  {daySessions
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((session) => (
                      <div
                        key={session.id}
                        className="grid gap-3 rounded-xl border border-border bg-card p-5 sm:grid-cols-[90px_1fr_auto] sm:items-center"
                        data-testid={`row-session-${session.id}`}
                      >
                        <div className="mono-font text-xs text-[hsl(var(--primary))]">
                          {timeLabel(session.startTime)}<br />
                          <span className="text-muted-foreground">
                            {timeLabel(session.endTime)}
                          </span>
                        </div>
                        <div>
                          <h2 className="font-semibold">{session.title}</h2>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {session.venueId ? venueMap.get(session.venueId) ?? "TBD" : "TBD"}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      </QueryState>
      {showCreate && (
        <SessionModal
          conferences={conferenceQuery.data ?? []}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            queryClient.invalidateQueries({
              queryKey: getListSessionsQueryKey(),
            });
          }}
        />
      )}
    </PageFrame>
  );
}

function SessionModal({
  conferences,
  onClose,
  onCreated,
}: {
  conferences: Conference[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const mutation = useCreateSession();
  const [form, setForm] = useState<{ title: string; description: string; venueId: string; conferenceId: string; date: string; startTime: string; endTime: string }>({
    title: "",
    description: "",
    venueId: "",
    conferenceId: conferences[0]?.id || "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const update = (key: keyof typeof form) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <Modal title="Add a session" onClose={onClose}>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate({ data: { ...form, startTime: `${form.date}T${form.startTime}:00Z`, endTime: `${form.date}T${form.endTime}:00Z` } as any }, { onSuccess: () => { onCreated(); onClose(); } });
        }}
      >
        <Field
          label="Session title"
          value={form.title}
          onChange={update("title")}
          placeholder="The shape of useful research"
          required
          testId="input-session-title"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Date"
            value={form.date}
            onChange={update("date")}
            type="date"
            required
            testId="input-session-date"
          />
          <Field
            label="Venue ID"
            value={form.venueId}
            onChange={update("venueId")}
            placeholder="Optional venue id"
            testId="input-session-venue"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Start time"
            value={form.startTime}
            onChange={update("startTime")}
            type="time"
            required
            testId="input-session-start"
          />
          <Field
            label="End time"
            value={form.endTime}
            onChange={update("endTime")}
            type="time"
            required
            testId="input-session-end"
          />
        </div>
        <Field
          label="Conference ID"
          value={form.conferenceId}
          onChange={update("conferenceId")}
          required
          testId="input-session-conference"
        />
        <Field
          label="Description"
          value={form.description}
          onChange={update("description")}
          multiline
          testId="input-session-description"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} testId="button-cancel-session">
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending} testId="button-create-session">
            Add session
          </Button>
        </div>
      </form>
    </Modal>
  );
}

const DOC_TYPES = [
  { value: "all", label: "All" },
  { value: "id-card", label: "Student/National ID" },
  { value: "image", label: "Profile picture" },
  { value: "paper", label: "Speaker CV", roles: ["speaker", "admin", "organiser"] },
  { value: "certificate", label: "Rules / Important" },
] as const;

function visibleDocTypes(role: string | undefined) {
  return DOC_TYPES.filter((d) => !("roles" in d) || (d.roles as readonly string[]).includes(role || ""));
}

function docTypeLabel(type: string, role?: string) {
  const found = visibleDocTypes(role).find((d) => d.value === type) ?? DOC_TYPES.find((d) => d.value === type);
  return found?.label ?? type;
}

function canUploadDocType(role: string | undefined, type: string) {
  if (role === "admin" || role === "organiser") return true;
  if (role === "attendee") return type === "id-card" || type === "image";
  if (role === "speaker") return type === "id-card" || type === "image" || type === "paper";
  return false;
}

function canViewDocument(role: string | undefined, type: string) {
  if (type === "paper") return role === "speaker" || role === "admin" || role === "organiser";
  return true;
}

function Documents() {
  const { user } = useAuth();
  const [type, setType] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const query = useListDocuments({
    type: type as "all" | "paper" | "id-card" | "certificate" | "image",
  });
  const docs = (query.data ?? []).filter((d: any) => canViewDocument(user?.role, d.type));
  const availableDocTypes = visibleDocTypes(user?.role);
  const allowedUploadTypes = availableDocTypes.filter((d) => d.value !== "all" && canUploadDocType(user?.role, d.value));

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Documents"
        title="Documents"
        body="Upload required documents and view rules/important documents shared by organisers."
        action={
          allowedUploadTypes.length > 0 ? (
            <Button onClick={() => setShowUpload(true)} testId="button-open-upload">
              <CloudUpload className="h-4 w-4" /> Upload document
            </Button>
          ) : null
        }
      />
      <div className="mb-5 flex gap-2 overflow-x-auto">
        {availableDocTypes.map((item) => (
          <button
            key={item.value}
            onClick={() => setType(item.value)}
            data-testid={`filter-document-${item.value}`}
            className={cn(
              "rounded-full border px-4 py-2 text-xs font-bold whitespace-nowrap",
              type === item.value
                ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      <QueryState
        loading={query.isLoading}
        error={query.isError}
        onRetry={() => query.refetch()}
        empty={!query.isLoading && docs.length === 0}
        emptyTitle="No documents found"
        emptyBody="Required uploads and organiser-shared documents will appear here."
      >
        <div className="grid gap-3">
          {docs.map((doc) => (
            <DocumentRow key={doc.id} document={doc} role={user?.role} />
          ))}
        </div>
      </QueryState>
      {showUpload && (
        <UploadModal allowedTypes={allowedUploadTypes} onClose={() => setShowUpload(false)} />
      )}
    </PageFrame>
  );
}

function DocumentRow({ document, role }: { document: ConferenceDocument; role?: string }) {
  return (
    <div
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
      data-testid={`row-document-${document.id}`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]">
        <FileText className="h-5 w-5" />
      </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold">{document.fileName}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {docTypeLabel(document.type, role)} · {document.fileSize} · uploaded{" "}
            {dateLabel(document.createdAt as unknown as string)}
          </div>
        </div>
        <Button
          variant="ghost"
          className="h-9 w-9 px-0"
          onClick={() => document.fileUrl && window.open(document.fileUrl, "_blank")}
          testId={`button-download-document-${document.id}`}
        >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}

function UploadModal({ onClose, allowedTypes }: { onClose: () => void; allowedTypes: Array<{ value: string; label: string }> }) {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState(allowedTypes[0]?.value ?? "id-card");
  const [uploaded, setUploaded] = useState(false);

  return (
    <Modal title="Upload document" onClose={onClose}>
      {uploaded ? (
        <div className="py-8 text-center">
          <Check className="mx-auto h-8 w-8 text-emerald-700" />
          <h3 className="mt-4 font-bold">Document ready</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {file?.name} ({docTypeLabel(docType)}) has been added.
          </p>
          <Button className="mt-5" onClick={onClose} testId="button-close-upload-success">
            Done
          </Button>
        </div>
      ) : (
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-medium">
            Document type
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
              data-testid="select-upload-document-type"
            >
              {allowedTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
          <label
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/40 px-5 py-12 text-center hover:border-[hsl(var(--primary)/.5)]"
          >
            <CloudUpload className="h-7 w-7 text-[hsl(var(--primary))]" />
            <span className="mt-3 text-sm font-bold">
              {file ? file.name : "Choose a file"}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              PDF, image, or document up to 25 MB
            </span>
            <input
              type="file"
              className="hidden"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              data-testid="input-upload-document"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} testId="button-cancel-upload">
              Cancel
            </Button>
            <Button
              disabled={!file}
              onClick={() => setUploaded(true)}
              testId="button-confirm-upload"
            >
              Upload
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Reports() {
  const query = useGetRegistrationReport();
  const report = query.data;

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Signals"
        title="Registration reports"
        body="Read the shape of your audience before the room fills up."
        action={
          <Button variant="outline" onClick={() => window.print()} testId="button-print-report">
            <Download className="h-4 w-4" /> Export report
          </Button>
        }
      />
      <QueryState loading={query.isLoading} error={query.isError} onRetry={() => query.refetch()}>
        {report && (
          <>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                ["Total registrations", report.total],
                ["Confirmed", report.confirmed],
                ["Pending", report.pending],
              ].map(([label, value], index) => (
                <div
                  key={String(label)}
                  className={cn(
                    "rounded-xl border border-border bg-card p-5",
                    index === 1 && "border-[hsl(var(--primary)/.3)] bg-[hsl(var(--primary)/.04)]",
                  )}
                  data-testid={`report-${String(label).toLowerCase().replaceAll(" ", "-")}`}
                >
                  <div className="text-sm text-muted-foreground">{label}</div>
                  <div className="mt-5 display-font text-3xl font-bold">{value}</div>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="mono-font text-[10px] uppercase tracking-[.18em] text-muted-foreground">
                  By conference
                </div>
                <h2 className="mt-2 text-lg font-bold">
                  Where people are gathering
                </h2>
                <div className="mt-7 grid gap-5">
                  {report.byConference.map((item) => {
                    const percentage = report.total ? (item.registrations / report.total) * 100 : 0;
                    return (
                      <div key={item.conference}>
                        <div className="mb-2 flex justify-between gap-3 text-sm">
                          <span className="font-semibold">{item.conference}</span>
                          <span className="mono-font text-xs text-muted-foreground">
                            {item.registrations}
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="bar-fill h-full rounded-full bg-[hsl(var(--primary))]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </QueryState>
    </PageFrame>
  );
}

function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaveError("");
    setIsSaving(true);
    try {
      await updateProfile({ name, email });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/auth/me`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error((body as { message?: string })?.message || "Failed to delete account");
      }
      await logout();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete account");
      setIsDeleting(false);
    }
  };

  const canDelete = deleteConfirm === "DELETE" && !isDeleting;

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Your account"
        title="Profile"
        body="The details your workspace uses to keep the work personal."
      />
      <div className="grid gap-5 lg:grid-cols-[.75fr_1.25fr]">
        <div className="rounded-xl border border-border bg-[hsl(var(--sidebar))] p-7 text-[hsl(var(--sidebar-foreground))]">
          <Avatar name={name} size="lg" />
          <h2 className="mt-5 text-xl font-bold">{name}</h2>
          <p className="mt-1 text-sm text-[hsl(var(--sidebar-foreground)/.55)]">{email}</p>
          <div className="mt-8 flex items-center gap-2 text-xs text-[hsl(var(--sidebar-foreground)/.6)]">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {((user?.role ?? "user").charAt(0).toUpperCase() + (user?.role ?? "user").slice(1))} access
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <div className="rounded-xl border border-border bg-card p-6 md:p-8">
            <div className="mb-7">
              <h2 className="text-lg font-bold">Personal details</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This is how your team will see you in Convene.
              </p>
            </div>
            <form className="grid gap-5" onSubmit={handleSave}>
              {saveError && (
                <div className="rounded-lg border border-[hsl(var(--destructive)/.3)] bg-[hsl(var(--destructive)/.08)] p-3 text-sm text-[hsl(var(--destructive))]">
                  {saveError}
                </div>
              )}
              <Field
                label="Full name"
                value={name}
                onChange={setName}
                required
                testId="input-profile-name"
              />
              <Field
                label="Work email"
                value={email}
                onChange={setEmail}
                type="email"
                required
                testId="input-profile-email"
              />
              <div className="flex items-center justify-end gap-3">
                {saved && (
                  <span className="text-xs font-semibold text-emerald-700">
                    Changes saved
                  </span>
                )}
                <Button type="submit" testId="button-save-profile" disabled={isSaving}>
                  {isSaving ? "Saving…" : "Save profile"}
                </Button>
              </div>
            </form>
          </div>

          <div className="rounded-xl border border-[hsl(var(--destructive)/.3)] bg-card p-6 md:p-8">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[hsl(var(--destructive))]">Delete account</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <div className="mb-4 rounded-lg border border-[hsl(var(--destructive)/.2)] bg-[hsl(var(--destructive)/.05)] p-4">
              <p className="text-sm font-semibold text-[hsl(var(--destructive))]">What will be lost:</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                <li>Your profile and login access</li>
                <li>All session registrations and check-ins</li>
                <li>Conference registrations</li>
                <li>Speaker profile (if applicable)</li>
                <li>Uploaded documents</li>
                <li>All associated data across the platform</li>
              </ul>
            </div>
            {deleteError && (
              <div className="mb-4 rounded-lg border border-[hsl(var(--destructive)/.3)] bg-[hsl(var(--destructive)/.08)] p-3 text-sm text-[hsl(var(--destructive))]">
                {deleteError}
              </div>
            )}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-muted-foreground">
                Type <span className="font-mono font-bold text-[hsl(var(--destructive))]">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="Type DELETE"
                className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:border-[hsl(var(--destructive))] focus:ring-2 focus:ring-[hsl(var(--destructive))]/15 transition-all"
                data-testid="input-delete-confirm"
              />
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={!canDelete}
                className={cn(
                  "h-11 w-full rounded-xl text-sm font-semibold transition-all",
                  canDelete
                    ? "bg-[hsl(var(--destructive))] text-white hover:opacity-90"
                    : "cursor-not-allowed bg-muted text-muted-foreground",
                )}
                data-testid="button-delete-account"
              >
                {isDeleting ? "Deleting account…" : "Delete my account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

function Organisers() {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: "", email: "", status: "active" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`${apiUrl}/api/auth/organisers${q}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to load organisers");
      setRows(Array.isArray(json.data) ? json.data : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load organisers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search]);

  const startEdit = (o: any) => {
    setEditing(o);
    setForm({ name: o.name || "", email: o.email || "", status: o.status || "active" });
  };

  const save = async () => {
    if (!editing) return;
    setBusy(true);
    try {
      const res = await fetch(`${apiUrl}/api/auth/organisers/${editing.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to update organiser");
      toast.success("Organiser updated");
      setEditing(null);
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update organiser");
    } finally {
      setBusy(false);
    }
  };

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Administration"
        title="Organisers"
        body="View and manage organiser accounts. Only administrators can access this screen."
      />
      <div className="mb-5 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search organisers by name or email"
            className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-primary"
            data-testid="input-search-organisers"
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading organisers…</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No organisers found.</div>
        ) : (
          rows.map((o) => (
            <div key={o.id} className="grid gap-2 border-b border-border px-5 py-4 last:border-0 md:grid-cols-[1.5fr_1.5fr_auto_auto] md:items-center md:gap-4" data-testid={`row-organiser-${o.id}`}>
              <div className="flex items-center gap-3">
                <Avatar name={o.name} />
                <div>
                  <div className="font-semibold">{o.name}</div>
                  <div className="text-xs text-muted-foreground capitalize">{o.role}</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">{o.email}</div>
              <StatusBadge status={o.status} />
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => startEdit(o)} data-testid={`button-edit-organiser-${o.id}`}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {editing ? (
        <Modal title="Edit organiser" onClose={() => !busy && setEditing(null)}>
          <div className="grid gap-4">
            <Field label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required testId="input-organiser-name" />
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} required testId="input-organiser-email" />
            <label className="grid gap-2 text-sm font-medium">
              Status
              <select
                className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                data-testid="select-organiser-status"
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setEditing(null)} disabled={busy}>Cancel</Button>
              <Button onClick={save} disabled={busy} data-testid="button-save-organiser">{busy ? "Saving…" : "Save changes"}</Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </PageFrame>
  );
}

function Settings() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("Convene");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [registrationAlerts, setRegistrationAlerts] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(false);
  const [requireStrongPasswords, setRequireStrongPasswords] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState("24");
  const [defaultRole, setDefaultRole] = useState("attendee");
  const [allowSelfSignup, setAllowSelfSignup] = useState(true);
  const [maxCapacity, setMaxCapacity] = useState("500");

  if (user?.role !== "admin") {
    return (
      <PageFrame>
        <PageHeader eyebrow="Settings" title="Settings" />
        <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
          <h3 className="font-semibold">Settings are only available to administrators.</h3>
        </div>
      </PageFrame>
    );
  }

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <PageFrame>
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        body="Set the defaults that keep your team moving in the same direction."
      />
      <div className="grid gap-5">
        {/* Workspace defaults */}
        <div className="rounded-xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-lg font-bold">Workspace defaults</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Small choices, fewer surprises.
          </p>
          <div className="mt-7 grid gap-5">
            <Field
              label="Workspace name"
              value={workspaceName}
              onChange={setWorkspaceName}
              required
              testId="input-workspace-name"
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Default role for new members"
                value={defaultRole}
                onChange={setDefaultRole}
                testId="input-default-role"
              />
              <Field
                label="Default conference capacity"
                value={maxCapacity}
                onChange={setMaxCapacity}
                type="number"
                testId="input-default-capacity"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            {saved && (
              <span className="text-xs font-semibold text-emerald-700">Changes saved</span>
            )}
            <Button type="submit" testId="button-save-settings" onClick={handleSave}>
              Save settings
            </Button>
          </div>
        </div>

        {/* Registration & access */}
        <div className="rounded-xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-lg font-bold">Registration & access</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Control how people join and access your workspace.
          </p>
          <div className="mt-7 space-y-4">
            <ToggleRow
              label="Allow self-signup"
              description="Let anyone create an attendee or speaker account"
              checked={allowSelfSignup}
              onChange={setAllowSelfSignup}
              testId="toggle-allow-signup"
            />
            <div className="h-px bg-border" />
            <ToggleRow
              label="Email notifications"
              description="Send email notifications for new registrations and updates"
              checked={emailNotifications}
              onChange={setEmailNotifications}
              testId="toggle-email-notifications"
            />
            <div className="h-px bg-border" />
            <ToggleRow
              label="Registration alerts"
              description="Notify admins when someone registers for a conference"
              checked={registrationAlerts}
              onChange={setRegistrationAlerts}
              testId="toggle-registration-alerts"
            />
            <div className="h-px bg-border" />
            <ToggleRow
              label="Session reminders"
              description="Send reminders before upcoming sessions"
              checked={sessionReminders}
              onChange={setSessionReminders}
              testId="toggle-session-reminders"
            />
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            {saved && (
              <span className="text-xs font-semibold text-emerald-700">Changes saved</span>
            )}
            <Button type="submit" testId="button-save-registration" onClick={handleSave}>
              Save settings
            </Button>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-lg font-bold">Security</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep your workspace and member data safe.
          </p>
          <div className="mt-7 space-y-4">
            <ToggleRow
              label="Require strong passwords"
              description="Enforce minimum 8 characters with mixed case and numbers"
              checked={requireStrongPasswords}
              onChange={setRequireStrongPasswords}
              testId="toggle-strong-passwords"
            />
            <div className="h-px bg-border" />
            <ToggleRow
              label="Two-factor authentication"
              description="Require 2FA for admin and organiser accounts"
              checked={twoFactorAuth}
              onChange={setTwoFactorAuth}
              testId="toggle-two-factor"
            />
            <div className="h-px bg-border" />
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Session timeout</label>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none"
                data-testid="select-session-timeout"
              >
                <option value="1">1 hour</option>
                <option value="8">8 hours</option>
                <option value="24">24 hours (recommended)</option>
                <option value="168">7 days</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            {saved && (
              <span className="text-xs font-semibold text-emerald-700">Changes saved</span>
            )}
            <Button type="submit" testId="button-save-security" onClick={handleSave}>
              Save settings
            </Button>
          </div>
        </div>

        {/* Data export */}
        <div className="rounded-xl border border-border bg-card p-6 md:p-8">
          <h2 className="text-lg font-bold">Data export</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Download a copy of your workspace data at any time.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Button variant="outline" onClick={() => {}} testId="button-export-users">
              <Download className="h-4 w-4" /> Export users
            </Button>
            <Button variant="outline" onClick={() => {}} testId="button-export-conferences">
              <Download className="h-4 w-4" /> Export conferences
            </Button>
            <Button variant="outline" onClick={() => {}} testId="button-export-registrations">
              <Download className="h-4 w-4" /> Export registrations
            </Button>
            <Button variant="outline" onClick={() => {}} testId="button-export-sessions">
              <Download className="h-4 w-4" /> Export sessions
            </Button>
          </div>
        </div>
      </div>
    </PageFrame>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  testId,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  testId: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] focus-visible:ring-offset-2",
          checked ? "bg-[hsl(var(--primary))]" : "bg-[hsl(var(--muted-foreground)/.35)]",
        )}
        data-testid={testId}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}

function RoleDashboard() {
  const { user } = useAuth();
  switch (user?.role) {
    case "admin": return <AdminDashboard />;
    case "organiser": return <OrganiserDashboard />;
    case "speaker": return <SpeakerDashboard />;
    case "attendee": return <AttendeeDashboard />;
    default: return <AttendeeDashboard />;
  }
}

function ForbiddenPage() {
  return (
    <PageFrame>
      <PageHeader eyebrow="Access" title="Not authorized" body="You do not have permission to view this page." />
    </PageFrame>
  );
}

function RoleRoute({
  allow,
  children,
}: {
  allow: Array<"admin" | "organiser" | "speaker" | "attendee">;
  children: () => React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return <div className="min-h-[100dvh] flex items-center justify-center"><LoadingRows count={2} /></div>;
  }
  if (!isAuthenticated || !user) return null;
  if (!allow.includes(user.role)) {
    return <DashboardLayout><ForbiddenPage /></DashboardLayout>;
  }
  return <DashboardLayout>{children()}</DashboardLayout>;
}

function ConferencesPage() {
  const { user } = useAuth();
  if (user?.role === "admin" || user?.role === "organiser") return <Conferences />;
  return <ConferenceBrowsePage />;
}

function SpeakerSchedulePage() {
  const [sessions, setSessions] = useState<Array<{
    id: string; title: string; conferenceTitle: string; startTime: string; endTime: string; venueName?: string | null; speakerRole?: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    fetch(`${apiUrl}/api/speakers/me/sessions`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setSessions(Array.isArray(d) ? d : []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);
  return (
    <PageFrame>
      <PageHeader
        eyebrow="Schedule"
        title="My speaking sessions"
        body="Sessions assigned to you within their conferences. Session attendance is managed through conference participation—no separate session registration."
      />
      <QueryState
        loading={loading}
        empty={!loading && sessions.length === 0}
        emptyTitle="No sessions assigned"
        emptyBody="When an organiser assigns you to a conference session, it will appear here."
      >
        <div className="grid gap-4">
          {sessions.map((s) => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold">{s.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Conference: <span className="font-medium text-foreground">{s.conferenceTitle}</span>
                  </p>
                </div>
                {s.speakerRole ? (
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold capitalize text-muted-foreground">
                    {s.speakerRole}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{dateLabel(s.startTime)}</span>
                <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{timeLabel(s.startTime)} – {timeLabel(s.endTime)}</span>
                {s.venueName ? <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{s.venueName}</span> : null}
              </div>
            </div>
          ))}
        </div>
      </QueryState>
    </PageFrame>
  );
}

function SchedulePage() {
  const { user } = useAuth();
  if (user?.role === "admin" || user?.role === "organiser") return <Schedule />;
  if (user?.role === "speaker") return <SpeakerSchedulePage />;
  return <SessionBrowsePage />;
}

function AuthRoute({ children }: { children: () => React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) return <div className="min-h-[100dvh] flex items-center justify-center"><LoadingRows count={2} /></div>;
  if (!isAuthenticated) return null;
  return <>{children()}</>;
}

function GuestRoute({ children }: { children: () => React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) return <div className="min-h-[100dvh] flex items-center justify-center"><LoadingRows count={2} /></div>;
  if (isAuthenticated) return null;
  return <>{children()}</>;
}

function Router() {
  const [location] = useLocation();

  return (
    <ErrorBoundary resetKey={location}>
      <AuthProvider>
        <Switch>
          {/* Auth pages - only accessible when not logged in */}
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignupPage} />

          {/* Protected routes - require authentication */}
          <Route path="/dashboard">
            <AuthRoute>{() => <DashboardLayout><RoleDashboard /></DashboardLayout>}</AuthRoute>
          </Route>

          <Route path="/conferences">
            <AuthRoute>{() => <DashboardLayout><ConferencesPage /></DashboardLayout>}</AuthRoute>
          </Route>
          <Route path="/conferences/:id">
            <RoleRoute allow={["admin", "organiser"]}>{() => <ConferenceDetailPage />}</RoleRoute>
          </Route>

          <Route path="/attendee/conferences">
            <RoleRoute allow={["attendee"]}>{() => <ConferenceBrowsePage />}</RoleRoute>
          </Route>
          <Route path="/attendee/sessions">
            <RoleRoute allow={["attendee"]}>{() => <SessionBrowsePage />}</RoleRoute>
          </Route>
          <Route path="/my-registrations">
            <RoleRoute allow={["attendee"]}>{() => <MyRegistrationsPage />}</RoleRoute>
          </Route>

          <Route path="/speakers">
            <RoleRoute allow={["admin", "organiser"]}>{() => <Speakers />}</RoleRoute>
          </Route>
          <Route path="/attendees">
            <RoleRoute allow={["admin", "organiser"]}>{() => <Attendees />}</RoleRoute>
          </Route>
          <Route path="/organisers">
            <RoleRoute allow={["admin"]}>{() => <Organisers />}</RoleRoute>
          </Route>
          <Route path="/venues">
            <RoleRoute allow={["admin", "organiser"]}>{() => <Venues />}</RoleRoute>
          </Route>
          <Route path="/schedule">
            <AuthRoute>{() => <DashboardLayout><SchedulePage /></DashboardLayout>}</AuthRoute>
          </Route>
          <Route path="/documents">
            <RoleRoute allow={["admin", "organiser", "speaker", "attendee"]}>{() => <Documents />}</RoleRoute>
          </Route>
          <Route path="/reports">
            <RoleRoute allow={["admin", "organiser"]}>{() => <Reports />}</RoleRoute>
          </Route>
          <Route path="/profile">
            <AuthRoute>{() => <DashboardLayout><Profile /></DashboardLayout>}</AuthRoute>
          </Route>
          <Route path="/settings">
            <RoleRoute allow={["admin"]}>{() => <Settings />}</RoleRoute>
          </Route>

          {/* Redirect root to login or dashboard */}
          <Route path="/">
            <GuestRoute>{() => <LoginPage />}</GuestRoute>
            <AuthRoute>{() => <DashboardLayout><RoleDashboard /></DashboardLayout>}</AuthRoute>
          </Route>

          <Route component={NotFound} />
        </Switch>
      </AuthProvider>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
