import { describe, expect, it } from "vitest";

import { dedupeByConflictKey, parseObCsv, summarizeImportedOperations } from "./master-data";

describe("OB CSV parser", () => {
  it("keeps only locked RONNY SMVs and flags pending imports", () => {
    const rows = parseObCsv(`op_no,name_en,name_ta,machine_code,smv_min,base_min
1,Shoulder Join,ஷோல்டர் ஜோயின்,4T_OL,99,0.30
2,Side Seam,சைடு சீம்,SNLS,,0.20
3,Neck Rib (Rib Attach),நெக் ரிப் அட்டாச்,4T_OL,,0.47`);

    expect(rows[0]?.smvMin).toBe(0.413);
    expect(rows[1]?.smvMin).toBeNull();
    expect(rows[1]?.pendingImport).toBe(true);
    expect(rows[2]?.smvMin).toBe(0.627);
    expect(rows[0]?.samMin).toBeCloseTo(0.396, 3);
  });

  it("summarizes distinct operations", () => {
    const rows = parseObCsv(`op_no,name_en,name_ta
1,Shoulder Join,ஷோல்டர் ஜோயின்
2,Side Seam,சைடு சீம்
2,Side Seam,சைடு சீம்`);

    expect(summarizeImportedOperations(rows)).toEqual({
      operationCount: 2,
      lockedSmvCount: 1,
      pendingImportCount: 1,
    });
  });

  it("deduplicates repeated conflict keys before bulk upserts", () => {
    const rows = [
      { operation_id: "op-1", step_no: 1, description_en: "first" },
      { operation_id: "op-1", step_no: 1, description_en: "second" },
      { operation_id: "op-1", step_no: 2, description_en: "third" },
      { operation_id: null, step_no: 3, description_en: "ignored" },
    ];

    expect(
      dedupeByConflictKey(rows, (row) => (row.operation_id ? `${row.operation_id}:${row.step_no}` : null)),
    ).toEqual([
      { operation_id: "op-1", step_no: 1, description_en: "second" },
      { operation_id: "op-1", step_no: 2, description_en: "third" },
    ]);
  });
});
