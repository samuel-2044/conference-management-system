import { useAuth } from "@/context/auth-context";
import { CalendarDays, UsersRound, Building2, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";

export function OrganiserDashboard() {
  const { user } = useAuth();
  const stats = [
    { label: "My conferences", value: "0", icon: CalendarDays },
    { label: "My venues", value: "0", icon: Building2 },
    { label: "My sessions", value: "0", icon: Clock3 },
    { label: "Total speakers", value: "0", icon: UsersRound },
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

      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold">Quick actions</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Create conferences, add venues, schedule sessions, and assign speakers from the sidebar.
        </p>
      </div>
    </div>
  );
}