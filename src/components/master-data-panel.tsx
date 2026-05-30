"use client";

import { useMemo, useState } from "react";

import type { Locale } from "@/lib/i18n";
import { useLanguage } from "./language-provider";

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

type MasterDataPanelProps = {
  operations: OperationView[];
  loops: LoopView[];
  importAction: (formData: FormData) => void;
  canWrite: boolean;
  status?: string;
  operationsImported?: string;
  lockedImported?: string;
  pendingImported?: string;
};

const sampleCsv = `op_no,name_en,name_ta,machine_code,base_min,step_no,step_description_en,step_description_ta,checkpoint_no,checkpoint_en,checkpoint_ta,skill_key,skill_value,exercise_stage
1,Shoulder Join,ஷோல்டர் ஜோயின்,4T_OL,0.313,1,Align shoulder panels,ஷோல்டர் panels align பண்ணு,1,Shoulder seam balanced,ஷோல்டர் seam சரியா இருக்கு,seam_width,Even seam,1
2,Side Seam,சைடு சீம்,SNLS,0.200,1,Match side seam,Side seam match பண்ணு,1,No open seam,Open seam இருக்கக் கூடாது,back_tack,Start and end,1
3,Neck Rib (Rib Attach),நெக் ரிப் அட்டாச்,4T_OL,0.475,1,Attach rib evenly,Rib சமமா attach பண்ணு,1,Rib stretch even,Rib stretch சமமா இருக்கு,easing,Controlled,2`;

function localizedName(locale: Locale, nameEn: string, nameTa: string): string {
  return locale === "ta" ? nameTa : nameEn;
}

function formatNumber(value: number | null): string {
  return value === null ? "—" : value.toFixed(3);
}

export function MasterDataPanel({
  operations,
  loops,
  importAction,
  canWrite,
  status,
  operationsImported,
  lockedImported,
  pendingImported,
}: MasterDataPanelProps) {
  const { locale, text } = useLanguage();
  const [csv, setCsv] = useState(sampleCsv);
  const importSummary = useMemo(() => {
    if (status !== "imported") {
      return null;
    }

    return [
      [text("operationCount"), operationsImported ?? "0"],
      [text("lockedCount"), lockedImported ?? "0"],
      [text("pendingCount"), pendingImported ?? "0"],
    ];
  }, [lockedImported, operationsImported, pendingImported, status, text]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-navy/10 bg-white p-6 shadow-sm">
        <p className="mb-3 inline-flex rounded-full bg-green/10 px-3 py-1 text-sm font-black text-green">
          {text("phaseOneReady")}
        </p>
        <h1 className="text-3xl font-black text-navy">{text("masterData")}</h1>
        <p className="mt-3 max-w-3xl text-slate-600">{text("masterDataBody")}</p>
        <p className="mt-3 rounded-2xl bg-gold/10 p-3 text-sm font-semibold text-navy">{text("readOnlyMasterData")}</p>
      </section>

      <section className="rounded-3xl border border-navy/10 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-black text-navy">{text("csvImport")}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{text("csvImportHelp")}</p>
        {importSummary ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {importSummary.map(([label, value]) => (
              <div className="rounded-2xl bg-green/10 p-4" key={label}>
                <p className="text-sm font-semibold text-green">{label}</p>
                <p className="text-2xl font-black text-navy">{value}</p>
              </div>
            ))}
          </div>
        ) : null}
        {canWrite ? (
          <form action={importAction} className="mt-4 space-y-4">
            <textarea
              className="min-h-60 w-full rounded-2xl border border-navy/20 p-4 font-mono text-sm"
              name="csv"
              onChange={(event) => setCsv(event.target.value)}
              value={csv}
            />
            <div className="flex flex-wrap gap-3">
              <button className="rounded-2xl bg-navy px-5 py-3 font-black text-white" type="submit">
                {text("importCsv")}
              </button>
              <button
                className="rounded-2xl border border-navy/20 px-5 py-3 font-black text-navy"
                onClick={() => setCsv(sampleCsv)}
                type="button"
              >
                {text("sampleCsv")}
              </button>
            </div>
          </form>
        ) : (
          <p className="mt-4 rounded-2xl bg-gold/10 p-4 text-sm font-semibold text-navy">{text("writeRestricted")}</p>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article className="overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-sm">
          <div className="border-b border-navy/10 p-5">
            <h2 className="text-2xl font-black text-navy">{text("operations")}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">{text("operation")}</th>
                  <th className="p-3">{text("machine")}</th>
                  <th className="p-3">{text("smv")}</th>
                  <th className="p-3">{text("sam")}</th>
                  <th className="p-3">{text("status")}</th>
                </tr>
              </thead>
              <tbody>
                {operations.map((operation) => (
                  <tr className="border-b border-navy/10" key={operation.id}>
                    <td className="p-3 font-bold text-navy">{operation.opNo}</td>
                    <td className="p-3">{localizedName(locale, operation.nameEn, operation.nameTa)}</td>
                    <td className="p-3">{operation.machineCode ?? "—"}</td>
                    <td className="p-3">{formatNumber(operation.smvMin)}</td>
                    <td className="p-3">{formatNumber(operation.samMin)}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          operation.smvMin === null ? "bg-gold/10 text-navy" : "bg-green/10 text-green"
                        }`}
                      >
                        {operation.smvMin === null ? text("pendingImport") : text("lockedSmv")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-3xl border border-navy/10 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black text-navy">{text("fiveLoops")}</h2>
          <div className="mt-4 space-y-3">
            {loops.map((loop) => (
              <div className="rounded-2xl border border-navy/10 p-4" key={loop.id}>
                <p className="font-black text-navy">{localizedName(locale, loop.nameEn, loop.nameTa)}</p>
                <p className="mt-1 text-sm text-slate-600">
                  {localizedName(locale, loop.descriptionEn ?? "", loop.descriptionTa ?? "")}
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-gold">
                  {text("target")}: {loop.targetValue ?? "—"} {loop.targetUnit ?? text("pendingImport")}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
