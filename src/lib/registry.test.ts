import { describe, expect, it } from "vitest";

import { getBatchCapacityStatus, parseTraineeCsv } from "./registry";

describe("registry helpers", () => {
  it("warns without blocking when capacity is exceeded", () => {
    expect(getBatchCapacityStatus(27, 25)).toEqual({
      traineeCount: 27,
      capacity: 25,
      exceeded: true,
      remaining: -2,
    });
  });

  it("parses bulk trainee rows", () => {
    expect(parseTraineeCsv("V001,Anbu,9000000001\nV002,Kavi," )).toEqual([
      { empCode: "V001", name: "Anbu", phone: "9000000001" },
      { empCode: "V002", name: "Kavi", phone: null },
    ]);
  });
});
