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
    { href: "/master-data", labelKey: "masterData" },
    { href: "/time-study", labelKey: "timeStudy" },
    { href: "/panels", labelKey: "panels" },
    { href: "/registry", labelKey: "registry" },
  ],
  ojt_coach: [
    { href: "/master-data", labelKey: "masterData" },
    { href: "/registry", labelKey: "registry" },
    { href: "/dashboard", labelKey: "dashboard" },
  ],
  lpi_coach: [
    { href: "/master-data", labelKey: "masterData" },
    { href: "/registry", labelKey: "registry" },
    { href: "/dashboard", labelKey: "dashboard" },
  ],
  mechanic: [
    { href: "/master-data", labelKey: "masterData" },
    { href: "/registry", labelKey: "registry" },
    { href: "/dashboard", labelKey: "dashboard" },
  ],
  coordinator: [
    { href: "/dashboard", labelKey: "dashboard" },
    { href: "/master-data", labelKey: "masterData" },
    { href: "/time-study", labelKey: "timeStudy" },
    { href: "/panels", labelKey: "panels" },
    { href: "/registry", labelKey: "registry" },
    { href: "/dashboards", labelKey: "leadershipDashboards" },
  ],
  it: [
    { href: "/dashboard", labelKey: "dashboard" },
    { href: "/master-data", labelKey: "masterData" },
    { href: "/time-study", labelKey: "timeStudy" },
    { href: "/panels", labelKey: "panels" },
    { href: "/registry", labelKey: "registry" },
    { href: "/dashboards", labelKey: "leadershipDashboards" },
  ],
  leadership: [
    { href: "/master-data", labelKey: "masterData" },
    { href: "/registry", labelKey: "registry" },
    { href: "/dashboards", labelKey: "leadershipDashboards" },
  ],
};

export const protectedRouteRoles = {
  dashboards: ["leadership"],
} as const satisfies Record<string, readonly StaffRole[]>;

export function isStaffRole(value: string | null | undefined): value is StaffRole {
  return staffRoles.includes(value as StaffRole);
}
