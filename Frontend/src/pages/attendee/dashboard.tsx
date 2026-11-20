import { useAuth } from "@/context/auth-context";
import { useListAvailableConferences, useListAvailableSessions } from "@workspace/api-client-react";
import { CalendarDays, Clock3, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function AttendeeDashboard() {
  const { user } = useAuth();
  const { data: conferences } = useListAvailableConferences();
  const { data: sessions } = useListAvailableSessions();

  const openConferences = (conferences ?? []).filter((c) => c.registrationOpen && !c.isFull);
  const openSessions = (sessions ?? []).filter((s) => s.registrationOpen && !s.isFull);

  const stats = [
    { label: "Open conferences", value: openConferences.length, icon: CalendarDays },
    { label: "Open sessions", value: openSessions.length, icon: Clock3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome, {user?.name}</h1>
        <p className="text-sm text-muted-foreground">
          Browse conferences and register for sessions available to you.
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

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Conferences</h2>
            <Link href="/conferences" className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
              Browse all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {openConferences.length > 0 ? (
            <div className="space-y-3">
              {openConferences.slice(0, 4).map((c) => (
                <div key={c.conferenceId} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <div className="font-semibold text-sm">{c.title}</div>
                    <div className="text-xs text-muted-foreground capitalize">{c.status} · {c.availableCount} spots left</div>
                  </div>
                  <Link href="/conferences">
                    <Button variant="outline" className="h-8 text-xs">View</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No conferences are open for registration right now.</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Sessions</h2>
            <Link href="/schedule" className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
              Browse all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {openSessions.length > 0 ? (
            <div className="space-y-3">
              {openSessions.slice(0, 4).map((s) => (
                <div key={s.sessionId} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm truncate">{s.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {s.conferenceTitle} · {new Date(s.startTime).toLocaleDateString()}
                    </div>
                  </div>
                  <Link href="/schedule">
                    <Button variant="outline" className="h-8 text-xs">View</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No sessions are open for registration right now.</p>
          )}
        </div>
      </div>
    </div>
  );
}