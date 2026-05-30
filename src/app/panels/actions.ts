"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentStaff, type CurrentStaff } from "@/lib/auth";
import { canIssuePanels, type PanelTxnType } from "@/lib/panels";
import type { StaffRole } from "@/lib/roles";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase";

function optionalString(value: FormDataEntryValue | null): string | null {
  const stringValue = String(value ?? "").trim();
  return stringValue || null;
}

function requireString(value: FormDataEntryValue | null, status: string): string {
  const stringValue = optionalString(value);
  if (!stringValue) {
    redirect(`/panels?status=${status}`);
  }
  return stringValue;
}

function requireQty(value: FormDataEntryValue | null): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    redirect("/panels?status=invalid-quantity");
  }
  return parsed;
}

function canWritePanels(role: StaffRole | undefined): boolean {
  return role === "school_trainer" || role === "coordinator" || role === "it";
}

async function requirePanelWriter(): Promise<CurrentStaff> {
  const staff = await getCurrentStaff();
  if (!staff || !canWritePanels(staff.role)) {
    redirect("/panels?status=write-restricted");
  }
  return staff;
}

async function getPanelBalance(panelTypeId: string): Promise<number> {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from("v_panel_balance").select("balance").eq("panel_type_id", panelTypeId).single();
  return Number(data?.balance ?? 0);
}

export async function recordPanelTransaction(formData: FormData): Promise<void> {
  if (!hasSupabaseConfig()) {
    redirect("/panels?status=missing-supabase-config");
  }

  const staff = await requirePanelWriter();
  const txnType = requireString(formData.get("txn_type"), "missing-txn-type") as PanelTxnType;
  const panelTypeId = requireString(formData.get("panel_type_id"), "missing-panel-type");
  const qty = requireQty(formData.get("qty"));

  if (["issue", "reissue", "scrap"].includes(txnType)) {
    const balance = await getPanelBalance(panelTypeId);
    if (!canIssuePanels(balance, qty)) {
      redirect(`/panels?status=insufficient-balance&balance=${balance}`);
    }
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("panel_transactions").insert({
    txn_type: txnType,
    panel_type_id: panelTypeId,
    qty,
    received_from: optionalString(formData.get("received_from")),
    cutting_ref: optionalString(formData.get("cutting_ref")),
    trainee_id: optionalString(formData.get("trainee_id")),
    operation_id: optionalString(formData.get("operation_id")),
    from_operation_id: optionalString(formData.get("from_operation_id")),
    staff_id: staff.id,
    condition: optionalString(formData.get("condition")),
    notes: optionalString(formData.get("notes")),
  });

  if (error) {
    redirect("/panels?status=transaction-failed");
  }

  revalidatePath("/panels");
  redirect("/panels?status=transaction-saved");
}
