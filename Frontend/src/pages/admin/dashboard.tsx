
import { useAuth } from "@/context/auth-context";
import {
  CalendarDays,
  UsersRound,
  UserRound,
  Building2,
  Plus,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  {
    label: "Total Conferences",
    value: 0,
    icon: CalendarDays,
    description: "Registered conferences",
  },
  {
    label: "Total Organisers",
    value: 0,
    icon: UsersRound,
    description: "Active organisers",
  },
  {
    label: "Total Speakers",
    value: 0,
    icon: UserRound,
    description: "Registered speakers",
  },
  {
    label: "Total Venues",
    value: 0,
    icon: Building2,
    description: "Available venues",
  },
];

export function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">

      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Admin Dashboard
          </h1>

          <p className="text-sm text-muted-foreground mt-2">
            Welcome back, {user?.name || "Administrator"}.
            Here's your system overview.
          </p>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Conference
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>

                <div className="rounded-lg bg-primary/10 p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>

              <h2 className="mt-5 text-3xl font-bold">
                {stat.value}
              </h2>

              <p className="mt-2 text-xs text-muted-foreground">
                {stat.description}
              </p>
            </div>
          );
        })}

      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-bold">
          Quick Actions
        </h2>

        <p className="text-sm text-muted-foreground mt-1">
          Manage your conference management system.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-5">

          {[
            "Manage Conferences",
            "Manage Organisers",
            "Manage Speakers",
            "Manage Venues",
            "View Reports",
            "System Settings",
          ].map((action) => (
            <Button
              key={action}
              variant="outline"
              className="justify-between h-12"
            >
              {action}
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          ))}

        </div>
      </div>

    </div>
  );
}
