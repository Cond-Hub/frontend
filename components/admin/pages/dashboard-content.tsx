'use client';

import { AlertTriangle, CalendarDays, DoorOpen, FileText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { formatDateBR, OCCURRENCE_STATUS_LABELS, PRIORITY_LABELS } from '../../../../shared/src';
import { dashboardApi } from '../../../src/store/useDashboardStore';
import { showToast } from '../../../src/store/useToastStore';

type DashboardData = Awaited<ReturnType<typeof dashboardApi.home.getSummary>>;
type OccurrenceList = Awaited<ReturnType<typeof dashboardApi.occurrences.list>>;
type DocumentList = Awaited<ReturnType<typeof dashboardApi.documents.list>>;
type DateList = Awaited<ReturnType<typeof dashboardApi.dates.list>>;
type BoletoList = Awaited<ReturnType<typeof dashboardApi.boletos.list>>;

const boletoStatusLabel: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  OVERDUE: 'Em atraso',
  CANCELED: 'Cancelado',
};

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
  const [summary, setSummary] = useState<DashboardData>();
  const [occurrences, setOccurrences] = useState<OccurrenceList>([]);
  const [documents, setDocuments] = useState<DocumentList>([]);
  const [dates, setDates] = useState<DateList>([]);
  const [boletos, setBoletos] = useState<BoletoList>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const [nextSummary, nextOccurrences, nextDocuments, nextDates, nextBoletos] = await Promise.all([
          dashboardApi.home.getSummary(),
          dashboardApi.occurrences.list({ status: 'OPEN' }),
          dashboardApi.documents.list({ expiringSoonDays: 30 }),
          dashboardApi.dates.list({ upcoming: 7 }),
          dashboardApi.boletos.list(),
        ]);

        if (!active) {
          return;
        }

        setSummary(nextSummary);
        setOccurrences(nextOccurrences.slice(0, 5));
        setDocuments(nextDocuments.slice(0, 4));
        setDates(nextDates.slice(0, 4));
        setBoletos(nextBoletos.slice(0, 4));
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
  }, []);

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
    const occurrenceBars = [
      { label: 'Ocorrencias', value: Math.min((summary?.openOccurrences.length ?? 0) * 12, 100) },
      { label: 'Documentos', value: Math.min((summary?.expiringDocuments.length ?? documents.length) * 18, 100) },
      { label: 'Agenda', value: Math.min((summary?.upcomingDates.length ?? dates.length) * 22, 100) },
    ];

    const recentLoad = [
      { label: 'Seg', value: Math.min((summary?.openOccurrences.length ?? 0) * 8, 100) },
      { label: 'Ter', value: Math.min((summary?.expiringDocuments.length ?? documents.length) * 14, 100) },
      { label: 'Qua', value: Math.min((summary?.upcomingDates.length ?? dates.length) * 16, 100) },
      { label: 'Qui', value: Math.min(((summary?.openOccurrences.length ?? 0) + (summary?.upcomingDates.length ?? 0)) * 7, 100) },
      { label: 'Sex', value: Math.min(((documents.length ?? 0) + (summary?.openOccurrences.length ?? 0)) * 9, 100) },
    ];

    return { occurrenceBars, recentLoad };
  }, [dates.length, documents.length, summary]);

  const boletoLines = useMemo(() => {
    const groups = boletos.reduce<Record<string, number>>((accumulator, boleto) => {
      accumulator[boleto.status] = (accumulator[boleto.status] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(groups).map(([status, value]) => ({
      label: boletoStatusLabel[status] ?? status,
      value,
      percentage: boletos.length ? Math.round((value / boletos.length) * 100) : 0,
    }));
  }, [boletos]);

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

      <div className="grid gap-4 xl:grid-cols-[0.95fr,1.05fr]">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Leitura por intensidade</CardTitle>
            <CardDescription>Indicadores visuais de carga operacional atual.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {chartData.occurrenceBars.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{item.value}%</span>
                </div>
                <div className="dashboard-bar h-3" style={{ ['--bar-value' as string]: item.value }} />
              </div>
            ))}

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-2xl font-semibold text-slate-950 dark:text-slate-50">{summary?.openOccurrences.length ?? 0}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Abertas</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-2xl font-semibold text-slate-950 dark:text-slate-50">{summary?.expiringDocuments.length ?? 0}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Alertas</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-2xl font-semibold text-slate-950 dark:text-slate-50">{summary?.upcomingDates.length ?? 0}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Agenda</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Ritmo da semana</CardTitle>
                <CardDescription>Leitura visual de carga operacional ao longo dos dias.</CardDescription>
              </div>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid h-[260px] grid-cols-5 items-end gap-3">
              {chartData.recentLoad.map((item) => (
                <div key={item.label} className="flex h-full flex-col justify-end gap-3">
                  <div className="relative flex-1 overflow-hidden rounded-t-2xl rounded-b-md bg-slate-100 dark:bg-slate-900">
                    <div
                      className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-gradient-to-t from-slate-900 via-teal-700 to-emerald-400 dark:from-slate-100 dark:via-emerald-300 dark:to-cyan-300"
                      style={{ height: `${Math.max(item.value, 10)}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.label}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.value}%</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Unidades</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{summary?.myUnits.length ?? 0}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Itens ativos</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                  {(summary?.openOccurrences.length ?? 0) + (summary?.upcomingDates.length ?? 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Painel de ocorrencias</CardTitle>
            <CardDescription>Itens mais recentes para acompanhamento imediato.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {occurrences.map((occurrence) => (
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
              {boletos.slice(0, 2).map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950 dark:text-slate-50">{item.unitLabel}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Referencia {item.referenceMonthISO.slice(0, 7)} • vence em {formatDateBR(item.dueDateISO)}
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                      {boletoStatusLabel[item.status] ?? item.status}
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
