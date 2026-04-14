'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Building2, Loader2, type LucideIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { buildTenantUrl, dashboardApi, startCondoWorkspaceTransition, type CompanyWorkspaceSnapshot, useDashboardStore, CONDO_TRANSITION_ENTER } from '@/src/store/useDashboardStore';
import { showToast } from '@/src/store/useToastStore';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export function formatCompanyCurrency(valueCents: number) {
  return currency.format(valueCents / 100);
}

export function useCompanyScope() {
  const state = useDashboardStore();
  const currentUser = state.currentUserId ? state.users[state.currentUserId] : undefined;
  const accessibleCondos = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return currentUser.accessibleCondoIds
      .map((id) => state.condos[id])
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [currentUser, state.condos]);

  return {
    state,
    currentUser,
    accessibleCondos,
  };
}

export function useCompanyRouteFilters<T extends Record<string, string>>(defaults: T) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = useMemo(() => {
    return Object.entries(defaults).reduce<Record<string, string>>((acc, [key, value]) => {
      acc[key] = searchParams.get(key) ?? value;
      return acc;
    }, {}) as T;
  }, [defaults, searchParams]);

  const setFilters = (updates: Partial<T>) => {
    const next = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      const defaultValue = defaults[key as keyof T];
      if (value === undefined || value === '' || value === defaultValue) {
        next.delete(key);
        return;
      }

      next.set(key, value);
    });

    const rendered = next.toString();
    router.replace(rendered ? `${pathname}?${rendered}` : pathname, { scroll: false });
  };

  return {
    filters,
    setFilters,
  };
}

export function useCompanyWorkspaceData() {
  const { state, currentUser, accessibleCondos } = useCompanyScope();
  const { filters, setFilters } = useCompanyRouteFilters({ condoId: 'ALL' });
  const selectedCondoId = filters.condoId as 'ALL' | string;
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<CompanyWorkspaceSnapshot>();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ADMIN_COMPANY') {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    dashboardApi.company
      .getWorkspace({ condoId: selectedCondoId === 'ALL' ? undefined : selectedCondoId })
      .then((data) => {
        if (!cancelled) {
          setSnapshot(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          showToast({
            tone: 'error',
            title: 'Nao foi possivel carregar o workspace da empresa',
            description: error instanceof Error ? error.message : 'Tente novamente.',
          });
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [currentUser, selectedCondoId]);

  return {
    state,
    currentUser,
    accessibleCondos,
    selectedCondoId,
    setSelectedCondoId: (value: 'ALL' | string) => setFilters({ condoId: value }),
    loading,
    snapshot,
  };
}

export function CompanyWorkspaceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-slate-200 dark:border-slate-800">
            <CardHeader className="space-y-3">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-8 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card className="h-96 border-slate-200 dark:border-slate-800" />
    </div>
  );
}

export function CompanyWorkspaceEmptyState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visao da empresa</CardTitle>
        <CardDescription>Este workspace e exclusivo para administradores da empresa.</CardDescription>
      </CardHeader>
    </Card>
  );
}

export function CompanyWorkspaceFilterCard({
  title,
  description,
  accessibleCondos,
  selectedCondoId,
  onChange,
}: {
  title: string;
  description: string;
  accessibleCondos: Array<{ id: string; name: string }>;
  selectedCondoId: 'ALL' | string;
  onChange: (value: 'ALL' | string) => void;
}) {
  return (
    <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <div className="w-full max-w-xs">
          <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Filtro da carteira</label>
          <select className="input" value={selectedCondoId} onChange={(event) => onChange(event.target.value as 'ALL' | string)}>
            <option value="ALL">Toda a carteira</option>
            {accessibleCondos.map((condo) => (
              <option key={condo.id} value={condo.id}>
                {condo.name}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
    </Card>
  );
}

export function CompanyMetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Card className="relative border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <span className="absolute right-6 top-6 rounded-2xl bg-slate-100 p-2 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
        <Icon className="h-5 w-5" />
      </span>
      <CardHeader className="pr-16">
        <div>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="mt-2 text-3xl">{value}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
      </CardContent>
    </Card>
  );
}

export function CompanyListEmpty({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
      {message}
    </p>
  );
}

export function OpenCondoButton({
  prefix,
  condoId,
  accessToken,
  path = '/dashboard',
  query,
  label = 'Entrar',
  className = '',
}: {
  prefix?: string;
  condoId: string;
  accessToken?: string;
  path?: string;
  query?: Record<string, string | undefined>;
  label?: string;
  className?: string;
}) {
  return (
    <Button
      className={className}
      onClick={() =>
        startCondoWorkspaceTransition(
          buildTenantUrl(prefix, path, accessToken, condoId, query, CONDO_TRANSITION_ENTER),
        )
      }
    >
      {label}
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}

export function CompanyPageLinks() {
  const searchParams = useSearchParams();
  const condoId = searchParams.get('condoId');
  const links = [
    { href: '/company/financial', label: 'Financeiro' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={condoId ? `${link.href}?condoId=${encodeURIComponent(condoId)}` : link.href}
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

export function CompanyRowMeta({ condoName, secondary }: { condoName: string; secondary?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 dark:border-slate-700 dark:bg-slate-950">
        <Building2 className="h-3.5 w-3.5" />
        {condoName}
      </span>
      {secondary ? <span>{secondary}</span> : null}
    </div>
  );
}

export function CompanyLoadingInline() {
  return <Loader2 className="h-4 w-4 animate-spin" />;
}

export function CompanyPagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(totalItems, page * pageSize);

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {totalItems === 0 ? 'Nenhum item encontrado.' : `Mostrando ${start}-${end} de ${totalItems} itens`}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Anterior
        </Button>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Pagina {page} de {totalPages}
        </span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Proxima
        </Button>
      </div>
    </div>
  );
}
