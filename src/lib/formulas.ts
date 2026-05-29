export type CycleSummary = {
  averageCycleSec: number;
  minCycleSec: number;
  maxCycleSec: number;
  observedCapacityPph: number;
};

function assertPositiveNumber(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive number.`);
  }
}

export function summarizeCycles(cycleTimesSec: readonly number[]): CycleSummary {
  if (cycleTimesSec.length === 0) {
    throw new Error("At least one cycle time is required.");
  }

  cycleTimesSec.forEach((cycleTimeSec) => assertPositiveNumber(cycleTimeSec, "cycle time"));

  const totalSec = cycleTimesSec.reduce((total, cycleTimeSec) => total + cycleTimeSec, 0);
  const averageCycleSec = totalSec / cycleTimesSec.length;
  const averageCycleMin = averageCycleSec / 60;

  return {
    averageCycleSec,
    minCycleSec: Math.min(...cycleTimesSec),
    maxCycleSec: Math.max(...cycleTimesSec),
    observedCapacityPph: 60 / averageCycleMin,
  };
}

export function calculateSchoolEfficiencyPct(smvMin: number, averageCycleSec: number): number {
  assertPositiveNumber(smvMin, "SMV");
  assertPositiveNumber(averageCycleSec, "average cycle time");

  return (smvMin / (averageCycleSec / 60)) * 100;
}

export function calculateStandardCapacityPph(smvMin: number): number {
  assertPositiveNumber(smvMin, "SMV");
  return 60 / smvMin;
}

export function calculateOjtEfficiencyPct(
  smvMin: number,
  goodPieces: number,
  minutesWorked: number,
): number {
  assertPositiveNumber(smvMin, "SMV");
  assertPositiveNumber(goodPieces, "good pieces");
  assertPositiveNumber(minutesWorked, "minutes worked");

  return (smvMin * goodPieces * 100) / minutesWorked;
}
