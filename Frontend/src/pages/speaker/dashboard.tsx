import { useAuth } from "@/context/auth-context";
import { useListSessions, useListConferences, useListSpeakers } from "@workspace/api-client-react";
import { CalendarDays, UserRound, Clock3, ArrowRight, MapPin, CheckCircle2, FileText } from "lucide-react";
import { Link } from "wouter";

export function SpeakerDashboard() {
  const { user } = useAuth();
  const { data: sessions } = useListSessions();
  const { data: conferences } = useListConferences();
  const { data: speakers } = useListSpeakers();

  const upcomingSessions = (sessions ?? [])
    .filter((s) => new Date(s.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  const mySpeakerProfile = (speakers ?? []).find((s) => s.userId === user?.id);
  const profileCompleteness = mySpeakerProfile?.bio ? 100 : 50;

  const stats = [
    { label: "Upcoming sessions", value: upcomingSessions.length, icon: CalendarDays },
    { label: "Conferences", value: conferences?.length ?? 0, icon: CheckCircle2 },
    { label: "Profile completeness", value: `${profileCompleteness}%`, icon: UserRound },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Speaker Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          View your assigned sessions and manage your speaker profile. Welcome back, {user?.name}.
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
              Full schedule <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-start gap-3 rounded-lg border border-border p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary)/.1)]">
                    <Clock3 className="h-4 w-4 text-[hsl(var(--primary))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{session.title}</div>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span>{new Date(session.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      <span>·</span>
                      <span>{new Date(session.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming sessions assigned yet.</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold mb-5">Speaker profile</h2>
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</div>
              <div className="mt-1 font-semibold">{user?.name}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</div>
              <div className="mt-1 text-sm">{user?.email}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {mySpeakerProfile?.bio || "No bio added yet"}
              </div>
            </div>
          </div>
          <Link href="/profile" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--primary))] hover:underline">
            Edit profile <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold mb-4">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/schedule" className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors">
            <Clock3 className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium">View schedule</span>
          </Link>
          <Link href="/conferences" className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors">
            <CalendarDays className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium">Browse conferences</span>
          </Link>
          <Link href="/documents" className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors">
            <FileText className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium">View documents</span>
          </Link>
        </div>
      </div>
    </div>
  );
}