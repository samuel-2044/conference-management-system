import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you requested does not exist or may have been moved.
        </p>
        <div className="mt-6 flex justify-center">
          <Link href="/dashboard">
            <Button>Go to dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
