
import { useAuth } from "@/context/auth-context";
import {
  useListConferences,
  useListSpeakers,
  useListVenues,
  useGetRegistrationReport,
} from "@workspace/api-client-react";
import {
  CalendarDays,
  UsersRound,
  UserRound,
  Building2,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function AdminDashboard() {
  const { user } = useAuth();
  const { data: conferences } = useListConferences();
  const { data: speakers } = useListSpeakers();
  const { data: venues } = useListVenues();
  const { data: report } = useGetRegistrationReport();

  const stats = [
    {
      label: "Conferences",
      value: conferences?.length ?? 0,
      icon: CalendarDays,
      description: "Total conferences",
    },
    {
      label: "Registrations",
      value: report?.total ?? 0,
      icon: UsersRound,
      description: "Conference registrations",
    },
    {
      label: "Speakers",
      value: speakers?.length ?? 0,
      icon: UserRound,
      description: "Registered speakers",
    },
    {
      label: "Venues",
      value: venues?.length ?? 0,
      icon: Building2,
      description: "Available venues",
    },
  ];

  const actions = [
    { label: "Manage Conferences", href: "/conferences" },
    { label: "Manage Speakers", href: "/speakers" },
    { label: "Manage Attendees", href: "/attendees" },
    { label: "Manage Venues", href: "/venues" },
    { label: "View Reports", href: "/reports" },
    { label: "System Settings", href: "/settings" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Welcome back, {user?.name || "Administrator"}. System overview and management.
          </p>
        </div>
        <Link href="/conferences">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New conference
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <div className="rounded-lg bg-primary/10 p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <h2 className="mt-5 text-3xl font-bold">{stat.value}</h2>
              <p className="mt-2 text-xs text-muted-foreground">{stat.description}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="text-lg font-bold">Quick actions</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage conferences, people, venues, and reports.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-5">
          {actions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Button variant="outline" className="justify-between h-12 w-full">
                {action.label}
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
