'use client';

import { AlertTriangle, CalendarDays, DoorOpen, FileText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { BOLETO_STATUS_LABELS, formatDateBR, OCCURRENCE_STATUS_LABELS, PRIORITY_LABELS, UNIT_STATUS_LABELS } from '../../../shared/src';
import { dashboardApi } from '../../../src/store/useDashboardStore';
import { useDashboardStore } from '../../../src/store/useDashboardStore';
import { showToast } from '../../../src/store/useToastStore';

type DashboardData = Awaited<ReturnType<typeof dashboardApi.home.getSummary>>;
type OccurrenceList = Awaited<ReturnType<typeof dashboardApi.occurrences.list>>;
type DocumentList = Awaited<ReturnType<typeof dashboardApi.documents.list>>;
type DateList = Awaited<ReturnType<typeof dashboardApi.dates.list>>;
type BoletoList = Awaited<ReturnType<typeof dashboardApi.boletos.list>>;
type UnitList = Awaited<ReturnType<typeof dashboardApi.map.getUnits>>;

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="border-slate-200/80 dark:border-slate-800">
            <CardHeader className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.95fr,1.05fr]">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full rounded-full" />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
              <Skeleton className="h-32 w-32 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <Skeleton className="h-7 w-44" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full rounded-xl" />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="border-slate-200/80 dark:border-slate-800">
            <CardHeader>
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((__, itemIndex) => (
                <Skeleton key={itemIndex} className="h-20 w-full rounded-xl" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function DashboardContent() {
  const state = useDashboardStore();
  const currentUser = state.currentUserId ? state.users[state.currentUserId] : undefined;
  const canManageFinance = currentUser?.role === 'ADMIN_COMPANY' || currentUser?.role === 'SYSTEM_ADMIN';
  const [summary, setSummary] = useState<DashboardData>();
  const [occurrences, setOccurrences] = useState<OccurrenceList>([]);
  const [documents, setDocuments] = useState<DocumentList>([]);
  const [dates, setDates] = useState<DateList>([]);
  const [boletos, setBoletos] = useState<BoletoList>([]);
  const [units, setUnits] = useState<UnitList>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const [nextSummary, nextOccurrences, nextDocuments, nextDates, nextBoletos, nextUnits] = await Promise.all([
          dashboardApi.home.getSummary(),
          dashboardApi.occurrences.list(),
          dashboardApi.documents.list({ expiringSoonDays: 30 }),
          dashboardApi.dates.list({ upcoming: 7 }),
          canManageFinance ? dashboardApi.boletos.list() : Promise.resolve([] as BoletoList),
          dashboardApi.map.getUnits(),
        ]);

        if (!active) {
          return;
        }

        setSummary(nextSummary);
        setOccurrences(nextOccurrences);
        setDocuments(nextDocuments.slice(0, 4));
        setDates(nextDates.slice(0, 4));
        setBoletos(nextBoletos);
        setUnits(nextUnits);
      } catch (loadError) {
        if (!active) {
          return;
        }

        showToast({
          tone: 'error',
          title: 'Falha ao carregar dashboard',
          description: loadError instanceof Error ? loadError.message : 'Tente novamente.',
        });
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [canManageFinance]);

  const stats = useMemo(
    () => [
      {
        label: 'Ocorrencias abertas',
        value: summary?.openOccurrences.length ?? 0,
        detail: 'Itens que ainda pedem acao da administracao.',
        icon: AlertTriangle,
      },
      {
        label: 'Documentos vencendo',
        value: summary?.expiringDocuments.length ?? documents.length,
        detail: 'Arquivos com prazo proximo de vencimento.',
        icon: FileText,
      },
      {
        label: 'Datas na semana',
        value: summary?.upcomingDates.length ?? dates.length,
        detail: 'Compromissos e eventos previstos.',
        icon: CalendarDays,
      },
      {
        label: 'Minhas unidades',
        value: summary?.myUnits.length ?? 0,
        detail: 'Unidades vinculadas ao usuario atual.',
        icon: DoorOpen,
      },
    ],
    [dates.length, documents.length, summary],
  );

  const chartData = useMemo(() => {
    const totalBoletos = boletos.length;
    const openBoletos = boletos.filter((item) => item.status === 'OPEN').length;
    const overdueBoletos = boletos.filter((item) => item.status === 'OVERDUE').length;
    const paidBoletos = boletos.filter((item) => item.status === 'PAID').length;

    const boletoStatusBars = [
      {
        label: 'Abertos',
        value: openBoletos,
        percentage: totalBoletos ? Math.round((openBoletos / totalBoletos) * 100) : 0,
      },
      {
        label: 'Em atraso',
        value: overdueBoletos,
        percentage: totalBoletos ? Math.round((overdueBoletos / totalBoletos) * 100) : 0,
      },
      {
        label: 'Pagos',
        value: paidBoletos,
        percentage: totalBoletos ? Math.round((paidBoletos / totalBoletos) * 100) : 0,
      },
    ];

    const occurrenceStatusOrder = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];
    const occurrenceStatusColors = ['#0f766e', '#0891b2', '#7c3aed'];
    const occurrenceTotals = occurrenceStatusOrder
      .map((status, index) => ({
        status,
        label: OCCURRENCE_STATUS_LABELS[status as keyof typeof OCCURRENCE_STATUS_LABELS] ?? status,
        value: occurrences.filter((item) => item.status === status).length,
        color: occurrenceStatusColors[index],
      }))
      .filter((item) => item.value > 0);

    const totalOccurrences = occurrenceTotals.reduce((sum, item) => sum + item.value, 0);

    let currentOffset = 0;
    const occurrenceStatusSlices = occurrenceTotals.map((item) => {
      const percentage = totalOccurrences ? Number(((item.value / totalOccurrences) * 100).toFixed(1)) : 0;
      const start = currentOffset;
      currentOffset += percentage;
      return {
        ...item,
        percentage,
        start,
        end: currentOffset,
      };
    });

    const occurrenceStatusChart =
      occurrenceStatusSlices.length > 0
        ? `conic-gradient(${occurrenceStatusSlices
            .map((item) => `${item.color} ${item.start}% ${item.end}%`)
            .join(', ')})`
        : 'conic-gradient(#e2e8f0 0% 100%)';

    const unitStatusOrder = ['GREEN', 'YELLOW', 'RED'] as const;
    const unitStatusColors = {
      GREEN: 'bg-emerald-500',
      YELLOW: 'bg-amber-500',
      RED: 'bg-rose-500',
    } as const;
    const totalUnits = units.length;
    const unitStatusBars = unitStatusOrder.map((status) => {
      const value = units.filter((item) => item.status === status).length;
      return {
        status,
        label: UNIT_STATUS_LABELS[status],
        value,
        percentage: totalUnits ? Math.round((value / totalUnits) * 100) : 0,
        colorClass: unitStatusColors[status],
      };
    });

    return {
      boletoStatusBars,
      occurrenceStatusChart,
      occurrenceStatusSlices,
      totalBoletos,
      overdueBoletos,
      totalOccurrences,
      unitStatusBars,
      totalUnits,
    };
  }, [boletos, occurrences, units]);

  const boletoLines = useMemo(() => {
    const groups = boletos.reduce<Record<string, number>>((accumulator, boleto) => {
      accumulator[boleto.status] = (accumulator[boleto.status] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(groups).map(([status, value]) => ({
      label: BOLETO_STATUS_LABELS[status as keyof typeof BOLETO_STATUS_LABELS] ?? status,
      value,
      percentage: boletos.length ? Math.round((value / boletos.length) * 100) : 0,
    }));
  }, [boletos]);

  const recentBoletos = useMemo(() => boletos.slice(0, 2), [boletos]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="border-slate-200/80 dark:border-slate-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3">
                  <CardDescription>{item.label}</CardDescription>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <CardTitle className="text-4xl text-slate-950 dark:text-slate-50">{item.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">{item.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className={`grid gap-4 ${canManageFinance ? 'xl:grid-cols-3' : 'xl:grid-cols-2'}`}>
        {canManageFinance ? (
          <Card className="border-slate-200/80 dark:border-slate-800 flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Boletos por status</CardTitle>
              <CardDescription>Leitura financeira rápida do que já entrou e do que ainda pede atenção.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {chartData.boletoStatusBars.map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {item.value} • {item.percentage}%
                    </span>
                  </div>
                  <div className="dashboard-bar h-3" style={{ ['--bar-value' as string]: item.percentage }} />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : null}
        <Card className="border-slate-200/80 dark:border-slate-800 flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Ocorrências por status</CardTitle>
                <CardDescription>Distribuição do volume de ocorrências pelo estágio atual de atendimento.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-[0.85fr,1.15fr] lg:items-center">
              <div className="flex justify-center">
                <div className="relative flex h-52 w-52 items-center justify-center rounded-full border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                  <div
                    className="h-40 w-40 rounded-full"
                    style={{ background: chartData.occurrenceStatusChart }}
                  />
                  <div className="absolute flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white text-center dark:bg-slate-950">
                    <p className="text-2xl font-semibold text-slate-950 dark:text-slate-50">{chartData.totalOccurrences}</p>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Total</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {chartData.occurrenceStatusSlices.map((item) => (
                  <div key={item.status} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {item.value} • {item.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
                {chartData.occurrenceStatusSlices.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                    Nenhuma ocorrência registrada ainda.
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800 flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Unidades por status</CardTitle>
            <CardDescription>Distribuição atual das unidades entre normal, atenção e urgente.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {chartData.unitStatusBars.map((item) => (
              <div key={item.status}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`h-3 w-3 rounded-full ${item.colorClass}`} />
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {item.value} • {item.percentage}%
                  </span>
                </div>
                <div className="dashboard-bar h-3" style={{ ['--bar-value' as string]: item.percentage }} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className={`grid gap-4 ${canManageFinance ? 'xl:grid-cols-[1.1fr,0.9fr]' : 'xl:grid-cols-[1.2fr,0.8fr]'}`}>
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Painel de ocorrencias</CardTitle>
            <CardDescription>Itens mais recentes para acompanhamento imediato.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {occurrences.slice(0, 5).map((occurrence) => (
              <div key={occurrence.id} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-slate-50">{occurrence.title}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {OCCURRENCE_STATUS_LABELS[occurrence.status]} • {PRIORITY_LABELS[occurrence.priority]}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{formatDateBR(occurrence.updatedAtISO)}</p>
                </div>
              </div>
            ))}
            {occurrences.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                Nenhuma ocorrencia aberta neste momento.
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Agenda da semana</CardTitle>
              <CardDescription>Compromissos e datas mais proximas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {dates.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                  <p className="font-medium text-slate-950 dark:text-slate-50">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{formatDateBR(item.dateISO)}</p>
                </div>
              ))}
              {dates.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                  Nenhuma data relevante cadastrada.
                </div>
              ) : null}
            </CardContent>
          </Card>

          {canManageFinance ? (
            <Card className="border-slate-200/80 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Boletos em acompanhamento</CardTitle>
                <CardDescription>Leitura financeira rapida por status, logo abaixo da agenda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {boletoLines.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {item.value} • {item.percentage}%
                      </span>
                    </div>
                    <div className="dashboard-bar h-3" style={{ ['--bar-value' as string]: item.percentage }} />
                  </div>
                ))}
                {recentBoletos.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-950 dark:text-slate-50">{item.unitLabel}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Referencia {item.referenceMonthISO.slice(0, 7)} • vence em {formatDateBR(item.dueDateISO)}
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                        {BOLETO_STATUS_LABELS[item.status]}
                      </span>
                    </div>
                  </div>
                ))}
                {boletos.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                    Nenhum boleto carregado recentemente.
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card className="border-slate-200/80 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Documentos para acompanhar</CardTitle>
              <CardDescription>Arquivos com vencimento ou revisao proxima.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.map((item) => (
                <div key={item.id} className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/80 dark:bg-amber-950/20">
                  <p className="font-medium text-amber-950 dark:text-amber-100">{item.title}</p>
                  <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                    {item.expiresAtISO ? `Vence em ${formatDateBR(item.expiresAtISO)}` : item.category}
                  </p>
                </div>
              ))}
              {documents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                  Nenhum documento com alerta imediato.
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
