'use client';

import { FileClock, FileText, Search, ShieldAlert } from 'lucide-react';
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
import { dashboardApi, type CompanyDocumentsSnapshot } from '@/src/store/useDashboardStore';
import { showToast } from '@/src/store/useToastStore';

export default function CompanyDocumentsPage() {
  const { state, currentUser, accessibleCondos } = useCompanyScope();
  const { filters, setFilters } = useCompanyRouteFilters({
    condoId: 'ALL',
    search: '',
    expiry: 'ALL',
    page: '1',
  });
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<CompanyDocumentsSnapshot>();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ADMIN_COMPANY') {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    dashboardApi.company
      .getDocuments({
        condoId: filters.condoId === 'ALL' ? undefined : filters.condoId,
        search: filters.search || undefined,
        expiringOnly: filters.expiry === 'EXPIRING' ? true : undefined,
        withoutExpiry: filters.expiry === 'NO_EXPIRY' ? true : undefined,
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
            title: 'Nao foi possivel carregar os documentos da carteira',
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
        title="Documentos da carteira"
        description="Monitore vencimentos, categorias e unidades vinculadas sem sair da visao da empresa."
        accessibleCondos={accessibleCondos}
        selectedCondoId={filters.condoId as 'ALL' | string}
        onChange={(value) => setFilters({ condoId: value, page: '1' })}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CompanyMetricCard title="Documentos" value={snapshot.totalCount} description="Arquivos na carteira filtrada" icon={FileText} />
        <CompanyMetricCard title="Com vencimento" value={snapshot.expiringCount} description="Monitorados por data de validade" icon={FileClock} />
        <CompanyMetricCard title="Sem vencimento" value={snapshot.noExpiryCount} description="Arquivos permanentes ou sem prazo" icon={ShieldAlert} />
        <CompanyMetricCard title="Categorias" value={snapshot.categoryCount} description="Tipos de documento ativos" icon={FileText} />
      </div>

      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle>Acervo consolidado</CardTitle>
            <CardDescription>Use filtros para encontrar rapidamente documentos por condominio, unidade ou categoria.</CardDescription>
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.6fr,0.8fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-10" value={filters.search} onChange={(event) => setFilters({ search: event.target.value, page: '1' })} placeholder="Buscar por titulo, categoria, unidade ou condominio" />
            </div>
            <select className="input" value={filters.expiry} onChange={(event) => setFilters({ expiry: event.target.value as 'ALL' | 'EXPIRING' | 'NO_EXPIRY', page: '1' })}>
              <option value="ALL">Todos os documentos</option>
              <option value="EXPIRING">Apenas com vencimento</option>
              <option value="NO_EXPIRY">Sem vencimento</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {snapshot.items.length === 0 ? (
            <CompanyListEmpty message="Nenhum documento encontrado com os filtros atuais." />
          ) : (
            <div className="space-y-3">
              {snapshot.items.map((item) => (
                <div key={item.document.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                          {item.document.category}
                        </span>
                        {item.document.unitLabel ? (
                          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                            {item.document.unitLabel}
                          </span>
                        ) : null}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-950 dark:text-slate-50">{item.document.title}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.document.description || 'Sem descricao cadastrada.'}</p>
                      </div>
                      <CompanyRowMeta
                        condoName={item.condo.name}
                        secondary={item.document.expiresAtISO ? `Vence em ${new Date(item.document.expiresAtISO).toLocaleDateString('pt-BR')}` : 'Sem vencimento'}
                      />
                    </div>
                    <OpenCondoButton
                      prefix={item.condo.prefix}
                      condoId={item.condo.id}
                      accessToken={state.accessToken}
                      path="/documents"
                      query={{ documentId: item.document.id, unitId: item.document.unitId }}
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
