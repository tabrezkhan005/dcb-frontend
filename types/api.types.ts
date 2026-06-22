export type DemandStatus = "PENDING" | "PARTIAL" | "COLLECTED" | "OVERDUE";

export type CollectionStatus = "SUBMITTED" | "ACCEPTED" | "QUERIED";

export type PaymentMode = "CASH" | "CHEQUE" | "UPI" | "DD";

export type Role = "INSPECTOR" | "ACCOUNTS" | "ADMIN" | "CHAIRMAN";

export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string | null;
  role: Role;
  districtId: string;
  isActive?: boolean;
  lastLoginAt?: string | null;
  district?: District;
}

export interface District {
  id: string;
  name: string;
  code: string;
  hqCity?: string;
  createdAt?: string;
}

export interface Institution {
  id: string;
  districtId: string;
  name: string;
  category: string;
  address: string;
  contactName: string;
  contactPhone: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface DemandNotice {
  id: string;
  institutionId: string;
  inspectorId: string | null;
  districtId: string;
  amountDue: string;
  financialYear: string;
  dueDate: string;
  status: DemandStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  institution?: Institution;
  inspector?: Pick<User, "id" | "name" | "phone"> | null;
  district?: District;
  collections?: Collection[];
}

export interface Collection {
  id: string;
  demandId: string;
  inspectorId: string;
  amountCollected: string;
  paymentMode: PaymentMode;
  referenceNo: string | null;
  status: CollectionStatus;
  accountsNote: string | null;
  accountsUserId: string | null;
  receiptNumber: string | null;
  receiptS3Key: string | null;
  idempotencyKey: string;
  submittedAt: string;
  reviewedAt: string | null;
  demand?: DemandNotice & {
    institution?: Institution;
    district?: District;
  };
  inspector?: Pick<User, "id" | "name" | "phone">;
  accountsUser?: Pick<User, "id" | "name"> | null;
}

export interface Receipt {
  receiptNumber: string;
  amount: string;
  institutionName: string;
  submittedAt: string;
}

export interface DCBRegisterRow {
  institutionId: string;
  institutionName: string;
  district: Pick<District, "id" | "name" | "code">;
  demandAmount: string;
  totalCollected: string;
  balance: string;
  status: DemandStatus | CollectionStatus | string;
}

export interface MonthlyTrend {
  month: string;
  collected: string;
  demanded: string;
}

export interface PaymentModeBreakdownEntry {
  count: number;
  amount: string;
}

export type PaymentModeBreakdown = Record<
  PaymentMode,
  PaymentModeBreakdownEntry
>;

export interface TopInspector {
  inspectorId: string;
  name: string;
  amount: string;
}

export interface DistrictComparison {
  districtId: string;
  districtName: string;
  code: string;
  demanded: string;
  collected: string;
  recoveryPercent: number;
}

export interface OverdueInstitution {
  demandId: string;
  institutionName: string;
  balance: string;
  daysOverdue: number;
}

export interface AnalyticsPayload {
  monthlyTrend: MonthlyTrend[];
  paymentModeBreakdown: PaymentModeBreakdown;
  topInspectors: TopInspector[];
  districtComparison: DistrictComparison[];
  overdueInstitutions: OverdueInstitution[];
}

export interface AnalyticsSummary {
  totalDemanded: string;
  totalCollected: string;
  totalPending: number;
  activeInspectors: number;
  collectionsByDistrict: {
    districtId: string;
    districtName: string;
    demanded: string;
    collected: string;
  }[];
  todayCollection: string;
}

export interface ExportJobResponse {
  jobId: string;
}

export interface ExportStatusResponse {
  status: "ready" | "processing" | "failed";
  downloadUrl?: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  beforeData: unknown;
  afterData: unknown;
  ipAddress: string | null;
  deviceId: string | null;
  createdAt: string;
  user:
    | (Pick<User, "id" | "name" | "role"> & { phone?: string | null })
    | null;
}

export interface UserActivityEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  ipAddress: string | null;
  deviceId: string | null;
  /** Present when row comes from audit log API */
  userId?: string | null;
  beforeData?: unknown;
  afterData?: unknown;
}

export interface ExportJob {
  jobId: string;
  type: string;
  status: "ready" | "processing" | "failed";
  createdAt: string;
  downloadUrl?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: Pick<User, "id" | "name" | "role" | "districtId">;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface PasswordChangeResult {
  ok: true;
}
