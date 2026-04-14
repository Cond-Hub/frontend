"use client";

import { Building2, Landmark } from "lucide-react";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanyMetricCard, CompanyWorkspaceEmptyState, CompanyWorkspaceSkeleton, formatCompanyCurrency, useCompanyWorkspaceData } from "@/components/admin/company-workspace";

type IncomingPeriod = "7D" | "30D" | "90D" | "12M";

type IncomingBucket = {
  key: string;
  label: string;
  currentValue: number;
  previousValue: number;
};

const PERIOD_OPTIONS: Array<{ id: IncomingPeriod; label: string }> = [
  { id: "7D", label: "7 dias" },
  { id: "30D", label: "30 dias" },
  { id: "90D", label: "90 dias" },
  { id: "12M", label: "12 meses" },
];

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
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(value);
}

function formatMonthLabel(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(value).replace(".", "");
}

function getPaymentMoment(payment: { paidAtUtc: string }) {
  return new Date(payment.paidAtUtc);
}

function buildIncomingBuckets(
  payments: Array<{ paidAtUtc: string; amountCents: number }>,
  period: IncomingPeriod,
): { buckets: IncomingBucket[]; currentTotal: number; previousTotal: number } {
  const now = new Date();
  const today = startOfDay(now);
  const currentEntries: Array<{ start: Date; end: Date; label: string; key: string }> = [];
  const previousEntries: Array<{ start: Date; end: Date; label: string; key: string }> = [];

  if (period === "12M") {
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
    const days = period === "7D" ? 7 : period === "30D" ? 30 : 90;
    const bucketSize = period === "90D" ? 7 : 1;
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
      const value = payments.reduce((sum, payment) => {
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

function IncomingPaymentsChart({
  payments,
  period,
  onPeriodChange,
}: {
  payments: Array<{ paidAtUtc: string; amountCents: number }>;
  period: IncomingPeriod;
  onPeriodChange: (value: IncomingPeriod) => void;
}) {
  const chart = useMemo(() => buildIncomingBuckets(payments, period), [payments, period]);
  const variation =
    chart.previousTotal === 0 ? (chart.currentTotal > 0 ? 100 : 0) : ((chart.currentTotal - chart.previousTotal) / chart.previousTotal) * 100;
  const variationLabel = `${variation > 0 ? "+" : ""}${variation.toFixed(1)}%`;

  return (
    <Card className="border-slate-200/80 dark:border-slate-800">
      <CardHeader className="gap-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Entrada de caixa</CardTitle>
            <CardDescription>
              Crescimento de boletos pagos e PIX liquidados no período selecionado, comparado com a janela anterior.
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
                    ? "bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950"
                    : "text-slate-600 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
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
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{formatCompanyCurrency(chart.currentTotal)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">Período anterior</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">{formatCompanyCurrency(chart.previousTotal)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">Variação</p>
            <p className={`mt-2 text-2xl font-semibold ${variation >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
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
                <AreaChart data={chart.buckets} margin={{ top: 12, right: 8, left: 8, bottom: 8 }}>
                  <defs>
                    <linearGradient id="incomingPreviousGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.65} />
                      <stop offset="100%" stopColor="#94a3b8" stopOpacity={0.08} />
                    </linearGradient>
                    <linearGradient id="incomingCurrentGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.85} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0.18} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.18)" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={88}
                    tickMargin={10}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    tickFormatter={(value: number) => formatCompanyCurrency(value)}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(148,163,184,0.10)" }}
                    contentStyle={{
                      borderRadius: "18px",
                      border: "1px solid rgba(148,163,184,0.22)",
                      background: "rgba(15,23,42,0.96)",
                      color: "#f8fafc",
                      boxShadow: "0 18px 45px rgba(15,23,42,0.28)",
                    }}
                    formatter={(value, name) => [
                      formatCompanyCurrency(Number(value ?? 0)),
                      name === "currentValue" ? "Período atual" : "Período anterior",
                    ]}
                    labelFormatter={(label) => `Faixa ${String(label ?? "")}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="previousValue"
                    name="previousValue"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    fill="url(#incomingPreviousGradient)"
                    fillOpacity={0.5}
                    strokeOpacity={0.5}
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="currentValue"
                    name="currentValue"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                    fill="url(#incomingCurrentGradient)"
                    fillOpacity={0.5}
                    strokeOpacity={0.5}
                    dot={false}
                  />
                </AreaChart>
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
            Nenhuma entrada de caixa encontrada para o período selecionado.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CompanyPage() {
  const { currentUser, loading, snapshot } = useCompanyWorkspaceData();
  const [period, setPeriod] = useState<IncomingPeriod>("12M");

  const incomingPayments = useMemo(
    () => snapshot?.incomingPayments ?? [],
    [snapshot],
  );

  if (!currentUser || currentUser.role !== "ADMIN_COMPANY") {
    return <CompanyWorkspaceEmptyState />;
  }

  if (loading || !snapshot) {
    return <CompanyWorkspaceSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <CompanyMetricCard title="Condomínios" value={snapshot.condoCount} description="Carteira filtrada" icon={Building2} />
        <CompanyMetricCard title="Unidades" value={snapshot.totalUnits} description={`${snapshot.occupiedUnits} em operação`} icon={Building2} />
        <CompanyMetricCard title="Inadimplência" value={formatCompanyCurrency(snapshot.overdueBoletoAmountCents)} description={`${snapshot.overdueBoletoCount} boletos vencidos`} icon={Landmark} />
      </div>

      <IncomingPaymentsChart payments={incomingPayments} period={period} onPeriodChange={setPeriod} />
    </div>
  );
}
