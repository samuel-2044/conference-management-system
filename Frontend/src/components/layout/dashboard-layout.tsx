import { useState, useMemo, type ReactNode } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/context/auth-context";
import {
  LayoutDashboard,
  CalendarDays,
  UserRound,
  UsersRound,
  Building2,
  Clock3,
  Library,
  BarChart3,
  LogOut,
  Settings2,
  ShieldCheck,
  Plus,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: ("admin" | "organiser" | "speaker" | "attendee")[];
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "organiser", "speaker", "attendee"] },
  // Management (admin/organiser)
  { href: "/conferences", label: "Conferences", icon: CalendarDays, roles: ["admin", "organiser"] },
  { href: "/speakers", label: "Speakers", icon: UserRound, roles: ["admin", "organiser"] },
  { href: "/attendees", label: "Attendees", icon: UsersRound, roles: ["admin", "organiser"] },
  { href: "/organisers", label: "Organisers", icon: ShieldCheck, roles: ["admin"] },
  { href: "/venues", label: "Venues", icon: Building2, roles: ["admin", "organiser"] },
  { href: "/schedule", label: "Schedule", icon: Clock3, roles: ["admin", "organiser"] },
  { href: "/documents", label: "Documents", icon: Library, roles: ["admin", "organiser", "speaker", "attendee"] },
  { href: "/reports", label: "Reports", icon: BarChart3, roles: ["admin", "organiser"] },
  // Participant
  { href: "/conferences", label: "Conferences", icon: CalendarDays, roles: ["attendee"] },
  { href: "/conferences", label: "Browse conferences", icon: CalendarDays, roles: ["speaker"] },
  { href: "/my-registrations", label: "My registrations", icon: UsersRound, roles: ["attendee"] },
  { href: "/schedule", label: "Sessions", icon: Clock3, roles: ["attendee"] },
  { href: "/schedule", label: "My schedule", icon: Clock3, roles: ["speaker"] },
  { href: "/profile", label: "Profile", icon: UserRound, roles: ["admin", "organiser", "speaker", "attendee"] },
  { href: "/settings", label: "Settings", icon: Settings2, roles: ["admin"] },
];

// Primary items for mobile bottom bar (resolved per role below)
const MOBILE_BOTTOM_HREFS = ["/dashboard", "/conferences", "/schedule", "/profile"];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = useMemo(
    () => NAV_ITEMS.filter((item) => !user || item.roles.includes(user.role)),
    [user],
  );

  const bottomNavItems = useMemo(() => {
    if (!user) return [] as NavItem[];
    return MOBILE_BOTTOM_HREFS
      .map((href) => NAV_ITEMS.find((n) => n.href === href && n.roles.includes(user.role)))
      .filter((n): n is NavItem => Boolean(n));
  }, [user]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  return (
    <div className="dashboard-shell flex min-h-[100dvh] bg-background">
      <aside
        className={cn(
          "sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] px-4 py-5 text-[hsl(var(--sidebar-foreground))] transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0",
        )}
      >
        <div className="flex items-center gap-3 px-3 mb-10">
          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg">
            <img src="/favicon.svg" alt="Convene" className="h-9 w-9" />
          </div>
          <div>
            <div className="display-font text-lg font-bold tracking-tight">Convene</div>
            <div className="mono-font text-[8px] uppercase tracking-[.22em] text-[hsl(var(--sidebar-foreground)/.55)]">
              Management system
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-md p-1.5 hover:bg-[hsl(var(--sidebar-accent))] md:hidden"
            aria-label="Close sidebar"
            data-testid="button-close-sidebar"
          >
            <X className="h-5 w-5 text-[hsl(var(--sidebar-foreground)/.65)]" />
          </button>
        </div>

        <div className="px-3 text-[11px] font-bold uppercase tracking-[.2em] text-[hsl(var(--sidebar-foreground)/.65)]">
          Navigation
        </div>
        <nav className="mt-3 grid gap-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                data-testid={`link-${item.label.toLowerCase()}`}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  "text-[hsl(var(--sidebar-foreground)/.82)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-white",
                  isActive
                    ? "bg-[hsl(var(--sidebar-primary))] font-semibold text-white shadow-sm"
                    : "",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 px-2 pt-4 border-t border-[hsl(var(--sidebar-border))]">
          <div className="px-1 text-[10px] font-bold uppercase tracking-[.2em] text-[hsl(var(--sidebar-foreground)/.65)] mb-2">
            Account
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-[hsl(var(--sidebar-border))] px-3 py-2">
            <div className="h-8 w-8 shrink-0 rounded-full bg-white/15 flex items-center justify-center text-white font-bold text-xs ring-1 ring-white/20">
              {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="block truncate text-sm font-semibold text-white">{user.name}</div>
              <div className="block text-[11px] text-[hsl(var(--sidebar-foreground)/.72)]">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </div>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="mt-2 w-full h-9 text-[hsl(var(--sidebar-foreground)/.82)] hover:bg-[hsl(var(--sidebar-accent))] hover:text-white flex items-center justify-center gap-2"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>


      </aside>

      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-[hsl(var(--sidebar)/.45)] md:hidden"
          data-testid="button-close-navigation"
        />
      )}

      {/* Mobile bottom navigation bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-[hsl(var(--background)/.95)] backdrop-blur-sm pb-safe"
        data-testid="mobile-bottom-nav"
      >
        <div className="grid grid-cols-4 gap-1 px-2 py-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors",
                  "text-[hsl(var(--foreground)/.55)] active:bg-[hsl(var(--accent)/.15)]",
                  isActive
                    ? "text-[hsl(var(--primary))] bg-[hsl(var(--primary)/.1)]"
                    : "hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--accent)/.1)]",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="flex-1 min-w-0 pb-safe md:pb-0">
        <header
          className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar))] px-5 backdrop-blur-md md:px-9 text-[hsl(var(--sidebar-foreground))]"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen((open) => !open)}
              className="rounded-md p-2 hover:bg-secondary md:hidden"
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              data-testid="button-open-navigation"
            >
              <span className="sr-only">{mobileOpen ? "Close navigation" : "Open navigation"}</span>
              {mobileOpen ? (
                <X className="h-5 w-5 text-[hsl(var(--sidebar-foreground))]" />
              ) : (
                <Menu className="h-5 w-5 text-[hsl(var(--sidebar-foreground))]" />
              )}
            </button>
            <div className="hidden items-center gap-2 text-sm font-semibold tracking-wide text-[hsl(var(--sidebar-foreground))] md:flex">
              <img src="/favicon.svg" alt="" className="h-5 w-5 rounded" />
              <span>Convene Management</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/profile" className="ml-1" data-testid="link-header-profile">
              <div className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center text-white font-bold text-xs ring-1 ring-white/20">
                {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
              </div>
            </Link>
          </div>
        </header>
        <div className="mx-auto max-w-[1500px] p-5 md:p-9">{children}</div>
      </main>
    </div>
  );
}
