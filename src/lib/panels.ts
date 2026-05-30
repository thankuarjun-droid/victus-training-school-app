export type PanelTxnType = "inward" | "issue" | "return" | "reissue" | "scrap";

export type PanelLedgerRow = {
  panelTypeId: string;
  txnType: PanelTxnType;
  qty: number;
};

export type PanelCascadeStep = {
  cascadeOrder: number;
  opNo: number;
  nameEn: string;
  nameTa: string;
};

export const panelCascade: PanelCascadeStep[] = [
  { cascadeOrder: 1, opNo: 1, nameEn: "Shoulder Join", nameTa: "ஷோல்டர் ஜோயின்" },
  { cascadeOrder: 2, opNo: 3, nameEn: "Rib Attach", nameTa: "ரிப் அட்டாச்" },
  { cascadeOrder: 3, opNo: 4, nameEn: "Binding Attach", nameTa: "பைண்டிங் அட்டாச்" },
  { cascadeOrder: 4, opNo: 5, nameEn: "Binding Close", nameTa: "பைண்டிங் க்ளோஸ்" },
  { cascadeOrder: 5, opNo: 12, nameEn: "Neck Topstitch", nameTa: "நெக் டாப்ஸ்டிட்ச்" },
];

export function getSignedPanelQuantity(txnType: PanelTxnType, qty: number): number {
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new Error("Panel quantity must be greater than zero.");
  }

  return txnType === "inward" || txnType === "return" ? qty : -qty;
}

export function calculatePanelBalance(panelTypeId: string, ledgerRows: readonly PanelLedgerRow[]): number {
  return ledgerRows
    .filter((row) => row.panelTypeId === panelTypeId)
    .reduce((balance, row) => balance + getSignedPanelQuantity(row.txnType, row.qty), 0);
}

export function canIssuePanels(availableBalance: number, requestedQty: number): boolean {
  if (!Number.isFinite(requestedQty) || requestedQty <= 0) {
    return false;
  }

  return requestedQty <= availableBalance;
}

export function getNextCascadeOperation(
  currentCascadeOrder: number | null,
  cascadeSteps: readonly PanelCascadeStep[] = panelCascade,
): PanelCascadeStep | null {
  if (currentCascadeOrder === null) {
    return null;
  }

  return cascadeSteps.find((step) => step.cascadeOrder === currentCascadeOrder + 1) ?? null;
}
