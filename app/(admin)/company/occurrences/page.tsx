'use client';

import { AlertTriangle, Clock3, CheckCircle2, CircleSlash2, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { OCCURRENCE_STATUS_LABELS, PRIORITY_LABELS, type OccurrencePriority, type OccurrenceStatus } from '@/shared/src';
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
import { dashboardApi, type CompanyOccurrencesSnapshot } from '@/src/store/useDashboardStore';
import { showToast } from '@/src/store/useToastStore';

const statusOrder: OccurrenceStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export default function CompanyOccurrencesPage() {
  const { state, currentUser, accessibleCondos } = useCompanyScope();
  const { filters, setFilters } = useCompanyRouteFilters({
    condoId: 'ALL',
    search: '',
    status: 'ALL',
    priority: 'ALL',
    page: '1',
  });
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<CompanyOccurrencesSnapshot>();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ADMIN_COMPANY') {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    dashboardApi.company
      .getOccurrences({
        condoId: filters.condoId === 'ALL' ? undefined : filters.condoId,
        search: filters.search || undefined,
        status: filters.status === 'ALL' ? undefined : filters.status,
        priority: filters.priority === 'ALL' ? undefined : filters.priority,
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
            title: 'Nao foi possivel carregar as ocorrencias da carteira',
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
        title="Ocorrencias da carteira"
        description="Veja chamados de todos os condominios, filtre por prioridade e entre no detalhe operacional quando precisar."
        accessibleCondos={accessibleCondos}
        selectedCondoId={filters.condoId as 'ALL' | string}
        onChange={(value) => setFilters({ condoId: value, page: '1' })}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CompanyMetricCard title="Abertas" value={snapshot.openCount} description="Aguardando tratativa" icon={AlertTriangle} />
        <CompanyMetricCard title="Em andamento" value={snapshot.inProgressCount} description="Ja em fluxo operacional" icon={Clock3} />
        <CompanyMetricCard title="Resolvidas" value={snapshot.resolvedCount} description="Concluidas tecnicamente" icon={CheckCircle2} />
        <CompanyMetricCard title="Encerradas" value={snapshot.closedCount} description="Finalizadas na carteira" icon={CircleSlash2} />
      </div>

      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Fila consolidada</CardTitle>
            <CardDescription>Acompanhe o historico recente e use o drill-down para abrir o condominio certo.</CardDescription>
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.6fr,0.8fr,0.8fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-10" value={filters.search} onChange={(event) => setFilters({ search: event.target.value, page: '1' })} placeholder="Buscar por titulo, descricao, categoria ou condominio" />
            </div>
            <select className="input" value={filters.status} onChange={(event) => setFilters({ status: event.target.value as 'ALL' | OccurrenceStatus, page: '1' })}>
              <option value="ALL">Todos os status</option>
              {statusOrder.map((status) => (
                <option key={status} value={status}>
                  {OCCURRENCE_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <select className="input" value={filters.priority} onChange={(event) => setFilters({ priority: event.target.value as 'ALL' | OccurrencePriority, page: '1' })}>
              <option value="ALL">Todas as prioridades</option>
              {(['HIGH', 'MEDIUM', 'LOW'] as OccurrencePriority[]).map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {snapshot.items.length === 0 ? (
            <CompanyListEmpty message="Nenhuma ocorrencia encontrada com os filtros atuais." />
          ) : (
            <div className="space-y-3">
              {snapshot.items.map((item) => (
                <div key={item.occurrence.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                          {OCCURRENCE_STATUS_LABELS[item.occurrence.status]}
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                          {PRIORITY_LABELS[item.occurrence.priority]}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950 dark:text-slate-50">{item.occurrence.title}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.occurrence.description}</p>
                      </div>
                      <CompanyRowMeta
                        condoName={item.condo.name}
                        secondary={`${item.occurrence.category} • Atualizada em ${new Date(item.occurrence.updatedAtISO).toLocaleDateString('pt-BR')}`}
                      />
                    </div>
                    <OpenCondoButton
                      prefix={item.condo.prefix}
                      condoId={item.condo.id}
                      accessToken={state.accessToken}
                      path="/occurrences"
                      query={{ occurrenceId: item.occurrence.id }}
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
