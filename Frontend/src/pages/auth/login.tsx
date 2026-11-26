import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login(email, password);
      setLocation("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 h-[30rem] w-[30rem] rounded-full bg-[hsl(var(--primary)/.10)] blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-[hsl(var(--accent)/.10)] blur-3xl" />
      </div>

      <div className="relative z-10 grid min-h-[100dvh] lg:grid-cols-2">
        <div className="hidden lg:flex flex-col justify-center px-12 xl:px-20 py-12">
          <div className="max-w-lg mx-auto w-full">
            <div className="inline-flex items-center gap-3 mb-10">
              <img src="/favicon.svg" alt="Convene" className="h-12 w-12 rounded-2xl shadow-sm" />
              <div>
                <div className="text-2xl font-bold tracking-tight text-[hsl(var(--foreground))]">Convene</div>
                <div className="text-[11px] font-semibold uppercase tracking-[.24em] text-[hsl(var(--muted-foreground))]">Conference Management</div>
              </div>
            </div>

            <h2 className="text-2xl xl:text-3xl font-bold tracking-tight text-[hsl(var(--foreground))] leading-tight whitespace-nowrap">
              Manage conferences with clarity<span className="text-[hsl(var(--primary))]">.</span>
            </h2>
            <p className="mt-5 text-base text-[hsl(var(--muted-foreground))] leading-relaxed max-w-md">
              Sign in to coordinate events, sessions, speakers, and registrations from one workspace.
            </p>

            <div className="mt-10 grid gap-4">
              {[
                { title: "Organized workflows", desc: "Conferences, venues, sessions, and reports in one place." },
                { title: "Role-based access", desc: "Admin, organiser, speaker, and attendee experiences." },
                { title: "Fast coordination", desc: "Track registrations and schedules with confidence." },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-[hsl(var(--border))] bg-white/60 backdrop-blur px-4 py-3">
                  <div className="text-sm font-semibold text-[hsl(var(--foreground))]">{item.title}</div>
                  <div className="text-sm text-[hsl(var(--muted-foreground))]">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 text-center">
              <img src="/favicon.svg" alt="Convene" className="mx-auto mb-4 h-12 w-12 rounded-2xl shadow-sm" />
              <div className="text-xs font-semibold uppercase tracking-[.24em] text-[hsl(var(--muted-foreground))]">Convene</div>
            </div>

            <div className="rounded-2xl border border-[hsl(var(--border))] bg-white/90 backdrop-blur p-6 shadow-sm sm:p-8">
              <div className="mb-7">
                <h1 className="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">Sign in</h1>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                  Enter your credentials to access your workspace.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-lg border border-[hsl(var(--destructive)/.25)] bg-[hsl(var(--destructive)/.06)] px-4 py-3 text-sm text-[hsl(var(--destructive))]">
                  {error}
                </div>
              )}

              <form className="grid gap-4" onSubmit={handleSubmit}>
                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-[hsl(var(--foreground))]">Email</span>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/.15)]"
                      data-testid="input-login-email"
                    />
                  </div>
                </label>

                <label className="grid gap-1.5">
                  <span className="text-sm font-medium text-[hsl(var(--foreground))]">Password</span>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-11 text-sm outline-none transition focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--primary)/.15)]"
                      data-testid="input-login-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                <Button type="submit" className="mt-2 h-11 w-full font-semibold" disabled={isLoading} data-testid="button-submit-login">
                  {isLoading ? "Signing in…" : "Sign in"}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="font-semibold text-[hsl(var(--primary))] hover:underline" data-testid="link-login-signup">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
