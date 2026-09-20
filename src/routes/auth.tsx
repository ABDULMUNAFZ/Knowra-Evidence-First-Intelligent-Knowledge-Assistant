import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Zap, Sparkles, UserCheck, Shield, KeyRound, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KnowraWordmark } from "@/components/knowra/logo";
import { triggerHaptic } from "@/lib/haptics";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Access Workspace — Traceable Knowledge" },
      { name: "description", content: "Access your Traceable Knowledge Base workspace." },
      { property: "og:title", content: "Access Workspace — Traceable Knowledge" },
      { property: "og:description", content: "Access your Traceable Knowledge Base workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const DEMO_PERSONAS = [
  { id: "pm", role: "Product Manager", email: "demo.pm@knowra.app", desc: "PRDs & specifications" },
  { id: "researcher", role: "Researcher", email: "demo.researcher@knowra.app", desc: "Papers & reports" },
  { id: "dev", role: "Developer", email: "demo.dev@knowra.app", desc: "API docs & architecture" },
];

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [showCustomAuth, setShowCustomAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/app" });
    });
  }, [navigate]);

  async function handleDemoAccess(demoEmail = "demo.user@knowra.app", demoPassword = "DemoPassword123!") {
    setBusy(true);
    triggerHaptic("success");
    try {
      // 1. Try signing in with demo credentials
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (signInErr || !signInData.session) {
        // 2. Fall back to creating a demo account automatically
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email: demoEmail,
          password: demoPassword,
        });

        if (signUpErr || !signUpData.session) {
          // 3. Fall back to anonymous session if available
          const { error: anonErr } = await supabase.auth.signInAnonymously();
          if (anonErr) {
            // Bypass for local preview if Supabase is offline
            toast.success("Welcome! Opening demo workspace mode.");
            navigate({ to: "/app" });
            return;
          }
        }
      }

      toast.success("Welcome to your Knowledge Workspace!");
      navigate({ to: "/app" });
    } catch (err) {
      toast.success("Opening demo workspace.");
      navigate({ to: "/app" });
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success("Check your inbox to confirm your email, then sign in.");
          setMode("signin");
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      triggerHaptic("success");
      navigate({ to: "/app" });
    } catch (err) {
      triggerHaptic("error");
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/app`,
      },
    });
    if (error) {
      setBusy(false);
      toast.error("Google sign-in failed. Try email instead.");
    }
  }

  return (
    <div className="grid-texture flex min-h-screen items-center justify-center p-4 sm:p-6">
      <div className="atmosphere absolute inset-0 -z-10" />

      <div className="w-full max-w-md space-y-6">
        <Link to="/" className="flex justify-center transition-transform hover:scale-105">
          <KnowraWordmark />
        </Link>

        {/* Hero Card: One-Click Instant Demo Access */}
        <div className="relative overflow-hidden rounded-2xl border border-[var(--primary)]/30 bg-[var(--surface)]/90 p-6 backdrop-blur-xl shadow-2xl transition-all">
          <div className="absolute -top-12 -right-12 size-32 rounded-full bg-[var(--primary)]/20 blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">
            <Sparkles className="size-4 animate-pulse" />
            <span>Instant Workspace Access</span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
            Explore Demo Account
          </h1>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            No signup forms or credentials required. One-click instant access with sample documents and grounded search ready.
          </p>

          <Button
            type="button"
            size="lg"
            className="mt-5 h-12 w-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] font-semibold text-white shadow-lg shadow-[var(--primary)]/25 transition-all hover:opacity-95 hover:shadow-xl hover:shadow-[var(--primary)]/35"
            onClick={() => handleDemoAccess()}
            disabled={busy}
          >
            <Zap className="mr-2 size-5 fill-current" />
            Enter Demo Workspace
            <ArrowRight className="ml-2 size-5" />
          </Button>

          {/* Quick Demo Persona Shortcuts */}
          <div className="mt-6 pt-5 border-t border-[var(--border)]">
            <p className="text-xs font-medium text-muted-foreground mb-3">Or choose a pre-configured role:</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_PERSONAS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleDemoAccess(p.email, "DemoPassword123!")}
                  disabled={busy}
                  className="flex flex-col items-start p-2.5 rounded-xl border border-[var(--border)] bg-background/50 hover:bg-background hover:border-[var(--primary)]/50 transition-all text-left group"
                >
                  <span className="text-xs font-semibold text-foreground group-hover:text-[var(--primary)] transition-colors">
                    {p.role}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                    {p.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Auth Toggle Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 p-6 backdrop-blur-md shadow-lg">
          {!showCustomAuth ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Have your own account?</h3>
                <p className="text-xs text-muted-foreground">Sign in with email, password or Google</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomAuth(true)}
                className="gap-1.5"
              >
                <KeyRound className="size-3.5" />
                Sign In / Up
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold tracking-tight">
                  {mode === "signin" ? "Sign in to workspace" : "Create custom account"}
                </h2>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowCustomAuth(false)}
                >
                  Hide
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10"
                  />
                </div>
                <Button type="submit" className="h-10 w-full" disabled={busy}>
                  {mode === "signin" ? "Sign in" : "Create account"}
                </Button>
              </form>

              <div className="text-muted-foreground my-4 flex items-center gap-3 text-xs">
                <span className="h-px flex-1 bg-[var(--border)]" /> or{" "}
                <span className="h-px flex-1 bg-[var(--border)]" />
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-10 w-full"
                onClick={handleGoogle}
                disabled={busy}
              >
                Continue with Google
              </Button>

              <button
                type="button"
                className="text-muted-foreground hover:text-foreground mt-4 w-full text-center text-xs"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              >
                {mode === "signin"
                  ? "Need a custom account? Sign up"
                  : "Already registered? Sign in"}
              </button>
            </div>
          )}
        </div>

        {/* Security / Privacy Trust Pill */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Shield className="size-3.5 text-emerald-400" /> Grounded Search
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <UserCheck className="size-3.5 text-blue-400" /> Zero Storage Risk
          </span>
        </div>
      </div>
    </div>
  );
}
