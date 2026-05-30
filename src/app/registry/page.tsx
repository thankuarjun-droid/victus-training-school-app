import { Suspense } from "react";

import { signOut } from "@/app/actions";
import { bulkAddTrainees, createBatch, createStaff, createTrainee } from "@/app/registry/actions";
import { AppShell } from "@/components/app-shell";
import { RegistryPanel } from "@/components/registry-panel";
import { getCurrentStaff } from "@/lib/auth";
import type { StaffRole } from "@/lib/roles";
import { hasSupabaseConfig, createSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type SearchParams = {
  status?: string;
  count?: string;
};

type StaffView = {
  id: string;
  name: string;
  role: StaffRole;
  phone: string | null;
};

type BatchView = {
  id: string;
  batchNo: string;
  startDate: string | null;
  room: string | null;
  capacity: number | null;
  trainerId: string | null;
  traineeCount: number;
};

type TraineeView = {
  id: string;
  empCode: string | null;
  name: string;
  phone: string | null;
  batchId: string | null;
  operationId: string | null;
  trainerId: string | null;
  status: string | null;
};

type OperationView = {
  id: string;
  opNo: number;
  nameEn: string;
  nameTa: string;
};

type RegistryData = {
  staff: StaffView[];
  batches: BatchView[];
  trainees: TraineeView[];
  operations: OperationView[];
};

const fallbackStaff: StaffView[] = [
  { id: "staff-trainer", name: "Demo School Trainer", role: "school_trainer", phone: "9000000000" },
  { id: "staff-it", name: "Sudhagar", role: "it", phone: null },
];

const fallbackOperations: OperationView[] = [
  { id: "op-1", opNo: 1, nameEn: "Shoulder Join", nameTa: "ஷோல்டர் ஜோயின்" },
  { id: "op-3", opNo: 3, nameEn: "Neck Rib (Rib Attach)", nameTa: "நெக் ரிப் அட்டாச்" },
  { id: "op-6", opNo: 6, nameEn: "Sleeve Attach", nameTa: "ஸ்லீவ் அட்டாச்" },
];

const fallbackBatches: BatchView[] = [
  {
    id: "batch-demo",
    batchNo: "DEMO-PILOT-001",
    startDate: null,
    room: "Sivagangai Training Room",
    capacity: 25,
    trainerId: "staff-trainer",
    traineeCount: 1,
  },
];

const fallbackTrainees: TraineeView[] = [
  {
    id: "trainee-demo",
    empCode: "DEMO-T001",
    name: "Demo Trainee",
    phone: "9000000000",
    batchId: "batch-demo",
    operationId: "op-1",
    trainerId: "staff-trainer",
    status: "active",
  },
];

async function getRegistryData(): Promise<RegistryData> {
  if (!hasSupabaseConfig()) {
    return {
      staff: fallbackStaff,
      batches: fallbackBatches,
      trainees: fallbackTrainees,
      operations: fallbackOperations,
    };
  }

  const supabase = createSupabaseServerClient();
  const [{ data: staff }, { data: batches }, { data: trainees }, { data: operations }] = await Promise.all([
    supabase.from("staff").select("id,name,role,phone").order("name"),
    supabase.from("batches").select("id,batch_no,start_date,room,capacity,trainer_id,status").order("batch_no"),
    supabase
      .from("trainees")
      .select("id,emp_code,name,phone,batch_id,assigned_operation_id,assigned_trainer_id,status")
      .order("name"),
    supabase.from("operations").select("id,op_no,name_en,name_ta").order("op_no"),
  ]);

  const traineesRows = trainees ?? [];
  const traineeCountByBatch = new Map<string, number>();
  traineesRows.forEach((trainee) => {
    if (trainee.batch_id) {
      traineeCountByBatch.set(trainee.batch_id, (traineeCountByBatch.get(trainee.batch_id) ?? 0) + 1);
    }
  });

  return {
    staff:
      staff?.map((member) => ({
        id: member.id,
        name: member.name,
        role: member.role,
        phone: member.phone,
      })) ?? fallbackStaff,
    batches:
      batches?.map((batchItem) => ({
        id: batchItem.id,
        batchNo: batchItem.batch_no,
        startDate: batchItem.start_date,
        room: batchItem.room,
        capacity: batchItem.capacity,
        trainerId: batchItem.trainer_id,
        traineeCount: traineeCountByBatch.get(batchItem.id) ?? 0,
      })) ?? fallbackBatches,
    trainees:
      traineesRows.map((trainee) => ({
        id: trainee.id,
        empCode: trainee.emp_code,
        name: trainee.name,
        phone: trainee.phone,
        batchId: trainee.batch_id,
        operationId: trainee.assigned_operation_id,
        trainerId: trainee.assigned_trainer_id,
        status: trainee.status,
      })) ?? fallbackTrainees,
    operations:
      operations?.map((operation) => ({
        id: operation.id,
        opNo: operation.op_no,
        nameEn: operation.name_en,
        nameTa: operation.name_ta,
      })) ?? fallbackOperations,
  };
}

export default async function RegistryPage({ searchParams }: { searchParams: SearchParams }) {
  const staff = await getCurrentStaff();
  const registryData = await getRegistryData();
  const canWriteRegistry = staff?.role === "coordinator" || staff?.role === "it";
  const canWriteStaff = staff?.role === "it";

  return (
    <Suspense>
      <AppShell role={staff?.role} staffName={staff?.name} signOutAction={staff ? signOut : undefined}>
        <RegistryPanel
          batches={registryData.batches}
          bulkAddTraineesAction={bulkAddTrainees}
          bulkCount={searchParams.count}
          canWriteRegistry={canWriteRegistry}
          canWriteStaff={canWriteStaff}
          createBatchAction={createBatch}
          createStaffAction={createStaff}
          createTraineeAction={createTrainee}
          operations={registryData.operations}
          staff={registryData.staff}
          status={searchParams.status}
          trainees={registryData.trainees}
        />
      </AppShell>
    </Suspense>
  );
}
