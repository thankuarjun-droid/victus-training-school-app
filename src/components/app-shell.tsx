"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

import { roleNav, staffRoles, type StaffRole } from "@/lib/roles";
import { useLanguage } from "./language-provider";
import { LanguageToggle } from "./language-toggle";

type AppShellProps = {
  children: ReactNode;
  role?: StaffRole | null;
  staffName?: string | null;
  signOutAction?: () => void;
};

export function AppShell({ children, role, staffName, signOutAction }: AppShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { text } = useLanguage();
  const previewRole = searchParams.get("role");
  const activeRole: StaffRole = role ?? (staffRoles.includes(previewRole as StaffRole) ? (previewRole as StaffRole) : "school_trainer");
  const navItems = roleNav[activeRole];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-950">
      <header className="border-b border-navy/10 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="space-y-1">
            <p className="text-lg font-black text-navy">{text("appName")}</p>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{text("phaseBadge")}</p>
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageToggle />
            {staffName ? <span className="rounded-full bg-green/10 px-3 py-2 text-sm font-semibold text-green">{staffName}</span> : null}
            {signOutAction ? (
              <form action={signOutAction}>
                <button className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white" type="submit">
                  {text("signOut")}
                </button>
              </form>
            ) : null}
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-4">
          {navItems.map((item) => (
            <Link
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
                pathname === item.href ? "bg-navy text-white" : "bg-navy/5 text-navy hover:bg-navy/10"
              }`}
              href={item.href}
              key={item.href}
            >
              {text(item.labelKey)}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      <footer className="border-t border-navy/10 bg-white px-4 py-5 text-center text-sm font-semibold text-navy">
        {text("partnership")}
      </footer>
    </div>
  );
}
