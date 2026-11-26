import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { useListAvailableConferences } from "@workspace/api-client-react";
import { CalendarDays, UserRound, Clock3, ArrowRight, CheckCircle2, FileText, MapPin } from "lucide-react";
import { Link } from "wouter";

type MySpeakerSession = {
  id: string;
  conferenceId: string;
  conferenceTitle: string;
  conferenceStatus?: string | null;
  venueName?: string | null;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  speakerRole?: string;
};

export function SpeakerDashboard() {
  const { user } = useAuth();
  const { data: conferences } = useListAvailableConferences();
  const [sessions, setSessions] = useState<MySpeakerSession[]>([]);
  const [profile, setProfile] = useState<{ bio?: string; name?: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [sRes, pRes] = await Promise.all([
          fetch(`${apiUrl}/api/speakers/me/sessions`, { credentials: "include" }),
          fetch(`${apiUrl}/api/speakers/me`, { credentials: "include" }),
        ]);
        if (!cancelled) {
          if (sRes.ok) setSessions(await sRes.json());
          if (pRes.ok) setProfile(await pRes.json());
        }
      } catch {
        // ignore; show empty states
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const upcomingSessions = useMemo(
    () =>
      sessions
        .filter((s) => new Date(s.startTime) >= new Date(Date.now() - 6 * 60 * 60 * 1000))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
        .slice(0, 5),
    [sessions],
  );

  const myConferenceCount = useMemo(
    () => new Set(sessions.map((s) => s.conferenceId)).size,
    [sessions],
  );

  const profileCompleteness = profile?.bio ? 100 : 50;

  const stats = [
    { label: "My upcoming sessions", value: upcomingSessions.length, icon: CalendarDays },
    { label: "My conferences", value: myConferenceCount, icon: CheckCircle2 },
    { label: "Profile completeness", value: `${profileCompleteness}%`, icon: UserRound },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Speaker Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          View the sessions and conferences you’re assigned to. Welcome back, {user?.name}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5">
            <Icon className="h-4 w-4 text-[hsl(var(--primary))]" />
            <div className="mt-5 flex items-baseline gap-1">
              <span className="display-font text-2xl font-bold">{value}</span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">My upcoming sessions</h2>
            <Link href="/schedule" className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
              View schedule <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <div className="h-24 flex items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary)/.1)]">
                    <Clock3 className="h-4 w-4 text-[hsl(var(--primary))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{session.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      Conference: <span className="font-medium text-foreground">{session.conferenceTitle}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{new Date(session.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      <span>·</span>
                      <span>
                        {new Date(session.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        {" – "}
                        {new Date(session.endTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                      </span>
                      {session.venueName ? (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{session.venueName}</span>
                        </>
                      ) : null}
                      {session.speakerRole ? (
                        <span className="rounded-full bg-secondary px-2 py-0.5 capitalize">{session.speakerRole}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No upcoming sessions assigned to you yet. Sessions you’re assigned to will appear here.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold mb-5">Speaker profile</h2>
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</div>
              <div className="mt-1 font-semibold">{profile?.name || user?.name}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</div>
              <div className="mt-1 text-sm">{profile?.email || user?.email}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</div>
              <div className="mt-1 text-sm text-muted-foreground">{profile?.bio || "No bio added yet"}</div>
            </div>
          </div>
          <Link href="/profile" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--primary))] hover:underline">
            Edit profile <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold mb-2">Conferences</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Browse available conferences. Your speaking sessions belong to their conferences.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/conferences" className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors">
            <CalendarDays className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium">Browse conferences</span>
          </Link>
          <Link href="/schedule" className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors">
            <Clock3 className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium">View my schedule</span>
          </Link>
          <Link href="/documents" className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors">
            <FileText className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium">View documents</span>
          </Link>
        </div>
        {(conferences ?? []).length > 0 && (
          <div className="mt-4 text-xs text-muted-foreground">
            {(conferences ?? []).length} conference(s) available to view.
          </div>
        )}
      </div>
    </div>
  );
}
