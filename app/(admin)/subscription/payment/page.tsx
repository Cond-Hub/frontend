"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Copy, Loader2, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardApi, type CustomerPortal } from "@/src/store/useDashboardStore";
import { showToast } from "@/src/store/useToastStore";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const fallbackPixCode =
  "00020101021226890014br.gov.bcb.pix2567mock.condhub.com/pix/empresa-regularizacao5204000053039865406499.005802BR5925CONDHUB ADMINISTRADORA6009SAO PAULO62070503***6304ABCD";

export default function SubscriptionPaymentPage() {
  const [portal, setPortal] = useState<CustomerPortal>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;

    dashboardApi.saas
      .customerPortal()
      .then((data) => {
        if (!cancelled) {
          setPortal(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Não foi possível carregar o pagamento.");
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
  }, []);

  const amount = useMemo(() => portal?.estimatedMonthlyAmount ?? portal?.currentPlan?.monthlyPrice ?? 499, [portal]);
  const pixCode = useMemo(
    () => `${fallbackPixCode}${portal?.companyId?.replace(/-/g, "").slice(0, 24) ?? ""}`,
    [portal?.companyId],
  );

  const copyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      showToast({
        tone: "success",
        title: "PIX copiado",
        description: "O código copia e cola foi enviado para a área de transferência.",
      });
    } catch {
      showToast({
        tone: "error",
        title: "Falha ao copiar",
        description: "Copie manualmente o código exibido abaixo.",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex min-h-48 items-center justify-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando pagamento...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pagamento</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="border-amber-200 bg-amber-50 text-amber-950">
        <CardHeader>
          <CardTitle>Assinatura bloqueada por pagamento</CardTitle>
          <CardDescription className="text-amber-900/80">
            Enquanto o pagamento nao for regularizado, a empresa, os sindicos e os moradores ficam sem acesso operacional.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardHeader>
            <CardTitle>Regularizar agora</CardTitle>
            <CardDescription>
              Este pagamento está mockado com QR Code e PIX copia e cola para validar a experiência.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">Empresa</p>
              <p className="mt-1 text-xl font-semibold text-slate-950 dark:text-slate-50">
                {portal?.companyName ?? "Empresa"}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 dark:bg-slate-950">
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Plano</p>
                  <p className="mt-2 font-semibold text-slate-950 dark:text-slate-50">{portal?.currentPlan?.name ?? "Pro"}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/20">
                  <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Valor</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-900 dark:text-emerald-100">
                    {currency.format(amount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
              <div className="mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <QrCode className="h-5 w-5" />
                <p className="font-semibold">QR Code mockado</p>
              </div>
              <div className="mx-auto grid w-[220px] grid-cols-8 gap-1 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700">
                {Array.from({ length: 64 }).map((_, index) => {
                  const filled = [0, 1, 2, 3, 8, 11, 16, 18, 21, 25, 27, 30, 31, 34, 36, 39, 40, 41, 44, 47, 49, 50, 52, 54, 57, 58, 61, 63].includes(index);
                  return <span key={index} className={`aspect-square rounded-[2px] ${filled ? "bg-slate-950" : "bg-white"}`} />;
                })}
              </div>
            </div>

            <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-950 dark:text-slate-50">PIX copia e cola</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Use este código no app do banco.</p>
                </div>
                <Button variant="outline" onClick={() => void copyPixCode()}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar
                </Button>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 font-mono text-xs leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                {pixCode}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardHeader>
            <CardTitle>Depois do pagamento</CardTitle>
            <CardDescription>Fluxo esperado para a regularização da conta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              O acesso volta para a empresa.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              Síndicos e moradores deixam de ver o bloqueio.
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              A carteira de condominios volta a operar normalmente.
            </div>

            <Link href="/subscription">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para assinatura
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
