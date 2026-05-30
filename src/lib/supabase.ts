import { createBrowserClient, createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/db";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function hasSupabaseConfig(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

function requireSupabaseConfig(): { url: string; anonKey: string } {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}

export function createSupabaseBrowserClient() {
  const { url, anonKey } = requireSupabaseConfig();
  return createBrowserClient<Database>(url, anonKey);
}

function safelySetServerCookie(
  cookieStore: ReturnType<typeof cookies>,
  name: string,
  value: string,
  options: CookieOptions,
) {
  try {
    cookieStore.set({ name, value, ...options });
  } catch {
    // Server Components can read cookies but cannot write refreshed Supabase
    // session cookies. Middleware/Server Actions run in writable contexts and
    // will persist the refresh instead.
  }
}

export function createSupabaseServerClient() {
  const { url, anonKey } = requireSupabaseConfig();
  const cookieStore = cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        safelySetServerCookie(cookieStore, name, value, options);
      },
      remove(name: string, options: CookieOptions) {
        safelySetServerCookie(cookieStore, name, "", options);
      },
    },
  });
}
