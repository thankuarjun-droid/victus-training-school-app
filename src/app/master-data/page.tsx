import { Suspense } from "react";

import { signOut } from "@/app/actions";
import { importObCsv } from "@/app/master-data/actions";
import { AppShell } from "@/components/app-shell";
import { MasterDataPanel } from "@/components/master-data-panel";
import { getCurrentStaff } from "@/lib/auth";
import { hasSupabaseConfig, createSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type SearchParams = {
  status?: string;
  operations?: string;
  locked?: string;
  pending?: string;
};

type OperationView = {
  id: string;
  opNo: number;
  nameEn: string;
  nameTa: string;
  machineCode: string | null;
  smvMin: number | null;
  samMin: number | null;
};

type LoopView = {
  id: string;
  loopNo: number;
  nameEn: string;
  nameTa: string;
  descriptionEn: string | null;
  descriptionTa: string | null;
  targetValue: number | null;
  targetUnit: string | null;
};

const fallbackOperations: OperationView[] = [
  {
    id: "ronny-1",
    opNo: 1,
    nameEn: "Shoulder Join",
    nameTa: "ஷோல்டர் ஜோயின்",
    machineCode: "4T_OL",
    smvMin: 0.413,
    samMin: null,
  },
  {
    id: "ronny-3",
    opNo: 3,
    nameEn: "Neck Rib (Rib Attach)",
    nameTa: "நெக் ரிப் அட்டாச்",
    machineCode: "4T_OL",
    smvMin: 0.627,
    samMin: null,
  },
  {
    id: "ronny-6",
    opNo: 6,
    nameEn: "Sleeve Attach",
    nameTa: "ஸ்லீவ் அட்டாச்",
    machineCode: null,
    smvMin: 0.732,
    samMin: null,
  },
];

const fallbackLoops: LoopView[] = [1, 2, 3, 4, 5].map((loopNo) => ({
  id: `loop-${loopNo}`,
  loopNo,
  nameEn: `Loop ${loopNo}`,
  nameTa: `லூப் ${loopNo}`,
  descriptionEn: `Foundation motor-skill exercise ${loopNo}`,
  descriptionTa: `Foundation motor-skill பயிற்சி ${loopNo}`,
  targetValue: null,
  targetUnit: "pending benchmark import",
}));

async function getMasterData(): Promise<{ operations: OperationView[]; loops: LoopView[] }> {
  if (!hasSupabaseConfig()) {
    return { operations: fallbackOperations, loops: fallbackLoops };
  }

  const supabase = createSupabaseServerClient();
  const [{ data: operations }, { data: loops }, { data: machineTypes }] = await Promise.all([
    supabase
      .from("operations")
      .select("id,op_no,name_en,name_ta,smv_min,sam_min,machine_type_id")
      .order("op_no", { ascending: true }),
    supabase.from("loops").select("id,loop_no,name_en,name_ta,description_en,description_ta,target_value,target_unit").order("loop_no"),
    supabase.from("machine_types").select("id,code"),
  ]);
  const machineCodeById = new Map((machineTypes ?? []).map((machineType) => [machineType.id, machineType.code]));

  return {
    operations:
      operations?.map((operation) => ({
        id: operation.id,
        opNo: operation.op_no,
        nameEn: operation.name_en,
        nameTa: operation.name_ta,
        machineCode: operation.machine_type_id ? machineCodeById.get(operation.machine_type_id) ?? null : null,
        smvMin: operation.smv_min,
        samMin: operation.sam_min,
      })) ?? fallbackOperations,
    loops:
      loops?.map((loop) => ({
        id: loop.id,
        loopNo: loop.loop_no,
        nameEn: loop.name_en,
        nameTa: loop.name_ta,
        descriptionEn: loop.description_en,
        descriptionTa: loop.description_ta,
        targetValue: loop.target_value,
        targetUnit: loop.target_unit,
      })) ?? fallbackLoops,
  };
}

export default async function MasterDataPage({ searchParams }: { searchParams: SearchParams }) {
  const staff = await getCurrentStaff();
  const masterData = await getMasterData();

  return (
    <Suspense>
      <AppShell role={staff?.role} staffName={staff?.name} signOutAction={staff ? signOut : undefined}>
        <MasterDataPanel
          canWrite={staff?.role === "coordinator" || staff?.role === "it"}
          importAction={importObCsv}
          lockedImported={searchParams.locked}
          loops={masterData.loops}
          operations={masterData.operations}
          operationsImported={searchParams.operations}
          pendingImported={searchParams.pending}
          status={searchParams.status}
        />
      </AppShell>
    </Suspense>
  );
}
