import { calculateSamFromBase } from "./formulas";

export const lockedRonnySmvs = {
  "shoulder join": 0.413,
  "neck rib": 0.627,
  "rib attach": 0.627,
  "neck rib (rib attach)": 0.627,
  "sleeve attach": 0.732,
} as const;

export type MachineCode = "SNLS" | "4T_OL" | "F_LTR" | "F_LFO" | "F_LCB";

export const machineAllowances: Record<MachineCode, number> = {
  SNLS: 1.24,
  "4T_OL": 1.32,
  F_LTR: 1.34,
  F_LFO: 1.36,
  F_LCB: 1.38,
};

export type ObCsvRow = {
  opNo: number;
  nameEn: string;
  nameTa: string;
  machineCode: MachineCode | null;
  smvMin: number | null;
  baseMin: number | null;
  samMin: number | null;
  pendingImport: boolean;
  stepNo: number | null;
  stepDescriptionEn: string | null;
  stepDescriptionTa: string | null;
  checkpointNo: number | null;
  checkpointEn: string | null;
  checkpointTa: string | null;
  skillKey: string | null;
  skillValue: string | null;
  exerciseStage: number | null;
};

type RawCsvRow = Record<string, string | undefined>;

const requiredHeaders = ["op_no", "name_en", "name_ta"] as const;

export function dedupeByConflictKey<Row>(rows: readonly Row[], getKey: (row: Row) => string | null | undefined): Row[] {
  const dedupedRows = new Map<string, Row>();

  rows.forEach((row) => {
    const key = getKey(row);
    if (key) {
      dedupedRows.set(key, row);
    }
  });

  return Array.from(dedupedRows.values());
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replaceAll(" ", "_");
}

function parseNumber(value: string | undefined): number | null {
  if (!value?.trim()) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseMachineCode(value: string | undefined): MachineCode | null {
  const normalized = value?.trim().toUpperCase();
  if (!normalized) {
    return null;
  }

  if (["SNLS", "4T_OL", "F_LTR", "F_LFO", "F_LCB"].includes(normalized)) {
    return normalized as MachineCode;
  }

  return null;
}

function splitCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && quoted && nextCharacter === '"') {
      current += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }

  values.push(current.trim());
  return values;
}

function toRawRows(csv: string): RawCsvRow[] {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV must include a header row and at least one operation row.");
  }

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    throw new Error(`CSV missing required headers: ${missingHeaders.join(", ")}.`);
  }

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return headers.reduce<RawCsvRow>((row, header, index) => {
      row[header] = values[index];
      return row;
    }, {});
  });
}

function resolveLockedSmv(nameEn: string): number | null {
  const normalizedName = nameEn.trim().toLowerCase();
  return lockedRonnySmvs[normalizedName as keyof typeof lockedRonnySmvs] ?? null;
}

function resolveSmv(rawSmv: number | null, nameEn: string): number | null {
  const lockedSmv = resolveLockedSmv(nameEn);
  if (lockedSmv !== null) {
    return lockedSmv;
  }

  return rawSmv;
}

export function parseObCsv(csv: string): ObCsvRow[] {
  return toRawRows(csv).map((row) => {
    const opNo = parseNumber(row.op_no);
    const nameEn = row.name_en?.trim() ?? "";
    const nameTa = row.name_ta?.trim() ?? "";
    const baseMin = parseNumber(row.base_min ?? row.base_time_min);
    const machineCode = parseMachineCode(row.machine_code);
    const smvMin = resolveSmv(parseNumber(row.smv_min), nameEn);
    const samMin = baseMin !== null && machineCode ? calculateSamFromBase(baseMin, machineAllowances[machineCode]) : null;

    if (opNo === null || !nameEn || !nameTa) {
      throw new Error("Each CSV row must include op_no, name_en, and name_ta.");
    }

    return {
      opNo,
      nameEn,
      nameTa,
      machineCode,
      smvMin,
      baseMin,
      samMin,
      pendingImport: smvMin === null,
      stepNo: parseNumber(row.step_no),
      stepDescriptionEn: row.step_description_en?.trim() || null,
      stepDescriptionTa: row.step_description_ta?.trim() || null,
      checkpointNo: parseNumber(row.checkpoint_no),
      checkpointEn: row.checkpoint_en?.trim() || null,
      checkpointTa: row.checkpoint_ta?.trim() || null,
      skillKey: row.skill_key?.trim() || null,
      skillValue: row.skill_value?.trim() || null,
      exerciseStage: parseNumber(row.exercise_stage),
    };
  });
}

export function summarizeImportedOperations(rows: readonly ObCsvRow[]) {
  const operations = new Map<number, ObCsvRow>();
  rows.forEach((row) => operations.set(row.opNo, row));

  return {
    operationCount: operations.size,
    lockedSmvCount: Array.from(operations.values()).filter((row) => row.smvMin !== null).length,
    pendingImportCount: Array.from(operations.values()).filter((row) => row.pendingImport).length,
  };
}
