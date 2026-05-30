import { redirect } from "next/navigation";

import { hasSupabaseConfig, createSupabaseServerClient } from "@/lib/supabase";
import { isStaffRole, type StaffRole } from "@/lib/roles";

export type CurrentStaff = {
  id: string;
  name: string;
  role: StaffRole;
};

type StaffCandidate = {
  id?: string | null;
  name?: string | null;
  role?: string | null;
};

function toCurrentStaff(data: StaffCandidate | null): CurrentStaff | null {
  if (!data?.id || !data.name || !isStaffRole(data.role)) {
    return null;
  }

  return { id: data.id, name: data.name, role: data.role };
}

export async function getCurrentStaff(): Promise<CurrentStaff | null> {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("staff")
    .select("id,name,role")
    .eq("auth_uid", user.id)
    .eq("active", true)
    .single();

  const currentStaff = toCurrentStaff(data);
  if (currentStaff) {
    return currentStaff;
  }

  const { data: bootstrappedStaff } = await supabase.rpc("claim_bootstrap_it_staff");

  return toCurrentStaff(bootstrappedStaff);
}

export async function requireCurrentStaff(): Promise<CurrentStaff> {
  const staff = await getCurrentStaff();
  if (!staff) {
    redirect("/login");
  }
  return staff;
}

export async function requireStaffRole(allowedRoles: readonly StaffRole[]): Promise<CurrentStaff> {
  const staff = await requireCurrentStaff();

  if (!allowedRoles.includes(staff.role)) {
    redirect("/dashboard");
  }

  return staff;
}
