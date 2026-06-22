export const QueryKeys = {
  AUTH: ["auth"] as const,
  DEMANDS: (filters?: Record<string, unknown>) =>
    ["demands", filters ?? {}] as const,
  COLLECTIONS: (filters?: Record<string, unknown>) =>
    ["collections", filters ?? {}] as const,
  USERS: (filters?: Record<string, unknown>) =>
    ["users", filters ?? {}] as const,
  DISTRICTS: ["districts"] as const,
  INSTITUTIONS: (filters?: Record<string, unknown>) =>
    ["institutions", filters ?? {}] as const,
  REPORTS_SUMMARY: ["reports", "summary"] as const,
  REPORTS_DCB: (filters?: Record<string, unknown>) =>
    ["reports", "dcb", filters ?? {}] as const,
  REPORTS_ANALYTICS: (filters?: Record<string, unknown>) =>
    ["reports", "analytics", filters ?? {}] as const,
  EXPORTS: (jobId?: string) => ["exports", jobId ?? "list"] as const,
  AUDIT_LOGS: ["auditLogs"] as const,
  INSPECTOR_REPORT: (id: string, fy?: string) =>
    ["reports", "inspector", id, fy ?? ""] as const,
} as const;
