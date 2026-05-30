import { describe, expect, it } from "vitest";

import {
  calculateOjtEfficiencyPct,
  calculateSamFromBase,
  calculateSchoolEfficiencyPct,
  calculateStandardCapacityPph,
  summarizeCycles,
} from "./formulas";

describe("training formulas", () => {
  it("summarizes observed cycle times with simple mean", () => {
    expect(summarizeCycles([60, 66, 54])).toEqual({
      averageCycleSec: 60,
      minCycleSec: 54,
      maxCycleSec: 66,
      observedCapacityPph: 60,
    });
  });

  it("matches the Shoulder Join 40% handover example", () => {
    expect(calculateSchoolEfficiencyPct(0.413, 61.95)).toBeCloseTo(40, 1);
  });

  it("calculates standard capacity from locked SMV", () => {
    expect(calculateStandardCapacityPph(0.627)).toBeCloseTo(95.69, 2);
  });

  it("calculates SAM using the machine-specific allowance multiplier", () => {
    expect(calculateSamFromBase(0.5, 1.24)).toBeCloseTo(0.62, 2);
  });

  it("uses the separate OJT line-efficiency formula", () => {
    expect(calculateOjtEfficiencyPct(0.732, 410, 500)).toBeCloseTo(60.02, 2);
  });
});
