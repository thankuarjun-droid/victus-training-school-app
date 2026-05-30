export type TraineeCsvRow = {
  empCode: string | null;
  name: string;
  phone: string | null;
};

export type BatchCapacityStatus = {
  traineeCount: number;
  capacity: number | null;
  exceeded: boolean;
  remaining: number | null;
};

export function getBatchCapacityStatus(traineeCount: number, capacity: number | null): BatchCapacityStatus {
  if (!Number.isFinite(traineeCount) || traineeCount < 0) {
    throw new Error("Trainee count must be zero or greater.");
  }

  if (capacity === null) {
    return { traineeCount, capacity, exceeded: false, remaining: null };
  }

  if (!Number.isFinite(capacity) || capacity < 0) {
    throw new Error("Batch capacity must be zero or greater.");
  }

  return {
    traineeCount,
    capacity,
    exceeded: traineeCount > capacity,
    remaining: capacity - traineeCount,
  };
}

export function parseTraineeCsv(csv: string): TraineeCsvRow[] {
  return csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [empCode, name, phone] = line.split(",").map((value) => value.trim());
      if (!name) {
        throw new Error("Each trainee row must include emp_code,name,phone.");
      }

      return {
        empCode: empCode || null,
        name,
        phone: phone || null,
      };
    });
}
