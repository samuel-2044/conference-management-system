import { useAuth } from "@/context/auth-context";
import { useListConferences, useListSessions, useListSpeakers, useGetRegistrationReport } from "@workspace/api-client-react";
import { CalendarDays, UsersRound, Building2, Clock3, ArrowRight, MapPin, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

export function OrganiserDashboard() {
  const { user } = useAuth();
  const { data: conferences } = useListConferences();
  const { data: sessions } = useListSessions();
  const { data: speakers } = useListSpeakers();
  const { data: report } = useGetRegistrationReport();

  const myConferences = (conferences ?? []).slice(0, 4);
  const upcomingSessions = (sessions ?? [])
    .filter((s) => new Date(s.startTime) > new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 4);

  const stats = [
    { label: "My conferences", value: conferences?.length ?? 0, icon: CalendarDays },
    { label: "My sessions", value: sessions?.length ?? 0, icon: Clock3 },
    { label: "Total speakers", value: speakers?.length ?? 0, icon: UsersRound },
    { label: "Registrations", value: report?.totalRegistrations ?? 0, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Organiser Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage your conferences, venues, and sessions. Welcome, {user?.name}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <h2 className="text-lg font-bold">Upcoming sessions</h2>
            <Link href="/schedule" className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
              View schedule <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--primary)/.1)]">
                    <Clock3 className="h-4 w-4 text-[hsl(var(--primary))]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{session.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(session.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {new Date(session.startTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming sessions.</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">My conferences</h2>
            <Link href="/conferences" className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {myConferences.length > 0 ? (
            <div className="space-y-3">
              {myConferences.map((conf) => (
                <Link
                  key={conf.id}
                  href={`/conferences/${conf.id}`}
                  className="block rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors"
                >
                  <div className="font-semibold text-sm">{conf.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {new Date(conf.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No conferences yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold mb-4">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/conferences" className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors">
            <CalendarDays className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium">Manage conferences</span>
          </Link>
          <Link href="/venues" className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors">
            <Building2 className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium">Manage venues</span>
          </Link>
          <Link href="/schedule" className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors">
            <Clock3 className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium">Schedule sessions</span>
          </Link>
          <Link href="/reports" className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors">
            <CheckCircle2 className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium">View reports</span>
          </Link>
        </div>
      </div>
    </div>
  );
}