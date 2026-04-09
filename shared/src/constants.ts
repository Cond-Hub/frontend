import type {
  Boleto,
  BoletoPixCharge,
  OccurrencePriority,
  OccurrenceStatus,
  UnitStatus,
  UserRole,
  WalletPayment,
  WalletWithdrawal,
} from './models';

export const ROLE_LABELS: Record<UserRole, string> = {
  SYSTEM_ADMIN: 'Administrador do sistema',
  RESIDENT: 'Morador',
  SYNDIC: 'Síndico',
  ADMIN_COMPANY: 'Administrador da empresa',
};

export const UNIT_STATUS_LABELS: Record<UnitStatus, string> = {
  GREEN: 'Normal',
  YELLOW: 'Atenção',
  RED: 'Urgente',
};

export const OCCURRENCE_STATUS_LABELS: Record<OccurrenceStatus, string> = {
  OPEN: 'Aberta',
  IN_PROGRESS: 'Em andamento',
  RESOLVED: 'Resolvida',
  CLOSED: 'Fechada',
};

export const PRIORITY_LABELS: Record<OccurrencePriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
};

export const IMPORTANT_DATE_TYPE_LABELS: Record<string, string> = {
  Maintenance: 'Manutenção',
  Meeting: 'Reunião',
  Assembly: 'Assembleia',
  Inspection: 'Vistoria',
  Event: 'Evento',
  Other: 'Outro',
};

export const BOLETO_STATUS_LABELS: Record<Boleto['status'], string> = {
  OPEN: 'Em aberto',
  OVERDUE: 'Em atraso',
  PAID: 'Pago',
};

export const PIX_CHARGE_STATUS_LABELS: Record<BoletoPixCharge['status'], string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  EXPIRED: 'Expirado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Estornado',
};

export const WALLET_PAYMENT_STATUS_LABELS: Record<WalletPayment['status'], string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  EXPIRED: 'Expirado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Estornado',
};

export const WALLET_WITHDRAWAL_STATUS_LABELS: Record<WalletWithdrawal['status'], string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  FAILED: 'Falhou',
  EXPIRED: 'Expirado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Estornado',
};
