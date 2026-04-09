'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  isWithinDays,
  type Building,
  type CommonSpace,
  type CommonSpaceReservation,
  type Condo,
  type Boleto,
  type BoletoPixCharge,
  type Document,
  type Floor,
  type ImportantDate,
  type Notification,
  type Occurrence,
  type OccurrencePriority,
  type OccurrenceStatus,
  type Resident,
  type Unit,
  type UnitStatus,
  type User,
  type UserRole,
  type WalletPayment,
  type WalletSummary,
  type WalletWithdrawal,
} from '../../shared/src';

export const STORE_KEY = 'condohome-web-v3';
type ThemeMode = 'light' | 'dark';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');
const TENANT_PREFIX_REQUIRED_MESSAGE = 'Acesse o painel pelo endereço do condomínio.';
export const AUTH_HANDOFF_TOKEN_PARAM = 'condohome_token';
export const AUTH_HANDOFF_CONDO_PARAM = 'condohome_condo_id';

type BackendUserRole =
  | 'SystemAdmin'
  | 'SYSTEM_ADMIN'
  | -1
  | 'AdminCompany'
  | 'Syndic'
  | 'Resident'
  | 'ADMIN_COMPANY'
  | 'SYNDIC'
  | 'RESIDENT'
  | 0
  | 2
  | 3;
type BackendUnitStatus = 'Green' | 'Yellow' | 'Red' | 'GREEN' | 'YELLOW' | 'RED' | 0 | 1 | 2;
type BackendOccurrencePriority = 'Low' | 'Medium' | 'High' | 'Critical' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 0 | 1 | 2 | 3;
type BackendOccurrenceStatus =
  | 'Open'
  | 'InProgress'
  | 'Resolved'
  | 'Closed'
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 0
  | 1
  | 2
  | 3;

type BackendCondo = {
  id: string;
  prefix: string;
  name: string;
  address: string;
  primaryColor?: string;
  logoUrl?: string;
};

type BackendUser = {
  id: string;
  companyId: string;
  role: BackendUserRole;
  name: string;
  email: string;
  createdAt: string;
  isFirstAccessPending?: boolean;
  activeCondoId?: string;
  residentUnitId?: string;
};

type BackendLoginResponse = {
  accessToken: string;
  expiresAtUtc: string;
  user: BackendUser;
  accessibleCondos: BackendCondo[];
  requiresSubscriptionPayment: boolean;
};

type BackendMeResponse = {
  user: BackendUser;
  accessibleCondos: BackendCondo[];
};
type BackendLogoutResponse = {
  message: string;
};

type BackendBuilding = { id: string; condoId: string; name: string };
type BackendFloor = { id: string; condoId: string; buildingId: string; number: number };
type BackendUnit = { id: string; condoId: string; floorId: string; label: string; status: BackendUnitStatus };
type BackendResident = { id: string; condoId: string; unitId: string; name: string; email?: string; phone?: string; isOwner: boolean };
type BackendCommonSpace = {
  id: string;
  condoId: string;
  name: string;
  description?: string;
  openMinutes: number;
  closeMinutes: number;
  isActive: boolean;
};
type BackendCommonSpaceReservation = {
  id: string;
  condoId: string;
  commonSpaceId: string;
  createdByUserId: string;
  createdByUserName?: string;
  unitId?: string;
  title: string;
  notes?: string;
  startAt: string;
  endAt: string;
  createdAt: string;
};
type BackendCreateResidentResponse = {
  residents: BackendResident[];
  user: BackendUser;
  message: string;
};
type BackendAllocateResidentResponse = {
  resident: BackendResident;
  message: string;
};
type BackendDeleteResidentResponse = {
  message: string;
};
type BackendOccurrence = {
  id: string;
  condoId: string;
  unitId?: string;
  createdByUserId: string;
  title: string;
  description: string;
  category: string;
  priority: BackendOccurrencePriority;
  status: BackendOccurrenceStatus;
  assignedToUserId?: string;
  createdAt: string;
  updatedAt: string;
  attachments?: BackendOccurrenceAttachment[];
};
type BackendOccurrenceAttachment = {
  id: string;
  condoId: string;
  occurrenceId: string;
  fileUrl: string;
  fileName?: string;
  contentType?: string;
  uploadedAt: string;
};
type BackendDocument = {
  id: string;
  condoId: string;
  unitId?: string;
  unitLabel?: string;
  title: string;
  category: string;
  description?: string;
  uploadedAt: string;
  expiresAt?: string;
  fileUrl: string;
};
type BackendDocumentUploadUrl = {
  storageRef: string;
  uploadUrl: string;
  expiresAtUtc: string;
  contentType?: string;
};
type BackendCondoBrandingUploadUrl = {
  storageRef: string;
  uploadUrl: string;
  expiresAtUtc: string;
  contentType?: string;
};
type BackendBoleto = {
  id: string;
  condoId: string;
  unitId: string;
  unitLabel: string;
  amountCents: number;
  referenceMonth: string;
  dueDate: string;
  status: 'OPEN' | 'OVERDUE' | 'PAID';
  paidAt?: string;
  notes?: string;
  uploadedAt: string;
  fileUrl: string;
  files?: Array<{
    id: string;
    boletoId: string;
    fileUrl: string;
    fileName?: string;
    contentType?: string;
    uploadedAt: string;
  }>;
};
type BackendBoletoPixCharge = {
  id: string;
  boletoId: string;
  amountCents: number;
  platformFeeCents: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED';
  brCode: string;
  brCodeBase64: string;
  createdAtUtc: string;
  updatedAtUtc: string;
  expiresAtUtc: string;
  paidAtUtc?: string;
  receiptUrl?: string;
};
type BackendBoletoUploadUrl = {
  storageRef: string;
  uploadUrl: string;
  expiresAtUtc: string;
  contentType?: string;
};
type BackendWalletPayment = {
  id: string;
  boletoId: string;
  unitLabel: string;
  referenceMonth: string;
  amountCents: number;
  platformFeeCents: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED';
  createdAtUtc: string;
  updatedAtUtc: string;
  paidAtUtc?: string;
  receiptUrl?: string;
};
type BackendWalletWithdrawal = {
  id: string;
  amountCents: number;
  platformFeeCents: number;
  pixKeyType: 'CPF' | 'CNPJ' | 'PHONE' | 'EMAIL' | 'RANDOM';
  pixKey: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED';
  createdAtUtc: string;
  updatedAtUtc: string;
  completedAtUtc?: string;
  receiptUrl?: string;
};
type BackendWalletSummary = {
  totalReceivedCents: number;
  totalFeesCents: number;
  availableToWithdrawCents: number;
  pendingIncomingCents: number;
  pendingWithdrawalCents: number;
  recentPayments: BackendWalletPayment[];
  recentWithdrawals: BackendWalletWithdrawal[];
};
type BackendImportantDate = { id: string; condoId: string; title: string; date: string; type: string; notes?: string };
type BackendNotification = {
  id: string;
  condoId: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  readAt?: string;
};
type BackendSubscriptionStatus = 'Trialing' | 'Active' | 'Suspended' | 'Canceled' | 'TRIALING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELED' | 0 | 1 | 2 | 3;
type BackendBillingProvider = 'Manual' | 'Stripe' | 'Asaas' | 'MANUAL' | 'STRIPE' | 'ASAAS' | 0 | 1 | 2;
type BackendInvoiceStatus = 'Draft' | 'Pending' | 'Paid' | 'Overdue' | 'Canceled' | 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELED' | 0 | 1 | 2 | 3 | 4;
type BackendSaasPlan = {
  id: string;
  code: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  maxCondos: number;
  extraCondoPrice?: number | null;
  maxUnitsPerCondo: number;
  maxResidents: number;
  includesBillingPortal: boolean;
  includesPrioritySupport: boolean;
  isActive: boolean;
  createdAtUtc: string;
};
type BackendCompanySubscription = {
  id: string;
  companyId: string;
  subscriptionPlanId: string;
  subscriptionPlanCode: string;
  subscriptionPlanName: string;
  status: BackendSubscriptionStatus;
  billingProvider: BackendBillingProvider;
  createdAtUtc: string;
  trialEndsAtUtc?: string;
  currentPeriodStartsAtUtc?: string;
  currentPeriodEndsAtUtc?: string;
  activatedAtUtc?: string;
  suspendedAtUtc?: string;
  canceledAtUtc?: string;
  notes?: string;
};
type BackendBillingInvoice = {
  id: string;
  companyId: string;
  companySubscriptionId: string;
  billingProvider: BackendBillingProvider;
  status: BackendInvoiceStatus;
  amount: number;
  currency: string;
  description: string;
  externalInvoiceId?: string;
  checkoutUrl?: string;
  createdAtUtc: string;
  dueAtUtc: string;
  paidAtUtc?: string;
};
type BackendCompanySupportNote = {
  id: string;
  companyId: string;
  createdByUserId: string;
  createdByUserName: string;
  title: string;
  body: string;
  createdAtUtc: string;
};
type BackendCompanySummary = {
  id: string;
  name: string;
  createdAtUtc: string;
  condoCount: number;
  userCount: number;
  condos: BackendCondo[];
  currentSubscription?: BackendCompanySubscription;
  currentPlan?: BackendSaasPlan;
  recentInvoices: BackendBillingInvoice[];
  supportNotes: BackendCompanySupportNote[];
};
type BackendSaasOverview = {
  plans: BackendSaasPlan[];
  companies: BackendCompanySummary[];
  users: BackendUser[];
};
type BackendCustomerPortal = {
  companyId: string;
  companyName: string;
  currentSubscription?: BackendCompanySubscription;
  currentPlan?: BackendSaasPlan;
  condoCount: number;
  estimatedMonthlyAmount?: number | null;
  invoices: BackendBillingInvoice[];
  welcomeChecklist: string[];
};
type BackendCompanyOccurrenceListItem = { condo: BackendCondo; occurrence: BackendOccurrence };
type BackendCompanyDocumentListItem = { condo: BackendCondo; document: BackendDocument };
type BackendCompanyAgendaListItem = { condo: BackendCondo; date: BackendImportantDate };
type BackendCompanyBoletoListItem = { condo: BackendCondo; boleto: BackendBoleto };
type BackendCompanyWorkspaceCondo = {
  condo: BackendCondo;
  unitCount: number;
  occupiedUnitCount: number;
  attentionUnitCount: number;
  openOccurrenceCount: number;
  expiringDocumentCount: number;
  upcomingDateCount: number;
  overdueBoletoCount: number;
  overdueBoletoAmountCents: number;
  availableToWithdrawCents: number;
};
type BackendCompanyWorkspace = {
  companyName: string;
  condoCount: number;
  totalUnits: number;
  occupiedUnits: number;
  attentionUnits: number;
  openOccurrenceCount: number;
  expiringDocumentCount: number;
  upcomingDateCount: number;
  overdueBoletoCount: number;
  overdueBoletoAmountCents: number;
  availableToWithdrawCents: number;
  condos: BackendCompanyWorkspaceCondo[];
  recentOccurrences: BackendCompanyOccurrenceListItem[];
  recentDocuments: BackendCompanyDocumentListItem[];
  upcomingDates: BackendCompanyAgendaListItem[];
  overdueBoletos: BackendCompanyBoletoListItem[];
};
type BackendCompanyOccurrences = {
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  closedCount: number;
  totalItems: number;
  page: number;
  pageSize: number;
  items: BackendCompanyOccurrenceListItem[];
};
type BackendCompanyDocuments = {
  totalCount: number;
  expiringCount: number;
  noExpiryCount: number;
  categoryCount: number;
  totalItems: number;
  page: number;
  pageSize: number;
  items: BackendCompanyDocumentListItem[];
};
type BackendCompanyAgenda = {
  totalCount: number;
  dueTodayCount: number;
  nextWeekCount: number;
  typeCount: number;
  totalItems: number;
  page: number;
  pageSize: number;
  items: BackendCompanyAgendaListItem[];
};
type BackendCompanyCondoBalance = {
  condo: BackendCondo;
  availableToWithdrawCents: number;
  overdueBoletoCount: number;
  overdueBoletoAmountCents: number;
};
type BackendCompanyFinancial = {
  availableToWithdrawCents: number;
  overdueBoletoAmountCents: number;
  overdueBoletoCount: number;
  openBoletoAmountCents: number;
  balances: BackendCompanyCondoBalance[];
  totalItems: number;
  page: number;
  pageSize: number;
  items: BackendCompanyBoletoListItem[];
};
type BackendRegisterCompanyResponse = {
  company: BackendCompanySummary;
  adminUser: BackendUser;
  syndicUser?: BackendUser;
  portal: BackendCustomerPortal;
  message: string;
};
type BackendUnitDetails = {
  unit: BackendUnit;
  residents: BackendResident[];
  recentOccurrences: BackendOccurrence[];
};

type DashboardSummary = {
  condo?: Condo;
  myUnits: Unit[];
  myUnit?: Unit;
  openOccurrences: Occurrence[];
  expiringDocuments: Document[];
  upcomingDates: ImportantDate[];
};

export interface CompanyWorkspaceCondoSnapshot {
  condo: Condo;
  unitCount: number;
  occupiedUnitCount: number;
  attentionUnitCount: number;
  openOccurrenceCount: number;
  expiringDocumentCount: number;
  upcomingDateCount: number;
  overdueBoletoCount: number;
  overdueBoletoAmountCents: number;
  availableToWithdrawCents: number;
}

export interface CompanyWorkspaceSnapshot {
  companyName?: string;
  condos: CompanyWorkspaceCondoSnapshot[];
  condoCount: number;
  totalUnits: number;
  occupiedUnits: number;
  attentionUnits: number;
  openOccurrenceCount: number;
  expiringDocumentCount: number;
  upcomingDateCount: number;
  overdueBoletoCount: number;
  overdueBoletoAmountCents: number;
  availableToWithdrawCents: number;
  recentOccurrences: Array<{ condo: Condo; occurrence: Occurrence }>;
  recentDocuments: Array<{ condo: Condo; document: Document }>;
  upcomingDates: Array<{ condo: Condo; date: ImportantDate }>;
  overdueBoletos: Array<{ condo: Condo; boleto: Boleto }>;
}

export interface CompanyOccurrencesSnapshot {
  openCount: number;
  inProgressCount: number;
  resolvedCount: number;
  closedCount: number;
  totalItems: number;
  page: number;
  pageSize: number;
  items: Array<{ condo: Condo; occurrence: Occurrence }>;
}

export interface CompanyDocumentsSnapshot {
  totalCount: number;
  expiringCount: number;
  noExpiryCount: number;
  categoryCount: number;
  totalItems: number;
  page: number;
  pageSize: number;
  items: Array<{ condo: Condo; document: Document }>;
}

export interface CompanyAgendaSnapshot {
  totalCount: number;
  dueTodayCount: number;
  nextWeekCount: number;
  typeCount: number;
  totalItems: number;
  page: number;
  pageSize: number;
  items: Array<{ condo: Condo; date: ImportantDate }>;
}

export interface CompanyFinancialSnapshot {
  availableToWithdrawCents: number;
  overdueBoletoAmountCents: number;
  overdueBoletoCount: number;
  openBoletoAmountCents: number;
  balances: Array<{ condo: Condo; availableToWithdrawCents: number; overdueBoletoCount: number; overdueBoletoAmountCents: number }>;
  totalItems: number;
  page: number;
  pageSize: number;
  items: Array<{ condo: Condo; boleto: Boleto }>;
}

export type SaasSubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'SUSPENDED' | 'CANCELED';
export type SaasBillingProvider = 'MANUAL' | 'STRIPE' | 'ASAAS';
export type SaasInvoiceStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELED';

export interface SaasPlan {
  id: string;
  code: string;
  name: string;
  description?: string;
  monthlyPrice: number;
  maxCondos: number;
  extraCondoPrice?: number | null;
  maxUnitsPerCondo: number;
  maxResidents: number;
  includesBillingPortal: boolean;
  includesPrioritySupport: boolean;
  isActive: boolean;
  createdAtUtc: string;
}

export interface SaasSubscription {
  id: string;
  companyId: string;
  subscriptionPlanId: string;
  subscriptionPlanCode: string;
  subscriptionPlanName: string;
  status: SaasSubscriptionStatus;
  billingProvider: SaasBillingProvider;
  createdAtUtc: string;
  trialEndsAtUtc?: string;
  currentPeriodStartsAtUtc?: string;
  currentPeriodEndsAtUtc?: string;
  activatedAtUtc?: string;
  suspendedAtUtc?: string;
  canceledAtUtc?: string;
  notes?: string;
}

export interface SaasInvoice {
  id: string;
  companyId: string;
  companySubscriptionId: string;
  billingProvider: SaasBillingProvider;
  status: SaasInvoiceStatus;
  amount: number;
  currency: string;
  description: string;
  externalInvoiceId?: string;
  checkoutUrl?: string;
  createdAtUtc: string;
  dueAtUtc: string;
  paidAtUtc?: string;
}

export interface SaasSupportNote {
  id: string;
  companyId: string;
  createdByUserId: string;
  createdByUserName: string;
  title: string;
  body: string;
  createdAtUtc: string;
}

export interface SaasCompanySummary {
  id: string;
  name: string;
  createdAtUtc: string;
  condoCount: number;
  userCount: number;
  condos: Condo[];
  currentSubscription?: SaasSubscription;
  currentPlan?: SaasPlan;
  recentInvoices: SaasInvoice[];
  supportNotes: SaasSupportNote[];
}

export interface SaasOverview {
  plans: SaasPlan[];
  companies: SaasCompanySummary[];
  users: User[];
}

export interface CustomerPortal {
  companyId: string;
  companyName: string;
  currentSubscription?: SaasSubscription;
  currentPlan?: SaasPlan;
  condoCount: number;
  estimatedMonthlyAmount?: number | null;
  invoices: SaasInvoice[];
  welcomeChecklist: string[];
}

export interface RegisterCompanyResult {
  company: SaasCompanySummary;
  adminUser: User;
  syndicUser?: User;
  portal: CustomerPortal;
  message: string;
}

interface DashboardState {
  users: Record<string, User>;
  condos: Record<string, Condo>;
  currentUserId?: string;
  activeCondoId?: string;
  accessToken?: string;
  themeMode: ThemeMode;
  hydrationComplete: boolean;
  bootstrapped: boolean;
  markHydrated: (value: boolean) => void;
  bootstrap: () => Promise<void>;
  loginStaff: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setActiveCondoId: (condoId: string) => Promise<void>;
  updateCondoBranding: (payload: { primaryColor?: string; logoUrl?: string }) => Promise<Condo>;
  createCondoBrandingUploadUrl: (payload: { fileName: string; contentType?: string }) => Promise<BackendCondoBrandingUploadUrl>;
  resetCondoBranding: () => Promise<Condo>;
  setThemeMode: (mode: ThemeMode) => void;
  resetDemo: () => Promise<void>;
}

const initialState: Pick<DashboardState, 'users' | 'condos' | 'currentUserId' | 'activeCondoId' | 'accessToken' | 'themeMode'> = {
  users: {},
  condos: {},
  currentUserId: undefined,
  activeCondoId: undefined,
  accessToken: undefined,
  themeMode: 'light',
};

const mapRole = (role: BackendUserRole): UserRole => {
  switch (role) {
    case -1:
    case 'SystemAdmin':
    case 'SYSTEM_ADMIN':
      return 'SYSTEM_ADMIN';
    case 3:
    case 'Resident':
    case 'RESIDENT':
      return 'RESIDENT';
    case 2:
    case 'Syndic':
    case 'SYNDIC':
      return 'SYNDIC';
    case 0:
    case 'AdminCompany':
    case 'ADMIN_COMPANY':
      return 'ADMIN_COMPANY';
    default:
      return 'RESIDENT';
  }
};

const mapRoleToBackend = (role: UserRole): number => {
  switch (role) {
    case 'SYSTEM_ADMIN':
      return -1;
    case 'ADMIN_COMPANY':
      return 0;
    case 'SYNDIC':
      return 2;
    case 'RESIDENT':
    default:
      return 3;
  }
};

const mapUnitStatusFromBackend = (status: BackendUnitStatus): UnitStatus => {
  switch (status) {
    case 0:
    case 'Green':
    case 'GREEN':
      return 'GREEN';
    case 1:
    case 'Yellow':
    case 'YELLOW':
      return 'YELLOW';
    case 2:
    case 'Red':
    case 'RED':
    default:
      return 'RED';
  }
};

const mapUnitStatusToBackend = (status: UnitStatus): number => {
  switch (status) {
    case 'GREEN':
      return 0;
    case 'YELLOW':
      return 1;
    case 'RED':
    default:
      return 2;
  }
};

const mapOccurrencePriorityFromBackend = (priority: BackendOccurrencePriority): OccurrencePriority => {
  switch (priority) {
    case 0:
    case 'Low':
    case 'LOW':
      return 'LOW';
    case 1:
    case 'Medium':
    case 'MEDIUM':
      return 'MEDIUM';
    case 2:
    case 'High':
    case 'HIGH':
      return 'HIGH';
    case 3:
    case 'Critical':
    case 'CRITICAL':
    default:
      return 'HIGH';
  }
};

const mapOccurrenceStatusFromBackend = (status: BackendOccurrenceStatus): OccurrenceStatus => {
  switch (status) {
    case 0:
    case 'Open':
    case 'OPEN':
      return 'OPEN';
    case 1:
    case 'InProgress':
    case 'IN_PROGRESS':
      return 'IN_PROGRESS';
    case 2:
    case 'Resolved':
    case 'RESOLVED':
      return 'RESOLVED';
    case 3:
    case 'Closed':
    case 'CLOSED':
    default:
      return 'CLOSED';
  }
};

const mapOccurrenceStatusToBackend = (status: OccurrenceStatus): number => {
  switch (status) {
    case 'OPEN':
      return 0;
    case 'IN_PROGRESS':
      return 1;
    case 'RESOLVED':
      return 2;
    case 'CLOSED':
    default:
      return 3;
  }
};

const mapCondo = (value: BackendCondo): Condo => ({
  id: value.id,
  prefix: value.prefix,
  name: value.name,
  address: value.address,
  primaryColor: value.primaryColor,
  logoUrl: value.logoUrl,
});

const mapUser = (value: BackendUser, accessibleCondos: Condo[]): User => ({
  id: value.id,
  companyId: value.companyId,
  name: value.name,
  email: value.email,
  role: mapRole(value.role),
  accessibleCondoIds: accessibleCondos.map((item) => item.id),
  isFirstAccessPending: value.isFirstAccessPending,
  defaultCondoId: value.activeCondoId,
  unitId: value.residentUnitId,
});

const mapBuilding = (value: BackendBuilding): Building => value;
const mapFloor = (value: BackendFloor): Floor => value;
const mapUnit = (value: BackendUnit): Unit => ({
  ...value,
  status: mapUnitStatusFromBackend(value.status),
});
const mapResident = (value: BackendResident): Resident => value;
const mapCommonSpace = (value: BackendCommonSpace): CommonSpace => value;
const mapCommonSpaceReservation = (value: BackendCommonSpaceReservation): CommonSpaceReservation => ({
  id: value.id,
  condoId: value.condoId,
  commonSpaceId: value.commonSpaceId,
  createdByUserId: value.createdByUserId,
  createdByUserName: value.createdByUserName,
  unitId: value.unitId,
  title: value.title,
  notes: value.notes,
  startAtISO: value.startAt,
  endAtISO: value.endAt,
  createdAtISO: value.createdAt,
});
const mapOccurrence = (value: BackendOccurrence): Occurrence => ({
  id: value.id,
  condoId: value.condoId,
  unitId: value.unitId,
  createdByUserId: value.createdByUserId,
  title: value.title,
  description: value.description,
  category: value.category,
  priority: mapOccurrencePriorityFromBackend(value.priority),
  status: mapOccurrenceStatusFromBackend(value.status),
  createdAtISO: value.createdAt,
  updatedAtISO: value.updatedAt,
  attachments: (value.attachments ?? []).map((attachment) => ({
    id: attachment.id,
    condoId: attachment.condoId,
    occurrenceId: attachment.occurrenceId,
    fileUrl: attachment.fileUrl,
    fileName: attachment.fileName,
    contentType: attachment.contentType,
    uploadedAtISO: attachment.uploadedAt,
  })),
});
const mapDocument = (value: BackendDocument): Document => ({
  id: value.id,
  condoId: value.condoId,
  unitId: value.unitId,
  unitLabel: value.unitLabel,
  title: value.title,
  category: value.category,
  description: value.description,
  uploadedAtISO: value.uploadedAt,
  expiresAtISO: value.expiresAt,
  fileUrl: value.fileUrl,
});
const mapBoleto = (value: BackendBoleto): Boleto => ({
  id: value.id,
  condoId: value.condoId,
  unitId: value.unitId,
  unitLabel: value.unitLabel,
  amountCents: value.amountCents,
  referenceMonthISO: value.referenceMonth,
  dueDateISO: value.dueDate,
  status: value.status,
  paidAtISO: value.paidAt,
  notes: value.notes,
  uploadedAtISO: value.uploadedAt,
  fileUrl: value.fileUrl,
  files:
    value.files?.map((file) => ({
      id: file.id,
      boletoId: file.boletoId,
      fileUrl: file.fileUrl,
      fileName: file.fileName,
      contentType: file.contentType,
      uploadedAtISO: file.uploadedAt,
    })) ??
    [
      {
        id: value.id,
        boletoId: value.id,
        fileUrl: value.fileUrl,
        fileName: undefined,
        contentType: 'application/pdf',
        uploadedAtISO: value.uploadedAt,
      },
    ],
});
const mapBoletoPixCharge = (value: BackendBoletoPixCharge): BoletoPixCharge => ({
  id: value.id,
  boletoId: value.boletoId,
  amountCents: value.amountCents,
  platformFeeCents: value.platformFeeCents,
  status: value.status,
  brCode: value.brCode,
  brCodeBase64: value.brCodeBase64,
  createdAtUtc: value.createdAtUtc,
  updatedAtUtc: value.updatedAtUtc,
  expiresAtUtc: value.expiresAtUtc,
  paidAtUtc: value.paidAtUtc,
  receiptUrl: value.receiptUrl,
});
const mapWalletPayment = (value: BackendWalletPayment): WalletPayment => ({
  id: value.id,
  boletoId: value.boletoId,
  unitLabel: value.unitLabel,
  referenceMonthISO: value.referenceMonth,
  amountCents: value.amountCents,
  platformFeeCents: value.platformFeeCents,
  status: value.status,
  createdAtUtc: value.createdAtUtc,
  updatedAtUtc: value.updatedAtUtc,
  paidAtUtc: value.paidAtUtc,
  receiptUrl: value.receiptUrl,
});
const mapWalletWithdrawal = (value: BackendWalletWithdrawal): WalletWithdrawal => ({
  id: value.id,
  amountCents: value.amountCents,
  platformFeeCents: value.platformFeeCents,
  pixKeyType: value.pixKeyType,
  pixKey: value.pixKey,
  status: value.status,
  createdAtUtc: value.createdAtUtc,
  updatedAtUtc: value.updatedAtUtc,
  completedAtUtc: value.completedAtUtc,
  receiptUrl: value.receiptUrl,
});
const mapWalletSummary = (value: BackendWalletSummary): WalletSummary => ({
  totalReceivedCents: value.totalReceivedCents,
  totalFeesCents: value.totalFeesCents,
  availableToWithdrawCents: value.availableToWithdrawCents,
  pendingIncomingCents: value.pendingIncomingCents,
  pendingWithdrawalCents: value.pendingWithdrawalCents,
  recentPayments: value.recentPayments.map(mapWalletPayment),
  recentWithdrawals: value.recentWithdrawals.map(mapWalletWithdrawal),
});
const mapImportantDate = (value: BackendImportantDate): ImportantDate => ({
  id: value.id,
  condoId: value.condoId,
  title: value.title,
  dateISO: value.date,
  type: value.type,
  notes: value.notes,
});
const mapCompanyWorkspaceCondo = (value: BackendCompanyWorkspaceCondo): CompanyWorkspaceCondoSnapshot => ({
  condo: mapCondo(value.condo),
  unitCount: value.unitCount,
  occupiedUnitCount: value.occupiedUnitCount,
  attentionUnitCount: value.attentionUnitCount,
  openOccurrenceCount: value.openOccurrenceCount,
  expiringDocumentCount: value.expiringDocumentCount,
  upcomingDateCount: value.upcomingDateCount,
  overdueBoletoCount: value.overdueBoletoCount,
  overdueBoletoAmountCents: value.overdueBoletoAmountCents,
  availableToWithdrawCents: value.availableToWithdrawCents,
});
const mapCompanyOccurrenceItem = (value: BackendCompanyOccurrenceListItem) => ({
  condo: mapCondo(value.condo),
  occurrence: mapOccurrence(value.occurrence),
});
const mapCompanyDocumentItem = (value: BackendCompanyDocumentListItem) => ({
  condo: mapCondo(value.condo),
  document: mapDocument(value.document),
});
const mapCompanyAgendaItem = (value: BackendCompanyAgendaListItem) => ({
  condo: mapCondo(value.condo),
  date: mapImportantDate(value.date),
});
const mapCompanyBoletoItem = (value: BackendCompanyBoletoListItem) => ({
  condo: mapCondo(value.condo),
  boleto: mapBoleto(value.boleto),
});
const mapCompanyWorkspace = (value: BackendCompanyWorkspace): CompanyWorkspaceSnapshot => ({
  companyName: value.companyName,
  condoCount: value.condoCount,
  totalUnits: value.totalUnits,
  occupiedUnits: value.occupiedUnits,
  attentionUnits: value.attentionUnits,
  openOccurrenceCount: value.openOccurrenceCount,
  expiringDocumentCount: value.expiringDocumentCount,
  upcomingDateCount: value.upcomingDateCount,
  overdueBoletoCount: value.overdueBoletoCount,
  overdueBoletoAmountCents: value.overdueBoletoAmountCents,
  availableToWithdrawCents: value.availableToWithdrawCents,
  condos: value.condos.map(mapCompanyWorkspaceCondo),
  recentOccurrences: value.recentOccurrences.map(mapCompanyOccurrenceItem),
  recentDocuments: value.recentDocuments.map(mapCompanyDocumentItem),
  upcomingDates: value.upcomingDates.map(mapCompanyAgendaItem),
  overdueBoletos: value.overdueBoletos.map(mapCompanyBoletoItem),
});
const mapCompanyOccurrences = (value: BackendCompanyOccurrences): CompanyOccurrencesSnapshot => ({
  openCount: value.openCount,
  inProgressCount: value.inProgressCount,
  resolvedCount: value.resolvedCount,
  closedCount: value.closedCount,
  totalItems: value.totalItems,
  page: value.page,
  pageSize: value.pageSize,
  items: value.items.map(mapCompanyOccurrenceItem),
});
const mapCompanyDocuments = (value: BackendCompanyDocuments): CompanyDocumentsSnapshot => ({
  totalCount: value.totalCount,
  expiringCount: value.expiringCount,
  noExpiryCount: value.noExpiryCount,
  categoryCount: value.categoryCount,
  totalItems: value.totalItems,
  page: value.page,
  pageSize: value.pageSize,
  items: value.items.map(mapCompanyDocumentItem),
});
const mapCompanyAgenda = (value: BackendCompanyAgenda): CompanyAgendaSnapshot => ({
  totalCount: value.totalCount,
  dueTodayCount: value.dueTodayCount,
  nextWeekCount: value.nextWeekCount,
  typeCount: value.typeCount,
  totalItems: value.totalItems,
  page: value.page,
  pageSize: value.pageSize,
  items: value.items.map(mapCompanyAgendaItem),
});
const mapCompanyFinancial = (value: BackendCompanyFinancial): CompanyFinancialSnapshot => ({
  availableToWithdrawCents: value.availableToWithdrawCents,
  overdueBoletoAmountCents: value.overdueBoletoAmountCents,
  overdueBoletoCount: value.overdueBoletoCount,
  openBoletoAmountCents: value.openBoletoAmountCents,
  totalItems: value.totalItems,
  page: value.page,
  pageSize: value.pageSize,
  balances: value.balances.map((item) => ({
    condo: mapCondo(item.condo),
    availableToWithdrawCents: item.availableToWithdrawCents,
    overdueBoletoCount: item.overdueBoletoCount,
    overdueBoletoAmountCents: item.overdueBoletoAmountCents,
  })),
  items: value.items.map(mapCompanyBoletoItem),
});
const mapNotification = (value: BackendNotification): Notification => ({
  id: value.id,
  condoId: value.condoId,
  userId: value.userId,
  title: value.title,
  body: value.body,
  createdAtISO: value.createdAt,
  readAtISO: value.readAt,
});
const mapSubscriptionStatus = (status: BackendSubscriptionStatus): SaasSubscriptionStatus => {
  switch (status) {
    case 1:
    case 'Active':
    case 'ACTIVE':
      return 'ACTIVE';
    case 2:
    case 'Suspended':
    case 'SUSPENDED':
      return 'SUSPENDED';
    case 3:
    case 'Canceled':
    case 'CANCELED':
      return 'CANCELED';
    case 0:
    case 'Trialing':
    case 'TRIALING':
    default:
      return 'TRIALING';
  }
};
const mapBillingProvider = (provider: BackendBillingProvider): SaasBillingProvider => {
  switch (provider) {
    case 1:
    case 'Stripe':
    case 'STRIPE':
      return 'STRIPE';
    case 2:
    case 'Asaas':
    case 'ASAAS':
      return 'ASAAS';
    case 0:
    case 'Manual':
    case 'MANUAL':
    default:
      return 'MANUAL';
  }
};
const mapBillingProviderToBackend = (provider: SaasBillingProvider): number => {
  switch (provider) {
    case 'STRIPE':
      return 1;
    case 'ASAAS':
      return 2;
    case 'MANUAL':
    default:
      return 0;
  }
};
const mapInvoiceStatus = (status: BackendInvoiceStatus): SaasInvoiceStatus => {
  switch (status) {
    case 1:
    case 'Pending':
    case 'PENDING':
      return 'PENDING';
    case 2:
    case 'Paid':
    case 'PAID':
      return 'PAID';
    case 3:
    case 'Overdue':
    case 'OVERDUE':
      return 'OVERDUE';
    case 4:
    case 'Canceled':
    case 'CANCELED':
      return 'CANCELED';
    case 0:
    case 'Draft':
    case 'DRAFT':
    default:
      return 'DRAFT';
  }
};
const mapSubscriptionStatusToBackend = (status: SaasSubscriptionStatus): number => {
  switch (status) {
    case 'ACTIVE':
      return 1;
    case 'SUSPENDED':
      return 2;
    case 'CANCELED':
      return 3;
    case 'TRIALING':
    default:
      return 0;
  }
};
const mapInvoiceStatusToBackend = (status: SaasInvoiceStatus): number => {
  switch (status) {
    case 'PENDING':
      return 1;
    case 'PAID':
      return 2;
    case 'OVERDUE':
      return 3;
    case 'CANCELED':
      return 4;
    case 'DRAFT':
    default:
      return 0;
  }
};
const mapSaasPlan = (value: BackendSaasPlan): SaasPlan => value;
const mapSaasSubscription = (value: BackendCompanySubscription): SaasSubscription => ({
  ...value,
  status: mapSubscriptionStatus(value.status),
  billingProvider: mapBillingProvider(value.billingProvider),
});
const mapSaasInvoice = (value: BackendBillingInvoice): SaasInvoice => ({
  ...value,
  billingProvider: mapBillingProvider(value.billingProvider),
  status: mapInvoiceStatus(value.status),
});
const mapSaasSupportNote = (value: BackendCompanySupportNote): SaasSupportNote => value;
const mapSaasCompanySummary = (value: BackendCompanySummary): SaasCompanySummary => ({
  id: value.id,
  name: value.name,
  createdAtUtc: value.createdAtUtc,
  condoCount: value.condoCount,
  userCount: value.userCount,
  condos: value.condos.map(mapCondo),
  currentSubscription: value.currentSubscription ? mapSaasSubscription(value.currentSubscription) : undefined,
  currentPlan: value.currentPlan ? mapSaasPlan(value.currentPlan) : undefined,
  recentInvoices: value.recentInvoices.map(mapSaasInvoice),
  supportNotes: value.supportNotes.map(mapSaasSupportNote),
});
const mapCustomerPortal = (value: BackendCustomerPortal): CustomerPortal => ({
  companyId: value.companyId,
  companyName: value.companyName,
  currentSubscription: value.currentSubscription ? mapSaasSubscription(value.currentSubscription) : undefined,
  currentPlan: value.currentPlan ? mapSaasPlan(value.currentPlan) : undefined,
  condoCount: value.condoCount,
  estimatedMonthlyAmount: value.estimatedMonthlyAmount,
  invoices: value.invoices.map(mapSaasInvoice),
  welcomeChecklist: value.welcomeChecklist,
});

const getTenantPrefixFromHostname = (hostname: string): string | undefined => {
  const normalized = hostname.trim().toLowerCase();
  if (!normalized || normalized === 'localhost') {
    return undefined;
  }

  const labels = normalized.split('.').filter(Boolean);
  if (labels.length >= 3) {
    const prefix = labels[0];
    if (prefix === 'www' || prefix === 'api') {
      return undefined;
    }
    return prefix;
  }

  if (labels.length === 2 && labels[1] === 'localhost') {
    return labels[0];
  }

  return undefined;
};

const getTenantPrefixFromWindow = (): string | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return getTenantPrefixFromHostname(window.location.hostname);
};

const pickActiveCondoId = (condos: Condo[], requestedActiveCondoId?: string): string | undefined => {
  const prefix = getTenantPrefixFromWindow();
  if (prefix) {
    const byPrefix = condos.find((item) => item.prefix?.toLowerCase() === prefix);
    if (byPrefix) {
      return byPrefix.id;
    }
  }

  if (requestedActiveCondoId && condos.some((item) => item.id === requestedActiveCondoId)) {
    return requestedActiveCondoId;
  }

  return condos[0]?.id;
};

const toQueryString = (params: Record<string, string | number | boolean | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value));
    }
  });
  const rendered = query.toString();
  return rendered ? `?${rendered}` : '';
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const buildTenantUrl = (
  prefix: string | undefined,
  path: string,
  accessToken?: string,
  condoId?: string,
  query?: Record<string, string | undefined>,
) => {
  if (typeof window === 'undefined' || !prefix) {
    return path;
  }

  const { protocol, hostname, port } = window.location;
  const labels = hostname.split('.').filter(Boolean);
  let targetHost = `${prefix}.localhost`;

  if (hostname.endsWith('.localhost') || hostname === 'localhost') {
    targetHost = `${prefix}.localhost`;
  } else if (labels.length >= 3) {
    targetHost = [prefix, ...labels.slice(1)].join('.');
  }

  const handoff = new URLSearchParams();
  if (accessToken) {
    handoff.set(AUTH_HANDOFF_TOKEN_PARAM, accessToken);
  }
  if (condoId) {
    handoff.set(AUTH_HANDOFF_CONDO_PARAM, condoId);
  }

  const search = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value) {
      search.set(key, value);
    }
  });

  return `${protocol}//${targetHost}${port ? `:${port}` : ''}${path}${search.size ? `?${search.toString()}` : ''}${handoff.size ? `#${handoff.toString()}` : ''}`;
};

export const buildManagerUrl = (
  path: string,
  accessToken?: string,
  query?: Record<string, string | undefined>,
) => {
  if (typeof window === 'undefined') {
    return path;
  }

  const { protocol, hostname, port } = window.location;
  const labels = hostname.split('.').filter(Boolean);
  let targetHost = hostname;

  if (hostname.endsWith('.localhost')) {
    targetHost = 'localhost';
  } else if (labels.length >= 3) {
    targetHost = labels.slice(1).join('.');
  }

  const handoff = new URLSearchParams();
  if (accessToken) {
    handoff.set(AUTH_HANDOFF_TOKEN_PARAM, accessToken);
  }

  const search = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value) {
      search.set(key, value);
    }
  });

  return `${protocol}//${targetHost}${port ? `:${port}` : ''}${path}${search.size ? `?${search.toString()}` : ''}${handoff.size ? `#${handoff.toString()}` : ''}`;
};

const readErrorPayload = async (response: Response): Promise<{ message: string; code?: string }> => {
  try {
    const payload = (await response.json()) as { title?: string; detail?: string; message?: string; error?: string };
    return {
      message: payload.detail ?? payload.message ?? payload.title ?? payload.error ?? `HTTP ${response.status}`,
      code: payload.title,
    };
  } catch {
    return { message: `HTTP ${response.status}` };
  }
};

const consumeAuthHandoff = (): { accessToken: string; activeCondoId?: string } | undefined => {
  if (typeof window === 'undefined' || !window.location.hash) {
    return undefined;
  }

  const params = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = params.get(AUTH_HANDOFF_TOKEN_PARAM);
  if (!accessToken) {
    return undefined;
  }

  const activeCondoId = params.get(AUTH_HANDOFF_CONDO_PARAM) ?? undefined;
  params.delete(AUTH_HANDOFF_TOKEN_PARAM);
  params.delete(AUTH_HANDOFF_CONDO_PARAM);

  const nextHash = params.toString();
  const nextUrl = `${window.location.pathname}${window.location.search}${nextHash ? `#${nextHash}` : ''}`;
  window.history.replaceState(null, '', nextUrl);

  return { accessToken, activeCondoId };
};

const requestJson = async <T>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    token?: string;
    condoId?: string;
    requireTenant?: boolean;
  } = {}
): Promise<T> => {
  const state = useDashboardStore.getState();
  const token = options.token ?? state.accessToken;
  const condoId = options.condoId ?? state.activeCondoId;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const prefix = getTenantPrefixFromWindow();
  if (prefix) {
    headers['X-Condo-Prefix'] = prefix;
  }

  if (options.requireTenant && condoId) {
    headers['X-Condo-Id'] = condoId;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new Error(`Falha na requisição de rede. Verifique NEXT_PUBLIC_API_URL: ${API_BASE_URL}`);
  }

  if (!response.ok) {
    if (token && response.status === 401) {
      useDashboardStore.setState({
        ...initialState,
        hydrationComplete: state.hydrationComplete,
        bootstrapped: true,
        themeMode: state.themeMode,
      });
    }
    const payload = await readErrorPayload(response);
    throw new ApiError(payload.message, response.status, payload.code);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};

const applyAuthState = (
  payload: { user: BackendUser; accessibleCondos: BackendCondo[]; accessToken?: string },
  preferredActiveCondoId?: string
) => {
  const condos = payload.accessibleCondos.map(mapCondo);
  const mappedUser = mapUser(payload.user, condos);
  const pickedActiveCondoId = pickActiveCondoId(condos, preferredActiveCondoId ?? payload.user.activeCondoId);

  useDashboardStore.setState((prev) => ({
    ...prev,
    users: {
      [mappedUser.id]: mappedUser,
    },
    condos: condos.reduce<Record<string, Condo>>((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {}),
    currentUserId: mappedUser.id,
    activeCondoId: pickedActiveCondoId,
    accessToken: payload.accessToken ?? prev.accessToken,
    bootstrapped: true,
  }));

  return { user: mappedUser, condos, pickedActiveCondoId };
};

interface OccurrenceFilters {
  status?: OccurrenceStatus;
  priority?: OccurrencePriority;
  category?: string;
  unitId?: string;
}

interface DocumentFilters {
  query?: string;
  category?: string;
  expiringSoonDays?: number;
  unitId?: string;
}

export const dashboardApi = {
  auth: {
    register: async (payload: {
      name: string;
      email: string;
      password: string;
      role: UserRole;
      companyId: string;
      accessibleCondoIds: string[];
      residentUnitId?: string | null;
    }) => {
      const data = await requestJson<BackendUser>('/auth/register', {
        method: 'POST',
        body: {
          ...payload,
          role: mapRoleToBackend(payload.role),
          residentUnitId: payload.residentUnitId ?? null,
        },
      });

      return mapUser(data, []);
    },
    login: async (email: string, password: string, allowedRoles: UserRole[]) => {
      const condoPrefix = getTenantPrefixFromWindow();
      if (!condoPrefix) {
        throw new Error(TENANT_PREFIX_REQUIRED_MESSAGE);
      }
      const payload = await requestJson<BackendLoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password, condoPrefix },
      });

      const role = mapRole(payload.user.role);
      if (!allowedRoles.includes(role)) {
        throw new Error('Este usuário não tem acesso ao painel de gestão.');
      }

      const applied = applyAuthState(payload, payload.user.activeCondoId);
      if (applied.pickedActiveCondoId && applied.pickedActiveCondoId !== payload.user.activeCondoId) {
        await requestJson<BackendUser>('/auth/active-condo', {
          method: 'POST',
          token: payload.accessToken,
          body: { condoId: applied.pickedActiveCondoId },
        });
      }

      return applied.user;
    },
    loginBackoffice: async (email: string, password: string) => {
      const payload = await requestJson<BackendLoginResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      const role = mapRole(payload.user.role);
      if (role !== 'SYSTEM_ADMIN' && role !== 'ADMIN_COMPANY') {
        throw new Error('Este usuário não tem acesso ao painel SaaS.');
      }

      const applied = applyAuthState(payload, payload.user.activeCondoId);
      if (applied.pickedActiveCondoId && applied.pickedActiveCondoId !== payload.user.activeCondoId && role !== 'SYSTEM_ADMIN') {
        await requestJson<BackendUser>('/auth/active-condo', {
          method: 'POST',
          token: payload.accessToken,
          body: { condoId: applied.pickedActiveCondoId },
        });
      }

      return {
        user: applied.user,
        requiresSubscriptionPayment: payload.requiresSubscriptionPayment,
      };
    },
    me: async () => {
      const payload = await requestJson<BackendMeResponse>('/auth/me');
      const applied = applyAuthState(payload, useDashboardStore.getState().activeCondoId);
      return { user: applied.user, accessibleCondos: applied.condos };
    },
    logout: async () => {
      try {
        await requestJson<{ message: string }>('/auth/logout', {
          method: 'POST',
          body: { logoutAllSessions: false },
        });
      } catch {
        return;
      }
    },
    listUsersByRole: async (_roles: UserRole[]) => {
      return [] as User[];
    },
    listSyndicsByCondo: async (condoId: string) => {
      const data = await requestJson<BackendUser[]>(`/auth/condos/${condoId}/syndics`, {
        method: 'GET',
      });
      return data.map((item) => mapUser(item, []));
    },
    updateManagedUser: async (userId: string, payload: {
      name: string;
      email: string;
      password?: string;
      accessibleCondoIds: string[];
    }) => {
      const data = await requestJson<BackendUser>(`/auth/users/${userId}`, {
        method: 'PUT',
        body: payload,
      });
      return mapUser(data, []);
    },
    deleteManagedUser: async (userId: string) => {
      return await requestJson<BackendLogoutResponse>(`/auth/users/${userId}`, {
        method: 'DELETE',
      });
    },
  },

  saas: {
    publicPlans: async () => {
      const data = await requestJson<BackendSaasPlan[]>('/saas/public/plans');
      return data.map(mapSaasPlan);
    },
    registerCompany: async (payload: {
      companyName: string;
      condoName: string;
      condoAddress: string;
      condoPrefix: string;
      adminName: string;
      adminEmail: string;
      adminPassword: string;
      syndicName?: string;
      syndicEmail?: string;
      syndicPassword?: string;
      planCode?: string;
      billingProvider?: SaasBillingProvider;
    }) => {
      const data = await requestJson<BackendRegisterCompanyResponse>('/saas/register-company', {
        method: 'POST',
        body: {
          ...payload,
          billingProvider: payload.billingProvider ? mapBillingProviderToBackend(payload.billingProvider) : undefined,
        },
      });

      return {
        company: mapSaasCompanySummary(data.company),
        adminUser: mapUser(data.adminUser, data.company.condos.map(mapCondo)),
        syndicUser: data.syndicUser ? mapUser(data.syndicUser, data.company.condos.map(mapCondo)) : undefined,
        portal: mapCustomerPortal(data.portal),
        message: data.message,
      } satisfies RegisterCompanyResult;
    },
    overview: async (userQuery?: string) => {
      const data = await requestJson<BackendSaasOverview>(`/saas/overview${toQueryString({ userQuery })}`);
      return {
        plans: data.plans.map(mapSaasPlan),
        companies: data.companies.map(mapSaasCompanySummary),
        users: data.users.map((user) => mapUser(user, [])),
      } satisfies SaasOverview;
    },
    plans: async () => {
      const data = await requestJson<BackendSaasPlan[]>('/saas/plans');
      return data.map(mapSaasPlan);
    },
    createPlan: async (payload: Omit<SaasPlan, 'id' | 'createdAtUtc'>) => {
      const data = await requestJson<BackendSaasPlan>('/saas/plans', {
        method: 'POST',
        body: payload,
      });
      return mapSaasPlan(data);
    },
    updatePlan: async (planId: string, payload: Omit<SaasPlan, 'id' | 'createdAtUtc'>) => {
      const data = await requestJson<BackendSaasPlan>(`/saas/plans/${planId}`, {
        method: 'PUT',
        body: payload,
      });
      return mapSaasPlan(data);
    },
    createCompanyCondo: async (companyId: string, payload: { name: string; address: string; prefix: string }) => {
      const data = await requestJson<BackendCondo>(`/saas/companies/${companyId}/condos`, {
        method: 'POST',
        body: payload,
      });
      const condo = mapCondo(data);
      useDashboardStore.setState((state) => {
        const currentUser = state.currentUserId ? state.users[state.currentUserId] : undefined;
        if (!currentUser || currentUser.role !== 'ADMIN_COMPANY') {
          return {
            condos: {
              ...state.condos,
              [condo.id]: condo,
            },
          };
        }

        const accessibleCondoIds = currentUser.accessibleCondoIds.includes(condo.id)
          ? currentUser.accessibleCondoIds
          : [...currentUser.accessibleCondoIds, condo.id];

        return {
          condos: {
            ...state.condos,
            [condo.id]: condo,
          },
          users: {
            ...state.users,
            [currentUser.id]: {
              ...currentUser,
              accessibleCondoIds,
            },
          },
        };
      });
      return condo;
    },
    changeSubscription: async (companyId: string, payload: { planCode: string; status: SaasSubscriptionStatus; billingProvider: SaasBillingProvider; trialDays?: number; notes?: string }) => {
      const data = await requestJson<BackendCompanySubscription>(`/saas/companies/${companyId}/subscription`, {
        method: 'POST',
        body: {
          ...payload,
          status: mapSubscriptionStatusToBackend(payload.status),
          billingProvider: mapBillingProviderToBackend(payload.billingProvider),
        },
      });
      return mapSaasSubscription(data);
    },
    issueInvoice: async (companyId: string, payload: { amount: number; dueAtUtc: string; description: string; currency: string; billingProvider?: SaasBillingProvider }) => {
      const data = await requestJson<BackendBillingInvoice>(`/saas/companies/${companyId}/invoices`, {
        method: 'POST',
        body: {
          ...payload,
          billingProvider: payload.billingProvider ? mapBillingProviderToBackend(payload.billingProvider) : undefined,
        },
      });
      return mapSaasInvoice(data);
    },
    updateInvoiceStatus: async (payload: {
      billingProvider: SaasBillingProvider;
      externalInvoiceId: string;
      providerEventId: string;
      status: SaasInvoiceStatus;
      paidAtUtc?: string;
    }) => {
      const data = await requestJson<BackendBillingInvoice>('/saas/billing/webhook', {
        method: 'POST',
        body: {
          ...payload,
          billingProvider: mapBillingProviderToBackend(payload.billingProvider),
          status: mapInvoiceStatusToBackend(payload.status),
        },
      });
      return mapSaasInvoice(data);
    },
    searchUsers: async (query?: string) => {
      const data = await requestJson<BackendUser[]>(`/saas/users/search${toQueryString({ q: query })}`);
      return data.map((user) => mapUser(user, []));
    },
    addSupportNote: async (companyId: string, payload: { title: string; body: string }) => {
      const data = await requestJson<BackendCompanySupportNote>(`/saas/companies/${companyId}/notes`, {
        method: 'POST',
        body: payload,
      });
      return mapSaasSupportNote(data);
    },
    customerPortal: async (companyId?: string) => {
      const data = await requestJson<BackendCustomerPortal>(`/saas/customer-portal${toQueryString({ companyId })}`);
      return mapCustomerPortal(data);
    },
  },

  tenant: {
    listAccessibleCondos: async () => {
      const state = useDashboardStore.getState();
      const currentUser = state.currentUserId ? state.users[state.currentUserId] : undefined;
      if (!currentUser) {
        return [] as Condo[];
      }
      return currentUser.accessibleCondoIds
        .map((id) => state.condos[id])
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));
    },
    setActiveCondo: async (condoId: string) => {
      const state = useDashboardStore.getState();
      const currentUser = state.currentUserId ? state.users[state.currentUserId] : undefined;
      if (!currentUser || !currentUser.accessibleCondoIds.includes(condoId)) {
        throw new Error('Condomínio não permitido para este usuário.');
      }

      await requestJson<BackendUser>('/auth/active-condo', {
        method: 'POST',
        body: { condoId },
      });

      useDashboardStore.setState({ activeCondoId: condoId });
      return state.condos[condoId];
    },
    updateBranding: async (condoId: string, payload: { primaryColor?: string; logoUrl?: string }) => {
      const data = await requestJson<BackendCondo>(`/condos/${condoId}/branding`, {
        method: 'PUT',
        body: {
          primaryColor: payload.primaryColor,
          logoUrl: payload.logoUrl,
        },
      });
      const condo = mapCondo(data);
      useDashboardStore.setState((state) => ({
        condos: {
          ...state.condos,
          [condo.id]: condo,
        },
      }));
      return condo;
    },
    createBrandingUploadUrl: async (condoId: string, payload: { fileName: string; contentType?: string }) => {
      return await requestJson<BackendCondoBrandingUploadUrl>(`/condos/${condoId}/branding/upload-url`, {
        method: 'POST',
        body: payload,
      });
    },
    resetBranding: async (condoId: string) => {
      const data = await requestJson<BackendCondo>(`/condos/${condoId}/branding/reset`, {
        method: 'POST',
      });
      const condo = mapCondo(data);
      useDashboardStore.setState((state) => ({
        condos: {
          ...state.condos,
          [condo.id]: condo,
        },
      }));
      return condo;
    },
  },

  home: {
    getSummary: async (): Promise<DashboardSummary> => {
      const state = useDashboardStore.getState();
      const currentUser = state.currentUserId ? state.users[state.currentUserId] : undefined;
      const [condos, occurrences, documents, dates] = await Promise.all([
        dashboardApi.tenant.listAccessibleCondos(),
        dashboardApi.occurrences.list({ status: 'OPEN' }),
        dashboardApi.documents.list({ expiringSoonDays: 30 }),
        dashboardApi.dates.list({ upcoming: 7 }),
      ]);
      let myUnit: Unit | undefined;
      let myUnits: Unit[] = [];

      if (currentUser?.role === 'RESIDENT') {
        try {
          const data = await requestJson<BackendUnit[]>('/auth/my-units', { requireTenant: true });
          myUnits = data.map(mapUnit);
        } catch {
          myUnits = [];
        }
      }

      if (currentUser?.role === 'RESIDENT' && currentUser?.unitId) {
        const details = await dashboardApi.units.getUnitDetails(currentUser.unitId);
        myUnit = details?.unit;
      }

      if (currentUser?.role === 'RESIDENT' && !myUnits.length && myUnit) {
        myUnits = [myUnit];
      }

      return {
        condo: condos.find((item) => item.id === state.activeCondoId),
        myUnits,
        myUnit,
        openOccurrences: occurrences,
        expiringDocuments: documents.filter((item) => !!item.expiresAtISO && isWithinDays(item.expiresAtISO, 30)),
        upcomingDates: dates,
      };
    },
  },

  company: {
    getWorkspace: async (filters: { condoId?: string } = {}): Promise<CompanyWorkspaceSnapshot> => {
      const state = useDashboardStore.getState();
      const currentUser = state.currentUserId ? state.users[state.currentUserId] : undefined;

      if (!currentUser || currentUser.role !== 'ADMIN_COMPANY') {
        throw new Error('Esta area e exclusiva para administradores da empresa.');
      }

      const data = await requestJson<BackendCompanyWorkspace>(`/saas/company-workspace${toQueryString({ condoId: filters.condoId })}`);
      return mapCompanyWorkspace(data);
    },
    getOccurrences: async (filters: {
      condoId?: string;
      search?: string;
      status?: string;
      priority?: string;
      category?: string;
      page?: number;
      pageSize?: number;
    } = {}): Promise<CompanyOccurrencesSnapshot> => {
      const data = await requestJson<BackendCompanyOccurrences>(`/saas/company-occurrences${toQueryString(filters)}`);
      return mapCompanyOccurrences(data);
    },
    getDocuments: async (filters: {
      condoId?: string;
      search?: string;
      category?: string;
      expiringOnly?: boolean;
      withoutExpiry?: boolean;
      page?: number;
      pageSize?: number;
    } = {}): Promise<CompanyDocumentsSnapshot> => {
      const data = await requestJson<BackendCompanyDocuments>(`/saas/company-documents${toQueryString(filters)}`);
      return mapCompanyDocuments(data);
    },
    getAgenda: async (filters: {
      condoId?: string;
      search?: string;
      type?: string;
      startDate?: string;
      endDate?: string;
      upcomingDays?: number;
      page?: number;
      pageSize?: number;
    } = {}): Promise<CompanyAgendaSnapshot> => {
      const data = await requestJson<BackendCompanyAgenda>(`/saas/company-agenda${toQueryString(filters)}`);
      return mapCompanyAgenda(data);
    },
    getFinancial: async (filters: {
      condoId?: string;
      search?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      pageSize?: number;
    } = {}): Promise<CompanyFinancialSnapshot> => {
      const data = await requestJson<BackendCompanyFinancial>(`/saas/company-financial${toQueryString(filters)}`);
      return mapCompanyFinancial(data);
    },
  },

  map: {
    getBuildings: async () => {
      const data = await requestJson<BackendBuilding[]>('/buildings', { requireTenant: true });
      return data.map(mapBuilding);
    },
    getFloors: async (buildingId?: string) => {
      const data = await requestJson<BackendFloor[]>(`/floors${toQueryString({ buildingId })}`, { requireTenant: true });
      return data.map(mapFloor);
    },
    getUnits: async (floorId?: string) => {
      const data = await requestJson<BackendUnit[]>(`/units${toQueryString({ floorId })}`, { requireTenant: true });
      return data.map(mapUnit);
    },
    createBuilding: async (name: string) => {
      const data = await requestJson<BackendBuilding>('/buildings', {
        method: 'POST',
        requireTenant: true,
        body: { name },
      });
      return mapBuilding(data);
    },
    createFloor: async (buildingId: string, number: number) => {
      const data = await requestJson<BackendFloor>('/floors', {
        method: 'POST',
        requireTenant: true,
        body: { buildingId, number },
      });
      return mapFloor(data);
    },
    createUnit: async (floorId: string, label: string, status: UnitStatus) => {
      const data = await requestJson<BackendUnit>('/units', {
        method: 'POST',
        requireTenant: true,
        body: {
          floorId,
          label,
          status: mapUnitStatusToBackend(status),
        },
      });
      return mapUnit(data);
    },
  },

  units: {
    getUnitDetails: async (unitId: string) => {
      try {
        const data = await requestJson<BackendUnitDetails>(`/units/${unitId}`, { requireTenant: true });
        return {
          unit: mapUnit(data.unit),
          residents: data.residents.map(mapResident),
          occurrences: data.recentOccurrences.map(mapOccurrence),
        };
      } catch {
        return undefined;
      }
    },
    update: async (unitId: string, label: string) => {
      const data = await requestJson<BackendUnit>(`/units/${unitId}`, {
        method: 'PATCH',
        requireTenant: true,
        body: { label },
      });
      return mapUnit(data);
    },
    setStatus: async (unitId: string, status: UnitStatus) => {
      const data = await requestJson<BackendUnit>(`/units/${unitId}/status`, {
        method: 'PATCH',
        requireTenant: true,
        body: { status: mapUnitStatusToBackend(status) },
      });
      return mapUnit(data);
    },
  },

  residents: {
    list: async (unitId?: string) => {
      const data = await requestJson<BackendResident[]>(`/residents${toQueryString({ unitId })}`, {
        requireTenant: true,
      });
      return data.map(mapResident);
    },
    listByUnit: async (unitId: string) => {
      return dashboardApi.residents.list(unitId);
    },
    create: async (payload: {
      unitIds: string[];
      name: string;
      email: string;
      phone?: string;
      isOwner?: boolean;
    }) => {
      const data = await requestJson<BackendCreateResidentResponse>('/residents', {
        method: 'POST',
        requireTenant: true,
        body: {
          unitIds: payload.unitIds,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          isOwner: payload.isOwner ?? false,
        },
      });

        return {
          residents: data.residents.map(mapResident),
          message: data.message,
        };
      },
    update: async (residentId: string, payload: {
      name: string;
      email: string;
      phone?: string;
      isOwner?: boolean;
    }) => {
      const data = await requestJson<BackendResident>(`/residents/${residentId}`, {
        method: 'PUT',
        requireTenant: true,
        body: {
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          isOwner: payload.isOwner ?? false,
        },
      });
      return mapResident(data);
    },
    allocateUnit: async (residentId: string, unitId: string) => {
      const data = await requestJson<BackendAllocateResidentResponse>(`/residents/${residentId}/unit`, {
        method: 'PATCH',
        requireTenant: true,
        body: { unitId },
      });

        return {
          resident: mapResident(data.resident),
          message: data.message,
        };
      },
    remove: async (residentId: string) => {
      const data = await requestJson<BackendDeleteResidentResponse>(`/residents/${residentId}`, {
        method: 'DELETE',
        requireTenant: true,
      });

      return data.message;
    },
  },

  occurrences: {
    list: async (filters: OccurrenceFilters = {}) => {
      const data = await requestJson<BackendOccurrence[]>(
        `/occurrences${toQueryString({
          status: filters.status ? mapOccurrenceStatusToBackend(filters.status) : undefined,
          category: filters.category,
          unitId: filters.unitId,
        })}`,
        { requireTenant: true }
      );

      const mapped = data.map(mapOccurrence);
      if (!filters.priority) {
        return mapped;
      }

      return mapped.filter((item) => item.priority === filters.priority);
    },
    updateStatus: async (occurrenceId: string, status: OccurrenceStatus) => {
      const data = await requestJson<BackendOccurrence>(`/occurrences/${occurrenceId}/status`, {
        method: 'PATCH',
        requireTenant: true,
        body: { status: mapOccurrenceStatusToBackend(status) },
      });
      return mapOccurrence(data);
    },
  },

  commonSpaces: {
    list: async (filters: { activeOnly?: boolean } = {}) => {
      const data = await requestJson<BackendCommonSpace[]>(
        `/common-spaces${toQueryString({ activeOnly: filters.activeOnly })}`,
        { requireTenant: true }
      );
      return data.map(mapCommonSpace);
    },
    create: async (payload: {
      name: string;
      description?: string;
      openMinutes: number;
      closeMinutes: number;
      isActive?: boolean;
    }) => {
      const data = await requestJson<BackendCommonSpace>('/common-spaces', {
        method: 'POST',
        requireTenant: true,
        body: {
          name: payload.name,
          description: payload.description,
          openMinutes: payload.openMinutes,
          closeMinutes: payload.closeMinutes,
          isActive: payload.isActive ?? true,
        },
      });
      return mapCommonSpace(data);
    },
    update: async (id: string, payload: {
      name: string;
      description?: string;
      openMinutes: number;
      closeMinutes: number;
      isActive?: boolean;
    }) => {
      const data = await requestJson<BackendCommonSpace>(`/common-spaces/${id}`, {
        method: 'PUT',
        requireTenant: true,
        body: {
          name: payload.name,
          description: payload.description,
          openMinutes: payload.openMinutes,
          closeMinutes: payload.closeMinutes,
          isActive: payload.isActive ?? true,
        },
      });
      return mapCommonSpace(data);
    },
    remove: async (id: string) => {
      await requestJson<void>(`/common-spaces/${id}`, {
        method: 'DELETE',
        requireTenant: true,
      });
    },
  },

  commonSpaceReservations: {
    list: async (filters: { commonSpaceId?: string; startISO?: string; endISO?: string } = {}) => {
      const data = await requestJson<BackendCommonSpaceReservation[]>(
        `/common-space-reservations${toQueryString({
          commonSpaceId: filters.commonSpaceId,
          start: filters.startISO,
          end: filters.endISO,
        })}`,
        { requireTenant: true }
      );
      return data.map(mapCommonSpaceReservation);
    },
    create: async (payload: {
      commonSpaceId: string;
      title: string;
      notes?: string;
      startAtISO: string;
      endAtISO: string;
      residentId?: string;
    }) => {
      const data = await requestJson<BackendCommonSpaceReservation>('/common-space-reservations', {
        method: 'POST',
        requireTenant: true,
        body: {
          commonSpaceId: payload.commonSpaceId,
          title: payload.title,
          notes: payload.notes,
          startAt: payload.startAtISO,
          endAt: payload.endAtISO,
          residentId: payload.residentId,
        },
      });
      return mapCommonSpaceReservation(data);
    },
    update: async (id: string, payload: {
      commonSpaceId: string;
      title: string;
      notes?: string;
      startAtISO: string;
      endAtISO: string;
      residentId?: string;
    }) => {
      const data = await requestJson<BackendCommonSpaceReservation>(`/common-space-reservations/${id}`, {
        method: 'PUT',
        requireTenant: true,
        body: {
          commonSpaceId: payload.commonSpaceId,
          title: payload.title,
          notes: payload.notes,
          startAt: payload.startAtISO,
          endAt: payload.endAtISO,
          residentId: payload.residentId,
        },
      });
      return mapCommonSpaceReservation(data);
    },
    remove: async (id: string) => {
      await requestJson<void>(`/common-space-reservations/${id}`, {
        method: 'DELETE',
        requireTenant: true,
      });
    },
  },

  documents: {
    list: async (filters: DocumentFilters = {}) => {
      const data = await requestJson<BackendDocument[]>(
        `/documents${toQueryString({
          category: filters.category,
          expiringSoon: filters.expiringSoonDays,
          unitId: filters.unitId,
        })}`,
        { requireTenant: true }
      );

      const mapped = data.map(mapDocument);
      if (!filters.query?.trim()) {
        return mapped;
      }

      const query = filters.query.trim().toLowerCase();
      return mapped.filter((item) => item.title.toLowerCase().includes(query));
    },
    createUploadUrl: async (payload: { fileName: string; contentType?: string }) => {
      return await requestJson<BackendDocumentUploadUrl>('/documents/upload-url', {
        method: 'POST',
        requireTenant: true,
        body: {
          fileName: payload.fileName,
          contentType: payload.contentType,
        },
      });
    },
    upload: async (payload: {
      unitId: string;
      title: string;
      category: string;
      description?: string;
      expiresAtISO?: string;
      fileUrl?: string;
    }) => {
      const data = await requestJson<BackendDocument>('/documents', {
        method: 'POST',
        requireTenant: true,
        body: {
          unitId: payload.unitId,
          title: payload.title,
          category: payload.category,
          description: payload.description,
          expiresAt: payload.expiresAtISO,
          fileUrl: payload.fileUrl,
        },
      });
      return mapDocument(data);
    },
    update: async (documentId: string, payload: {
      unitId: string;
      title: string;
      category: string;
      description?: string;
      expiresAtISO?: string;
      fileUrl?: string;
    }) => {
      const data = await requestJson<BackendDocument>(`/documents/${documentId}`, {
        method: 'PUT',
        requireTenant: true,
        body: {
          unitId: payload.unitId,
          title: payload.title,
          category: payload.category,
          description: payload.description,
          expiresAt: payload.expiresAtISO,
          fileUrl: payload.fileUrl,
        },
      });
      return mapDocument(data);
    },
    setExpiry: async (documentId: string, expiresAtISO?: string) => {
      const data = await requestJson<BackendDocument>(`/documents/${documentId}/expiry`, {
        method: 'PATCH',
        requireTenant: true,
        body: {
          expiresAt: expiresAtISO ?? null,
        },
      });
      return mapDocument(data);
    },
    remove: async (documentId: string) => {
      await requestJson<void>(`/documents/${documentId}`, {
        method: 'DELETE',
        requireTenant: true,
      });
    },
  },

  boletos: {
    list: async (filters: { unitId?: string; referenceMonthISO?: string } = {}) => {
      const data = await requestJson<BackendBoleto[]>(
        `/boletos${toQueryString({
          unitId: filters.unitId,
          referenceMonth: filters.referenceMonthISO,
        })}`,
        { requireTenant: true }
      );
      return data.map(mapBoleto);
    },
    createUploadUrl: async (payload: { fileName: string }) => {
      return await requestJson<BackendBoletoUploadUrl>('/boletos/upload-url', {
        method: 'POST',
        requireTenant: true,
        body: {
          fileName: payload.fileName,
          contentType: 'application/pdf',
        },
      });
    },
    create: async (payload: {
      unitId: string;
      amountCents: number;
      referenceMonthISO: string;
      dueDateISO: string;
      notes?: string;
      fileUrls: string[];
      replaceExisting?: boolean;
    }) => {
      const data = await requestJson<BackendBoleto>('/boletos', {
        method: 'POST',
        requireTenant: true,
        body: {
          unitId: payload.unitId,
          amountCents: payload.amountCents,
          referenceMonth: payload.referenceMonthISO,
          dueDate: payload.dueDateISO,
          notes: payload.notes,
          fileUrl: payload.fileUrls[0] ?? '',
          fileUrls: payload.fileUrls,
          replaceExisting: payload.replaceExisting ?? false,
        },
      });
      return mapBoleto(data);
    },
    update: async (
      boletoId: string,
      payload: {
        unitId: string;
        amountCents: number;
        referenceMonthISO: string;
        dueDateISO: string;
        notes?: string;
        fileUrls?: string[];
      }
    ) => {
      const data = await requestJson<BackendBoleto>(`/boletos/${boletoId}`, {
        method: 'PUT',
        requireTenant: true,
        body: {
          unitId: payload.unitId,
          amountCents: payload.amountCents,
          referenceMonth: payload.referenceMonthISO,
          dueDate: payload.dueDateISO,
          notes: payload.notes,
          fileUrl: payload.fileUrls?.[0],
          fileUrls: payload.fileUrls,
        },
      });
      return mapBoleto(data);
    },
    remove: async (boletoId: string) => {
      await requestJson<void>(`/boletos/${boletoId}`, {
        method: 'DELETE',
        requireTenant: true,
      });
    },
    updateStatus: async (boletoId: string, status: 'OPEN' | 'PAID') => {
      const data = await requestJson<BackendBoleto>(`/boletos/${boletoId}/status`, {
        method: 'PATCH',
        requireTenant: true,
        body: { status },
      });
      return mapBoleto(data);
    },
    getPixCharge: async (boletoId: string) => {
      const data = await requestJson<BackendBoletoPixCharge>(`/boletos/${boletoId}/pix`, {
        requireTenant: true,
      });
      return mapBoletoPixCharge(data);
    },
    createOrGetPixCharge: async (boletoId: string) => {
      const data = await requestJson<BackendBoletoPixCharge>(`/boletos/${boletoId}/pix`, {
        method: 'POST',
        requireTenant: true,
      });
      return mapBoletoPixCharge(data);
    },
  },

  wallet: {
    getSummary: async () => {
      const data = await requestJson<BackendWalletSummary>('/wallet/summary', {
        requireTenant: true,
      });
      return mapWalletSummary(data);
    },
    listPayments: async () => {
      const data = await requestJson<BackendWalletPayment[]>('/wallet/payments', {
        requireTenant: true,
      });
      return data.map(mapWalletPayment);
    },
    listWithdrawals: async () => {
      const data = await requestJson<BackendWalletWithdrawal[]>('/wallet/withdrawals', {
        requireTenant: true,
      });
      return data.map(mapWalletWithdrawal);
    },
    createWithdrawal: async (payload: {
      amountCents: number;
      pixKeyType: WalletWithdrawal['pixKeyType'];
      pixKey: string;
      description?: string;
    }) => {
      const data = await requestJson<BackendWalletWithdrawal>('/wallet/withdrawals', {
        method: 'POST',
        requireTenant: true,
        body: payload,
      });
      return mapWalletWithdrawal(data);
    },
  },

  dates: {
    list: async (filters: { upcoming?: number } = {}) => {
      const data = await requestJson<BackendImportantDate[]>(
        `/dates${toQueryString({ upcoming: filters.upcoming })}`,
        { requireTenant: true }
      );
      return data.map(mapImportantDate);
    },
    create: async (payload: { title: string; dateISO: string; type: string; notes?: string }) => {
      const data = await requestJson<BackendImportantDate>('/dates', {
        method: 'POST',
        requireTenant: true,
        body: {
          title: payload.title,
          date: payload.dateISO,
          type: payload.type,
          notes: payload.notes,
        },
      });
      return mapImportantDate(data);
    },
    update: async (id: string, payload: { title: string; dateISO: string; type: string; notes?: string }) => {
      const data = await requestJson<BackendImportantDate>(`/dates/${id}`, {
        method: 'PUT',
        requireTenant: true,
        body: {
          title: payload.title,
          date: payload.dateISO,
          type: payload.type,
          notes: payload.notes,
        },
      });
      return mapImportantDate(data);
    },
    remove: async (id: string) => {
      await requestJson<void>(`/dates/${id}`, {
        method: 'DELETE',
        requireTenant: true,
      });
    },
  },
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      ...initialState,
      hydrationComplete: false,
      bootstrapped: false,
      markHydrated: (value) => set({ hydrationComplete: value }),
      bootstrap: async () => {
        const handoff = consumeAuthHandoff();
        if (handoff) {
          set({
            accessToken: handoff.accessToken,
            activeCondoId: handoff.activeCondoId,
            bootstrapped: false,
          });
        }

        const state = get();
        if (state.bootstrapped) {
          return;
        }

        if (!state.accessToken) {
          set({ bootstrapped: true, currentUserId: undefined, activeCondoId: undefined, users: {}, condos: {} });
          return;
        }

        try {
          const me = await dashboardApi.auth.me();
          const chosenCondoId = pickActiveCondoId(me.accessibleCondos, state.activeCondoId);
          if (chosenCondoId && chosenCondoId !== state.activeCondoId) {
            await dashboardApi.tenant.setActiveCondo(chosenCondoId);
          }
          set({ bootstrapped: true });
        } catch {
          set({
            ...initialState,
            hydrationComplete: state.hydrationComplete,
            bootstrapped: true,
          });
        }
      },
      loginStaff: async (email, password) => {
        await dashboardApi.auth.login(email, password, ['SYNDIC', 'ADMIN_COMPANY']);
        set({ bootstrapped: true });
      },
      logout: async () => {
        await dashboardApi.auth.logout();
        set({
          users: {},
          condos: {},
          currentUserId: undefined,
          activeCondoId: undefined,
          accessToken: undefined,
        });
      },
      setActiveCondoId: async (condoId) => {
        await dashboardApi.tenant.setActiveCondo(condoId);
      },
      updateCondoBranding: async (payload) => {
        const condoId = get().activeCondoId;
        if (!condoId) {
          throw new Error('Nenhum condomínio ativo selecionado.');
        }

        return await dashboardApi.tenant.updateBranding(condoId, payload);
      },
      createCondoBrandingUploadUrl: async (payload) => {
        const condoId = get().activeCondoId;
        if (!condoId) {
          throw new Error('Nenhum condomínio ativo selecionado.');
        }

        return await dashboardApi.tenant.createBrandingUploadUrl(condoId, payload);
      },
      resetCondoBranding: async () => {
        const condoId = get().activeCondoId;
        if (!condoId) {
          throw new Error('Nenhum condomínio ativo selecionado.');
        }

        return await dashboardApi.tenant.resetBranding(condoId);
      },
      setThemeMode: (mode) => set({ themeMode: mode }),
      resetDemo: async () => {
        const themeMode = get().themeMode;
        set({
          ...initialState,
          themeMode,
          bootstrapped: true,
        });
      },
    }),
    {
      name: STORE_KEY,
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        users: state.users,
        condos: state.condos,
        currentUserId: state.currentUserId,
        activeCondoId: state.activeCondoId,
        accessToken: state.accessToken,
        themeMode: state.themeMode,
      }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated(true);
      },
    }
  )
);
