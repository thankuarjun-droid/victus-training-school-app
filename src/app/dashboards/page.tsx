import { Suspense } from "react";

import { signOut } from "@/app/actions";
import { AppShell } from "@/components/app-shell";
import { Text } from "@/components/text";
import { requireStaffRole } from "@/lib/auth";
import { protectedRouteRoles } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function RoutePage() {
  const staff = await requireStaffRole(protectedRouteRoles.dashboards);

  return (
    <Suspense>
      <AppShell role={staff?.role} staffName={staff?.name} signOutAction={staff ? signOut : undefined}>
        <section className="rounded-3xl border border-navy/10 bg-white p-6 shadow-sm">
          <Text as="h1" className="text-3xl font-black text-navy" copyKey="leadershipDashboards" />
          <Text as="p" className="mt-3 text-slate-600" copyKey="comingSoon" />
        </section>
      </AppShell>
    </Suspense>
  );
}
