import {
  AlertTriangle,
  CalendarDays,
  CreditCard,
  DoorOpen,
  FileText,
  LayoutDashboard,
  Map,
  Menu,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type AdminSectionId =
  | 'dashboard'
  | 'map'
  | 'occurrences'
  | 'agenda'
  | 'documents'
  | 'boletos'
  | 'payments'
  | 'common-spaces'
  | 'residents'
  | 'settings';

export type AdminSection = {
  id: AdminSectionId;
  href: string;
  label: string;
  description: string;
  pageTitle: string;
  pageDescription: string;
  icon: LucideIcon;
};

export const adminSections: AdminSection[] = [
  {
    id: 'dashboard',
    href: '/dashboard',
    label: 'Dashboard',
    description: 'Resumo do condomínio',
    pageTitle: 'Dashboard',
    pageDescription: 'Uma visão nova, mais limpa e modular para acompanhar a operação do condomínio.',
    icon: LayoutDashboard,
  },
  {
    id: 'map',
    href: '/map',
    label: 'Mapa',
    description: 'Blocos e unidades',
    pageTitle: 'Mapa',
    pageDescription: 'Novo módulo de navegação por blocos, andares e unidades.',
    icon: Map,
  },
  {
    id: 'occurrences',
    href: '/occurrences',
    label: 'Ocorrências',
    description: 'Chamados e status',
    pageTitle: 'Ocorrências',
    pageDescription: 'Novo fluxo de acompanhamento de chamados e prioridades.',
    icon: AlertTriangle,
  },
  {
    id: 'agenda',
    href: '/agenda',
    label: 'Agenda',
    description: 'Datas e compromissos',
    pageTitle: 'Agenda',
    pageDescription: 'Datas importantes, compromissos e alertas em uma página propria.',
    icon: CalendarDays,
  },
  {
    id: 'documents',
    href: '/documents',
    label: 'Documentos',
    description: 'Arquivos por unidade',
    pageTitle: 'Documentos',
    pageDescription: 'Documentos vinculados a unidades em uma página dedicada.',
    icon: FileText,
  },
  {
    id: 'boletos',
    href: '/boletos',
    label: 'Boletos',
    description: 'Financeiro por unidade',
    pageTitle: 'Boletos',
    pageDescription: 'Controle financeiro por unidade dentro do novo shell administrativo.',
    icon: FileText,
  },
  {
    id: 'payments',
    href: '/payments',
    label: 'Carteira',
    description: 'PIX e recebimentos',
    pageTitle: 'Carteira',
    pageDescription: 'Acompanhamento de recebimentos, PIX e fluxo financeiro do condomínio.',
    icon: CreditCard,
  },
  {
    id: 'common-spaces',
    href: '/common-spaces',
    label: 'Espaços',
    description: 'Reservas e regras',
    pageTitle: 'Espaços',
    pageDescription: 'Gestão de reservas e regras no novo layout administrativo.',
    icon: DoorOpen,
  },
  {
    id: 'residents',
    href: '/residents',
    label: 'Moradores',
    description: 'Gestão de pessoas',
    pageTitle: 'Moradores',
    pageDescription: 'Gestão de pessoas e unidades em uma página propria e nova.',
    icon: Users,
  },
  {
    id: 'settings',
    href: '/settings',
    label: 'Mais funcionalidades',
    description: 'Regimento e ajustes',
    pageTitle: 'Mais funcionalidades',
    pageDescription: 'Acesse recursos extras e configurações do condomínio ativo.',
    icon: Menu,
  },
];

export const getAdminSectionByPathname = (pathname: string) => {
  return adminSections.find((section) => section.href === pathname) ?? adminSections[0];
};
