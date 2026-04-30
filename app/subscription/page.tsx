"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, Loader2, ShieldCheck, Sparkles } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  dashboardApi,
  useDashboardStore,
  type CustomerPortal,
  type ManagedSubscriptionPlanCode,
  type SaasPlan,
  type SubscriptionManagementContext,
} from "@/src/store/useDashboardStore";
import { showToast } from "@/src/store/useToastStore";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const selfServePlanOrder: Array<Exclude<ManagedSubscriptionPlanCode, "ENTERPRISE">> = ["INDIVIDUAL", "STARTER", "PRO"];

const planBadgeByCode: Record<string, string> = {
  INDIVIDUAL: "1 condomínio",
  STARTER: "Até 3 condomínios",
  PRO: "Até 10 condomínios",
};

const formatMoney = (value?: number | null) => {
  if (value === undefined || value === null) {
    return "Sob consulta";
  }

  return currency.format(value);
};

const planFeatures = (plan: SaasPlan) => [
  `${plan.maxCondos === 1 ? "1 condomínio incluído" : `Até ${plan.maxCondos.toLocaleString("pt-BR")} condomínios`}`,
  `${plan.maxUnitsPerCondo === 0 ? "Volume de unidades negociado" : `Até ${plan.maxUnitsPerCondo.toLocaleString("pt-BR")} unidades por condomínio`}`,
  `Até ${plan.maxResidents.toLocaleString("pt-BR")} moradores`,
  "Todas as features incluídas",
];

const isManager = (role?: string) => role === "ADMIN_COMPANY";

const isTrialActive = (portal?: CustomerPortal) => {
  if (portal?.currentSubscription?.status !== "TRIALING") {
    return false;
  }

  if (!portal.currentSubscription.trialEndsAtUtc) {
    return true;
  }

  const trialEndsAt = new Date(portal.currentSubscription.trialEndsAtUtc).getTime();
  return Number.isNaN(trialEndsAt) || trialEndsAt > Date.now();
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function SubscriptionPage() {
  return (
    <Suspense fallback={<SubscriptionPageSkeleton />}>
      <SubscriptionPageContent />
    </Suspense>
  );
}

function SubscriptionPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = useDashboardStore();
  const currentUser = state.currentUserId ? state.users[state.currentUserId] : undefined;
  const trialStarted = searchParams.get("trialStarted") === "1";
  const paymentRequired = searchParams.get("paymentRequired") === "1";

  const [portal, setPortal] = useState<CustomerPortal>();
  const [management, setManagement] = useState<SubscriptionManagementContext>();
  const [plans, setPlans] = useState<SaasPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [planAction, setPlanAction] = useState<string>();
  const [portalAction, setPortalAction] = useState(false);

  useEffect(() => {
    if (state.hydrationComplete && !state.bootstrapped) {
      void state.bootstrap();
    }
  }, [state]);

  useEffect(() => {
    if (!state.hydrationComplete || !state.bootstrapped) {
      return;
    }

    if (!currentUser || !isManager(currentUser.role)) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(undefined);

    Promise.all([
      dashboardApi.saas.customerPortal(),
      dashboardApi.saas.publicPlans(),
      dashboardApi.saas.subscriptionManagement(),
    ])
      .then(([portalData, plansData, managementData]) => {
        if (cancelled) {
          return;
        }

        setPortal(portalData);
        setPlans(plansData);
        setManagement(managementData);
      })
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
  }, [currentUser?.id, state.bootstrapped, state.hydrationComplete]);

  const orderedPlans = useMemo(() => {
    const planMap = new Map(plans.map((plan) => [plan.code, plan]));
    return selfServePlanOrder.map((code) => planMap.get(code)).filter(Boolean) as SaasPlan[];
  }, [plans]);

  const trialActive = isTrialActive(portal);
  const subscriptionActive = portal?.currentSubscription?.status === "ACTIVE";
  const currentManaged = management?.current;

  const reload = async () => {
    setLoading(true);
    try {
      const [portalData, plansData, managementData] = await Promise.all([
        dashboardApi.saas.customerPortal(),
        dashboardApi.saas.publicPlans(),
        dashboardApi.saas.subscriptionManagement(),
      ]);
      setPortal(portalData);
      setPlans(plansData);
      setManagement(managementData);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar a assinatura.");
    } finally {
      setLoading(false);
    }
  };

  const startCheckout = async (plan: SaasPlan) => {
    if (portal && portal.condoCount > plan.maxCondos) {
      showToast({
        tone: "error",
        title: "Plano incompatível",
        description: `Reduza sua carteira para no máximo ${plan.maxCondos} condomínio(s) antes de contratar o plano ${plan.name}.`,
      });
      return;
    }

    const planCode = plan.code as Exclude<ManagedSubscriptionPlanCode, "ENTERPRISE">;
    setPlanAction(planCode);
    try {
      const origin = typeof window === "undefined" ? "" : window.location.origin;
      const currentUrl = typeof window === "undefined" ? `${origin}/subscription` : window.location.href;
      const checkout = await dashboardApi.saas.createManagedSubscriptionCheckout({
        planCode,
        returnUrl: currentUrl,
        completionUrl: `${origin}/company`,
      });
      showToast({
        tone: "success",
        title: "Checkout criado",
        description: "Vamos abrir o checkout seguro da assinatura.",
      });
      window.location.assign(checkout.checkoutUrl);
    } catch (err) {
      showToast({
        tone: "error",
        title: "Não foi possível abrir o checkout",
        description: err instanceof Error ? err.message : "Tente novamente em instantes.",
      });
    } finally {
      setPlanAction(undefined);
    }
  };

  const openBillingPortal = async () => {
    setPortalAction(true);
    try {
      const origin = typeof window === "undefined" ? "" : window.location.origin;
      const session = await dashboardApi.saas.createBillingPortalSession({
        returnUrl: `${origin}/subscription`,
      });
      window.location.assign(session.url);
    } catch (err) {
      showToast({
        tone: "error",
        title: "Não foi possível abrir o portal",
        description: err instanceof Error ? err.message : "Tente novamente em instantes.",
      });
    } finally {
      setPortalAction(false);
    }
  };

  const renderPlanSelection = (showCurrentPlanState: boolean) => {
    const currentPlanCode = portal?.currentPlan?.code ?? portal?.currentSubscription?.subscriptionPlanCode;

    return (
      <div className="grid items-stretch gap-4 lg:grid-cols-3">
        {orderedPlans.map((plan) => {
          const actionLoading = planAction === plan.code;
          const hasPendingCheckout = currentManaged?.status === "PENDING" && currentManaged.planCode === plan.code && currentManaged.checkoutUrl;
          const isCurrentPlan = showCurrentPlanState && currentPlanCode === plan.code;
          const exceedsCondoLimit = Boolean(portal && portal.condoCount > plan.maxCondos);

          return (
            <Card key={plan.code} className="flex h-full min-h-[460px] flex-col border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <CardHeader className="space-y-4">
                <div className="space-y-3">
                  <span className="inline-flex w-fit rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    {planBadgeByCode[plan.code] ?? "Plano"}
                  </span>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription className="min-h-[44px]">{plan.description}</CardDescription>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Preço recorrente</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-slate-50">{`${formatMoney(plan.monthlyPrice)}/mês`}</p>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col space-y-5">
                <div className="grid gap-3">
                  {planFeatures(plan).map((item) => (
                    <div key={item} className="flex min-h-[48px] items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-auto space-y-2 pt-2">
                  {exceedsCondoLimit ? (
                    <p className="text-xs leading-5 text-amber-700 dark:text-amber-300">
                      Sua carteira tem {portal?.condoCount} condomínio(s). Adeque para até {plan.maxCondos} antes de trocar.
                    </p>
                  ) : null}
                  {hasPendingCheckout ? (
                    <Button className="w-full" onClick={() => window.location.assign(currentManaged?.checkoutUrl ?? "/subscription")}>
                      Continuar checkout
                    </Button>
                  ) : isCurrentPlan ? (
                    <Button className="w-full" variant="outline" disabled>
                      Plano atual
                    </Button>
                  ) : showCurrentPlanState ? (
                    <Button className="w-full" variant={isCurrentPlan ? "outline" : "secondary"} disabled>
                      {isCurrentPlan ? "Plano atual" : "Troca indisponível"}
                    </Button>
                  ) : (
                    <Button className="w-full" disabled={actionLoading || exceedsCondoLimit} onClick={() => void startCheckout(plan)}>
                      {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Escolher {plan.name}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Card className="border-slate-200 bg-white lg:col-span-3 dark:border-slate-800 dark:bg-slate-950">
          <CardHeader className="space-y-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Contratação
            </div>
            <div className="space-y-3">
              <CardTitle className="text-2xl">Contrate o plano adequado</CardTitle>
              <CardDescription>
                Escolha o plano compatível com a quantidade de condomínios que sua administradora opera hoje. A cobrança será aberta em BRL no checkout seguro da Stripe.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-slate-600 md:grid-cols-3 dark:text-slate-300">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              Individual para uma operação enxuta com 1 condomínio ativo.
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              Starter para administradoras em crescimento com até 3 condomínios.
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              Pro para carteiras maiores com até 10 condomínios e todos os recursos liberados.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (!state.hydrationComplete || !state.bootstrapped || loading) {
    return <SubscriptionPageSkeleton />;
  }

  if (!currentUser || !isManager(currentUser.role)) {
    return (
      <main className="min-h-screen bg-[#f3f4ec] px-6 py-10 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Entrar para continuar</CardTitle>
              <CardDescription>Esta tela de assinatura foi desenhada para o gestor principal da empresa.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button>Ir para login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#f3f4ec] px-6 py-10 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
        <div className="mx-auto max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Assinatura</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => void reload()}>Tentar novamente</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!trialActive && !paymentRequired && subscriptionActive) {
    return (
      <AdminShell>
        <div className="mx-auto max-w-7xl space-y-6">
          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl">Minha assinatura</CardTitle>
              <CardDescription>
                Gerencie forma de pagamento, notas fiscais e dados da assinatura pelo portal seguro da Stripe.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <p>
                  Plano atual: <strong>{portal.currentPlan?.name ?? portal.currentSubscription?.subscriptionPlanName ?? "Assinatura ativa"}</strong>
                </p>
                <p>
                  Valor estimado: <strong>{formatMoney(portal.estimatedMonthlyAmount ?? portal.currentPlan?.monthlyPrice)}</strong>
                </p>
              </div>
              <Button onClick={() => void openBillingPortal()} disabled={portalAction}>
                {portalAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                Gerenciar assinatura
              </Button>
            </CardContent>
          </Card>
        </div>
      </AdminShell>
    );
  }

  return (
    <main className="min-h-screen bg-[#f3f4ec] px-6 py-8 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto max-w-7xl space-y-6">
        {trialActive ? (
          <>
            <div className="grid gap-4 xl:grid-cols-2">
              <Card className="border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-100">
                <CardHeader className="space-y-4">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                    <Sparkles className="h-3.5 w-3.5" />
                    1 mês grátis
                  </div>
                  <div className="space-y-3">
                    <CardTitle className="text-2xl">{trialStarted ? "Teste gratuito iniciado" : "Teste gratuito ativo"}</CardTitle>
                    <CardDescription className="text-emerald-900/80 dark:text-emerald-200/80">
                      Sua administradora já está operando com os limites do plano Pro durante o período grátis.
                      Os planos pagos só aparecem quando esse período terminar.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" onClick={() => router.push("/my-condos")}>
                    Ir para Meus condomínios
                  </Button>
                  <p className="text-xs leading-6 text-emerald-900/80 dark:text-emerald-200/80">
                    Fim previsto do período grátis: <strong>{formatDateTime(portal?.currentSubscription?.trialEndsAtUtc)}</strong>
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                <CardHeader>
                  <CardTitle>Limites do teste</CardTitle>
                  <CardDescription>Mesmo escopo operacional do plano Pro por 30 dias.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Até 10 condomínios ativos",
                    "Até 1.000 unidades por condomínio",
                    "Até 3.000 moradores",
                    "Todas as features liberadas no período grátis",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            {!subscriptionActive || paymentRequired ? (
              <>
                {renderPlanSelection(false)}
              </>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}

function SubscriptionPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#f3f4ec] px-6 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <Card key={item} className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <CardHeader className="space-y-3">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-20 w-full rounded-3xl" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
