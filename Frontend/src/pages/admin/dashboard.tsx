import { useAuth } from "@/context/auth-context";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { CalendarDays, UsersRound, UserRound, Building2, Clock3, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminDashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading } = useGetDashboardSummary();

  const stats = [
    { label: "Total conferences", value: summary?.activeConferences ?? 0, icon: CalendarDays },
    { label: "Total organisers", value: summary?.totalOrganisers ?? 0, icon: UsersRound },
    { label: "Total speakers", value: summary?.totalSpeakers ?? 0, icon: UserRound },
    { label: "Total venues", value: summary?.totalVenues ?? 0, icon: Building2 },
  ];

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

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold">Quick actions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage system-wide settings, users, and conferences from the sidebar.
        </p>
      </div>
    </div>
  );
}