import type { Collection, DemandNotice, DemandStatus } from "../types/api.types";

/** Recovery % from accepted collections when present; otherwise status-based estimate. */
export function demandRecoveryPercent(demand: DemandNotice): number {
  const due = Number.parseFloat(demand.amountDue);
  const collections = demand.collections;
  if (collections !== undefined && collections.length > 0 && due > 0) {
    const accepted = collections
      .filter((c) => c.status === "ACCEPTED")
      .reduce((sum, c) => sum + Number.parseFloat(c.amountCollected), 0);
    return Math.min(100, Math.round((accepted / due) * 100));
  }
  return statusRecoveryEstimate(demand.status);
}

function statusRecoveryEstimate(status: DemandStatus): number {
  switch (status) {
    case "COLLECTED":
      return 100;
    case "PARTIAL":
      return 50;
    case "OVERDUE":
      return 15;
    default:
      return 0;
  }
}

/** Inspector portfolio recovery from assigned demands + accepted collections. */
export function portfolioRecoveryPercent(
  demands: DemandNotice[],
  collections: Collection[],
): number {
  const totalDue = demands.reduce(
    (sum, d) => sum + Number.parseFloat(d.amountDue),
    0,
  );
  if (totalDue <= 0) {
    return 0;
  }
  const accepted = collections
    .filter((c) => c.status === "ACCEPTED")
    .reduce((sum, c) => sum + Number.parseFloat(c.amountCollected), 0);
  return Math.min(100, Math.round((accepted / totalDue) * 100));
}
