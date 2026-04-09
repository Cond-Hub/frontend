"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Copy, Loader2, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardApi, type CustomerPortal, type SaasInvoice } from "@/src/store/useDashboardStore";
import { showToast } from "@/src/store/useToastStore";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function SubscriptionPaymentPage() {
  const router = useRouter();
  const [portal, setPortal] = useState<CustomerPortal>();
  const [invoice, setInvoice] = useState<SaasInvoice>();
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string>();
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  const loadPayment = async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setPolling(true);
    }

    try {
      const [portalData, paymentData] = await Promise.all([
        dashboardApi.saas.customerPortal(),
        dashboardApi.saas.currentPayment(),
      ]);
      setPortal(portalData);
      setInvoice(paymentData);
      setError(undefined);
      if (paymentData.status === "PAID") {
        setPaymentConfirmed(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar o pagamento.");
    } finally {
      if (showLoading) {
        setLoading(false);
      } else {
        setPolling(false);
      }
    }
  };

  useEffect(() => {
    void loadPayment(true);
  }, []);

  useEffect(() => {
    if (paymentConfirmed) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadPayment(false);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [paymentConfirmed]);

  const amount = useMemo(() => invoice?.amount ?? portal?.estimatedMonthlyAmount ?? portal?.currentPlan?.monthlyPrice ?? 499, [invoice?.amount, portal]);
  const pixCode = invoice?.brCode ?? "";
  const copyPixCode = async () => {
    if (!pixCode) {
      return;
    }

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
      {paymentConfirmed ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md border-emerald-200 bg-white dark:border-emerald-900/60 dark:bg-slate-950">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <CardTitle className="mt-3">Pagamento confirmado</CardTitle>
              <CardDescription>
                O acesso da empresa foi regularizado. Você já pode voltar ao sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => router.replace("/company")}>
                Voltar ao sistema
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : null}

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
              Gere e acompanhe o PIX da mensalidade da empresa por aqui.
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
              <div className="mb-4 flex items-center justify-between gap-3 text-slate-900 dark:text-slate-100">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  <p className="font-semibold">QR Code PIX</p>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {polling ? "Verificando pagamento..." : "Atualização automática a cada 5s"}
                </span>
              </div>
              {pixCode ? (
                <div className="mx-auto flex w-[220px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700">
                  <QRCodeSVG value={pixCode} size={176} bgColor="#ffffff" fgColor="#0f172a" includeMargin />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  Não foi possível gerar o QR Code agora.
                </div>
              )}
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
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 font-mono text-xs leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                <div className="break-all whitespace-pre-wrap">
                  {pixCode}
                </div>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
