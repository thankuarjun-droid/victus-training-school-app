import { Suspense } from "react";

import { signOut } from "@/app/actions";
import { recordPanelTransaction } from "@/app/panels/actions";
import { AppShell } from "@/components/app-shell";
import { PanelsPanel } from "@/components/panels-panel";
import { getCurrentStaff } from "@/lib/auth";
import type { PanelTxnType } from "@/lib/panels";
import { hasSupabaseConfig, createSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type SearchParams = {
  status?: string;
  balance?: string;
};

type PanelTypeView = {
  id: string;
  nameEn: string;
  nameTa: string | null;
  cascadeOrder: number | null;
  balance: number;
};

type OperationView = {
  id: string;
  opNo: number;
  nameEn: string;
  nameTa: string;
};

type TraineeView = {
  id: string;
  empCode: string | null;
  name: string;
};

type PanelTransactionView = {
  id: string;
  txnType: PanelTxnType;
  panelTypeId: string | null;
  qty: number;
  txnDate: string | null;
  traineeId: string | null;
  operationId: string | null;
  fromOperationId: string | null;
  condition: string | null;
  notes: string | null;
};

type PanelsData = {
  panelTypes: PanelTypeView[];
  operations: OperationView[];
  trainees: TraineeView[];
  transactions: PanelTransactionView[];
};

const fallbackOperations: OperationView[] = [
  { id: "op-1", opNo: 1, nameEn: "Shoulder Join", nameTa: "ஷோல்டர் ஜோயின்" },
  { id: "op-3", opNo: 3, nameEn: "Rib Attach", nameTa: "ரிப் அட்டாச்" },
  { id: "op-4", opNo: 4, nameEn: "Binding Attach", nameTa: "பைண்டிங் அட்டாச்" },
  { id: "op-5", opNo: 5, nameEn: "Binding Close", nameTa: "பைண்டிங் க்ளோஸ்" },
  { id: "op-12", opNo: 12, nameEn: "Neck Topstitch", nameTa: "நெக் டாப்ஸ்டிட்ச்" },
];

const fallbackPanelTypes: PanelTypeView[] = [
  { id: "pt-1", nameEn: "Shoulder panel", nameTa: "ஷோல்டர் பேனல்", cascadeOrder: 1, balance: 0 },
  { id: "pt-2", nameEn: "Rib attach panel", nameTa: "ரிப் அட்டாச் பேனல்", cascadeOrder: 2, balance: 0 },
  { id: "pt-3", nameEn: "Binding attach panel", nameTa: "பைண்டிங் அட்டாச் பேனல்", cascadeOrder: 3, balance: 0 },
  { id: "pt-4", nameEn: "Binding close panel", nameTa: "பைண்டிங் க்ளோஸ் பேனல்", cascadeOrder: 4, balance: 0 },
  { id: "pt-5", nameEn: "Neck topstitch panel", nameTa: "நெக் டாப்ஸ்டிட்ச் பேனல்", cascadeOrder: 5, balance: 0 },
];

const fallbackTrainees: TraineeView[] = [{ id: "trainee-demo", empCode: "DEMO-T001", name: "Demo Trainee" }];

async function getPanelsData(): Promise<PanelsData> {
  if (!hasSupabaseConfig()) {
    return { panelTypes: fallbackPanelTypes, operations: fallbackOperations, trainees: fallbackTrainees, transactions: [] };
  }

  const supabase = createSupabaseServerClient();
  const [{ data: panelTypes }, { data: balances }, { data: operations }, { data: trainees }, { data: transactions }] = await Promise.all([
    supabase.from("panel_types").select("id,name_en,name_ta,cascade_order").order("cascade_order"),
    supabase.from("v_panel_balance").select("panel_type_id,balance"),
    supabase.from("operations").select("id,op_no,name_en,name_ta").order("op_no"),
    supabase.from("trainees").select("id,emp_code,name").order("name"),
    supabase
      .from("panel_transactions")
      .select("id,txn_type,panel_type_id,qty,txn_date,trainee_id,operation_id,from_operation_id,condition,notes")
      .order("txn_date", { ascending: false })
      .limit(50),
  ]);
  const balanceByPanelType = new Map((balances ?? []).map((balance) => [balance.panel_type_id, Number(balance.balance ?? 0)]));

  return {
    panelTypes:
      panelTypes?.map((panelType) => ({
        id: panelType.id,
        nameEn: panelType.name_en,
        nameTa: panelType.name_ta,
        cascadeOrder: panelType.cascade_order,
        balance: balanceByPanelType.get(panelType.id) ?? 0,
      })) ?? fallbackPanelTypes,
    operations:
      operations?.map((operation) => ({
        id: operation.id,
        opNo: operation.op_no,
        nameEn: operation.name_en,
        nameTa: operation.name_ta,
      })) ?? fallbackOperations,
    trainees:
      trainees?.map((trainee) => ({
        id: trainee.id,
        empCode: trainee.emp_code,
        name: trainee.name,
      })) ?? fallbackTrainees,
    transactions:
      transactions?.map((transaction) => ({
        id: transaction.id,
        txnType: transaction.txn_type,
        panelTypeId: transaction.panel_type_id,
        qty: transaction.qty,
        txnDate: transaction.txn_date,
        traineeId: transaction.trainee_id,
        operationId: transaction.operation_id,
        fromOperationId: transaction.from_operation_id,
        condition: transaction.condition,
        notes: transaction.notes,
      })) ?? [],
  };
}

export default async function PanelsPage({ searchParams }: { searchParams: SearchParams }) {
  const staff = await getCurrentStaff();
  const panelsData = await getPanelsData();
  const canWrite = staff?.role === "school_trainer" || staff?.role === "coordinator" || staff?.role === "it";
import { AppShell } from "@/components/app-shell";
import { Text } from "@/components/text";
import { getCurrentStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function RoutePage() {
  const staff = await getCurrentStaff();

  return (
    <Suspense>
      <AppShell role={staff?.role} staffName={staff?.name} signOutAction={staff ? signOut : undefined}>
        <PanelsPanel
          balanceStatus={searchParams.balance}
          canWrite={canWrite}
          operations={panelsData.operations}
          panelTypes={panelsData.panelTypes}
          recordAction={recordPanelTransaction}
          status={searchParams.status}
          trainees={panelsData.trainees}
          transactions={panelsData.transactions}
        />
        <section className="rounded-3xl border border-navy/10 bg-white p-6 shadow-sm">
          <Text as="h1" className="text-3xl font-black text-navy" copyKey="panels" />
          <Text as="p" className="mt-3 text-slate-600" copyKey="comingSoon" />
        </section>
      </AppShell>
    </Suspense>
  );
}
