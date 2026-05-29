"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase";

export async function signIn(formData: FormData): Promise<void> {
  if (!hasSupabaseConfig()) {
    redirect("/login?message=missing-supabase-config");
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/login?message=login-failed");
  }

  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  if (hasSupabaseConfig()) {
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
