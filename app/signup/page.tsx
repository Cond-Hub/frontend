'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Loader2, Moon, Sun } from 'lucide-react';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

import { CondoHomeBrandImage } from '../../components/brand/condohome-brand-image';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { dashboardApi, useDashboardStore } from '../../src/store/useDashboardStore';
import { showToast } from '../../src/store/useToastStore';

type SignupForm = {
  companyName: string;
  companyDocumentNumber: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  adminDocumentType: 'CPF' | 'CNPJ';
  adminDocumentNumber: string;
  adminPhone: string;
  acceptTerms: boolean;
};

const initialForm: SignupForm = {
  companyName: '',
  companyDocumentNumber: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  adminDocumentType: 'CPF',
  adminDocumentNumber: '',
  adminPhone: '',
  acceptTerms: false,
};

const progressStorageKey = 'condhub-frontend-signup-progress-v1';
const steps = [
  { key: 'company', label: 'Empresa' },
  { key: 'adminName', label: 'Administrador' },
  { key: 'adminEmail', label: 'E-mail' },
  { key: 'adminDocument', label: 'Documento' },
  { key: 'adminPhone', label: 'Telefone' },
  { key: 'password', label: 'Senha' },
] as const;

const createProgressClientId = () => `web-signup-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const onlyDigits = (value: string) => value.replace(/\D/g, '');

const formatDocument = (value: string, type: 'CPF' | 'CNPJ') => {
  const digits = onlyDigits(value).slice(0, type === 'CPF' ? 11 : 14);
  if (type === 'CPF') {
    return digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2');
  }

  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
};

const formatPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) {
    return digits ? `(${digits}` : '';
  }
  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupPageFallback />}>
      <SignupPageContent />
    </Suspense>
  );
}

function SignupPageContent() {
  const router = useRouter();
  const state = useDashboardStore();
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [step, setStep] = useState(0);
  const [progressClientId, setProgressClientId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const currentStep = steps[step];
  const companyStepReady = !!form.companyName.trim() && onlyDigits(form.companyDocumentNumber).length === 14;
  const adminNameStepReady = !!form.adminName.trim();
  const adminEmailStepReady = !!form.adminEmail.trim() && /\S+@\S+\.\S+/.test(form.adminEmail.trim());
  const adminDocumentStepReady = onlyDigits(form.adminDocumentNumber).length === (form.adminDocumentType === 'CPF' ? 11 : 14);
  const adminPhoneStepReady = onlyDigits(form.adminPhone).length === 11;
  const passwordStepReady = form.adminPassword.length >= 8 && form.acceptTerms;
  const stepReady = useMemo(
    () => [companyStepReady, adminNameStepReady, adminEmailStepReady, adminDocumentStepReady, adminPhoneStepReady, passwordStepReady],
    [adminDocumentStepReady, adminEmailStepReady, adminNameStepReady, adminPhoneStepReady, companyStepReady, passwordStepReady],
  );
  const completedStepCount = stepReady.filter(Boolean).length;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(progressStorageKey);
      if (raw) {
        const saved = JSON.parse(raw) as { clientId?: string; step?: number; form?: Partial<SignupForm> };
        setProgressClientId(saved.clientId || createProgressClientId());
        setStep(Math.min(Math.max(saved.step ?? 0, 0), steps.length - 1));
        setForm((prev) => ({ ...prev, ...saved.form, adminPassword: '' }));
        return;
      }
    } catch {
      // Start fresh if local signup progress is corrupted.
    }

    setProgressClientId(createProgressClientId());
  }, []);

  useEffect(() => {
    if (!progressClientId) {
      return;
    }

    const localForm = { ...form, adminPassword: '' };
    window.localStorage.setItem(progressStorageKey, JSON.stringify({ clientId: progressClientId, step, form: localForm }));
  }, [form, progressClientId, step]);

  const persistRemoteProgress = useCallback(
    async (completed = false) => {
      if (!progressClientId) {
        return;
      }

      try {
        await dashboardApi.saas.updateSignupProgress({
          clientId: progressClientId,
          currentStep: currentStep.key,
          completedStepCount,
          totalSteps: steps.length,
          companyName: form.companyName.trim() || undefined,
          companyDocumentNumber: form.companyDocumentNumber || undefined,
          adminName: form.adminName.trim() || undefined,
          adminEmail: form.adminEmail.trim() || undefined,
          adminDocumentType: form.adminDocumentType,
          adminDocumentNumber: form.adminDocumentNumber || undefined,
          adminPhone: form.adminPhone || undefined,
          hasPassword: form.adminPassword.length >= 8,
          acceptTerms: form.acceptTerms,
          completed,
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Falha ao salvar progresso do cadastro.', error);
        }
      }
    },
    [completedStepCount, currentStep.key, form, progressClientId],
  );

  useEffect(() => {
    if (!progressClientId) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void persistRemoteProgress(false);
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [persistRemoteProgress, progressClientId]);

  const goNext = () => {
    if (!stepReady[step]) {
      return;
    }

    void persistRemoteProgress(false);
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const goBack = () => {
    if (step === 0) {
      router.push('/');
      return;
    }

    setStep((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = async () => {
    if (loading) {
      return;
    }

    const payload = {
      companyName: form.companyName.trim(),
      companyDocumentNumber: form.companyDocumentNumber,
      adminName: form.adminName.trim(),
      adminEmail: form.adminEmail.trim(),
      adminPassword: form.adminPassword,
      adminDocumentType: form.adminDocumentType,
      adminDocumentNumber: form.adminDocumentNumber,
      adminPhone: form.adminPhone,
      acceptTerms: form.acceptTerms,
    };

    if (stepReady.some((ready) => !ready)) {
      showToast({
        tone: 'error',
        title: 'Campos obrigatorios',
        description: 'Complete todas as etapas do cadastro.',
      });
      return;
    }

    setLoading(true);
    try {
      await dashboardApi.saas.registerCompany(payload);
      await persistRemoteProgress(true);
      window.localStorage.removeItem(progressStorageKey);
      await dashboardApi.auth.loginBackoffice(payload.adminEmail, payload.adminPassword);
      showToast({
        tone: 'success',
        title: 'Conta criada',
        description: 'Sua empresa foi criada e o teste gratuito de 1 mês já foi iniciado.',
      });
      router.replace('/subscription?trialStarted=1');
    } catch (error) {
      showToast({
        tone: 'error',
        title: 'Não foi possível concluir o cadastro',
        description: error instanceof Error ? error.message : 'Revise os dados e tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f3f4ec] text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="fixed right-4 top-4 z-20 sm:right-6 sm:top-6">
        <Button
          variant="outline"
          size="sm"
          className="h-10 w-10 p-0"
          onClick={() => state.setThemeMode(state.themeMode === 'dark' ? 'light' : 'dark')}
          aria-label={state.themeMode === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
          title={state.themeMode === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
        >
          {state.themeMode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <div className="grid min-h-screen lg:grid-cols-[0.96fr,1.04fr]">
        <section className="relative hidden overflow-hidden bg-[#0f1720] text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.25),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(250,204,21,0.18),transparent_22%),linear-gradient(180deg,#0f1720_0%,#101827_100%)]" />
          <div className="relative flex h-full flex-col justify-between p-12">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Voltar para o site
              </Link>

              <div className="mt-20 max-w-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">Cadastro da empresa</p>
                <h1 className="mt-5 text-5xl font-semibold tracking-tight">
                  Crie a conta agora. A assinatura vem no passo seguinte.
                </h1>
                <p className="mt-6 text-base leading-8 text-slate-300">
                  Primeiro criamos a empresa e o gestor principal. Só depois você escolhe o plano e vai para o checkout seguro da assinatura.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                'Cria a conta da empresa e o gestor principal',
                'Leva para a escolha do plano no passo seguinte',
                'Destaca 1 mês grátis e cancelamento antes da cobrança',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  <p className="text-sm leading-6 text-slate-100">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-8">
          <Card className="w-full max-w-3xl border-slate-200/80 shadow-xl dark:border-slate-800 dark:bg-slate-950">
            <CardHeader className="space-y-4">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 lg:hidden">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-4 flex justify-center sm:justify-start">
                    <CondoHomeBrandImage className="h-16 w-auto" />
                  </div>
                  <CardTitle>Criar conta da empresa</CardTitle>
                  <CardDescription>{currentStep.label}</CardDescription>
                </div>
                <div className="w-fit whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200">
                  1 mês grátis
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-7">
              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {step + 1}/{steps.length}
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {steps.map((item, index) => (
                    <div
                      key={item.key}
                      className={`h-2 rounded-full transition-colors ${
                        index <= step ? 'bg-emerald-700' : 'bg-slate-100 dark:bg-slate-800'
                      }`}
                      title={item.label}
                    />
                  ))}
                </div>
              </div>

              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">{currentStep.label}</h2>

                {step === 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Nome da empresa</Label>
                      <Input id="companyName" value={form.companyName} onChange={(event) => setForm((prev) => ({ ...prev, companyName: event.target.value }))} placeholder="Ex.: Gestão Prime Condomínios" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyDocumentNumber">CNPJ da empresa</Label>
                      <Input
                        id="companyDocumentNumber"
                        value={form.companyDocumentNumber}
                        onChange={(event) => setForm((prev) => ({ ...prev, companyDocumentNumber: formatDocument(event.target.value, 'CNPJ') }))}
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                  </div>
                ) : null}

                {step === 1 ? (
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Nome do administrador</Label>
                    <Input id="adminName" value={form.adminName} onChange={(event) => setForm((prev) => ({ ...prev, adminName: event.target.value }))} placeholder="Seu nome" />
                  </div>
                ) : null}

                {step === 2 ? (
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">E-mail</Label>
                    <Input id="adminEmail" type="email" value={form.adminEmail} onChange={(event) => setForm((prev) => ({ ...prev, adminEmail: event.target.value }))} placeholder="gestor@empresa.com.br" />
                  </div>
                ) : null}

                {step === 3 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="adminDocumentType">Tipo de documento</Label>
                      <select
                        id="adminDocumentType"
                        value={form.adminDocumentType}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            adminDocumentType: event.target.value as 'CPF' | 'CNPJ',
                            adminDocumentNumber: formatDocument(prev.adminDocumentNumber, event.target.value as 'CPF' | 'CNPJ'),
                          }))
                        }
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:ring-offset-slate-950"
                      >
                        <option value="CPF">CPF</option>
                        <option value="CNPJ">CNPJ</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminDocumentNumber">Documento</Label>
                      <Input
                        id="adminDocumentNumber"
                        value={form.adminDocumentNumber}
                        onChange={(event) =>
                          setForm((prev) => ({
                            ...prev,
                            adminDocumentNumber: formatDocument(event.target.value, prev.adminDocumentType),
                          }))
                        }
                        placeholder={form.adminDocumentType === 'CPF' ? '000.000.000-00' : '00.000.000/0000-00'}
                      />
                    </div>
                  </div>
                ) : null}

                {step === 4 ? (
                  <div className="space-y-2">
                    <Label htmlFor="adminPhone">Telefone</Label>
                    <Input
                      id="adminPhone"
                      value={form.adminPhone}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          adminPhone: formatPhone(event.target.value),
                        }))
                      }
                      placeholder="(47) 99999-9999"
                    />
                  </div>
                ) : null}

                {step === 5 ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="adminPassword">Senha</Label>
                      <Input
                        id="adminPassword"
                        type="password"
                        value={form.adminPassword}
                        onChange={(event) => setForm((prev) => ({ ...prev, adminPassword: event.target.value }))}
                        placeholder="Mínimo de 8 caracteres"
                        onKeyDown={(event) => {
                          if (event.key === 'Enter') {
                            void handleSubmit();
                          }
                        }}
                      />
                    </div>

                    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={form.acceptTerms}
                        onChange={(event) => setForm((prev) => ({ ...prev, acceptTerms: event.target.checked }))}
                        className="mt-1 h-4 w-4 rounded border-slate-400"
                      />
                      <span>
                        Li e aceito os{' '}
                        <Link href="/terms" target="_blank" rel="noreferrer" className="font-semibold text-emerald-700 underline underline-offset-4 dark:text-emerald-300">
                          termos do teste gratuito e da operação
                        </Link>
                        .
                      </span>
                    </label>
                  </div>
                ) : null}
              </section>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:justify-between">
                <Button variant="secondary" onClick={goBack} disabled={loading}>
                  {step === 0 ? 'Voltar' : 'Etapa anterior'}
                </Button>
                {step < steps.length - 1 ? (
                  <Button className="min-w-36" onClick={goNext} disabled={!stepReady[step] || loading}>
                    Continuar
                  </Button>
                ) : (
                  <Button className="min-w-44" onClick={() => void handleSubmit()} disabled={loading || !passwordStepReady}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Criar conta e continuar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function SignupPageFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f4ec] text-slate-600 dark:bg-slate-950 dark:text-slate-300">
      <div className="flex items-center gap-3 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando cadastro...
      </div>
    </main>
  );
}
