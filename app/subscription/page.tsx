"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, ExternalLink, Loader2, ShieldCheck, Sparkles, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  dashboardApi,
  useDashboardStore,
  type CustomerPortal,
  type ManagedSubscription,
  type ManagedSubscriptionPlanCode,
  type SaasPlan,
  type SubscriptionManagementContext,
} from "@/src/store/useDashboardStore";
import { showToast } from "@/src/store/useToastStore";

const WHATSAPP_NUMBER = "5547992611819";
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

const formatMoneyFromCents = (value?: number | null) => {
  if (value === undefined || value === null) {
    return "Sob consulta";
  }

  return currency.format(value / 100);
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
  const [cancelOpen, setCancelOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [couponCode, setCouponCode] = useState("");

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
  const currentManaged = management?.current;

  const openEnterpriseSales = () => {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá, tenho interesse no plano Enterprise da CondHub")}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

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

  const startCheckout = async (planCode: Exclude<ManagedSubscriptionPlanCode, "ENTERPRISE">) => {
    setPlanAction(planCode);
    try {
      const origin = typeof window === "undefined" ? "" : window.location.origin;
      const currentUrl = typeof window === "undefined" ? `${origin}/subscription` : window.location.href;
      const checkout = await dashboardApi.saas.createManagedSubscriptionCheckout({
        planCode,
        couponCode: couponCode.trim() || undefined,
        returnUrl: currentUrl,
        completionUrl: `${origin}/my-condos`,
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

  const cancelCurrentSubscription = async () => {
    if (!currentManaged?.id) {
      return;
    }

    setCanceling(true);
    try {
      await dashboardApi.saas.cancelManagedSubscription(currentManaged.id);
      await reload();
      setCancelOpen(false);
      showToast({
        tone: "success",
        title: "Assinatura cancelada",
        description: "As próximas cobranças recorrentes foram interrompidas.",
      });
    } catch (err) {
      showToast({
        tone: "error",
        title: "Não foi possível cancelar",
        description: err instanceof Error ? err.message : "Tente novamente em instantes.",
      });
    } finally {
      setCanceling(false);
    }
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

  return (
    <main className="min-h-screen bg-[#f3f4ec] px-6 py-8 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <ConfirmDialog
        open={cancelOpen}
        title="Cancelar assinatura"
        description="Essa ação interrompe as próximas cobranças recorrentes. Se quiser apenas trocar de plano, conclua a nova contratação antes de cancelar a atual."
        confirmLabel={canceling ? "Cancelando..." : "Cancelar assinatura"}
        cancelLabel="Voltar"
        destructive
        onCancel={() => {
          if (!canceling) {
            setCancelOpen(false);
          }
        }}
        onConfirm={() => {
          if (!canceling) {
            void cancelCurrentSubscription();
          }
        }}
      />

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
            <Card className="border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-100">
              <CardHeader className="space-y-3">
                <CardTitle className="text-2xl">
                  {paymentRequired ? "Seu período grátis terminou" : "Escolha o plano da administradora"}
                </CardTitle>
                <CardDescription className="text-amber-900/80 dark:text-amber-200/80">
                  O teste gratuito já foi concluído. Agora a operação precisa ser enquadrada em um plano pago compatível com a carteira ativa.
                  Se a carteira estiver acima dos limites do plano desejado, reduza a quantidade de condomínios antes da contratação ou fale com nosso time.
                </CardDescription>
              </CardHeader>
            </Card>

            {currentManaged ? (
              <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                <CardHeader>
                  <CardTitle>Assinatura gerenciada</CardTitle>
                  <CardDescription>Estado atual do checkout recorrente hospedado pela AbacatePay.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Plano vinculado: <strong>{currentManaged.planCode ?? "—"}</strong>
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Valor atual do checkout: <strong>{formatMoneyFromCents(currentManaged.amountCents)}</strong>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {currentManaged.checkoutUrl ? (
                      <Button variant="outline" onClick={() => window.location.assign(currentManaged.checkoutUrl ?? "/subscription")}>
                        Continuar checkout
                      </Button>
                    ) : null}
                    <Button variant="outline" onClick={() => setCancelOpen(true)}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancelar assinatura
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <div className="grid gap-4 xl:grid-cols-4">
              <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                <CardHeader className="space-y-4">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Escolha do plano
                  </div>
                  <div className="space-y-3">
                    <CardTitle className="text-2xl">Contrate o plano adequado</CardTitle>
                    <CardDescription>
                      Os três planos abaixo cobrem as faixas self-serve da plataforma. Se a carteira exigir volume acima disso, fale com vendas.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    Taxa operacional: <strong>R$ 1,99 por transação recebida</strong>.
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    Se você mantiver 10 condomínios na carteira, o enquadramento esperado é o <strong>Pro</strong>.
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="couponCode" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                      Cupom
                    </label>
                    <Input
                      id="couponCode"
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                      placeholder="Digite seu cupom"
                    />
                  </div>
                  <Button className="w-full" variant="outline" onClick={openEnterpriseSales}>
                    Falar com vendas
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              {orderedPlans.map((plan) => {
                const actionLoading = planAction === plan.code;
                const hasPendingCheckout = currentManaged?.status === "PENDING" && currentManaged.planCode === plan.code && currentManaged.checkoutUrl;

                return (
                  <Card key={plan.code} className="flex flex-col border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
                    <CardHeader className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle>{plan.name}</CardTitle>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                              {planBadgeByCode[plan.code] ?? "Plano"}
                            </span>
                          </div>
                          <CardDescription className="mt-2">{plan.description}</CardDescription>
                        </div>
                      </div>
                      <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Preço recorrente</p>
                        <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-slate-50">{`${formatMoney(plan.monthlyPrice)}/mês`}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col space-y-5">
                      <div className="grid gap-3">
                        {planFeatures(plan).map((item) => (
                          <div key={item} className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-auto pt-2">
                        {hasPendingCheckout ? (
                          <Button className="w-full" onClick={() => window.location.assign(currentManaged?.checkoutUrl ?? "/subscription")}>
                            Continuar checkout
                          </Button>
                        ) : (
                          <Button className="w-full" disabled={actionLoading} onClick={() => void startCheckout(plan.code as Exclude<ManagedSubscriptionPlanCode, "ENTERPRISE">)}>
                            {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Escolher {plan.name}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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
        <div className="grid gap-4 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
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
