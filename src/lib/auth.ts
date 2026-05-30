import { redirect } from "next/navigation";

import { hasSupabaseConfig, createSupabaseServerClient } from "@/lib/supabase";
import { isStaffRole, type StaffRole } from "@/lib/roles";

export type CurrentStaff = {
  id: string;
  name: string;
  role: StaffRole;
};

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

  const { data, error } = await supabase
    .from("staff")
    .select("id,name,role")
    .eq("auth_uid", user.id)
    .eq("active", true)
    .single();

  if (error || !data || !isStaffRole(data.role)) {
    return null;
  }

  return { id: data.id, name: data.name, role: data.role };
}

export async function requireCurrentStaff(): Promise<CurrentStaff> {
  const staff = await getCurrentStaff();
  if (!staff) {
    redirect("/login");
  }
  return staff;
}
