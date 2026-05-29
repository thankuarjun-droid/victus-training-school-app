import type { CopyKey } from "./i18n";

export const staffRoles = [
  "school_trainer",
  "ojt_coach",
  "lpi_coach",
  "mechanic",
  "coordinator",
  "it",
  "leadership",
] as const;

export type StaffRole = (typeof staffRoles)[number];

export type NavItem = {
  href: string;
  labelKey: CopyKey;
};

export const roleNav: Record<StaffRole, NavItem[]> = {
  school_trainer: [
    { href: "/time-study", labelKey: "timeStudy" },
    { href: "/panels", labelKey: "panels" },
    { href: "/batches", labelKey: "batch" },
  ],
  ojt_coach: [{ href: "/dashboard", labelKey: "dashboard" }],
  lpi_coach: [{ href: "/dashboard", labelKey: "dashboard" }],
  mechanic: [{ href: "/dashboard", labelKey: "dashboard" }],
  coordinator: [
    { href: "/dashboard", labelKey: "dashboard" },
    { href: "/time-study", labelKey: "timeStudy" },
    { href: "/panels", labelKey: "panels" },
    { href: "/batches", labelKey: "batch" },
  ],
  it: [
    { href: "/dashboard", labelKey: "dashboard" },
    { href: "/time-study", labelKey: "timeStudy" },
    { href: "/panels", labelKey: "panels" },
    { href: "/batches", labelKey: "batch" },
  ],
  leadership: [{ href: "/dashboards", labelKey: "leadershipDashboards" }],
};

export function isStaffRole(value: string | null | undefined): value is StaffRole {
  return staffRoles.includes(value as StaffRole);
}
