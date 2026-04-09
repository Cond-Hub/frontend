"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Check,
  CreditCard,
  ExternalLink,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  dashboardApi,
  useDashboardStore,
  type CustomerPortal,
} from "@/src/store/useDashboardStore";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const formatCurrency = (value?: number | null) => {
  if (value === undefined || value === null) {
    return "Sob consulta";
  }

  return currency.format(value);
};

const isSubscriptionActive = (portal?: CustomerPortal) => {
  const subscription = portal?.currentSubscription;
  if (!subscription) {
    return true;
  }

  if (subscription.status === "ACTIVE") {
    return true;
  }

  if (subscription.status !== "TRIALING") {
    return false;
  }

  if (!subscription.trialEndsAtUtc) {
    return true;
  }

  const trialEndsAt = new Date(subscription.trialEndsAtUtc).getTime();
  return Number.isNaN(trialEndsAt) || trialEndsAt > Date.now();
};

export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const state = useDashboardStore();
  const currentUser = state.currentUserId ? state.users[state.currentUserId] : undefined;
  const canViewSubscription = currentUser?.role === "ADMIN_COMPANY" || currentUser?.role === "SYSTEM_ADMIN";
  const [portal, setPortal] = useState<CustomerPortal>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const onboardingMode = searchParams.get("onboarding") === "1";

  const loadPortal = async () => {
    const data = await dashboardApi.saas.customerPortal();
    setPortal(data);
  };

  useEffect(() => {
    if (!canViewSubscription) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(undefined);

    loadPortal()
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Não foi possível carregar a assinatura.");
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
  }, [canViewSubscription]);

  const usage = useMemo(() => {
    const plan = portal?.currentPlan;
    const condoCount = portal?.condoCount ?? 0;
    const includedCondos = plan?.maxCondos ?? 0;
    const extraCondos = Math.max(0, condoCount - includedCondos);

    return {
      condoCount,
      includedCondos,
      extraCondos,
      percent: includedCondos > 0 ? Math.min(100, Math.round((condoCount / includedCondos) * 100)) : 0,
    };
  }, [portal]);

  if (!canViewSubscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assinatura</CardTitle>
          <CardDescription>Esta área é exclusiva para administradores da empresa.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex min-h-48 items-center justify-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando assinatura...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assinatura</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </CardContent>
      </Card>
    );
  }

  const plan = portal?.currentPlan;
  const subscription = portal?.currentSubscription;
  const subscriptionOk = isSubscriptionActive(portal);

  return (
    <div className="space-y-6">
      {onboardingMode ? (
        <Card className="border-emerald-200 bg-emerald-50 text-emerald-950">
          <CardHeader>
            <CardTitle className="text-xl">Sua empresa foi criada</CardTitle>
            <CardDescription className="text-emerald-900/80">
              A assinatura ja esta pronta. Agora voce pode seguir para a carteira operacional e expandir a empresa.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {!subscriptionOk ? (
        <Card className="border-amber-200 bg-amber-50 text-amber-950">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Pagamento pendente</CardTitle>
              <CardDescription className="text-amber-900/80">
                O acesso operacional da empresa esta bloqueado ate a regularizacao da assinatura.
              </CardDescription>
            </div>
            <Link href="/subscription/payment">
              <Button className="sm:self-start">
                Regularizar agora
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>{plan?.name ?? "Plano não configurado"}</CardTitle>
                <CardDescription>
                  {plan?.description ?? "A empresa ainda não possui uma assinatura ativa."}
                </CardDescription>
              </div>
              {subscription ? (
                <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  {subscription.status}
                </span>
              ) : null}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-900 dark:text-slate-100">Condomínios usados</span>
                <span className="text-slate-600 dark:text-slate-400">
                  {usage.condoCount} de {usage.includedCondos || "sob consulta"}
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-emerald-600" style={{ width: `${usage.percent}%` }} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Inclusos" value={usage.includedCondos || "Sob consulta"} />
              <Metric label="Extras em uso" value={usage.extraCondos} />
              <Metric label="Extra por condomínio" value={formatCurrency(plan?.extraCondoPrice)} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardHeader>
            <CardTitle>Resumo financeiro</CardTitle>
            <CardDescription>Visão rápida do valor mensal estimado da operação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <CreditCard className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
              <div>
                <p className="text-sm text-emerald-900/70 dark:text-emerald-200/70">Total estimado</p>
                <p className="text-2xl font-bold text-emerald-950 dark:text-emerald-100">
                  {formatCurrency(portal?.estimatedMonthlyAmount)}
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {subscription?.currentPeriodEndsAtUtc ? (
                <>Próxima virada do período em {new Date(subscription.currentPeriodEndsAtUtc).toLocaleDateString("pt-BR")}.</>
              ) : (
                <>No Enterprise ou em volumes negociados, o valor final aparece como sob consulta.</>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 xl:col-span-2">
          <CardHeader>
            <CardTitle>Incluído no plano</CardTitle>
            <CardDescription>Todas as operacoes da carteira recebem o pacote completo.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {[
                "Workspace da empresa",
                "Moradores e unidades",
                "Ocorrências e documentos",
                "Agenda, espaços e reservas",
                "Boletos, carteira e PIX",
                "Branding do condomínio",
                "Acesso de síndicos e moradores",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                >
                  <Check className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-slate-50">{value}</p>
    </div>
  );
}
