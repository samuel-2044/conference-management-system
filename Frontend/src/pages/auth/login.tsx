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
    <div className="min-h-[100dvh] w-full bg-[hsl(var(--background))] relative overflow-hidden flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[hsl(var(--primary)/.08)] blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-[hsl(var(--accent)/.10)] blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <img src="/favicon.svg" alt="Convene" className="mx-auto mb-4 h-12 w-12 rounded-2xl shadow-sm" />
          <div className="text-xs font-semibold uppercase tracking-[.24em] text-[hsl(var(--muted-foreground))]">Convene</div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">Sign in</h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Access your conference workspace.
          </p>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white/90 backdrop-blur p-6 shadow-sm sm:p-8">
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
        </div>

        <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-[hsl(var(--primary))] hover:underline" data-testid="link-login-signup">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
