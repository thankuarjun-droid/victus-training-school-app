"use client";

import { useMemo, useState } from "react";

import { getNextCascadeOperation, panelCascade, type PanelTxnType } from "@/lib/panels";
import { useLanguage } from "./language-provider";

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

type PanelsPanelProps = {
  panelTypes: PanelTypeView[];
  operations: OperationView[];
  trainees: TraineeView[];
  transactions: PanelTransactionView[];
  canWrite: boolean;
  recordAction: (formData: FormData) => void;
  status?: string;
  balanceStatus?: string;
};

const txnTypes: PanelTxnType[] = ["inward", "issue", "return", "reissue", "scrap"];

function txnLabel(txnType: PanelTxnType, text: (key: keyof typeof import("@/lib/i18n").copy) => string): string {
  if (txnType === "return") {
    return text("returnTxn");
  }
  return text(txnType);
}

export function PanelsPanel({
  panelTypes,
  operations,
  trainees,
  transactions,
  canWrite,
  recordAction,
  status,
  balanceStatus,
}: PanelsPanelProps) {
  const { locale, text } = useLanguage();
  const [selectedTxnType, setSelectedTxnType] = useState<PanelTxnType>("inward");
  const [selectedPanelTypeId, setSelectedPanelTypeId] = useState("");
  const panelTypeById = useMemo(() => new Map(panelTypes.map((panelType) => [panelType.id, panelType])), [panelTypes]);
  const operationById = useMemo(() => new Map(operations.map((operation) => [operation.id, operation])), [operations]);
  const traineeById = useMemo(() => new Map(trainees.map((trainee) => [trainee.id, trainee])), [trainees]);
  const selectedPanelType = selectedPanelTypeId ? panelTypeById.get(selectedPanelTypeId) ?? null : null;
  const nextCascadeOperation = selectedTxnType === "reissue" ? getNextCascadeOperation(selectedPanelType?.cascadeOrder ?? null) : null;
  const nextCascadeOperationId = nextCascadeOperation
    ? operations.find((operation) => operation.opNo === nextCascadeOperation.opNo)?.id ?? ""
    : "";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-navy/10 bg-white p-6 shadow-sm">
        <p className="mb-3 inline-flex rounded-full bg-green/10 px-3 py-1 text-sm font-black text-green">
          {text("phaseThreeReady")}
        </p>
        <h1 className="text-3xl font-black text-navy">{text("panelRegister")}</h1>
        <p className="mt-3 max-w-3xl text-slate-600">{text("panelRegisterBody")}</p>
        {!canWrite ? <p className="mt-3 rounded-2xl bg-gold/10 p-3 text-sm font-semibold text-navy">{text("panelWriteRestricted")}</p> : null}
        {status ? (
          <p className="mt-3 rounded-2xl bg-green/10 p-3 text-sm font-semibold text-green">
            {status} {balanceStatus ? `· ${text("availableBalance")}: ${balanceStatus}` : ""}
          </p>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <article className="rounded-3xl border border-navy/10 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black text-navy">{text("cascadeChain")}</h2>
          <div className="mt-4 space-y-3">
            {panelCascade.map((step) => (
              <div className="rounded-2xl border border-navy/10 p-4" key={step.cascadeOrder}>
                <p className="font-black text-navy">
                  {step.cascadeOrder}. Op{step.opNo} · {locale === "ta" ? step.nameTa : step.nameEn}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {text("toOperation")}: {getNextCascadeOperation(step.cascadeOrder)?.opNo ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-navy/10 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black text-navy">{text("transaction")}</h2>
          <p className="mt-2 text-sm text-slate-600">{text("issueBlocked")}</p>
          {canWrite ? (
            <form action={recordAction} className="mt-4 grid gap-3 sm:grid-cols-2">
              <select className="rounded-2xl border border-navy/20 px-4 py-3" name="txn_type" onChange={(event) => setSelectedTxnType(event.target.value as PanelTxnType)} required value={selectedTxnType}>
                {txnTypes.map((txnType) => (
                  <option key={txnType} value={txnType}>
                    {txnLabel(txnType, text)}
                  </option>
                ))}
              </select>
              <select className="rounded-2xl border border-navy/20 px-4 py-3" name="panel_type_id" onChange={(event) => setSelectedPanelTypeId(event.target.value)} required value={selectedPanelTypeId}>
                <option value="">{text("panelType")}</option>
                {panelTypes.map((panelType) => (
                  <option key={panelType.id} value={panelType.id}>
                    {locale === "ta" ? panelType.nameTa ?? panelType.nameEn : panelType.nameEn} · {text("balance")}: {panelType.balance}
                  </option>
                ))}
              </select>
              <input className="rounded-2xl border border-navy/20 px-4 py-3" min="1" name="qty" placeholder={text("quantity")} required type="number" />
              <select className="rounded-2xl border border-navy/20 px-4 py-3" name="trainee_id">
                <option value="">{text("trainees")}</option>
                {trainees.map((trainee) => (
                  <option key={trainee.id} value={trainee.id}>
                    {trainee.empCode ? `${trainee.empCode} · ` : ""}{trainee.name}
                  </option>
                ))}
              </select>
              <select className="rounded-2xl border border-navy/20 px-4 py-3" name="operation_id" value={nextCascadeOperationId} onChange={() => undefined}>
                <option value="">{nextCascadeOperation ? `${text("toOperation")}: Op${nextCascadeOperation.opNo}` : text("toOperation")}</option>
                {operations.map((operation) => (
                  <option key={operation.id} value={operation.id}>
                    Op{operation.opNo} · {locale === "ta" ? operation.nameTa : operation.nameEn}
                  </option>
                ))}
              </select>
              <select className="rounded-2xl border border-navy/20 px-4 py-3" name="from_operation_id">
                <option value="">{text("fromOperation")}</option>
                {operations.map((operation) => (
                  <option key={operation.id} value={operation.id}>
                    Op{operation.opNo} · {locale === "ta" ? operation.nameTa : operation.nameEn}
                  </option>
                ))}
              </select>
              <input className="rounded-2xl border border-navy/20 px-4 py-3" name="received_from" placeholder={text("receivedFrom")} />
              <input className="rounded-2xl border border-navy/20 px-4 py-3" name="cutting_ref" placeholder={text("cuttingRef")} />
              <input className="rounded-2xl border border-navy/20 px-4 py-3" name="condition" placeholder={text("condition")} />
              <input className="rounded-2xl border border-navy/20 px-4 py-3" name="notes" placeholder={text("notes")} />
              <button className="rounded-2xl bg-navy px-4 py-3 font-black text-white sm:col-span-2" type="submit">
                {text("save")}
              </button>
            </form>
          ) : null}
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_2fr]">
        <article className="rounded-3xl border border-navy/10 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black text-navy">{text("panelTypes")}</h2>
          <div className="mt-4 space-y-3">
            {panelTypes.map((panelType) => (
              <div className="rounded-2xl border border-navy/10 p-4" key={panelType.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-navy">{locale === "ta" ? panelType.nameTa ?? panelType.nameEn : panelType.nameEn}</p>
                  <span className="rounded-full bg-green/10 px-3 py-1 text-sm font-black text-green">{panelType.balance}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{text("cascadeChain")}: {panelType.cascadeOrder ?? "—"}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-sm">
          <div className="border-b border-navy/10 p-5">
            <h2 className="text-2xl font-black text-navy">{text("transactions")}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="p-3">{text("transaction")}</th>
                  <th className="p-3">{text("panelType")}</th>
                  <th className="p-3">{text("quantity")}</th>
                  <th className="p-3">{text("trainees")}</th>
                  <th className="p-3">{text("operation")}</th>
                  <th className="p-3">{text("notes")}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => {
                  const operation = transaction.operationId ? operationById.get(transaction.operationId) : null;
                  return (
                    <tr className="border-b border-navy/10" key={transaction.id}>
                      <td className="p-3 font-bold text-navy">{txnLabel(transaction.txnType, text)}</td>
                      <td className="p-3">{transaction.panelTypeId ? panelTypeById.get(transaction.panelTypeId)?.nameEn ?? "—" : "—"}</td>
                      <td className="p-3">{transaction.qty}</td>
                      <td className="p-3">{transaction.traineeId ? traineeById.get(transaction.traineeId)?.name ?? "—" : "—"}</td>
                      <td className="p-3">{operation ? `Op${operation.opNo}` : "—"}</td>
                      <td className="p-3">{transaction.notes ?? transaction.condition ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </div>
  );
}
