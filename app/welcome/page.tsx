'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Suspense, useEffect } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { useDashboardStore } from '../../src/store/useDashboardStore';

export default function WelcomePage() {
  return (
    <Suspense fallback={<WelcomePageFallback />}>
      <WelcomePageContent />
    </Suspense>
  );
}

function WelcomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const state = useDashboardStore();
  const currentUser = state.currentUserId ? state.users[state.currentUserId] : undefined;
  const activeCondo = state.activeCondoId ? state.condos[state.activeCondoId] : undefined;
  const onboardingMode = searchParams.get('onboarding') === '1';

  useEffect(() => {
    if (state.hydrationComplete && !state.bootstrapped) {
      void state.bootstrap();
    }
  }, [state]);

  useEffect(() => {
    if (!state.hydrationComplete || !state.bootstrapped) {
      return;
    }

    if (!currentUser) {
      router.replace('/login');
    }
  }, [currentUser, router, state.bootstrapped, state.hydrationComplete]);

  if (!state.hydrationComplete || !state.bootstrapped) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-300">Carregando...</main>;
  }

  if (!currentUser) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-300">Redirecionando...</main>;
  }

  return (
    <main className="min-h-screen bg-[#f5f7f3] px-6 py-10 text-slate-950">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle className="text-3xl text-emerald-950">Bem-vindo ao CondHub</CardTitle>
            <CardDescription className="text-base text-emerald-900/80">
              {onboardingMode
                ? 'A conta da empresa foi criada e a primeira operacao ja esta pronta.'
                : 'Sua conta esta pronta para acompanhar a empresa e entrar nas operacoes da carteira.'}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Próximos passos</CardTitle>
              <CardDescription>O fluxo inicial da empresa agora e simples e direto.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                `Acessar o condomínio ativo${activeCondo ? `: ${activeCondo.name}` : ''}`,
                'Adicionar mais condominios a carteira',
                'Cadastrar síndicos para operar cada condomínio',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <p className="text-sm text-slate-700">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white">
            <CardHeader>
              <CardTitle>Operação ativa</CardTitle>
              <CardDescription>Resumo do ambiente selecionado para começar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-950">{activeCondo?.name ?? 'Condomínio selecionado'}</p>
                    <p className="text-sm text-slate-500">{activeCondo?.prefix ? `${activeCondo.prefix}.condhub.com` : 'Domínio principal'}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-slate-950">{currentUser.name}</p>
                    <p className="text-sm text-slate-500">{currentUser.email}</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-3">
                <Link
                  href={currentUser.role === 'ADMIN_COMPANY' ? '/company' : '/dashboard'}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  {currentUser.role === 'ADMIN_COMPANY' ? 'Abrir workspace da empresa' : 'Entrar no painel'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/my-condos?onboarding=1"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
                >
                  Ir para a carteira operacional
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function WelcomePageFallback() {
  return <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-300">Carregando...</main>;
}
