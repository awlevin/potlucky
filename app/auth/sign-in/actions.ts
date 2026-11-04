"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { SITE_URL, safeNextPath } from "@/lib/site";

export type SignInState = {
  status: "idle" | "sent" | "error";
  email?: string;
  error?: string;
};

export async function sendMagicLink(
  _prev: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const next = safeNextPath(String(formData.get("next") ?? "/"));

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", error: "That email doesn't look right." };
  }

  // Build the link from our own configured URL, never from request headers:
  // a forged Origin/Host would otherwise point the emailed link elsewhere.
  const emailRedirectTo = `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`;

  const supabase = createServerSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo },
  });

  if (error) {
    return { status: "error", error: error.message };
  }

  return { status: "sent", email };
}
