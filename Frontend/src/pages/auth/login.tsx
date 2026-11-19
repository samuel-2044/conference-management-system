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
    <div className="auth-page min-h-[100dvh] w-full bg-background relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50rem] h-[50rem] rounded-full bg-[hsl(var(--primary)/.12)] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-[hsl(var(--accent)/.10)] blur-[100px] pointer-events-none" />
      </div>

      <div className="relative z-10 flex w-full items-center justify-center px-5 min-h-[100dvh]">
        {/* Left panel: Convene branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-10 lg:p-16 text-center">
          <div className="inline-flex flex-col items-center gap-3 mb-8">
            <img src="/favicon.svg" alt="Convene" className="h-14 w-14 rounded-2xl" />
            <div>
              <span className="font-serif text-3xl font-bold tracking-tight text-foreground">Convene</span>
              <div className="mono-font text-[10px] uppercase tracking-[.25em] text-[hsl(var(--muted-foreground))] mt-1">
                Conference Management
              </div>
            </div>
          </div>

          <div className="max-w-md w-full">
            <h2 className="display-font text-4xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              Welcome back<span className="text-[hsl(var(--primary))]">.</span>
            </h2>
            <p className="text-[hsl(var(--muted-foreground))] text-lg leading-relaxed mb-10">
              Sign in to your conference workspace to manage events, sessions, and registrations.
            </p>

            <div className="space-y-6">
              <div className="text-center">
                <div className="text-sm font-semibold text-foreground">Fast, secure sign-in</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">Access your dashboard in seconds</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-foreground">Role-based access</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">Admin, organiser, speaker, or attendee</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-foreground">Everything in one place</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">Venues, sessions, and registrations</div>
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-[hsl(var(--border))] pt-8 w-full">
            <div className="flex flex-col items-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
              <span className="border border-[hsl(var(--border))] rounded-full px-2 py-0.5">v1.0.0</span>
              <span>Convene Conference Management System</span>
            </div>
          </div>
        </div>

        {/* Right panel: login form card */}
        <div className="flex flex-col items-center justify-center p-6 lg:w-1/2 lg:p-16 min-h-[560px]">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <img src="/favicon.svg" alt="Convene" className="h-12 w-12 mx-auto mb-4" />
              <h1 className="display-font text-3xl font-bold tracking-tight text-foreground mb-2">Welcome back</h1>
              <p className="text-[hsl(var(--muted-foreground))] text-sm">
                Enter your email and password to access your conference workspace.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-[hsl(var(--destructive)/.3)] bg-[hsl(var(--destructive)/.08)] p-4 text-sm text-[hsl(var(--destructive))] shadow-sm">
                {error}
              </div>
            )}

            <form className="grid gap-5" onSubmit={handleSubmit}>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  autoComplete="email"
                  className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  data-testid="input-login-email"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-10 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  data-testid="input-login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <Button
                type="submit"
                className="h-11 w-full font-semibold"
                disabled={isLoading}
                data-testid="button-submit-login"
              >
                {isLoading ? "Signing in…" : "Sign in"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="mt-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
              Don't have an account?{" "}
              <Link href="/signup" className="font-bold text-[hsl(var(--primary))] hover:underline" data-testid="link-login-signup">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
