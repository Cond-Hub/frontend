'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Moon, ShieldCheck, Sun } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { CondoHomeBrandImage } from '../../components/brand/condohome-brand-image';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Skeleton } from '../../components/ui/skeleton';
import { ApiError, dashboardApi, useDashboardStore } from '../../src/store/useDashboardStore';
import { showToast } from '../../src/store/useToastStore';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000').replace(/\/$/, '');

const resolveTenantPrefix = () => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const hostname = window.location.hostname.trim().toLowerCase();
  if (!hostname || hostname === 'localhost') {
    return undefined;
  }

  const labels = hostname.split('.').filter(Boolean);
  if (labels.length >= 3) {
    const prefix = labels[0];
    if (prefix === 'www' || prefix === 'api') {
      return undefined;
    }
    return prefix;
  }

  if (labels.length === 2 && labels[1] === 'localhost') {
    return labels[0];
  }

  return undefined;
};

export default function LoginPage() {
  const router = useRouter();
  const state = useDashboardStore();
  const currentUser = state.currentUserId ? state.users[state.currentUserId] : undefined;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantPrefix, setTenantPrefix] = useState<string>();
  const [apiHealth, setApiHealth] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    if (state.hydrationComplete && !state.bootstrapped) {
      void state.bootstrap();
    }
  }, [state]);

  useEffect(() => {
    setTenantPrefix(resolveTenantPrefix());
  }, []);

  useEffect(() => {
    if (currentUser && state.bootstrapped) {
      if (tenantPrefix) {
        router.replace('/dashboard');
        return;
      }

      if (currentUser.role === 'ADMIN_COMPANY') {
        router.replace('/company');
        return;
      }

      router.replace('/subscription');
    }
  }, [currentUser, router, state.bootstrapped, tenantPrefix]);

  const checkApiHealth = useCallback(async () => {
    setApiHealth('checking');
    try {
      const response = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
      setApiHealth(response.ok ? 'online' : 'offline');
    } catch {
      setApiHealth('offline');
    }
  }, []);

  useEffect(() => {
    void checkApiHealth();
  }, [checkApiHealth]);

  const login = async () => {
    try {
      if (tenantPrefix) {
        await state.loginStaff(email, password);
        router.replace('/dashboard');
        return;
      }

      const result = await dashboardApi.auth.loginBackoffice(email, password);
      if (result.requiresSubscriptionPayment) {
        router.replace('/subscription?paymentRequired=1');
        return;
      }

      if (result.user.role === 'ADMIN_COMPANY') {
        router.replace('/company');
        return;
      }

      router.replace('/subscription');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'subscription_payment_required') {
        router.replace('/subscription?paymentRequired=1');
        return;
      }

      showToast({
        tone: 'error',
        title: 'Não foi possível entrar',
        description: error instanceof Error ? error.message : 'Revise seus dados e tente novamente.',
      });
    }
  };

  if (!state.hydrationComplete || !state.bootstrapped) {
    return <LoginPageSkeleton />;
  }

  return (
    <main className="min-h-screen bg-[#f5f7f3] dark:bg-slate-950">
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

      <div className="grid min-h-screen lg:grid-cols-[1.02fr,0.98fr]">
        <section className="relative hidden overflow-hidden bg-[#0b1310] text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_85%_18%,_rgba(234,179,8,0.12),transparent_24%)]" />
          <div className="relative flex h-full flex-col justify-between p-12">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Voltar para o site
              </Link>

              <div className="mt-20 max-w-xl">
                <p className="text-sm font-medium text-emerald-300">
                  {tenantPrefix ? 'Operação do condomínio' : 'Workspace da empresa'}
                </p>
                <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white">
                  {tenantPrefix
                    ? 'Entre para acompanhar a operação diária do seu condomínio.'
                    : 'Entre para gerenciar a empresa, a carteira e depois entrar na operação de cada condomínio.'}
                </h1>
                <p className="mt-6 text-base leading-8 text-slate-300">
                  {tenantPrefix
                    ? 'Consulte moradores, boletos, ocorrências, agenda, reservas e documentos em um único painel.'
                    : 'Acesse sua conta sem subdominio para acompanhar a empresa, revisar assinatura e abrir cada operação quando precisar.'}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.75rem] border border-emerald-400/20 bg-emerald-500/10 p-6">
                <div className="flex items-center gap-2 text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  <p className="text-sm font-medium">
                    {tenantPrefix ? 'Acesso vinculado ao endereço do condomínio' : 'Gestores podem entrar sem subdominio'}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  {tenantPrefix
                    ? 'Use sempre o link oficial da sua operação. Assim o sistema abre o painel, os moradores e os dados do condomínio correto.'
                    : 'Administradores entram pelo dominio principal e comecam pela visão da empresa. O sistema só leva para um condomínio quando você escolhe a operação.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-8">
          <Card className="w-full max-w-md border-slate-200/80 shadow-xl dark:border-slate-800">
            <CardHeader className="space-y-4">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 lg:hidden">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Link>
              <div>
                <div className="mb-3 w-full flex items-center justify-center">
                  <CondoHomeBrandImage className="h-16 w-auto object-contain" />
                </div>
                <CardTitle>{tenantPrefix ? 'Entrar no painel do condomínio' : 'Entrar na conta da empresa'}</CardTitle>
                <CardDescription>
                  {tenantPrefix
                    ? 'Use seu e-mail e sua senha para acessar moradores, cobrança, agenda e ocorrências.'
                    : 'Use seu e-mail e sua senha para acessar a visão da empresa, a assinatura e a carteira operacional.'}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seuemail@condomínio.com.br"
                  autoComplete="off"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Digite sua senha"
                  autoComplete="off"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      void login();
                    }
                  }}
                />
              </div>

              <div
                className={`rounded-xl px-3 py-3 text-sm leading-6 ${
                  tenantPrefix
                    ? 'border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-200'
                    : 'border border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/70 dark:bg-sky-950/30 dark:text-sky-200'
                }`}
              >
                {tenantPrefix ? (
                  <>Você está entrando no ambiente do condomínio <span className="font-semibold">{tenantPrefix}</span>.</>
                ) : (
                  <>Gestores da empresa entram por aqui sem subdominio. Para moradores e síndicos, continue usando o link do condomínio.</>
                )}
              </div>

              {apiHealth !== 'online' ? (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  <span>O sistema não conseguiu se conectar agora.</span>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => void checkApiHealth()}>
                    Tentar novamente
                  </Button>
                </div>
              ) : null}

              <Button className="w-full" onClick={login}>
                {tenantPrefix ? 'Entrar no condomínio' : 'Entrar na empresa'}
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

function LoginPageSkeleton() {
  return (
    <main className="min-h-screen bg-[#f5f7f3] dark:bg-slate-950">
      <div className="fixed right-4 top-4 z-20 sm:right-6 sm:top-6">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>

      <div className="grid min-h-screen lg:grid-cols-[1.02fr,0.98fr]">
        <section className="relative hidden overflow-hidden bg-[#0b1310] text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_85%_18%,_rgba(234,179,8,0.12),transparent_24%)]" />
          <div className="relative flex h-full flex-col justify-between p-12">
            <div>
              <Skeleton className="h-5 w-36 bg-white/10 dark:bg-white/10" />
              <div className="mt-20 max-w-xl space-y-4">
                <Skeleton className="h-4 w-40 bg-emerald-300/20 dark:bg-emerald-300/20" />
                <Skeleton className="h-12 w-full max-w-lg bg-white/10 dark:bg-white/10" />
                <Skeleton className="h-12 w-[92%] max-w-xl bg-white/10 dark:bg-white/10" />
                <Skeleton className="h-5 w-full max-w-xl bg-white/10 dark:bg-white/10" />
                <Skeleton className="h-5 w-[88%] max-w-xl bg-white/10 dark:bg-white/10" />
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-emerald-400/20 bg-emerald-500/10 p-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full bg-emerald-300/20 dark:bg-emerald-300/20" />
                <Skeleton className="h-4 w-72 bg-emerald-300/20 dark:bg-emerald-300/20" />
              </div>
              <div className="mt-4 space-y-3">
                <Skeleton className="h-4 w-full bg-white/10 dark:bg-white/10" />
                <Skeleton className="h-4 w-[92%] bg-white/10 dark:bg-white/10" />
                <Skeleton className="h-4 w-[76%] bg-white/10 dark:bg-white/10" />
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-8">
          <Card className="w-full max-w-md border-slate-200/80 shadow-xl dark:border-slate-800">
            <CardHeader className="space-y-4">
              <Skeleton className="h-5 w-20 lg:hidden" />
              <div>
                <div className="mb-3 flex w-full items-center justify-center">
                  <Skeleton className="h-16 w-40 rounded-xl" />
                </div>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-[88%]" />
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-md" />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
