'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Building2, CheckCircle2, Loader2, Moon, ShieldCheck, Sparkles, Sun } from 'lucide-react';
import { Suspense, useEffect, useMemo, useState } from 'react';

import { CondoHomeBrandImage } from '../../components/brand/condohome-brand-image';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { dashboardApi, useDashboardStore } from '../../src/store/useDashboardStore';
import { showToast } from '../../src/store/useToastStore';

type SignupForm = {
  companyName: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
};

const initialForm: SignupForm = {
  companyName: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
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
  const searchParams = useSearchParams();
  const state = useDashboardStore();
  const [form, setForm] = useState<SignupForm>(initialForm);
  const [loading, setLoading] = useState(false);
  const selectedPlanCode = (searchParams.get('plan') ?? 'PRO').toUpperCase();

  const selectedPlanLabel = useMemo(() => {
    if (selectedPlanCode === 'INDIVIDUAL') {
      return 'Individual';
    }
    if (selectedPlanCode === 'STARTER') {
      return 'Starter';
    }
    if (selectedPlanCode === 'ENTERPRISE') {
      return 'Enterprise';
    }
    return 'Pro';
  }, [selectedPlanCode]);

  const handleSubmit = async () => {
    if (loading) {
      return;
    }

    const payload = {
      companyName: form.companyName.trim(),
      adminName: form.adminName.trim(),
      adminEmail: form.adminEmail.trim(),
      adminPassword: form.adminPassword,
    };

    if (!payload.companyName || !payload.adminName || !payload.adminEmail || !payload.adminPassword) {
      showToast({
        tone: 'error',
        title: 'Campos obrigatorios',
        description: 'Preencha os dados da empresa e do gestor responsavel.',
      });
      return;
    }

    setLoading(true);
    try {
      await dashboardApi.saas.registerCompany(payload);
      await dashboardApi.auth.loginBackoffice(payload.adminEmail, payload.adminPassword);
      showToast({
        tone: 'success',
        title: 'Conta criada',
        description: 'Sua empresa foi criada. Agora voce escolhe a assinatura e segue para o checkout seguro.',
      });
      router.replace(`/subscription?onboarding=1&plan=${selectedPlanCode}`);
    } catch (error) {
      showToast({
        tone: 'error',
        title: 'Nao foi possivel concluir o cadastro',
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
                  Primeiro criamos a empresa e o gestor principal. So depois voce escolhe o plano e vai para o checkout seguro da assinatura.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {[
                'Cria a conta da empresa e o gestor principal',
                'Leva para a escolha do plano no passo seguinte',
                'Destaca 1 mes gratis e cancelamento antes da cobranca',
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
                  <CardDescription>
                    Plano sugerido: <span className="font-semibold text-slate-800 dark:text-slate-100">{selectedPlanLabel}</span>. Esse plano nao e gravado no cadastro. Depois de criar a conta, voce escolhe a assinatura no checkout.
                  </CardDescription>
                </div>
                <div className="w-fit whitespace-nowrap rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200">
                  1 mes gratis
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              <section className="rounded-[1.6rem] border border-emerald-200 bg-emerald-50/80 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-300" />
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-100">Sem cobranca imediata</p>
                    <p className="text-sm leading-6 text-emerald-900/80 dark:text-emerald-200/80">
                      Assim que a conta for criada, voce segue para escolher a assinatura. O checkout destaca o periodo gratis de 1 mes e a possibilidade de cancelar antes da primeira cobranca.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Empresa</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="companyName">Nome da empresa</Label>
                    <Input id="companyName" value={form.companyName} onChange={(event) => setForm((prev) => ({ ...prev, companyName: event.target.value }))} placeholder="Ex.: Gestao Prime Condominios" />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Gestor principal</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="adminName">Nome do gestor</Label>
                    <Input id="adminName" value={form.adminName} onChange={(event) => setForm((prev) => ({ ...prev, adminName: event.target.value }))} placeholder="Seu nome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="adminEmail">E-mail</Label>
                    <Input id="adminEmail" type="email" value={form.adminEmail} onChange={(event) => setForm((prev) => ({ ...prev, adminEmail: event.target.value }))} placeholder="gestor@empresa.com.br" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="adminPassword">Senha</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={form.adminPassword}
                      onChange={(event) => setForm((prev) => ({ ...prev, adminPassword: event.target.value }))}
                      placeholder="Minimo de 8 caracteres"
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          void handleSubmit();
                        }
                      }}
                    />
                  </div>
                </div>
              </section>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Ao concluir, voce entra na jornada da assinatura para escolher o plano e seguir para o checkout seguro.
                </p>
                <Button className="min-w-44" onClick={() => void handleSubmit()} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Criar conta e continuar
                </Button>
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
