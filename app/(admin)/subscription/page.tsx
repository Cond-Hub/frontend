"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, CheckCircle2, CreditCard, ExternalLink, Loader2, ShieldCheck, Sparkles, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  STARTER: "Carteira inicial",
  PRO: "Mais escolhido",
  ENTERPRISE: "Sob consulta",
};

const statusLabel = (status?: ManagedSubscription["status"]) => {
  switch (status) {
    case "PAID":
      return "Ativa";
    case "CANCELLED":
      return "Cancelada";
    case "EXPIRED":
      return "Expirada";
    case "REFUNDED":
      return "Reembolsada";
    case "PENDING":
    default:
      return "Pendente";
  }
};

const statusTone = (status?: ManagedSubscription["status"]) => {
  switch (status) {
    case "PAID":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200";
    case "CANCELLED":
    case "EXPIRED":
      return "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200";
    case "REFUNDED":
      return "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";
    case "PENDING":
    default:
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200";
  }
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

const planFeatures = (plan: SaasPlan) => {
  if (plan.code === "ENTERPRISE") {
    return [
      "Escala alta com condições comerciais personalizadas",
      "Volume de condomínios e unidades sob consulta",
      "Suporte prioritário e negociação dedicada",
    ];
  }

  return [
    `${plan.maxCondos === 1 ? "1 condomínio incluído" : `Até ${plan.maxCondos.toLocaleString("pt-BR")} condomínios`}`,
    `${plan.maxUnitsPerCondo === 0 ? "Volume de unidades negociado" : `Até ${plan.maxUnitsPerCondo.toLocaleString("pt-BR")} unidades`}`,
    `Até ${plan.maxResidents.toLocaleString("pt-BR")} moradores`,
    "Todas as features incluídas",
    `Condomínio extra: ${formatMoney(plan.extraCondoPrice)}/mês`,
  ];
};

const isManager = (role?: string) => role === "ADMIN_COMPANY";

export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const state = useDashboardStore();
  const currentUser = state.currentUserId ? state.users[state.currentUserId] : undefined;
  const onboardingMode = searchParams.get("onboarding") === "1";
  const paymentRequired = searchParams.get("paymentRequired") === "1";
  const checkoutSuccess = searchParams.get("checkout") === "success";
  const queryPlanCode = (searchParams.get("plan") ?? "").trim().toUpperCase() as ManagedSubscriptionPlanCode | "";

  const [portal, setPortal] = useState<CustomerPortal>();
  const [management, setManagement] = useState<SubscriptionManagementContext>();
  const [plans, setPlans] = useState<SaasPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [planAction, setPlanAction] = useState<string>();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const loadAll = async () => {
    const [portalData, plansData, managementData] = await Promise.all([
      dashboardApi.saas.customerPortal(),
      dashboardApi.saas.publicPlans(),
      dashboardApi.saas.subscriptionManagement(),
    ]);

    setPortal(portalData);
    setPlans(plansData);
    setManagement(managementData);
  };

  useEffect(() => {
    if (!currentUser || !isManager(currentUser.role)) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(undefined);

    loadAll()
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Nao foi possivel carregar a assinatura.");
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
  }, [currentUser?.id]);

  const orderedPlans = useMemo(() => {
    const planMap = new Map(plans.map((plan) => [plan.code, plan]));
    const selfServe = selfServePlanOrder.map((code) => planMap.get(code)).filter(Boolean) as SaasPlan[];
    const enterprise = planMap.get("ENTERPRISE");
    return enterprise ? [...selfServe, enterprise] : selfServe;
  }, [plans]);

  const currentManaged = management?.current;
  const suggestedPlanCode = queryPlanCode || currentManaged?.planCode || portal?.currentPlan?.code || "PRO";

  const usage = useMemo(() => {
    const plan = portal?.currentPlan;
    const condoCount = portal?.condoCount ?? 0;
    const includedCondos = plan?.maxCondos ?? 0;
    const extraCondos = Math.max(0, condoCount - includedCondos);

    return {
      condoCount,
      includedCondos,
      extraCondos,
      estimatedMonthlyAmount: portal?.estimatedMonthlyAmount,
    };
  }, [portal]);

  const openEnterpriseSales = () => {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Olá, tenho interesse no plano Enterprise da CondHub")}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const startCheckout = async (planCode: Exclude<ManagedSubscriptionPlanCode, "ENTERPRISE">) => {
    setPlanAction(planCode);
    try {
      const origin = typeof window === "undefined" ? "" : window.location.origin;
      const checkout = await dashboardApi.saas.createManagedSubscriptionCheckout({
        planCode,
        returnUrl: `${origin}/subscription?plan=${planCode}`,
        completionUrl: `${origin}/subscription?checkout=success&plan=${planCode}`,
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
        title: "Nao foi possivel abrir o checkout",
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
      await loadAll();
      setCancelOpen(false);
      showToast({
        tone: "success",
        title: "Assinatura cancelada",
        description: "Nenhuma cobrança futura será gerada para essa assinatura.",
      });
    } catch (err) {
      showToast({
        tone: "error",
        title: "Nao foi possivel cancelar",
        description: err instanceof Error ? err.message : "Tente novamente em instantes.",
      });
    } finally {
      setCanceling(false);
    }
  };

  if (!currentUser || !isManager(currentUser.role)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assinatura</CardTitle>
          <CardDescription>Esta área foi desenhada para o gestor principal da empresa.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return <SubscriptionPageSkeleton />;
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

  return (
    <div className="space-y-6">
      <ConfirmDialog
        open={cancelOpen}
        title="Cancelar assinatura"
        description="Essa ação interrompe as próximas cobranças recorrentes. Se quiser apenas trocar de plano, crie o novo checkout e mantenha a atual ativa até concluir a troca."
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

      {(onboardingMode || paymentRequired || checkoutSuccess) ? (
        <Card className="border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-100">
          <CardHeader className="space-y-3">
            <CardTitle className="text-xl">
              {checkoutSuccess ? "Checkout iniciado com sucesso" : "Sua assinatura começa aqui"}
            </CardTitle>
            <CardDescription className="text-emerald-900/80 dark:text-emerald-200/80">
              {checkoutSuccess
                ? "Se o pagamento for concluído no checkout, a assinatura recorrente passa a valer automaticamente."
                : "O primeiro mês é grátis. Você pode cancelar antes da primeira cobrança e nada será debitado. Essa mensagem precisa ficar clara para gerar confiança, então deixamos isso explícito aqui e nas ações principais."}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
        <div className="space-y-6">
          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                    <Sparkles className="h-3.5 w-3.5" />
                    1 mês grátis
                  </div>
                  <div>
                    <CardTitle>Escolha a assinatura da empresa</CardTitle>
                    <CardDescription className="mt-2 max-w-2xl">
                      A conta da empresa já foi criada. Agora o próximo passo é escolher o plano e abrir o checkout seguro da AbacatePay. A proposta precisa passar confiança: você não será cobrado antes de 30 dias e pode cancelar antes disso sem cobrança.
                    </CardDescription>
                  </div>
                </div>
                <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                  {[
                    "Checkout seguro hospedado pela AbacatePay",
                    "Sem cobrança antes do fim do período grátis",
                    "Cancelamento disponível a qualquer momento",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            {orderedPlans.map((plan) => {
              const selfServe = plan.code !== "ENTERPRISE";
              const isCurrentPlan = currentManaged?.planCode === plan.code && currentManaged?.status === "PAID";
              const isSuggested = suggestedPlanCode === plan.code;
              const actionLoading = planAction === plan.code;

              return (
                <Card
                  key={plan.code}
                  className={`border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 ${
                    isSuggested ? "ring-2 ring-emerald-500/70 dark:ring-emerald-400/70" : ""
                  }`}
                >
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
                      {isCurrentPlan ? (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                          Plano atual
                        </span>
                      ) : null}
                    </div>

                    <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Preço recorrente</p>
                      <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-slate-50">
                        {plan.code === "ENTERPRISE" ? "Sob consulta" : `${formatMoney(plan.monthlyPrice)}/mês`}
                      </p>
                      {selfServe ? (
                        <p className="mt-2 text-sm text-emerald-700 dark:text-emerald-300">
                          Primeiro mês grátis. Se cancelar antes do fim do período gratuito, nada será cobrado.
                        </p>
                      ) : (
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          Plano com negociação dedicada e contratação comercial.
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5">
                    <div className="grid gap-3">
                      {planFeatures(plan).map((item) => (
                        <div
                          key={item}
                          className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 border-t border-slate-200 pt-5 dark:border-slate-800">
                      {plan.code === "ENTERPRISE" ? (
                        <Button className="w-full" variant="outline" onClick={openEnterpriseSales}>
                          Falar com vendas
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      ) : currentManaged?.status === "PENDING" && currentManaged.planCode === plan.code && currentManaged.checkoutUrl ? (
                        <Button className="w-full" onClick={() => window.location.assign(currentManaged.checkoutUrl ?? "/subscription")}>
                          Continuar checkout atual
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          disabled={actionLoading || isCurrentPlan}
                          onClick={() => void startCheckout(plan.code as Exclude<ManagedSubscriptionPlanCode, "ENTERPRISE">)}
                        >
                          {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {isCurrentPlan ? "Plano atual" : currentManaged?.planCode && currentManaged.planCode !== plan.code ? `Trocar para ${plan.name}` : "Iniciar período grátis"}
                        </Button>
                      )}

                      {selfServe ? (
                        <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
                          Você será levado para o checkout seguro da AbacatePay. O objetivo aqui é deixar claro: sem cobrança antes de 30 dias e cancelamento possível antes disso.
                        </p>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <CardHeader>
              <CardTitle>Assinatura atual</CardTitle>
              <CardDescription>Estado atual do checkout recorrente gerenciado pela AbacatePay.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentManaged ? (
                <>
                  <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusTone(currentManaged.status)}`}>
                    {statusLabel(currentManaged.status)}
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Plano</p>
                    <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-slate-50">
                      {currentManaged.planCode ?? "Sem vínculo detectado"}
                    </p>
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                      Valor da assinatura: <span className="font-semibold">{formatMoneyFromCents(currentManaged.amountCents)}</span>
                    </p>
                  </div>

                  <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                      <p className="font-medium text-slate-950 dark:text-slate-50">Criada em</p>
                      <p className="mt-1">{currentManaged.createdAt ? new Date(currentManaged.createdAt).toLocaleString("pt-BR") : "—"}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                      <p className="font-medium text-slate-950 dark:text-slate-50">Atualizada em</p>
                      <p className="mt-1">{currentManaged.updatedAt ? new Date(currentManaged.updatedAt).toLocaleString("pt-BR") : "—"}</p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                    {currentManaged.status === "PENDING" && currentManaged.checkoutUrl ? (
                      <Button className="w-full" onClick={() => window.location.assign(currentManaged.checkoutUrl ?? "/subscription")}>
                        Continuar checkout
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    ) : null}

                    {currentManaged.status !== "CANCELLED" && currentManaged.status !== "EXPIRED" ? (
                      <Button className="w-full" variant="outline" onClick={() => setCancelOpen(true)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancelar assinatura
                      </Button>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Ainda nao existe assinatura gerenciada detectada para esta empresa. Escolha um plano ao lado para abrir o checkout.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <CardHeader>
              <CardTitle>Resumo da operação</CardTitle>
              <CardDescription>Contexto atual da empresa dentro do portal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Empresa</p>
                <p className="mt-2 font-semibold text-slate-950 dark:text-slate-50">{portal?.companyName ?? management?.companyName ?? "Empresa"}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <Metric label="Condomínios em uso" value={usage.condoCount} />
                <Metric label="Condomínios inclusos" value={usage.includedCondos || "Sob consulta"} />
                <Metric label="Condomínios extras" value={usage.extraCondos} />
                <Metric label="Estimativa mensal" value={formatMoney(usage.estimatedMonthlyAmount)} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <CardHeader>
              <CardTitle>Como a jornada funciona</CardTitle>
              <CardDescription>Fluxo pensado para transmitir segurança antes de cobrar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {[
                "Você cria a conta da empresa primeiro, sem amarrar o cadastro a um plano.",
                "Depois escolhe a assinatura e segue para o checkout seguro da AbacatePay.",
                "O destaque visual reforça 1 mês grátis e cancelamento antes da primeira cobrança.",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
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

function SubscriptionPageSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
        <div className="grid gap-4 xl:grid-cols-2">
          {[0, 1, 2].map((item) => (
            <Card key={item} className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <CardHeader className="space-y-3">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-24 w-full rounded-3xl" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          {[0, 1, 2].map((item) => (
            <Card key={item} className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <CardHeader className="space-y-3">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
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
    </div>
  );
}
