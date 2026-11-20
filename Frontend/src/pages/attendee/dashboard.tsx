import { useAuth } from "@/context/auth-context";
import { CalendarDays, Clock3, UsersRound } from "lucide-react";

export function AttendeeDashboard() {
  const { user } = useAuth();
  const stats = [
    { label: "Available conferences", value: "0", icon: CalendarDays },
    { label: "My registrations", value: "0", icon: UsersRound },
    { label: "My sessions", value: "0", icon: Clock3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendee Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Browse conferences and register for sessions. Welcome back, {user?.name}.
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
        <h2 className="text-lg font-bold">Available conferences</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse conferences in the sidebar and register for sessions you want to attend.
        </p>
      </div>
    </div>
  );
}