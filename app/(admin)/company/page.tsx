'use client';

import Link from 'next/link';
import { Building2, Landmark, Wallet } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CompanyMetricCard,
  CompanyWorkspaceEmptyState,
  CompanyWorkspaceSkeleton,
  OpenCondoButton,
  formatCompanyCurrency,
  useCompanyWorkspaceData,
} from '@/components/admin/company-workspace';

export default function CompanyPage() {
  const { state, currentUser, loading, snapshot } = useCompanyWorkspaceData();

  if (!currentUser || currentUser.role !== 'ADMIN_COMPANY') {
    return <CompanyWorkspaceEmptyState />;
  }

  if (loading || !snapshot) {
    return <CompanyWorkspaceSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CompanyMetricCard title="Condominios" value={snapshot.condoCount} description="Carteira filtrada" icon={Building2} />
        <CompanyMetricCard title="Unidades" value={snapshot.totalUnits} description={`${snapshot.occupiedUnits} em operacao`} icon={Building2} />
        <CompanyMetricCard title="Inadimplencia" value={formatCompanyCurrency(snapshot.overdueBoletoAmountCents)} description={`${snapshot.overdueBoletoCount} boletos vencidos`} icon={Landmark} />
        <CompanyMetricCard title="Disponivel para saque" value={formatCompanyCurrency(snapshot.availableToWithdrawCents)} description="Saldo consolidado" icon={Wallet} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle>Operacoes da carteira</CardTitle>
              <CardDescription>Entre no detalhe operacional de qualquer condomínio da carteira.</CardDescription>
            </div>
            <Link
              href="/my-condos"
              className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              Abrir carteira operacional
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.condos.map((item) => (
              <div key={item.condo.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-slate-50">{item.condo.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{item.condo.address}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 dark:border-slate-700 dark:bg-slate-950">
                        {item.unitCount} unidades
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 dark:border-slate-700 dark:bg-slate-950">
                        {item.openOccurrenceCount} ocorrencias abertas
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 dark:border-slate-700 dark:bg-slate-950">
                        {item.overdueBoletoCount} vencidos
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3 lg:items-end">
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                      {item.condo.prefix}.condhub.com
                    </span>
                    <OpenCondoButton prefix={item.condo.prefix} condoId={item.condo.id} accessToken={state.accessToken} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardHeader>
            <CardTitle>Resumo financeiro</CardTitle>
            <CardDescription>Saldo disponível e pressão de cobrança na carteira filtrada.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <p className="text-sm text-emerald-900/70 dark:text-emerald-200/70">Disponivel para saque</p>
              <p className="mt-2 text-3xl font-bold text-emerald-950 dark:text-emerald-100">{formatCompanyCurrency(snapshot.availableToWithdrawCents)}</p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <p className="text-sm text-amber-900/70 dark:text-amber-200/70">Total em atraso</p>
              <p className="mt-2 text-2xl font-semibold text-amber-950 dark:text-amber-100">{formatCompanyCurrency(snapshot.overdueBoletoAmountCents)}</p>
            </div>
            <div className="grid gap-3">
              {snapshot.condos.slice(0, 5).map((item) => (
                <div key={item.condo.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{item.condo.name}</span>
                  <span className="text-slate-500 dark:text-slate-400">{formatCompanyCurrency(item.availableToWithdrawCents)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
