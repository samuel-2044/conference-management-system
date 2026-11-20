import { useAuth } from "@/context/auth-context";
import { useGetDashboardSummary, useListConferences, useGetRegistrationReport } from "@workspace/api-client-react";
import { CalendarDays, UsersRound, UserRound, Building2, Clock3, ArrowRight, MapPin } from "lucide-react";
import { Link } from "wouter";

export function AdminDashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading } = useGetDashboardSummary();
  const { data: conferences } = useListConferences();
  const { data: report } = useGetRegistrationReport();

  const stats = [
    { label: "Total conferences", value: summary?.activeConferences ?? 0, icon: CalendarDays },
    { label: "Total organisers", value: summary?.totalOrganisers ?? 0, icon: UsersRound },
    { label: "Total speakers", value: summary?.totalSpeakers ?? 0, icon: UserRound },
    { label: "Total venues", value: summary?.totalVenues ?? 0, icon: Building2 },
  ];

  const upcomingConferences = (conferences ?? [])
    .filter((c) => c.status === "upcoming" || c.status === "ongoing")
    .slice(0, 4);

  const totalRegistrations = report?.totalRegistrations ?? 0;
  const confirmedRegistrations = report?.confirmedRegistrations ?? 0;
  const pendingRegistrations = report?.pendingRegistrations ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          System administration and oversight for {user?.name}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-5">
            <Icon className="h-4 w-4 text-[hsl(var(--primary))]" />
            <div className="mt-5 flex items-baseline gap-1">
              <span className="display-font text-2xl font-bold">
                {isLoading ? "…" : value}
              </span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">Upcoming conferences</h2>
            <Link href="/conferences" className="text-xs font-semibold text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {upcomingConferences.length > 0 ? (
            <div className="space-y-3">
              {upcomingConferences.map((conf) => (
                <Link
                  key={conf.id}
                  href={`/conferences/${conf.id}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-4 hover:bg-secondary/50 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-sm">{conf.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {new Date(conf.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    conf.status === "ongoing" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {conf.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming conferences.</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold mb-5">Registration overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total registrations</span>
              <span className="font-bold">{totalRegistrations}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: totalRegistrations > 0 ? `${(confirmedRegistrations / totalRegistrations) * 100}%` : "0%" }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-semibold">{confirmedRegistrations} confirmed</span>
              <span className="text-amber-600 font-semibold">{pendingRegistrations} pending</span>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <Link href="/reports" className="block text-xs font-semibold text-[hsl(var(--primary))] hover:underline flex items-center gap-1">
              View full report <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold mb-4">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/conferences" className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors">
            <CalendarDays className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium">Manage conferences</span>
          </Link>
          <Link href="/attendees" className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors">
            <UsersRound className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium">View attendees</span>
          </Link>
          <Link href="/settings" className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors">
            <Building2 className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium">Workspace settings</span>
          </Link>
          <Link href="/reports" className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary/50 transition-colors">
            <Clock3 className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span className="text-sm font-medium">View reports</span>
          </Link>
        </div>
      </div>
    </div>
  );
}