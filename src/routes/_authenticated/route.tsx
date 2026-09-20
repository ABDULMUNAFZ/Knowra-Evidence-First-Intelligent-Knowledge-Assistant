import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // 1. Check active Supabase user session
    const { data, error } = await supabase.auth.getUser();
    if (data?.user) {
      return { user: data.user };
    }

    // 2. Check local demo session fallback
    if (typeof window !== "undefined") {
      const demoSession = localStorage.getItem("knowra_demo_session") || sessionStorage.getItem("knowra_demo_session");
      if (demoSession) {
        try {
          const parsed = JSON.parse(demoSession);
          return {
            user: {
              id: parsed.id || "demo-user-id",
              email: parsed.email || "demo@gmail.com",
              user_metadata: { name: "Demo Account" },
            },
          };
        } catch {
          // invalid json, fallback
        }
      }
    }

    // 3. Redirect to auth if neither session is present
    throw redirect({ to: "/auth" });
  },
  component: () => <Outlet />,
});
