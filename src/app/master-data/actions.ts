"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { dedupeByConflictKey, parseObCsv, summarizeImportedOperations } from "@/lib/master-data";
import { createSupabaseServerClient, hasSupabaseConfig } from "@/lib/supabase";

export async function importObCsv(formData: FormData): Promise<void> {
  if (!hasSupabaseConfig()) {
    redirect("/master-data?status=missing-supabase-config");
  }

  const csv = String(formData.get("csv") ?? "").trim();
  const rows = parseObCsv(csv);
  const summary = summarizeImportedOperations(rows);
  const supabase = createSupabaseServerClient();

  const { data: style, error: styleError } = await supabase
    .from("styles")
    .upsert(
      {
        code: "RONNY",
        name: "Round Neck T-shirt",
        garment_type: "T-shirt",
        size: "M",
        gsd_ob_ratio: 71,
      },
      { onConflict: "code" },
    )
    .select("id")
    .single();

  if (styleError || !style) {
    redirect("/master-data?status=style-import-failed");
  }

  const { data: machineTypes, error: machineError } = await supabase.from("machine_types").select("id,code");
  if (machineError || !machineTypes) {
    redirect("/master-data?status=machine-load-failed");
  }

  const machineIdByCode = new Map(machineTypes.map((machineType) => [machineType.code, machineType.id]));
  const operationRows = Array.from(new Map(rows.map((row) => [row.opNo, row])).values());

  const { data: operations, error: operationError } = await supabase
    .from("operations")
    .upsert(
      operationRows.map((row) => ({
        style_id: style.id,
        op_no: row.opNo,
        name_en: row.nameEn,
        name_ta: row.nameTa,
        machine_type_id: row.machineCode ? machineIdByCode.get(row.machineCode) ?? null : null,
        smv_min: row.smvMin,
        sam_min: row.samMin,
        sequence: row.opNo,
      })),
      { onConflict: "style_id,op_no" },
    )
    .select("id,op_no");

  if (operationError || !operations) {
    redirect("/master-data?status=operation-import-failed");
  }

  const operationIdByOpNo = new Map(operations.map((operation) => [operation.op_no, operation.id]));
  const stepRows = dedupeByConflictKey(
    rows
      .filter((row) => row.stepNo !== null && row.stepDescriptionEn && row.stepDescriptionTa)
      .map((row) => ({
        operation_id: operationIdByOpNo.get(row.opNo) ?? null,
        step_no: row.stepNo ?? 0,
        description_en: row.stepDescriptionEn,
        description_ta: row.stepDescriptionTa,
        instruction_en: row.stepDescriptionEn,
        instruction_ta: row.stepDescriptionTa,
      }))
      .filter((row) => row.operation_id),
    (row) => (row.operation_id ? `${row.operation_id}:${row.step_no}` : null),
  );

  if (stepRows.length > 0) {
    const { error } = await supabase.from("operation_steps").upsert(stepRows, { onConflict: "operation_id,step_no" });
    if (error) {
      redirect("/master-data?status=step-import-failed");
    }
  }

  const checkpointRows = dedupeByConflictKey(
    rows
      .filter((row) => row.checkpointNo !== null && row.checkpointEn && row.checkpointTa)
      .map((row) => ({
        operation_id: operationIdByOpNo.get(row.opNo) ?? null,
        checkpoint_no: row.checkpointNo ?? 0,
        description_en: row.checkpointEn ?? "",
        description_ta: row.checkpointTa ?? "",
        check_method: null,
        tolerance: null,
      }))
      .filter((row) => row.operation_id),
    (row) => (row.operation_id ? `${row.operation_id}:${row.checkpoint_no}` : null),
  );

  if (checkpointRows.length > 0) {
    const { error } = await supabase
      .from("quality_checkpoints")
      .upsert(checkpointRows, { onConflict: "operation_id,checkpoint_no" });
    if (error) {
      redirect("/master-data?status=checkpoint-import-failed");
    }
  }

  const skillRows = dedupeByConflictKey(
    rows
      .filter((row) => row.skillKey)
      .map((row) => ({
        operation_id: operationIdByOpNo.get(row.opNo) ?? null,
        attr_key: row.skillKey ?? "",
        attr_value: row.skillValue,
        exercise_stage: row.exerciseStage,
      }))
      .filter((row) => row.operation_id),
    (row) => (row.operation_id ? `${row.operation_id}:${row.attr_key}:${row.exercise_stage ?? ""}` : null),
  );

  if (skillRows.length > 0) {
    const { error } = await supabase
      .from("operation_skill_attrs")
      .upsert(skillRows, { onConflict: "operation_id,attr_key,exercise_stage" });
    if (error) {
      redirect("/master-data?status=skill-import-failed");
    }
  }

  revalidatePath("/master-data");
  redirect(
    `/master-data?status=imported&operations=${summary.operationCount}&locked=${summary.lockedSmvCount}&pending=${summary.pendingImportCount}`,
  );
}
