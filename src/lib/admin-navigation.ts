import {
  AlertTriangle,
  CalendarDays,
  DoorOpen,
  FileText,
  LayoutDashboard,
  Map,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type AdminSectionId =
  | 'dashboard'
  | 'map'
  | 'occurrences'
  | 'agenda'
  | 'boletos'
  | 'common-spaces'
  | 'residents';

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
    description: 'Resumo do condominio',
    pageTitle: 'Dashboard',
    pageDescription: 'Uma visao nova, mais limpa e modular para acompanhar a operacao do condominio.',
    icon: LayoutDashboard,
  },
  {
    id: 'map',
    href: '/map',
    label: 'Mapa',
    description: 'Blocos e unidades',
    pageTitle: 'Mapa',
    pageDescription: 'Novo modulo de navegacao por blocos, andares e unidades.',
    icon: Map,
  },
  {
    id: 'occurrences',
    href: '/occurrences',
    label: 'Ocorrencias',
    description: 'Chamados e status',
    pageTitle: 'Ocorrencias',
    pageDescription: 'Novo fluxo de acompanhamento de chamados e prioridades.',
    icon: AlertTriangle,
  },
  {
    id: 'agenda',
    href: '/agenda',
    label: 'Agenda',
    description: 'Datas e compromissos',
    pageTitle: 'Agenda',
    pageDescription: 'Datas importantes, compromissos e alertas em uma pagina propria.',
    icon: CalendarDays,
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
    id: 'common-spaces',
    href: '/common-spaces',
    label: 'Espacos',
    description: 'Reservas e regras',
    pageTitle: 'Espacos',
    pageDescription: 'Gestao de reservas e regras no novo layout administrativo.',
    icon: DoorOpen,
  },
  {
    id: 'residents',
    href: '/residents',
    label: 'Moradores',
    description: 'Gestao de pessoas',
    pageTitle: 'Moradores',
    pageDescription: 'Gestao de pessoas e unidades em uma pagina propria e nova.',
    icon: Users,
  },
];

export const getAdminSectionByPathname = (pathname: string) => {
  return adminSections.find((section) => section.href === pathname) ?? adminSections[0];
};
