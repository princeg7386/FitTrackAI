import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dumbbell, Activity, Bell } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth";

export default function AppLayout() {
  const location = useLocation();

  useEffect(() => {
    const now = new Date();
    if (now.getHours() % 3 === 0) {
      toast("Hydration reminder", {
        description: "Time to drink a glass of water.",
      });
    }
  }, [location.pathname]);

  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--brand-3)/0.12),transparent_60%),radial-gradient(40%_40%_at_100%_0%,hsl(var(--brand-2)/0.18),transparent_70%)]">
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
            <div className="size-8 grid place-items-center rounded-lg bg-gradient-to-br from-brand to-brand3 text-white">
              <Dumbbell className="size-5" />
            </div>
            <span className="text-lg">FitTrack AI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavItem to="/" label="Home" />
            <NavItem to="/dashboard" label="Dashboard" />
            {user ? (
              <NavItem to="/profile" label="Profile" />
            ) : (
              <NavItem to="/login" label="Sign in" />
            )}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell />
            </Button>
            <ThemeToggle />
            <Button asChild>
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="container py-10">
        <Outlet />
      </main>
      <footer className="border-t">
        <div className="container py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center gap-2 md:gap-6 justify-between">
          <p>© {new Date().getFullYear()} FitTrack AI. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1"><Activity className="size-4" /> Secure • Encrypted</span>
            <span>Cross‑platform: Android • iOS • Web</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "px-3 py-2 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
          isActive && "text-foreground bg-accent/60"
        )
      }
      end
    >
      {label}
    </NavLink>
  );
}
