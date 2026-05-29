"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { staffRoles, type StaffRole } from "@/lib/roles";
import { useLanguage } from "./language-provider";

export function RolePreview() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { text } = useLanguage();
  const selectedRole = (searchParams.get("role") as StaffRole | null) ?? "school_trainer";

  return (
    <label className="flex flex-col gap-2 text-sm font-semibold text-navy sm:max-w-xs">
      <span>{text("demoRole")}</span>
      <select
        className="rounded-2xl border border-navy/20 bg-white px-4 py-3 shadow-sm"
        value={selectedRole}
        onChange={(event) => router.push(`?role=${event.target.value}`)}
      >
        {staffRoles.map((role) => (
          <option key={role} value={role}>
            {text(role)}
          </option>
        ))}
      </select>
    </label>
  );
}
