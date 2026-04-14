"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboardStore } from "@/src/store/useDashboardStore";
import type { CondoBillingSettings } from "@/shared/src";

type BillingSettingsForm = {
  automaticGenerationEnabled: boolean;
  generationDayEnabled: boolean;
  generationDay: string;
  defaultAmountEnabled: boolean;
  defaultAmount: string;
  dueDayEnabled: boolean;
  dueDay: string;
  lateFeeEnabled: boolean;
  lateFeePercent: string;
  lateInterestEnabled: boolean;
  lateInterestMonthlyPercent: string;
  notifyOnGenerationEnabled: boolean;
  reminderEnabled: boolean;
  reminderLeadDays: string;
  importantDateNotificationsEnabled: boolean;
  reservationTomorrowNotificationsEnabled: boolean;
  occurrenceStatusNotificationsEnabled: boolean;
  occurrenceAssignmentNotificationsEnabled: boolean;
};

const emptyForm: BillingSettingsForm = {
  automaticGenerationEnabled: false,
  generationDayEnabled: false,
  generationDay: "",
  defaultAmountEnabled: false,
  defaultAmount: "",
  dueDayEnabled: false,
  dueDay: "",
  lateFeeEnabled: false,
  lateFeePercent: "",
  lateInterestEnabled: false,
  lateInterestMonthlyPercent: "",
  notifyOnGenerationEnabled: false,
  reminderEnabled: false,
  reminderLeadDays: "",
  importantDateNotificationsEnabled: true,
  reservationTomorrowNotificationsEnabled: true,
  occurrenceStatusNotificationsEnabled: true,
  occurrenceAssignmentNotificationsEnabled: true,
};

const mapSettingsToForm = (settings?: CondoBillingSettings): BillingSettingsForm => ({
  automaticGenerationEnabled: settings?.automaticGenerationEnabled ?? false,
  generationDayEnabled: settings?.generationDayEnabled ?? false,
  generationDay: settings?.generationDay?.toString() ?? "",
  defaultAmountEnabled: settings?.defaultAmountEnabled ?? false,
  defaultAmount: settings?.defaultAmountCents ? (settings.defaultAmountCents / 100).toFixed(2) : "",
  dueDayEnabled: settings?.dueDayEnabled ?? false,
  dueDay: settings?.dueDay?.toString() ?? "",
  lateFeeEnabled: settings?.lateFeeEnabled ?? false,
  lateFeePercent: settings?.lateFeePercent?.toString() ?? "",
  lateInterestEnabled: settings?.lateInterestEnabled ?? false,
  lateInterestMonthlyPercent: settings?.lateInterestMonthlyPercent?.toString() ?? "",
  notifyOnGenerationEnabled: settings?.notifyOnGenerationEnabled ?? false,
  reminderEnabled: settings?.reminderEnabled ?? false,
  reminderLeadDays: settings?.reminderLeadDays?.toString() ?? "",
  importantDateNotificationsEnabled: settings?.importantDateNotificationsEnabled ?? true,
  reservationTomorrowNotificationsEnabled: settings?.reservationTomorrowNotificationsEnabled ?? true,
  occurrenceStatusNotificationsEnabled: settings?.occurrenceStatusNotificationsEnabled ?? true,
  occurrenceAssignmentNotificationsEnabled: settings?.occurrenceAssignmentNotificationsEnabled ?? true,
});

const DEFAULT_GENERATION_DAY = "5";
const DEFAULT_BILLING_AMOUNT = "200,00";
const DEFAULT_DUE_DAY = "15";

const parseOptionalInteger = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? Number.parseInt(trimmed, 10) : undefined;
};

const parseOptionalDecimal = (value: string) => {
  const normalized = value.trim().replace(",", ".");
  return normalized ? Number.parseFloat(normalized) : undefined;
};

const parseOptionalAmountCents = (value: string) => {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) {
    return undefined;
  }

  const parsed = Number.parseFloat(normalized);
  if (Number.isNaN(parsed)) {
    return undefined;
  }

  return Math.round(parsed * 100);
};

const formatCurrencyInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  const cents = Number.parseInt(digits, 10);
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
};

function SettingToggle({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
      <div>
        <Label htmlFor={id}>{label}</Label>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
      <label className="mt-0.5 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
        />
        Ativo
      </label>
    </div>
  );
}

export default function SettingsPage() {
  const state = useDashboardStore();
  const activeCondo = state.activeCondoId ? state.condos[state.activeCondoId] : undefined;
  const currentUser = state.currentUserId ? state.users[state.currentUserId] : undefined;
  const canManageSettings = currentUser?.role === "ADMIN_COMPANY" || currentUser?.role === "SYSTEM_ADMIN";
  const [form, setForm] = useState<BillingSettingsForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    setForm(mapSettingsToForm(activeCondo?.billingSettings));
    setMessage(undefined);
    setError(undefined);
  }, [activeCondo?.id, activeCondo?.billingSettings]);

  const updateForm = (patch: Partial<BillingSettingsForm>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const handleAutomaticGenerationChange = (checked: boolean) => {
    setForm((current) => ({
      ...current,
      automaticGenerationEnabled: checked,
      generationDayEnabled: checked,
      defaultAmountEnabled: checked,
      dueDayEnabled: checked,
      generationDay: checked ? current.generationDay || DEFAULT_GENERATION_DAY : "",
      defaultAmount: checked ? current.defaultAmount || DEFAULT_BILLING_AMOUNT : "",
      dueDay: checked ? current.dueDay || DEFAULT_DUE_DAY : "",
    }));
  };

  const save = async () => {
    setSaving(true);
    setMessage(undefined);
    setError(undefined);
    try {
      await state.updateCondoBillingSettings({
        automaticGenerationEnabled: form.automaticGenerationEnabled,
        generationDayEnabled: form.automaticGenerationEnabled,
        generationDay: form.automaticGenerationEnabled ? parseOptionalInteger(form.generationDay) : undefined,
        defaultAmountEnabled: form.automaticGenerationEnabled,
        defaultAmountCents: form.automaticGenerationEnabled ? parseOptionalAmountCents(form.defaultAmount) : undefined,
        dueDayEnabled: form.automaticGenerationEnabled,
        dueDay: form.automaticGenerationEnabled ? parseOptionalInteger(form.dueDay) : undefined,
        lateFeeEnabled: form.lateFeeEnabled,
        lateFeePercent: form.lateFeeEnabled ? parseOptionalDecimal(form.lateFeePercent) : undefined,
        lateInterestEnabled: form.lateInterestEnabled,
        lateInterestMonthlyPercent: form.lateInterestEnabled ? parseOptionalDecimal(form.lateInterestMonthlyPercent) : undefined,
        notifyOnGenerationEnabled: form.notifyOnGenerationEnabled,
        reminderEnabled: form.reminderEnabled,
        reminderLeadDays: form.reminderEnabled ? parseOptionalInteger(form.reminderLeadDays) : undefined,
        importantDateNotificationsEnabled: form.importantDateNotificationsEnabled,
        reservationTomorrowNotificationsEnabled: form.reservationTomorrowNotificationsEnabled,
        occurrenceStatusNotificationsEnabled: form.occurrenceStatusNotificationsEnabled,
        occurrenceAssignmentNotificationsEnabled: form.occurrenceAssignmentNotificationsEnabled,
      });
      setMessage("Configurações salvas.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar as configurações.");
    } finally {
      setSaving(false);
    }
  };

  if (!activeCondo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
          <CardDescription>Selecione um condomínio ativo para ajustar regras operacionais e de cobrança.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!canManageSettings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
          <CardDescription>Esta área é exclusiva para administradores.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader>
          <CardTitle>Regras de cobrança</CardTitle>
          <CardDescription>Defina quais automações e padrões financeiros ficam ativos em {activeCondo.name}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingToggle
            id="automatic-generation"
            label="Ativar geração automática"
            description="Liga ou desliga a rotina automática de emissão para moradores."
            checked={form.automaticGenerationEnabled}
            onCheckedChange={handleAutomaticGenerationChange}
          />

          <div className="grid gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <div>
              <Label htmlFor="generation-day">Dia de geração da cobrança</Label>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Define o dia do mês em que novas cobranças podem ser criadas automaticamente.</p>
            </div>
            <Input id="generation-day" type="number" min={1} max={31} placeholder="Ex.: 5" value={form.generationDay} onChange={(event) => updateForm({ generationDay: event.target.value })} disabled={!form.automaticGenerationEnabled || saving} />

            <div className="pt-1">
              <Label htmlFor="default-amount">Valor padrão da cobrança</Label>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Usa um valor base para novas cobranças recorrentes.</p>
            </div>
            <Input
              id="default-amount"
              inputMode="numeric"
              placeholder="200,00"
              value={form.defaultAmount}
              onChange={(event) => updateForm({ defaultAmount: formatCurrencyInput(event.target.value) })}
              disabled={!form.automaticGenerationEnabled || saving}
            />

            <div className="pt-1">
              <Label htmlFor="due-day">Data de vencimento</Label>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Define o dia padrão de vencimento das cobranças.</p>
            </div>
            <Input id="due-day" type="number" min={1} max={31} placeholder="Ex.: 15" value={form.dueDay} onChange={(event) => updateForm({ dueDay: event.target.value })} disabled={!form.automaticGenerationEnabled || saving} />
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <SettingToggle
              id="late-fee"
              label="Multa por atraso"
              description="Aplica uma multa percentual quando a cobrança passar do vencimento."
              checked={form.lateFeeEnabled}
              onCheckedChange={(checked) => updateForm({ lateFeeEnabled: checked })}
            />
            <Input inputMode="decimal" placeholder="Ex.: 2" value={form.lateFeePercent} onChange={(event) => updateForm({ lateFeePercent: event.target.value })} disabled={!form.lateFeeEnabled || saving} />
          </div>

          <div className="grid gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
            <SettingToggle
              id="late-interest"
              label="Juros por atraso"
              description="Aplica juros percentuais ao mês sobre cobranças vencidas."
              checked={form.lateInterestEnabled}
              onCheckedChange={(checked) => updateForm({ lateInterestEnabled: checked })}
            />
            <Input inputMode="decimal" placeholder="Ex.: 1" value={form.lateInterestMonthlyPercent} onChange={(event) => updateForm({ lateInterestMonthlyPercent: event.target.value })} disabled={!form.lateInterestEnabled || saving} />
          </div>

          <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-50">Configurações de notificação</h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Controle os avisos enviados aos moradores durante o ciclo de cobrança.</p>
            </div>

            <div className="space-y-4">
              <SettingToggle
                id="notify-generation"
                label="Enviar notificação ao morador ao gerar cobrança"
                description="Dispara aviso imediato quando uma nova cobrança for criada."
                checked={form.notifyOnGenerationEnabled}
                onCheckedChange={(checked) => updateForm({ notifyOnGenerationEnabled: checked })}
              />

              <div className="grid gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <SettingToggle
                  id="reminder"
                  label="Prazo de antecedência para aviso de cobrança"
                  description="Envia um lembrete alguns dias antes do vencimento."
                  checked={form.reminderEnabled}
                  onCheckedChange={(checked) => updateForm({ reminderEnabled: checked })}
                />
                <Input type="number" min={0} max={60} placeholder="Ex.: 3" value={form.reminderLeadDays} onChange={(event) => updateForm({ reminderLeadDays: event.target.value })} disabled={!form.reminderEnabled || saving} />
              </div>

              <SettingToggle
                id="important-date-notifications"
                label="Datas importantes"
                description="Envia avisos quando houver uma data importante marcada para amanhã."
                checked={form.importantDateNotificationsEnabled}
                onCheckedChange={(checked) => updateForm({ importantDateNotificationsEnabled: checked })}
              />

              <SettingToggle
                id="reservation-tomorrow-notifications"
                label="Reserva para amanhã"
                description="Envia lembrete quando existir uma reserva marcada para o dia seguinte."
                checked={form.reservationTomorrowNotificationsEnabled}
                onCheckedChange={(checked) => updateForm({ reservationTomorrowNotificationsEnabled: checked })}
              />

              <SettingToggle
                id="occurrence-status-notifications"
                label="Status de ocorrência"
                description="Avisa os envolvidos quando o status de uma ocorrência for atualizado."
                checked={form.occurrenceStatusNotificationsEnabled}
                onCheckedChange={(checked) => updateForm({ occurrenceStatusNotificationsEnabled: checked })}
              />

              <SettingToggle
                id="occurrence-assignment-notifications"
                label="Atribuição de ocorrência"
                description="Avisa quando alguém for designado para atender uma ocorrência."
                checked={form.occurrenceAssignmentNotificationsEnabled}
                onCheckedChange={(checked) => updateForm({ occurrenceAssignmentNotificationsEnabled: checked })}
              />
            </div>
          </div>

          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}

          <Button onClick={save} disabled={saving}>
            {saving ? "Salvando..." : "Salvar configurações"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo aplicado</CardTitle>
          <CardDescription>Prévia rápida das regras atualmente ativas para este condomínio.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <div className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
            <p className="font-medium text-slate-950 dark:text-slate-50">Automação</p>
            <p className="mt-1">{form.automaticGenerationEnabled ? "Geração automática ligada" : "Geração automática desligada"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
            <p className="font-medium text-slate-950 dark:text-slate-50">Calendário</p>
            <p className="mt-1">Geração: {form.automaticGenerationEnabled ? `dia ${form.generationDay || "-"}` : "desativado"}</p>
            <p className="mt-1">Vencimento: {form.automaticGenerationEnabled ? `dia ${form.dueDay || "-"}` : "desativado"}</p>
            <p className="mt-1">Lembrete: {form.reminderEnabled ? `${form.reminderLeadDays || "-"} dia(s) antes` : "desativado"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
            <p className="font-medium text-slate-950 dark:text-slate-50">Valores</p>
            <p className="mt-1">Cobrança padrão: {form.automaticGenerationEnabled ? `R$ ${form.defaultAmount || "-"}` : "desativado"}</p>
            <p className="mt-1">Multa: {form.lateFeeEnabled ? `${form.lateFeePercent || "-"}%` : "desativado"}</p>
            <p className="mt-1">Juros: {form.lateInterestEnabled ? `${form.lateInterestMonthlyPercent || "-"}% ao mês` : "desativado"}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 px-4 py-3 dark:border-slate-800">
            <p className="font-medium text-slate-950 dark:text-slate-50">Notificações</p>
            <p className="mt-1">{form.notifyOnGenerationEnabled ? "Aviso no momento da geração ativado" : "Aviso no momento da geração desativado"}</p>
            <p className="mt-1">Datas importantes: {form.importantDateNotificationsEnabled ? "ativado" : "desativado"}</p>
            <p className="mt-1">Reserva para amanhã: {form.reservationTomorrowNotificationsEnabled ? "ativado" : "desativado"}</p>
            <p className="mt-1">Status de ocorrência: {form.occurrenceStatusNotificationsEnabled ? "ativado" : "desativado"}</p>
            <p className="mt-1">Atribuição de ocorrência: {form.occurrenceAssignmentNotificationsEnabled ? "ativado" : "desativado"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
