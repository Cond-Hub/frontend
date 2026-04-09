'use client';

import { CalendarDays, Clock3, Search, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  CompanyListEmpty,
  CompanyMetricCard,
  CompanyPagination,
  CompanyRowMeta,
  CompanyWorkspaceEmptyState,
  CompanyWorkspaceFilterCard,
  CompanyWorkspaceSkeleton,
  OpenCondoButton,
  useCompanyRouteFilters,
  useCompanyScope,
} from '@/components/admin/company-workspace';
import { dashboardApi, type CompanyAgendaSnapshot } from '@/src/store/useDashboardStore';
import { showToast } from '@/src/store/useToastStore';

export default function CompanyAgendaPage() {
  const { state, currentUser, accessibleCondos } = useCompanyScope();
  const { filters, setFilters } = useCompanyRouteFilters({
    condoId: 'ALL',
    search: '',
    type: 'ALL',
    page: '1',
  });
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<CompanyAgendaSnapshot>();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ADMIN_COMPANY') {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    dashboardApi.company
      .getAgenda({
        condoId: filters.condoId === 'ALL' ? undefined : filters.condoId,
        search: filters.search || undefined,
        type: filters.type === 'ALL' ? undefined : filters.type,
        page: Number(filters.page || '1'),
        pageSize: 20,
      })
      .then((data) => {
        if (!cancelled) {
          setSnapshot(data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          showToast({
            tone: 'error',
            title: 'Nao foi possivel carregar a agenda da carteira',
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
  }, [currentUser, filters]);

  if (!currentUser || currentUser.role !== 'ADMIN_COMPANY') {
    return <CompanyWorkspaceEmptyState />;
  }

  if (loading || !snapshot) {
    return <CompanyWorkspaceSkeleton />;
  }

  return (
    <div className="space-y-6">
      <CompanyWorkspaceFilterCard
        title="Agenda da carteira"
        description="Centralize compromissos e datas importantes da empresa inteira, sem perder o acesso ao detalhe por condominio."
        accessibleCondos={accessibleCondos}
        selectedCondoId={filters.condoId as 'ALL' | string}
        onChange={(value) => setFilters({ condoId: value, page: '1' })}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CompanyMetricCard title="Proximos itens" value={snapshot.totalCount} description="Janela futura carregada na carteira" icon={CalendarDays} />
        <CompanyMetricCard title="Hoje" value={snapshot.dueTodayCount} description="Compromissos para hoje" icon={Clock3} />
        <CompanyMetricCard title="Proximos 7 dias" value={snapshot.nextWeekCount} description="Itens a enderecar nesta semana" icon={Timer} />
        <CompanyMetricCard title="Tipos ativos" value={snapshot.typeCount} description="Categorias presentes na agenda" icon={CalendarDays} />
      </div>

      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Agenda consolidada</CardTitle>
            <CardDescription>Filtre por tipo e navegue para o condominio quando precisar ajustar a agenda operacional.</CardDescription>
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.6fr,0.8fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-10" value={filters.search} onChange={(event) => setFilters({ search: event.target.value, page: '1' })} placeholder="Buscar por titulo, tipo, notas ou condominio" />
            </div>
            <select className="input" value={filters.type} onChange={(event) => setFilters({ type: event.target.value, page: '1' })}>
              <option value="ALL">Todos os tipos</option>
              {Array.from(new Set(snapshot.items.map((item) => item.date.type))).sort((a, b) => a.localeCompare(b)).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {snapshot.items.length === 0 ? (
            <CompanyListEmpty message="Nenhuma data encontrada com os filtros atuais." />
          ) : (
            <div className="space-y-3">
              {snapshot.items.map((item) => (
                <div key={item.date.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                          {item.date.type}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                          {new Date(item.date.dateISO).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950 dark:text-slate-50">{item.date.title}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.date.notes || 'Sem anotacoes adicionais.'}</p>
                      </div>
                      <CompanyRowMeta condoName={item.condo.name} secondary={new Date(item.date.dateISO).toLocaleString('pt-BR')} />
                    </div>
                    <OpenCondoButton
                      prefix={item.condo.prefix}
                      condoId={item.condo.id}
                      accessToken={state.accessToken}
                      path="/agenda"
                      query={{ dateId: item.date.id }}
                      label="Abrir item"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <CompanyPagination
            page={snapshot.page}
            pageSize={snapshot.pageSize}
            totalItems={snapshot.totalItems}
            onPageChange={(page) => setFilters({ page: String(page) })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
