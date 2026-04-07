'use client';

import { AlertTriangle, CreditCard, DoorOpen, FileText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Skeleton } from '../../ui/skeleton';
import { OCCURRENCE_STATUS_LABELS, UNIT_STATUS_LABELS, type WalletPayment } from '../../../shared/src';
import { dashboardApi, useDashboardStore } from '../../../src/store/useDashboardStore';
import { showToast } from '../../../src/store/useToastStore';

type DashboardData = Awaited<ReturnType<typeof dashboardApi.home.getSummary>>;
type OccurrenceList = Awaited<ReturnType<typeof dashboardApi.occurrences.list>>;
type UnitList = Awaited<ReturnType<typeof dashboardApi.map.getUnits>>;
type WalletPaymentList = Awaited<ReturnType<typeof dashboardApi.wallet.listPayments>>;

type PixChartPeriod = '7D' | '30D' | '90D' | '12M';

type PixBucket = {
  key: string;
  label: string;
  currentValue: number;
  previousValue: number;
};

const PERIOD_OPTIONS: Array<{ id: PixChartPeriod; label: string }> = [
  { id: '7D', label: '7 dias' },
  { id: '30D', label: '30 dias' },
  { id: '90D', label: '90 dias' },
  { id: '12M', label: '12 meses' },
];

const MIN_BAR_SIZE = 4;

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

      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Card key={index} className="border-slate-200/80 dark:border-slate-800">
            <CardHeader>
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 4 }).map((__, itemIndex) => (
                <Skeleton key={itemIndex} className="h-20 w-full rounded-xl" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader>
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[420px] w-full rounded-3xl" />
        </CardContent>
      </Card>
    </div>
  );
}

function formatCurrencyBRL(valueCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(valueCents / 100);
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(value: Date, months: number) {
  return new Date(value.getFullYear(), value.getMonth() + months, 1);
}

function formatShortDay(value: Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(value);
}

function formatMonthLabel(value: Date) {
  return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(value).replace('.', '');
}

function getPaymentMoment(payment: WalletPayment) {
  const source = payment.paidAtUtc ?? payment.updatedAtUtc ?? payment.createdAtUtc;
  return new Date(source);
}

function buildPixBuckets(payments: WalletPaymentList, period: PixChartPeriod): {
  buckets: PixBucket[];
  currentTotal: number;
  previousTotal: number;
} {
  const paidPayments = payments.filter((payment) => payment.status === 'PAID');
  const now = new Date();
  const today = startOfDay(now);
  const currentEntries: Array<{ start: Date; end: Date; label: string; key: string }> = [];
  const previousEntries: Array<{ start: Date; end: Date; label: string; key: string }> = [];

  if (period === '12M') {
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    for (let index = 11; index >= 0; index -= 1) {
      const start = addMonths(currentMonth, -index);
      const end = addMonths(start, 1);
      currentEntries.push({
        start,
        end,
        key: `${start.getFullYear()}-${start.getMonth() + 1}`,
        label: formatMonthLabel(start),
      });
    }

    for (let index = 11; index >= 0; index -= 1) {
      const start = addMonths(currentMonth, -12 - index);
      const end = addMonths(start, 1);
      previousEntries.push({
        start,
        end,
        key: `${start.getFullYear()}-${start.getMonth() + 1}`,
        label: formatMonthLabel(start),
      });
    }
  } else {
    const days = period === '7D' ? 7 : period === '30D' ? 30 : 90;
    const bucketSize = period === '90D' ? 7 : 1;
    const bucketCount = Math.ceil(days / bucketSize);
    const currentStart = addDays(today, -(days - 1));
    const previousStart = addDays(currentStart, -days);

    for (let index = 0; index < bucketCount; index += 1) {
      const start = addDays(currentStart, index * bucketSize);
      const end = addDays(start, bucketSize);
      currentEntries.push({
        start,
        end,
        key: start.toISOString(),
        label: bucketSize === 1 ? formatShortDay(start) : `${formatShortDay(start)}-${formatShortDay(addDays(end, -1))}`,
      });
    }

    for (let index = 0; index < bucketCount; index += 1) {
      const start = addDays(previousStart, index * bucketSize);
      const end = addDays(start, bucketSize);
      previousEntries.push({
        start,
        end,
        key: start.toISOString(),
        label: bucketSize === 1 ? formatShortDay(start) : `${formatShortDay(start)}-${formatShortDay(addDays(end, -1))}`,
      });
    }
  }

  const countPayments = (entries: Array<{ start: Date; end: Date; key: string; label: string }>) =>
    entries.map((entry) => {
      const value = paidPayments.reduce((sum, payment) => {
        const moment = getPaymentMoment(payment);
        return moment >= entry.start && moment < entry.end ? sum + payment.amountCents : sum;
      }, 0);

      return {
        key: entry.key,
        label: entry.label,
        value,
      };
    });

  const currentSeries = countPayments(currentEntries);
  const previousSeries = countPayments(previousEntries);
  const buckets = currentSeries.map((entry, index) => ({
    key: entry.key,
    label: entry.label,
    currentValue: entry.value,
    previousValue: previousSeries[index]?.value ?? 0,
  }));

  return {
    buckets,
    currentTotal: currentSeries.reduce((sum, item) => sum + item.value, 0),
    previousTotal: previousSeries.reduce((sum, item) => sum + item.value, 0),
  };
}

function PixPaymentsChart({
  payments,
  period,
  onPeriodChange,
}: {
  payments: WalletPaymentList;
  period: PixChartPeriod;
  onPeriodChange: (value: PixChartPeriod) => void;
}) {
  const chart = useMemo(() => buildPixBuckets(payments, period), [payments, period]);
  const variation = chart.previousTotal === 0
    ? (chart.currentTotal > 0 ? 100 : 0)
    : ((chart.currentTotal - chart.previousTotal) / chart.previousTotal) * 100;
  const variationLabel = `${variation > 0 ? '+' : ''}${variation.toFixed(1)}%`;

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="gap-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl text-slate-950 dark:text-slate-50">PIX recebidos por período</CardTitle>
            <CardDescription>
              Comparativo entre o período selecionado e o imediatamente anterior, usando apenas pagamentos PIX liquidados.
            </CardDescription>
          </div>

          <div className="inline-flex w-full flex-wrap gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900/60 xl:w-auto">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onPeriodChange(option.id)}
                className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                  option.id === period
                    ? 'bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950'
                    : 'text-slate-600 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">Período atual</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{formatCurrencyBRL(chart.currentTotal)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">Período anterior</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{formatCurrencyBRL(chart.previousTotal)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">Variação</p>
            <p className={`mt-2 text-2xl font-semibold ${variation >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {variationLabel}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {chart.buckets.some((bucket) => bucket.currentValue > 0 || bucket.previousValue > 0) ? (
          <div className="rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_38%),linear-gradient(180deg,_rgba(248,250,252,0.95),_rgba(241,245,249,0.95))] p-5 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),_transparent_38%),linear-gradient(180deg,_rgba(2,6,23,0.92),_rgba(15,23,42,0.94))]">
            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chart.buckets}
                  margin={{ top: 12, right: 8, left: 8, bottom: 8 }}
                  barGap={8}
                  barCategoryGap="28%"
                >
                  <defs>
                    <linearGradient id="pixCurrentGradient" x1="0" y1="1" x2="0" y2="0">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="55%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.18)" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={88}
                    tickMargin={10}
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    tickFormatter={(value: number) => formatCurrencyBRL(value)}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(148,163,184,0.10)' }}
                    contentStyle={{
                      borderRadius: '18px',
                      border: '1px solid rgba(148,163,184,0.22)',
                      background: 'rgba(15,23,42,0.96)',
                      color: '#f8fafc',
                      boxShadow: '0 18px 45px rgba(15,23,42,0.28)',
                    }}
                    formatter={(value, name) => [
                      formatCurrencyBRL(Number(value ?? 0)),
                      name === 'currentValue' ? 'Período atual' : 'Período anterior',
                    ]}
                    labelFormatter={(label) => `Faixa ${String(label ?? '')}`}
                  />
                  <Bar
                    dataKey="previousValue"
                    name="previousValue"
                    fill="rgba(148,163,184,0.72)"
                    radius={[12, 12, 0, 0]}
                    maxBarSize={26}
                    minPointSize={MIN_BAR_SIZE}
                  />
                  <Bar
                    dataKey="currentValue"
                    name="currentValue"
                    fill="url(#pixCurrentGradient)"
                    radius={[12, 12, 0, 0]}
                    maxBarSize={26}
                    minPointSize={MIN_BAR_SIZE}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[linear-gradient(180deg,#34d399_0%,#06b6d4_50%,#0ea5e9_100%)]" />
                <span>Período atual</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-400 dark:bg-slate-600" />
                <span>Período anterior</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
            Nenhum pagamento PIX liquidado no período selecionado.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardContent() {
  const state = useDashboardStore();
  const currentUser = state.currentUserId ? state.users[state.currentUserId] : undefined;
  const activeCondo = state.activeCondoId ? state.condos[state.activeCondoId] : undefined;
  const canManageFinance = currentUser?.role === 'ADMIN_COMPANY' || currentUser?.role === 'SYSTEM_ADMIN';
  const canViewWalletChart = canManageFinance && activeCondo?.type === 'COMPLETE';

  const [summary, setSummary] = useState<DashboardData>();
  const [occurrences, setOccurrences] = useState<OccurrenceList>([]);
  const [units, setUnits] = useState<UnitList>([]);
  const [walletPayments, setWalletPayments] = useState<WalletPaymentList>([]);
  const [period, setPeriod] = useState<PixChartPeriod>('30D');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);

      try {
        const [nextSummary, nextOccurrences, nextUnits, nextWalletPayments] = await Promise.all([
          dashboardApi.home.getSummary(),
          dashboardApi.occurrences.list(),
          dashboardApi.map.getUnits(),
          canViewWalletChart ? dashboardApi.wallet.listPayments() : Promise.resolve([] as WalletPaymentList),
        ]);

        if (!active) {
          return;
        }

        setSummary(nextSummary);
        setOccurrences(nextOccurrences);
        setUnits(nextUnits);
        setWalletPayments(nextWalletPayments);
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
  }, [canViewWalletChart]);

  const stats = useMemo(
    () => [
      {
        label: 'Ocorrências abertas',
        value: summary?.openOccurrences.length ?? 0,
        detail: 'Itens que ainda pedem ação da administração.',
        icon: AlertTriangle,
      },
      {
        label: 'Documentos vencendo',
        value: summary?.expiringDocuments.length ?? 0,
        detail: 'Arquivos com prazo próximo de vencimento.',
        icon: FileText,
      },
      {
        label: 'PIX recebidos',
        value: canViewWalletChart ? walletPayments.filter((item) => item.status === 'PAID').length : 0,
        detail: canViewWalletChart ? 'Pagamentos liquidados no condomínio atual.' : 'Disponível em condomínios COMPLETE.',
        icon: CreditCard,
      },
      {
        label: 'Minhas unidades',
        value: summary?.myUnits.length ?? 0,
        detail: 'Unidades vinculadas ao usuário atual.',
        icon: DoorOpen,
      },
    ],
    [canViewWalletChart, summary, walletPayments],
  );

  const chartData = useMemo(() => {
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
      occurrenceStatusChart,
      occurrenceStatusSlices,
      totalOccurrences,
      unitStatusBars,
    };
  }, [occurrences, units]);

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

      <div className="grid gap-4 xl:grid-cols-2">
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
                  <div className="h-40 w-40 rounded-full" style={{ background: chartData.occurrenceStatusChart }} />
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

      {canViewWalletChart ? (
        <PixPaymentsChart payments={walletPayments} period={period} onPeriodChange={setPeriod} />
      ) : null}
    </div>
  );
}
