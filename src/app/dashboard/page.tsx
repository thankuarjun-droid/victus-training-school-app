import { Suspense } from "react";

import { signOut } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { RolePreview } from "@/components/role-preview";
import { Text } from "@/components/text";
import { getCurrentStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const staff = await getCurrentStaff();

  return (
    <Suspense>
      <AppShell role={staff?.role} staffName={staff?.name} signOutAction={staff ? signOut : undefined}>
        <section className="rounded-3xl border border-navy/10 bg-white p-6 shadow-sm">
          <Text as="h1" className="text-3xl font-black text-navy" copyKey="roleGate" />
          <Text as="p" className="mt-3 max-w-2xl text-slate-600" copyKey="heroBody" />
        </section>
        {!staff ? (
          <section className="mt-6 rounded-3xl border border-gold/40 bg-gold/10 p-5">
            <Text as="p" className="mb-4 text-sm font-semibold text-navy" copyKey="noSupabase" />
            <RolePreview />
          </section>
        ) : null}
      </AppShell>
    </Suspense>
  );
}
