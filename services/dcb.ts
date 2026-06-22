import { get, post, patch } from "./api";
import type {
  AnalyticsPayload,
  AnalyticsSummary,
  AuditLogEntry,
  Collection,
  DemandNotice,
  DCBRegisterRow,
  District,
  ExportJobResponse,
  ExportStatusResponse,
  Institution,
  User,
  UserActivityEntry,
} from "../types/api.types";

function qs(params: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v.length > 0) {
      q.set(k, v);
    }
  });
  const s = q.toString();
  return s.length > 0 ? `?${s}` : "";
}

export async function listDistricts(): Promise<District[]> {
  return get<District[]>(`/districts`);
}

export async function listInstitutions(
  params: Record<string, string | undefined>,
): Promise<Institution[]> {
  return get<Institution[]>(`/institutions${qs(params)}`);
}

export async function getInstitution(id: string): Promise<Institution> {
  return get<Institution>(`/institutions/${id}`);
}

export async function createInstitution(body: {
  districtId: string;
  name: string;
  category: string;
  address: string;
  contactName: string;
  contactPhone: string;
}): Promise<Institution> {
  return post<Institution>(`/institutions`, body);
}

export async function updateInstitution(
  id: string,
  body: Partial<{
    districtId: string;
    name: string;
    category: string;
    address: string;
    contactName: string;
    contactPhone: string;
    isActive: boolean;
  }>,
): Promise<Institution> {
  return patch<Institution>(`/institutions/${id}`, body);
}

export async function getDistrictSummary(id: string): Promise<{
  district: District;
  stats: {
    totalDemands: number;
    totalDemanded: string;
    totalCollections: number;
    totalCollected: string;
    activeInspectors: number;
  };
}> {
  return get(`/districts/${id}/summary`);
}

export async function getInspectorReport(
  inspectorId: string,
  financialYear?: string,
): Promise<{
  inspector: Pick<User, "id" | "name" | "role"> & { district: District };
  summary: {
    totalDemanded: string;
    totalCollected: string;
    demandCount: number;
    receiptCount: number;
  };
  demands: DemandNotice[];
  receipts: Collection[];
}> {
  return get(
    `/reports/inspector/${inspectorId}${qs({ financialYear })}`,
  );
}

export async function getCollectionReceiptUrl(
  collectionId: string,
): Promise<{ downloadUrl: string; receiptNumber: string | null }> {
  return get(`/collections/${collectionId}/receipt-url`);
}

export async function resetUserDevice(userId: string): Promise<User> {
  return patch<User>(`/users/${userId}/reset-device`, {});
}

export async function listDemands(
  params: Record<string, string | undefined>,
): Promise<DemandNotice[]> {
  return get<DemandNotice[]>(`/demands${qs(params)}`);
}

export async function getDemand(id: string): Promise<DemandNotice> {
  return get<DemandNotice>(`/demands/${id}`);
}

export async function createDemand(body: {
  institutionId: string;
  districtId: string;
  amountDue: number;
  financialYear: string;
  dueDate: string;
}): Promise<DemandNotice> {
  return post<DemandNotice>(`/demands`, body);
}

export async function assignDemand(
  demandId: string,
  inspectorId: string,
): Promise<DemandNotice> {
  return patch<DemandNotice>(`/demands/${demandId}/assign`, { inspectorId });
}

export async function listCollections(
  params: Record<string, string | undefined>,
): Promise<Collection[]> {
  return get<Collection[]>(`/collections${qs(params)}`);
}

export async function getCollection(id: string): Promise<Collection> {
  return get<Collection>(`/collections/${id}`);
}

export async function submitCollection(body: {
  demandId: string;
  amountCollected: number;
  paymentMode: string;
  referenceNo?: string;
  idempotencyKey: string;
}): Promise<Collection> {
  return post<Collection>(`/collections`, body);
}

export async function acceptCollection(id: string): Promise<Collection> {
  return patch<Collection>(`/collections/${id}/accept`, {});
}

export async function queryCollection(
  id: string,
  note: string,
): Promise<Collection> {
  return patch<Collection>(`/collections/${id}/query`, { note });
}

export async function getReportsSummary(): Promise<AnalyticsSummary> {
  return get<AnalyticsSummary>(`/reports/summary`);
}

export async function getReportsDcb(
  params: Record<string, string | undefined>,
): Promise<DCBRegisterRow[]> {
  return get<DCBRegisterRow[]>(`/reports/dcb${qs(params)}`);
}

export async function getReportsAnalytics(
  financialYear: string,
): Promise<AnalyticsPayload> {
  return get<AnalyticsPayload>(
    `/reports/analytics${qs({ financialYear })}`,
  );
}

export async function requestExport(body: {
  type: "dcb" | "collections" | "demands";
  filters: Record<string, unknown>;
}): Promise<ExportJobResponse> {
  return post<ExportJobResponse>(`/exports`, body);
}

export async function getExportStatus(
  jobId: string,
): Promise<ExportStatusResponse> {
  return get<ExportStatusResponse>(`/exports/${jobId}`);
}

export async function listAuditLogs(): Promise<AuditLogEntry[]> {
  return get<AuditLogEntry[]>(`/audit-logs`);
}

export async function getUser(id: string): Promise<User> {
  return get<User>(`/users/${id}`);
}

export async function getUserActivity(id: string): Promise<UserActivityEntry[]> {
  return get<UserActivityEntry[]>(`/users/${id}/activity`);
}

export async function updateUser(
  id: string,
  body: Partial<{
    districtId: string;
    name: string;
    email: string | null;
    password: string;
    role: string;
    isActive: boolean;
  }>,
): Promise<User> {
  return patch<User>(`/users/${id}`, body);
}

export async function listUsers(
  params: Record<string, string | undefined>,
): Promise<User[]> {
  return get<User[]>(`/users${qs(params)}`);
}

export async function createUser(body: {
  districtId: string;
  name: string;
  phone: string;
  email?: string | null;
  password: string;
  role: string;
}): Promise<User> {
  return post<User>(`/users`, body);
}

export async function transferInspector(
  userId: string,
  newDistrictId: string,
  notes?: string,
): Promise<User> {
  return patch<User>(`/users/${userId}/transfer`, {
    newDistrictId,
    notes,
  });
}

export async function deactivateUser(userId: string): Promise<User> {
  return patch<User>(`/users/${userId}/deactivate`, {});
}
