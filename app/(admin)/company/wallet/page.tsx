"use client";

import { Landmark, Wallet, X } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CompanyListEmpty,
  CompanyMetricCard,
  CompanyWorkspaceEmptyState,
  CompanyWorkspaceSkeleton,
  useCompanyWorkspaceData,
} from "@/components/admin/company-workspace";
import { dashboardApi, useDashboardStore } from "@/src/store/useDashboardStore";
import { showToast } from "@/src/store/useToastStore";
import type { WalletWithdrawal } from "@/shared/src";

type WithdrawFormState = {
  amountInput: string;
  pixKeyType: WalletWithdrawal["pixKeyType"];
  pixKey: string;
};

const emptyWithdrawForm: WithdrawFormState = {
  amountInput: "",
  pixKeyType: "EMAIL",
  pixKey: "",
};

function formatCurrencyBRL(valueCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueCents / 100);
}

function formatCurrencyInput(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  return formatCurrencyBRL(Number(digits));
}

function currencyInputToCents(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function WithdrawModal({
  form,
  saving,
  availableCents,
  onClose,
  onChange,
  onSubmit,
}: {
  form: WithdrawFormState;
  saving: boolean;
  availableCents: number;
  onClose: () => void;
  onChange: (next: WithdrawFormState) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[90] h-dvh min-h-dvh w-screen overflow-y-auto bg-slate-950/60 backdrop-blur-sm">
      <div className="flex min-h-dvh w-full items-center justify-center p-4 py-6">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Sacar carteira</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Disponível agora: {formatCurrencyBRL(availableCents)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50"
              onClick={onClose}
              aria-label="Fechar modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="wallet-amount">Valor</Label>
              <Input
                id="wallet-amount"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={form.amountInput}
                onChange={(event) => onChange({ ...form, amountInput: formatCurrencyInput(event.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet-pix-key-type">Tipo de chave PIX</Label>
              <select
                id="wallet-pix-key-type"
                className="input"
                value={form.pixKeyType}
                onChange={(event) => onChange({ ...form, pixKeyType: event.target.value as WalletWithdrawal["pixKeyType"] })}
              >
                <option value="EMAIL">E-mail</option>
                <option value="PHONE">Celular</option>
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
                <option value="RANDOM">Aleatória</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wallet-pix-key">Chave PIX</Label>
              <Input
                id="wallet-pix-key"
                value={form.pixKey}
                onChange={(event) => onChange({ ...form, pixKey: event.target.value })}
                placeholder="Digite a chave para receber o saque"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={onSubmit} disabled={saving || availableCents <= 0 || currencyInputToCents(form.amountInput) <= 0 || !form.pixKey.trim()}>
                {saving ? "Enviando..." : "Sacar"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompanyWalletPage() {
  const { state, currentUser, loading, snapshot } = useCompanyWorkspaceData();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<WithdrawFormState>(emptyWithdrawForm);

  const availableCondos = useMemo(
    () =>
      (snapshot?.condos ?? [])
        .filter((condo) => condo.availableToWithdrawCents > 0)
        .sort((left, right) => right.availableToWithdrawCents - left.availableToWithdrawCents),
    [snapshot],
  );

  const totalAvailable = snapshot?.availableToWithdrawCents ?? 0;

  const openWithdrawDialog = () => {
    setForm({
      ...emptyWithdrawForm,
      amountInput: totalAvailable > 0 ? formatCurrencyBRL(totalAvailable) : "",
    });
    setWithdrawOpen(true);
  };

  const handleWithdraw = async () => {
    if (!snapshot || totalAvailable <= 0) {
      return;
    }

    const amountCents = currencyInputToCents(form.amountInput);
    if (amountCents <= 0 || amountCents > totalAvailable) {
      showToast({
        tone: "error",
        title: "Valor inválido",
        description: "Informe um valor entre zero e o saldo consolidado disponível.",
      });
      return;
    }

    if (!form.pixKey.trim()) {
      showToast({
        tone: "error",
        title: "Chave PIX obrigatória",
        description: "Informe a chave PIX para receber o saque.",
      });
      return;
    }

    setSaving(true);
    const originalCondoId = state.activeCondoId;
    let remaining = amountCents;

    try {
      for (const condo of availableCondos) {
        if (remaining <= 0) {
          break;
        }

        const amountForCondo = Math.min(remaining, condo.availableToWithdrawCents);
        if (amountForCondo <= 0) {
          continue;
        }

        remaining -= amountForCondo;
        await state.setActiveCondoId(condo.condo.id);
        await dashboardApi.wallet.createWithdrawal({
          amountCents: amountForCondo,
          pixKeyType: form.pixKeyType,
          pixKey: form.pixKey.trim(),
          description: `Saque consolidado da carteira - ${condo.condo.name}`,
        });
      }

      showToast({
        tone: "success",
        title: "Saque enviado",
        description: "O saque consolidado foi enviado para a chave PIX informada.",
      });

      setWithdrawOpen(false);
      setForm(emptyWithdrawForm);
      window.location.reload();
    } catch (error) {
      showToast({
        tone: "error",
        title: "Falha ao sacar",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      if (originalCondoId && originalCondoId !== state.activeCondoId) {
        try {
          await state.setActiveCondoId(originalCondoId);
        } catch {
          // ignore restore errors
        }
      }
      setSaving(false);
    }
  };

  if (!currentUser || currentUser.role !== "ADMIN_COMPANY") {
    return <CompanyWorkspaceEmptyState />;
  }

  if (loading || !snapshot) {
    return <CompanyWorkspaceSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CompanyMetricCard title="Carteiras" value={snapshot.condoCount} description="Condomínios somados" icon={Wallet} />
        <CompanyMetricCard title="Disponível para saque" value={formatCurrencyBRL(totalAvailable)} description="Saldo consolidado" icon={Landmark} />
        <CompanyMetricCard title="Boletos vencidos" value={snapshot.overdueBoletoCount} description="Pressão de cobrança" icon={Landmark} />
        <CompanyMetricCard title="Inadimplência" value={formatCurrencyBRL(snapshot.overdueBoletoAmountCents)} description="Total em atraso" icon={Wallet} />
      </div>

      <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>Minha carteira</CardTitle>
            <CardDescription>Saldo consolidado de todas as carteiras da empresa.</CardDescription>
          </div>
          <Button onClick={openWithdrawDialog} disabled={totalAvailable <= 0}>
            Sacar
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {snapshot.condos.length === 0 ? (
            <CompanyListEmpty message="Nenhum condomínio encontrado para consolidar." />
          ) : (
            snapshot.condos.map((item) => (
              <div key={item.condo.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-slate-50">{item.condo.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{item.condo.prefix}.condhub.com</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Disponível</p>
                    <p className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                      {formatCurrencyBRL(item.availableToWithdrawCents)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {withdrawOpen ? (
        <WithdrawModal
          availableCents={totalAvailable}
          form={form}
          saving={saving}
          onChange={setForm}
          onClose={() => {
            if (!saving) {
              setWithdrawOpen(false);
            }
          }}
          onSubmit={() => void handleWithdraw()}
        />
      ) : null}
    </div>
  );
}
