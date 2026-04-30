"use client";

import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Auto-sign-in anonymously when there's no session. This gives every
    // visitor a stable auth.uid() so RLS-gated mutations work without an
    // email round-trip. They keep the option to upgrade to a real
    // email/phone identity via /auth/sign-in (linkIdentity preserves
    // their data). Drop this block once phone OTP makes the auth UX
    // friction-free and we want to require real identities.
    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (data.session) {
        setSession(data.session);
        setIsLoading(false);
        return;
      }
      const { data: anon, error } = await supabase.auth.signInAnonymously();
      if (!mounted) return;
      if (error) {
        console.error("[auth] anonymous sign-in failed", error);
      }
      setSession(anon?.session ?? null);
      setIsLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isLoading,
      signOut: async () => {
        await fetch("/auth/sign-out", { method: "POST" });
        window.location.reload();
      },
    }),
    [session, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
