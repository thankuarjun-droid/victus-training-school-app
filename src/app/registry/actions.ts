"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentStaff } from "@/lib/auth";
import { parseTraineeCsv } from "@/lib/registry";
import { staffRoles, type StaffRole } from "@/lib/roles";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase";

function optionalString(value: FormDataEntryValue | null): string | null {
  const stringValue = String(value ?? "").trim();
  return stringValue || null;
}

function requireString(value: FormDataEntryValue | null, status: string): string {
  const stringValue = optionalString(value);
  if (!stringValue) {
    redirect(`/registry?status=${status}`);
  }
  return stringValue;
}

function optionalNumber(value: FormDataEntryValue | null): number | null {
  const stringValue = optionalString(value);
  if (!stringValue) {
    return null;
  }
  const parsed = Number(stringValue);
  return Number.isFinite(parsed) ? parsed : null;
}

function isWriteRole(role: StaffRole | undefined): boolean {
  return role === "coordinator" || role === "it";
}

async function requireRegistryWriter(): Promise<void> {
  const staff = await getCurrentStaff();
  if (!isWriteRole(staff?.role)) {
    redirect("/registry?status=write-restricted");
  }
}

export async function createBatch(formData: FormData): Promise<void> {
  if (!hasSupabaseConfig()) {
    redirect("/registry?status=missing-supabase-config");
  }
  await requireRegistryWriter();

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("batches").upsert(
    {
      batch_no: requireString(formData.get("batch_no"), "missing-batch-no"),
      start_date: optionalString(formData.get("start_date")),
      room: optionalString(formData.get("room")),
      capacity: optionalNumber(formData.get("capacity")),
      trainer_id: optionalString(formData.get("trainer_id")),
      status: "active",
    },
    { onConflict: "batch_no" },
  );

  if (error) {
    redirect("/registry?status=batch-save-failed");
  }

  revalidatePath("/registry");
  redirect("/registry?status=batch-saved");
}

export async function createTrainee(formData: FormData): Promise<void> {
  if (!hasSupabaseConfig()) {
    redirect("/registry?status=missing-supabase-config");
  }
  await requireRegistryWriter();

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("trainees").upsert(
    {
      emp_code: optionalString(formData.get("emp_code")),
      name: requireString(formData.get("name"), "missing-trainee-name"),
      gender: optionalString(formData.get("gender")),
      dob: optionalString(formData.get("dob")),
      join_date: optionalString(formData.get("join_date")),
      phone: optionalString(formData.get("phone")),
      batch_id: optionalString(formData.get("batch_id")),
      assigned_operation_id: optionalString(formData.get("assigned_operation_id")),
      assigned_trainer_id: optionalString(formData.get("assigned_trainer_id")),
      status: "active",
    },
    { onConflict: "emp_code" },
  );

  if (error) {
    redirect("/registry?status=trainee-save-failed");
  }

  revalidatePath("/registry");
  redirect("/registry?status=trainee-saved");
}

export async function bulkAddTrainees(formData: FormData): Promise<void> {
  if (!hasSupabaseConfig()) {
    redirect("/registry?status=missing-supabase-config");
  }
  await requireRegistryWriter();

  const rows = parseTraineeCsv(String(formData.get("bulk_rows") ?? ""));
  const batchId = optionalString(formData.get("batch_id"));
  const trainerId = optionalString(formData.get("assigned_trainer_id"));
  const operationId = optionalString(formData.get("assigned_operation_id"));
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("trainees").upsert(
    rows.map((row) => ({
      emp_code: row.empCode,
      name: row.name,
      phone: row.phone,
      batch_id: batchId,
      assigned_trainer_id: trainerId,
      assigned_operation_id: operationId,
      status: "active" as const,
    })),
    { onConflict: "emp_code" },
  );

  if (error) {
    redirect("/registry?status=bulk-save-failed");
  }

  revalidatePath("/registry");
  redirect(`/registry?status=bulk-saved&count=${rows.length}`);
}

export async function createStaff(formData: FormData): Promise<void> {
  if (!hasSupabaseConfig()) {
    redirect("/registry?status=missing-supabase-config");
  }
  const currentStaff = await getCurrentStaff();
  if (currentStaff?.role !== "it") {
    redirect("/registry?status=staff-write-restricted");
  }

  const role = String(formData.get("role") ?? "");
  if (!staffRoles.includes(role as StaffRole)) {
    redirect("/registry?status=invalid-role");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("staff").insert({
    name: requireString(formData.get("name"), "missing-staff-name"),
    phone: optionalString(formData.get("phone")),
    role: role as StaffRole,
    active: true,
  });

  if (error) {
    redirect("/registry?status=staff-save-failed");
  }

  revalidatePath("/registry");
  redirect("/registry?status=staff-saved");
}
