'use client';

import { CreditCard, Landmark, Search, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  CompanyListEmpty,
  CompanyMetricCard,
  CompanyPagination,
  CompanyRowMeta,
  CompanyWorkspaceEmptyState,
  CompanyWorkspaceSkeleton,
  OpenCondoButton,
  formatCompanyCurrency,
  useCompanyRouteFilters,
  useCompanyScope,
} from '@/components/admin/company-workspace';
import { dashboardApi, type CompanyFinancialSnapshot } from '@/src/store/useDashboardStore';
import { showToast } from '@/src/store/useToastStore';

export default function CompanyFinancialPage() {
  const { state, currentUser } = useCompanyScope();
  const { filters, setFilters } = useCompanyRouteFilters({
    condoId: 'ALL',
    search: '',
    status: 'OVERDUE',
    page: '1',
  });
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<CompanyFinancialSnapshot>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ADMIN_COMPANY') {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(undefined);

    dashboardApi.company
      .getFinancial({
        condoId: filters.condoId === 'ALL' ? undefined : filters.condoId,
        search: filters.search || undefined,
        status: filters.status,
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
          setError(error instanceof Error ? error.message : 'Tente novamente.');
          showToast({
            tone: 'error',
            title: 'Nao foi possivel carregar o financeiro da carteira',
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
  }, [currentUser, filters.condoId, filters.search, filters.status, filters.page]);

  if (!currentUser || currentUser.role !== 'ADMIN_COMPANY') {
    return <CompanyWorkspaceEmptyState />;
  }

  if (loading) {
    return <CompanyWorkspaceSkeleton />;
  }

  if (error || !snapshot) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financeiro da carteira</CardTitle>
          <CardDescription>{error ?? 'Nao foi possivel carregar os dados financeiros.'}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CompanyMetricCard title="Disponivel para saque" value={formatCompanyCurrency(snapshot.availableToWithdrawCents)} description="Somatorio da carteira filtrada" icon={Wallet} />
        <CompanyMetricCard title="Total em atraso" value={formatCompanyCurrency(snapshot.overdueBoletoAmountCents)} description="Boletos vencidos" icon={CreditCard} />
        <CompanyMetricCard title="Boletos vencidos" value={snapshot.overdueBoletoCount} description="Itens exigindo cobranca" icon={Landmark} />
        <CompanyMetricCard title="Em aberto" value={formatCompanyCurrency(snapshot.openBoletoAmountCents)} description="Inclui vencidos e a vencer" icon={CreditCard} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr,1.1fr]">
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardHeader>
            <CardTitle>Saldos por condominio</CardTitle>
            <CardDescription>Consulte rapidamente quanto cada operacao tem disponivel para saque.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.balances.length === 0 ? (
              <CompanyListEmpty message="Nenhum saldo encontrado para a carteira atual." />
            ) : (
              snapshot.balances.map((item) => (
                <div key={item.condo.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950 dark:text-slate-50">{item.condo.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.overdueBoletoCount} boletos vencidos</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatCompanyCurrency(item.availableToWithdrawCents)}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardHeader className="space-y-4">
            <div>
              <CardTitle>Boletos</CardTitle>
              <CardDescription>Priorize a cobranca por condominio e entre direto no financeiro operacional quando precisar agir.</CardDescription>
            </div>
            <div className="grid gap-3 lg:grid-cols-[1.6fr,0.8fr]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="pl-10" value={filters.search} onChange={(event) => setFilters({ search: event.target.value, page: '1' })} placeholder="Buscar por unidade, observacoes ou condominio" />
              </div>
              <select className="input" value={filters.status} onChange={(event) => setFilters({ status: event.target.value as 'OVERDUE' | 'OPEN' | 'PAID', page: '1' })}>
                <option value="OVERDUE">Somente vencidos</option>
                <option value="OPEN">Em aberto</option>
                <option value="PAID">Pagos</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {snapshot.items.length === 0 ? (
              <CompanyListEmpty message="Nenhum boleto encontrado com os filtros atuais." />
            ) : (
              <div className="space-y-3">
                {snapshot.items.map((item) => (
                  <div key={item.boleto.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                            {item.boleto.status === 'OVERDUE' ? 'Vencido' : item.boleto.status === 'OPEN' ? 'Aberto' : 'Pago'}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                            {item.boleto.unitLabel}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-950 dark:text-slate-50">{formatCompanyCurrency(item.boleto.amountCents)}</p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{item.boleto.notes || 'Sem observacoes adicionais.'}</p>
                        </div>
                        <CompanyRowMeta
                          condoName={item.condo.name}
                          secondary={`Vencimento em ${new Date(item.boleto.dueDateISO).toLocaleDateString('pt-BR')}`}
                        />
                      </div>
                      <OpenCondoButton
                        prefix={item.condo.prefix}
                        condoId={item.condo.id}
                        accessToken={state.accessToken}
                        path="/boletos"
                        query={{ boletoId: item.boleto.id, unitId: item.boleto.unitId }}
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
    </div>
  );
}
