import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  History,
  Settings,
  Command as CommandIcon,
  LogOut,
  Menu,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { KnowraWordmark, KnowraMark } from "@/components/knowra/logo";
import { CollectionProvider } from "@/hooks/use-active-collection";
import { CommandPalette } from "@/components/knowra/command-palette";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_authenticated/app")({
  component: WorkspaceLayout,
});

const NAV = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/app/documents", label: "Documents", icon: FileText },
  { to: "/app/ask", label: "Ask Knowra", icon: MessageSquare },
  { to: "/app/history", label: "History", icon: History },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

function WorkspaceLayout() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to || pathname === `${to}/` : pathname.startsWith(to);

  async function signOut() {
    await supabase.auth.signOut();
    void navigate({ to: "/auth" });
  }

  return (
    <CollectionProvider>
      <div className="bg-background min-h-screen">
        {/* Top bar */}
        <header className="glass sticky top-0 z-30 flex h-14 items-center gap-3 px-4">
          <button
            className="text-muted-foreground hover:text-foreground -ml-1 p-2 md:hidden"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <Menu className="size-5" />
          </button>
          <Link to="/app" className="hidden md:block">
            <KnowraWordmark />
          </Link>
          <Link to="/app" className="md:hidden">
            <KnowraMark />
          </Link>
          <button
            onClick={() => setPaletteOpen(true)}
            className="text-muted-foreground hover:border-[var(--border-strong)] hover:text-foreground mx-auto flex h-9 w-full max-w-md items-center gap-2 rounded-lg border px-3 text-sm transition-colors"
          >
            <CommandIcon className="size-3.5" />
            Search knowledge...
            <kbd className="ml-auto hidden font-mono text-[10px] opacity-60 sm:block">⌘K</kbd>
          </button>
          <Button variant="ghost" size="sm" onClick={signOut} aria-label="Sign out">
            <LogOut className="size-4" />
          </Button>
        </header>

        <div className="flex">
          {/* Desktop sidebar */}
          <nav
            className={cn(
              "bg-surface fixed inset-y-14 left-0 z-20 w-60 shrink-0 border-r p-3 md:sticky md:top-14 md:block md:h-[calc(100vh-3.5rem)]",
              mobileNavOpen ? "block" : "hidden",
            )}
          >
            <p className="text-muted-foreground px-3 py-2 text-[10px] tracking-[0.2em] uppercase">
              Knowledge
            </p>
            <ul className="space-y-1">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                      isActive(item.to, item.exact)
                        ? "bg-elevated text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-[var(--elevated)]/60",
                    )}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <main className="min-w-0 flex-1 pb-20 md:pb-0">
            <Outlet />
          </main>
        </div>

        {/* Mobile bottom navigation */}
        <nav className="glass fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 text-[10px]",
                isActive(item.to, item.exact) ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon className="size-5" />
              {item.label.replace("Ask Knowra", "Ask")}
            </Link>
          ))}
        </nav>

        <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
        <Toaster position="top-center" />
      </div>
    </CollectionProvider>
  );
}
