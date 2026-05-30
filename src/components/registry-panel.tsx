"use client";

import { useMemo, type ReactNode } from "react";

import { getBatchCapacityStatus } from "@/lib/registry";
import { staffRoles, type StaffRole } from "@/lib/roles";
import { useLanguage } from "./language-provider";

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
  phone: string | null;
  batchId: string | null;
  operationId: string | null;
  trainerId: string | null;
  status: string | null;
};

type RegistryPanelProps = {
  staff: StaffView[];
  batches: BatchView[];
  trainees: TraineeView[];
  operations: OperationView[];
  canWriteRegistry: boolean;
  canWriteStaff: boolean;
  createBatchAction: (formData: FormData) => void;
  createTraineeAction: (formData: FormData) => void;
  bulkAddTraineesAction: (formData: FormData) => void;
  createStaffAction: (formData: FormData) => void;
  status?: string;
  bulkCount?: string;
};

function SelectOptions({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function RegistryPanel({
  staff,
  batches,
  trainees,
  operations,
  canWriteRegistry,
  canWriteStaff,
  createBatchAction,
  createTraineeAction,
  bulkAddTraineesAction,
  createStaffAction,
  status,
  bulkCount,
}: RegistryPanelProps) {
  const { locale, text } = useLanguage();
  const trainers = useMemo(() => staff.filter((member) => member.role === "school_trainer"), [staff]);
  const staffNameById = useMemo(() => new Map(staff.map((member) => [member.id, member.name])), [staff]);
  const batchById = useMemo(() => new Map(batches.map((batchItem) => [batchItem.id, batchItem])), [batches]);
  const operationById = useMemo(() => new Map(operations.map((operation) => [operation.id, operation])), [operations]);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-navy/10 bg-white p-6 shadow-sm">
        <p className="mb-3 inline-flex rounded-full bg-green/10 px-3 py-1 text-sm font-black text-green">
          {text("phaseTwoReady")}
        </p>
        <h1 className="text-3xl font-black text-navy">{text("registry")}</h1>
        <p className="mt-3 max-w-3xl text-slate-600">{text("registryBody")}</p>
        {!canWriteRegistry ? (
          <p className="mt-3 rounded-2xl bg-gold/10 p-3 text-sm font-semibold text-navy">{text("registryWriteRestricted")}</p>
        ) : null}
        {status ? (
          <p className="mt-3 rounded-2xl bg-green/10 p-3 text-sm font-semibold text-green">
            {status} {bulkCount ? `(${bulkCount})` : ""}
          </p>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-3xl border border-navy/10 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black text-navy">{text("createBatch")}</h2>
          {canWriteRegistry ? (
            <form action={createBatchAction} className="mt-4 space-y-3">
              <input className="w-full rounded-2xl border border-navy/20 px-4 py-3" name="batch_no" placeholder={text("batchNo")} required />
              <input className="w-full rounded-2xl border border-navy/20 px-4 py-3" name="start_date" type="date" />
              <input className="w-full rounded-2xl border border-navy/20 px-4 py-3" name="room" placeholder={text("room")} />
              <input className="w-full rounded-2xl border border-navy/20 px-4 py-3" min="0" name="capacity" placeholder={text("capacity")} type="number" />
              <select className="w-full rounded-2xl border border-navy/20 px-4 py-3" name="trainer_id">
                <option value="">{text("trainer")}</option>
                <SelectOptions>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </option>
                  ))}
                </SelectOptions>
              </select>
              <button className="w-full rounded-2xl bg-navy px-4 py-3 font-black text-white" type="submit">
                {text("save")}
              </button>
            </form>
          ) : null}
        </article>

        <article className="rounded-3xl border border-navy/10 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-2xl font-black text-navy">{text("registerTrainee")}</h2>
          {canWriteRegistry ? (
            <form action={createTraineeAction} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className="rounded-2xl border border-navy/20 px-4 py-3" name="emp_code" placeholder={text("empCode")} />
              <input className="rounded-2xl border border-navy/20 px-4 py-3" name="name" placeholder={text("traineeName")} required />
              <input className="rounded-2xl border border-navy/20 px-4 py-3" name="phone" placeholder={text("phone")} />
              <input className="rounded-2xl border border-navy/20 px-4 py-3" name="gender" placeholder={text("gender")} />
              <input className="rounded-2xl border border-navy/20 px-4 py-3" name="dob" type="date" />
              <input className="rounded-2xl border border-navy/20 px-4 py-3" name="join_date" type="date" />
              <select className="rounded-2xl border border-navy/20 px-4 py-3" name="batch_id">
                <option value="">{text("batch")}</option>
                {batches.map((batchItem) => (
                  <option key={batchItem.id} value={batchItem.id}>
                    {batchItem.batchNo}
                  </option>
                ))}
              </select>
              <select className="rounded-2xl border border-navy/20 px-4 py-3" name="assigned_trainer_id">
                <option value="">{text("trainer")}</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.name}
                  </option>
                ))}
              </select>
              <select className="rounded-2xl border border-navy/20 px-4 py-3 sm:col-span-2" name="assigned_operation_id">
                <option value="">{text("assignedOperation")}</option>
                {operations.map((operation) => (
                  <option key={operation.id} value={operation.id}>
                    {operation.opNo} · {locale === "ta" ? operation.nameTa : operation.nameEn}
                  </option>
                ))}
              </select>
              <button className="rounded-2xl bg-navy px-4 py-3 font-black text-white sm:col-span-2" type="submit">
                {text("save")}
              </button>
            </form>
          ) : null}
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-navy/10 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black text-navy">{text("bulkAddTrainees")}</h2>
          <p className="mt-2 text-sm text-slate-600">{text("bulkTraineeHelp")}</p>
          {canWriteRegistry ? (
            <form action={bulkAddTraineesAction} className="mt-4 space-y-3">
              <textarea
                className="min-h-32 w-full rounded-2xl border border-navy/20 p-4 font-mono text-sm"
                name="bulk_rows"
                placeholder={text("bulkRows")}
                required
              />
              <div className="grid gap-3 sm:grid-cols-3">
                <select className="rounded-2xl border border-navy/20 px-4 py-3" name="batch_id">
                  <option value="">{text("batch")}</option>
                  {batches.map((batchItem) => (
                    <option key={batchItem.id} value={batchItem.id}>
                      {batchItem.batchNo}
                    </option>
                  ))}
                </select>
                <select className="rounded-2xl border border-navy/20 px-4 py-3" name="assigned_trainer_id">
                  <option value="">{text("trainer")}</option>
                  {trainers.map((trainer) => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.name}
                    </option>
                  ))}
                </select>
                <select className="rounded-2xl border border-navy/20 px-4 py-3" name="assigned_operation_id">
                  <option value="">{text("operation")}</option>
                  {operations.map((operation) => (
                    <option key={operation.id} value={operation.id}>
                      {operation.opNo} · {locale === "ta" ? operation.nameTa : operation.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <button className="w-full rounded-2xl bg-navy px-4 py-3 font-black text-white" type="submit">
                {text("save")}
              </button>
            </form>
          ) : null}
        </article>

        <article className="rounded-3xl border border-navy/10 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black text-navy">{text("addStaff")}</h2>
          {canWriteStaff ? (
            <form action={createStaffAction} className="mt-4 space-y-3">
              <input className="w-full rounded-2xl border border-navy/20 px-4 py-3" name="name" placeholder={text("staffName")} required />
              <input className="w-full rounded-2xl border border-navy/20 px-4 py-3" name="phone" placeholder={text("phone")} />
              <select className="w-full rounded-2xl border border-navy/20 px-4 py-3" name="role">
                {staffRoles.map((role) => (
                  <option key={role} value={role}>
                    {text(role)}
                  </option>
                ))}
              </select>
              <button className="w-full rounded-2xl bg-navy px-4 py-3 font-black text-white" type="submit">
                {text("save")}
              </button>
            </form>
          ) : (
            <p className="mt-4 rounded-2xl bg-gold/10 p-4 text-sm font-semibold text-navy">{text("registryWriteRestricted")}</p>
          )}
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl border border-navy/10 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black text-navy">{text("batch")}</h2>
          <div className="mt-4 space-y-3">
            {batches.map((batchItem) => {
              const capacity = getBatchCapacityStatus(batchItem.traineeCount, batchItem.capacity);
              return (
                <div className="rounded-2xl border border-navy/10 p-4" key={batchItem.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-black text-navy">{batchItem.batchNo}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${capacity.exceeded ? "bg-coral/10 text-coral" : "bg-green/10 text-green"}`}>
                      {capacity.exceeded ? text("overCapacity") : text("withinCapacity")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {text("trainees")}: {batchItem.traineeCount} / {batchItem.capacity ?? "—"} · {text("trainer")}: {batchItem.trainerId ? staffNameById.get(batchItem.trainerId) ?? "—" : "—"}
                  </p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-sm">
          <div className="border-b border-navy/10 p-5">
            <h2 className="text-2xl font-black text-navy">{text("trainees")}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="p-3">{text("empCode")}</th>
                  <th className="p-3">{text("traineeName")}</th>
                  <th className="p-3">{text("batch")}</th>
                  <th className="p-3">{text("assignedOperation")}</th>
                  <th className="p-3">{text("status")}</th>
                </tr>
              </thead>
              <tbody>
                {trainees.map((trainee) => {
                  const operation = trainee.operationId ? operationById.get(trainee.operationId) : null;
                  return (
                    <tr className="border-b border-navy/10" key={trainee.id}>
                      <td className="p-3 font-bold text-navy">{trainee.empCode ?? "—"}</td>
                      <td className="p-3">{trainee.name}</td>
                      <td className="p-3">{trainee.batchId ? batchById.get(trainee.batchId)?.batchNo ?? "—" : "—"}</td>
                      <td className="p-3">{operation ? `${operation.opNo} · ${locale === "ta" ? operation.nameTa : operation.nameEn}` : "—"}</td>
                      <td className="p-3">{trainee.status ?? "—"}</td>
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
