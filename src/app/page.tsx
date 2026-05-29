import { Suspense } from "react";

import { AppShell } from "@/components/app-shell";
import { RolePreview } from "@/components/role-preview";
import { Text } from "@/components/text";

const cards = [
  ["supabaseWiredTitle", "supabaseWiredBody"],
  ["roleGatesTitle", "roleGatesBody"],
  ["ronnySeedTitle", "ronnySeedBody"],
] as const;

export default function HomePage() {
  return (
    <Suspense>
      <AppShell>
        <section className="rounded-3xl bg-navy p-6 text-white shadow-xl sm:p-10">
          <Text as="p" className="mb-3 inline-flex rounded-full bg-gold px-3 py-1 text-sm font-black text-navy" copyKey="phaseZero" />
          <Text as="h1" className="text-3xl font-black sm:text-5xl" copyKey="heroTitle" />
          <Text as="p" className="mt-4 max-w-2xl text-lg text-white/85" copyKey="heroBody" />
        </section>
        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {cards.map(([titleKey, bodyKey]) => (
            <article className="rounded-3xl border border-navy/10 bg-white p-5 shadow-sm" key={titleKey}>
              <Text as="h2" className="text-xl font-black text-navy" copyKey={titleKey} />
              <Text as="p" className="mt-2 text-sm leading-6 text-slate-600" copyKey={bodyKey} />
            </article>
          ))}
        </section>
        <section className="mt-6 rounded-3xl border border-gold/40 bg-gold/10 p-5">
          <RolePreview />
        </section>
      </AppShell>
    </Suspense>
  );
}
