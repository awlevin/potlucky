"use server";

import { headers } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";

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
  const next = String(formData.get("next") ?? "/");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: "error", error: "That email doesn't look right." };
  }

  const origin = headers().get("origin") ?? headers().get("host");
  const emailRedirectTo = origin
    ? `${origin.startsWith("http") ? "" : "https://"}${origin}/auth/callback?next=${encodeURIComponent(next)}`
    : undefined;

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
