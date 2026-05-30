import { Suspense } from "react";

import { signIn } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Text } from "@/components/text";
import { hasSupabaseConfig } from "@/lib/supabase";

export default function LoginPage() {
  const readyForLiveLogin = hasSupabaseConfig();

  return (
    <Suspense>
      <AppShell>
        <div className="mx-auto max-w-md rounded-3xl border border-navy/10 bg-white p-6 shadow-xl">
          <Text as="h1" className="text-3xl font-black text-navy" copyKey="login" />
          {!readyForLiveLogin ? (
            <Text as="p" className="mt-3 rounded-2xl bg-gold/15 p-3 text-sm font-semibold text-navy" copyKey="noSupabase" />
          ) : null}
          <form action={signIn} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold text-navy">
              <Text copyKey="email" />
              <input
                className="mt-2 w-full rounded-2xl border border-navy/20 px-4 py-3"
                name="email"
                required
                type="email"
              />
            </label>
            <label className="block text-sm font-semibold text-navy">
              <Text copyKey="password" />
              <input
                className="mt-2 w-full rounded-2xl border border-navy/20 px-4 py-3"
                name="password"
                required
                type="password"
              />
            </label>
            <button className="w-full rounded-2xl bg-navy px-4 py-3 font-black text-white" type="submit">
              <Text copyKey="signIn" />
            </button>
          </form>
          <Text as="p" className="mt-4 text-sm leading-6 text-slate-600" copyKey="phoneLoginNote" />
        </div>
      </AppShell>
    </Suspense>
  );
}
