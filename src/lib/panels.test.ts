import { describe, expect, it } from "vitest";

import { calculatePanelBalance, canIssuePanels, getNextCascadeOperation, getSignedPanelQuantity } from "./panels";

describe("panel ledger helpers", () => {
  it("signs ledger quantities by transaction type", () => {
    expect(getSignedPanelQuantity("inward", 10)).toBe(10);
    expect(getSignedPanelQuantity("return", 2)).toBe(2);
    expect(getSignedPanelQuantity("issue", 4)).toBe(-4);
    expect(getSignedPanelQuantity("reissue", 3)).toBe(-3);
    expect(getSignedPanelQuantity("scrap", 1)).toBe(-1);
  });

  it("calculates running balance per panel type", () => {
    expect(
      calculatePanelBalance("p1", [
        { panelTypeId: "p1", txnType: "inward", qty: 20 },
        { panelTypeId: "p1", txnType: "issue", qty: 8 },
        { panelTypeId: "p1", txnType: "return", qty: 3 },
        { panelTypeId: "p1", txnType: "scrap", qty: 1 },
      ]),
    ).toBe(14);
  });

  it("blocks issue requests above available balance", () => {
    expect(canIssuePanels(5, 6)).toBe(false);
    expect(canIssuePanels(5, 5)).toBe(true);
  });

  it("resolves the next cascade operation", () => {
    expect(getNextCascadeOperation(1)?.opNo).toBe(3);
    expect(getNextCascadeOperation(5)).toBeNull();
  });
});
