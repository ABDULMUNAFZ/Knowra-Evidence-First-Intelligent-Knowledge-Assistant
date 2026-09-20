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
import TextCursor from "@/components/reactbits/TextCursor";

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
    if (typeof window !== "undefined") {
      localStorage.removeItem("knowra_demo_session");
      sessionStorage.removeItem("knowra_demo_session");
    }
    await supabase.auth.signOut();
    void navigate({ to: "/auth" });
  }

  return (
    <CollectionProvider>
      <div className="bg-[#fcfbf9] text-neutral-900 font-['Space_Grotesk',sans-serif] min-h-screen relative overflow-x-hidden">
        {/* Interactive TextCursor Trail from React Bits */}
        <TextCursor text="AI" spacing={75} maxPoints={6} />
        
        {/* Editorial Floating Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-neutral-200 bg-white/90 px-6 backdrop-blur-md shadow-sm">
          <button
            className="text-neutral-600 hover:text-black -ml-1 p-2 md:hidden"
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
            className="text-neutral-500 hover:border-neutral-400 hover:text-black mx-auto flex h-10 w-full max-w-md items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50/80 px-4 text-xs font-medium transition-colors shadow-inner"
          >
            <CommandIcon className="size-3.5 text-[#ff4500]" />
            <span>Search knowledge, passages & documents...</span>
            <kbd className="ml-auto hidden font-mono text-[10px] bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full font-bold sm:block">⌘K</kbd>
          </button>
          <Button variant="ghost" size="sm" onClick={signOut} className="rounded-full hover:bg-neutral-100 text-neutral-700 font-medium text-xs gap-1.5" aria-label="Sign out">
            <LogOut className="size-4 text-[#ff4500]" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </header>

        <div className="flex max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          {/* Desktop sidebar */}
          <nav
            className={cn(
              "bg-white fixed inset-y-16 left-0 z-20 w-64 shrink-0 border-r border-neutral-200 p-4 md:sticky md:top-20 md:block md:h-[calc(100vh-6rem)] rounded-3xl shadow-sm md:border",
              mobileNavOpen ? "block" : "hidden",
            )}
          >
            <p className="font-['Chakra_Petch',sans-serif] text-[11px] font-bold tracking-widest uppercase text-[#ff4500] px-3 py-2">
              KNOWLEDGE WORKSPACE
            </p>
            <ul className="mt-2 space-y-1.5">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      "flex min-h-12 items-center gap-3 rounded-2xl px-4 text-xs font-bold transition-all",
                      isActive(item.to, item.exact)
                        ? "bg-neutral-950 text-white font-['Chakra_Petch',sans-serif] tracking-wider shadow-md"
                        : "text-neutral-600 hover:text-black hover:bg-neutral-100/80 font-['Space_Grotesk',sans-serif]",
                    )}
                  >
                    <item.icon className={cn("size-4", isActive(item.to, item.exact) ? "text-[#ff4500]" : "text-neutral-500")} />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <main className="min-w-0 flex-1 pl-0 md:pl-8 pb-20 md:pb-0">
            <Outlet />
          </main>
        </div>

        {/* Mobile bottom navigation */}
        <nav className="border-t border-neutral-200 bg-white/95 backdrop-blur-md fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 md:hidden shadow-lg">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] font-bold",
                isActive(item.to, item.exact) ? "text-[#ff4500]" : "text-neutral-500",
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
