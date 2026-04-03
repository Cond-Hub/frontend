'use client';

import Link from 'next/link';
import { ArrowRight, Landmark, WalletCards, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { WalletPayment, WalletSummary, WalletWithdrawal } from '../../../../shared/src';
import { formatDateBR, formatMonthYearBR, WALLET_PAYMENT_STATUS_LABELS, WALLET_WITHDRAWAL_STATUS_LABELS } from '../../../../shared/src';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Skeleton } from '../../../components/ui/skeleton';
import { dashboardApi } from '../../../src/store/useDashboardStore';
import { showToast } from '../../../src/store/useToastStore';

type WithdrawFormState = {
  amountInput: string;
  pixKeyType: WalletWithdrawal['pixKeyType'];
  pixKey: string;
};

const emptyWithdrawForm: WithdrawFormState = {
  amountInput: '',
  pixKeyType: 'EMAIL',
  pixKey: '',
};

function formatCurrencyBRL(valueCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valueCents / 100);
}

function formatCurrencyInput(raw: string) {
  const digits = raw.replace(/\D/g, '');
  if (!digits) {
    return '';
  }

  return formatCurrencyBRL(Number(digits));
}

function currencyInputToCents(value: string) {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

function maskPixKey(value: WalletWithdrawal) {
  if (value.pixKeyType === 'EMAIL') {
    return value.pixKey;
  }

  if (value.pixKey.length <= 6) {
    return value.pixKey;
  }

  return `${value.pixKey.slice(0, 3)}••••${value.pixKey.slice(-3)}`;
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
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">Sacar saldo</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Disponível agora: {formatCurrencyBRL(availableCents)}
              </p>
            </div>
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50" onClick={onClose} aria-label="Fechar modal">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="withdraw-amount">Valor</Label>
              <Input
                id="withdraw-amount"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={form.amountInput}
                onChange={(event) => onChange({ ...form, amountInput: formatCurrencyInput(event.target.value) })}
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto px-0 py-1 text-sm text-sky-700 hover:bg-transparent hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200"
                  onClick={() => onChange({ ...form, amountInput: availableCents > 0 ? formatCurrencyBRL(availableCents) : '' })}
                  disabled={saving || availableCents <= 0}
                >
                  Sacar tudo
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdraw-key-type">Tipo de chave PIX</Label>
              <select
                id="withdraw-key-type"
                className="input"
                value={form.pixKeyType}
                onChange={(event) => onChange({ ...form, pixKeyType: event.target.value as WalletWithdrawal['pixKeyType'] })}
              >
                <option value="EMAIL">E-mail</option>
                <option value="PHONE">Celular</option>
                <option value="CPF">CPF</option>
                <option value="CNPJ">CNPJ</option>
                <option value="RANDOM">Aleatória</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdraw-key">Chave PIX</Label>
              <Input
                id="withdraw-key"
                value={form.pixKey}
                onChange={(event) => onChange({ ...form, pixKey: event.target.value })}
                placeholder="Digite a chave para receber o saque"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={onSubmit} disabled={saving}>
                {saving ? 'Enviando...' : 'Sacar'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const [summary, setSummary] = useState<WalletSummary>();
  const [payments, setPayments] = useState<WalletPayment[]>([]);
  const [withdrawals, setWithdrawals] = useState<WalletWithdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [savingWithdrawal, setSavingWithdrawal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState<WithdrawFormState>(emptyWithdrawForm);

  const load = async () => {
    setLoading(true);

    try {
      const [nextSummary, nextPayments, nextWithdrawals] = await Promise.all([
        dashboardApi.wallet.getSummary(),
        dashboardApi.wallet.listPayments(),
        dashboardApi.wallet.listWithdrawals(),
      ]);

      setSummary(nextSummary);
      setPayments(nextPayments);
      setWithdrawals(nextWithdrawals);
    } catch (error) {
      showToast({
        tone: 'error',
        title: 'Falha ao carregar carteira',
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const cards = useMemo(
    () => [
      {
        label: 'Entrou',
        value: formatCurrencyBRL(summary?.totalReceivedCents ?? 0),
        icon: WalletCards,
      },
      {
        label: 'Disponível para sacar',
        value: formatCurrencyBRL(summary?.availableToWithdrawCents ?? 0),
        icon: Landmark,
      },
    ],
    [summary],
  );

  const handleCreateWithdrawal = async () => {
    const amountCents = currencyInputToCents(withdrawForm.amountInput);
    if (amountCents < 81 || !withdrawForm.pixKey.trim()) {
      showToast({
        tone: 'error',
        title: 'Dados incompletos',
        description: 'Preencha um valor maior que R$ 0,80 e a chave PIX para continuar.',
      });
      return;
    }

    setSavingWithdrawal(true);
    try {
      await dashboardApi.wallet.createWithdrawal({
        amountCents,
        pixKeyType: withdrawForm.pixKeyType,
        pixKey: withdrawForm.pixKey.trim(),
      });

      showToast({
        tone: 'success',
        title: 'Saque enviado',
      });

      setWithdrawOpen(false);
      setWithdrawForm(emptyWithdrawForm);
      await load();
    } catch (error) {
      showToast({
        tone: 'error',
        title: 'Falha ao sacar',
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
    } finally {
      setSavingWithdrawal(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="text-2xl text-slate-950 dark:text-slate-50">Carteira</CardTitle>
            <CardDescription className="max-w-2xl text-sm leading-6">
              Aqui voce acompanha o que entrou via PIX em tempo real e o valor disponivel para saque, considerando R$ 0,80 por transacao recebida e R$ 0,80 por saque.
            </CardDescription>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/boletos">
              <Button variant="outline" className="inline-flex items-center gap-2">
                Ver boletos
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button onClick={() => setWithdrawOpen(true)} disabled={(summary?.availableToWithdrawCents ?? 0) < 81}>
              Sacar
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label} className="border-slate-200/80 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardDescription>{card.label}</CardDescription>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <CardTitle className="text-3xl text-slate-950 dark:text-slate-50">{card.value}</CardTitle>
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Taxas consideradas no saldo disponível: {formatCurrencyBRL(summary?.totalFeesCents ?? 0)}.
      </p>

      <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Recebimentos PIX</CardTitle>
            <CardDescription>Boletos com cobrancas PIX geradas e seus respectivos status.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24 w-full rounded-2xl" />)
            ) : payments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                Nenhum recebimento PIX registrado ainda.
              </div>
            ) : (
              payments.map((payment) => (
                <div key={payment.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-slate-50">{payment.unitLabel}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Referencia {formatMonthYearBR(payment.referenceMonthISO)} • {formatCurrencyBRL(payment.amountCents)}
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                      {WALLET_PAYMENT_STATUS_LABELS[payment.status]}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Criado em {formatDateBR(payment.createdAtUtc)}
                    {payment.paidAtUtc ? ` • Pago em ${formatDateBR(payment.paidAtUtc)}` : ''}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Saques</CardTitle>
            <CardDescription>Saidas da carteira para a chave PIX informada.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24 w-full rounded-2xl" />)
            ) : withdrawals.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                Nenhum saque solicitado ate agora.
              </div>
            ) : (
              withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-slate-50">{formatCurrencyBRL(withdrawal.amountCents)}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {withdrawal.pixKeyType} • {maskPixKey(withdrawal)}
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                      {WALLET_WITHDRAWAL_STATUS_LABELS[withdrawal.status]}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Criado em {formatDateBR(withdrawal.createdAtUtc)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {withdrawOpen ? (
        <WithdrawModal
          form={withdrawForm}
          saving={savingWithdrawal}
          availableCents={summary?.availableToWithdrawCents ?? 0}
          onClose={() => setWithdrawOpen(false)}
          onChange={setWithdrawForm}
          onSubmit={() => void handleCreateWithdrawal()}
        />
      ) : null}
    </div>
  );
}
