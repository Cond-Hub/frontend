export type UserRole = 'SYSTEM_ADMIN' | 'RESIDENT' | 'SYNDIC' | 'ADMIN_COMPANY';
export type UnitStatus = 'GREEN' | 'YELLOW' | 'RED';
export type OccurrencePriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type OccurrenceStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  role: UserRole;
  accessibleCondoIds: string[];
  isFirstAccessPending?: boolean;
  defaultCondoId?: string;
  unitId?: string;
}

export interface Condo {
  id: string;
  name: string;
  address: string;
  prefix?: string;
  primaryColor?: string;
  logoUrl?: string;
}

export interface Building {
  id: string;
  condoId: string;
  name: string;
}

export interface Floor {
  id: string;
  condoId: string;
  buildingId: string;
  number: number;
}

export interface Unit {
  id: string;
  condoId: string;
  floorId: string;
  label: string;
  status: UnitStatus;
}

export interface Resident {
  id: string;
  condoId: string;
  unitId: string;
  name: string;
  email?: string;
  phone?: string;
  isOwner: boolean;
}

export interface CommonSpace {
  id: string;
  condoId: string;
  name: string;
  description?: string;
  openMinutes: number;
  closeMinutes: number;
  isActive: boolean;
}

export interface CommonSpaceReservation {
  id: string;
  condoId: string;
  commonSpaceId: string;
  createdByUserId: string;
  createdByUserName?: string;
  unitId?: string;
  title: string;
  notes?: string;
  startAtISO: string;
  endAtISO: string;
  createdAtISO: string;
}

export interface Document {
  id: string;
  condoId: string;
  unitId?: string;
  unitLabel?: string;
  title: string;
  category: string;
  description?: string;
  uploadedAtISO: string;
  expiresAtISO?: string;
  fileUrl?: string;
}

export interface BoletoFile {
  id: string;
  boletoId: string;
  fileUrl: string;
  fileName?: string;
  contentType?: string;
  uploadedAtISO: string;
}

export interface Boleto {
  id: string;
  condoId: string;
  unitId: string;
  unitLabel: string;
  amountCents: number;
  referenceMonthISO: string;
  dueDateISO: string;
  status: 'OPEN' | 'OVERDUE' | 'PAID';
  paidAtISO?: string;
  notes?: string;
  uploadedAtISO: string;
  fileUrl: string;
  files: BoletoFile[];
}

export interface BoletoPixCharge {
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
}

export interface WalletPayment {
  id: string;
  boletoId: string;
  unitLabel: string;
  referenceMonthISO: string;
  amountCents: number;
  platformFeeCents: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED';
  createdAtUtc: string;
  updatedAtUtc: string;
  paidAtUtc?: string;
  receiptUrl?: string;
}

export interface WalletWithdrawal {
  id: string;
  amountCents: number;
  platformFeeCents: number;
  pixKeyType: 'CPF' | 'CNPJ' | 'PHONE' | 'EMAIL' | 'RANDOM';
  pixKey: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED';
  createdAtUtc: string;
  updatedAtUtc: string;
  completedAtUtc?: string;
  receiptUrl?: string;
}

export interface WalletSummary {
  totalReceivedCents: number;
  totalFeesCents: number;
  availableToWithdrawCents: number;
  pendingIncomingCents: number;
  pendingWithdrawalCents: number;
  recentPayments: WalletPayment[];
  recentWithdrawals: WalletWithdrawal[];
}

export interface OccurrenceAttachment {
  id: string;
  condoId: string;
  occurrenceId: string;
  fileUrl: string;
  fileName?: string;
  contentType?: string;
  uploadedAtISO: string;
}

export interface Occurrence {
  id: string;
  condoId: string;
  unitId?: string;
  createdByUserId: string;
  title: string;
  description: string;
  category: string;
  priority: OccurrencePriority;
  status: OccurrenceStatus;
  createdAtISO: string;
  updatedAtISO: string;
  attachments: OccurrenceAttachment[];
}

export interface ImportantDate {
  id: string;
  condoId: string;
  title: string;
  dateISO: string;
  type: string;
  notes?: string;
}

export interface Notification {
  id: string;
  condoId: string;
  userId: string;
  title: string;
  body: string;
  createdAtISO: string;
  readAtISO?: string;
}
