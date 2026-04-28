'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaAppStoreIos, FaGooglePlay } from 'react-icons/fa';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  LayoutGrid,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { Suspense, useEffect, useRef } from 'react';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
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
  const conversionSentRef = useRef(false);
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

  useEffect(() => {
    if (!state.hydrationComplete || !state.bootstrapped || !currentUser || conversionSentRef.current) {
      return;
    }

    conversionSentRef.current = true;

    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', {
        send_to: 'AW-18107330701/K_PVCPSls6AcEI3hn7pD',
      });
    }
  }, [currentUser, state.bootstrapped, state.hydrationComplete]);

  if (!state.hydrationComplete || !state.bootstrapped) {
    return <WelcomePageSkeleton />;
  }

  if (!currentUser) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-300">Redirecionando...</main>;
  }

  const companyCtaHref = currentUser.role === 'ADMIN_COMPANY' ? '/company' : '/dashboard';
  const companyCtaLabel = currentUser.role === 'ADMIN_COMPANY' ? 'Abrir workspace da empresa' : 'Entrar no painel';

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-8 sm:px-8 lg:py-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(250,204,21,0.12),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(250,204,21,0.12),transparent_24%)]" />
          <div className="relative grid gap-8 px-6 py-8 lg:grid-cols-[1.2fr,0.8fr] lg:px-10 lg:py-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {onboardingMode ? 'Conta criada com sucesso' : 'Workspace pronto'}
              </div>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                {onboardingMode
                  ? 'Bem-vindo ao novo ciclo da sua empresa no CondHub.'
                  : 'Seu workspace já está pronto para voltar a operar.'}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
                {onboardingMode
                  ? 'A empresa foi criada, a primeira operação já está ativa e o próximo passo agora é estruturar a carteira, cadastrar síndicos e acompanhar a operação diária.'
                  : 'A conta está pronta para acompanhar a empresa, revisar a carteira operacional e entrar em cada condomínio quando precisar aprofundar a operação.'}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={companyCtaHref}>
                  <Button className="gap-2">
                    {companyCtaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                {currentUser.role === 'ADMIN_COMPANY' ? (
                  <Link href="/my-condos?onboarding=1">
                    <Button variant="outline" className="gap-2">
                      <Building2 className="h-4 w-4" />
                      Abrir meus condomínios
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 self-start">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-200">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Operação ativa</p>
                    <p className="font-semibold text-slate-950 dark:text-slate-50">{activeCondo?.name ?? 'Condomínio selecionado'}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{activeCondo?.prefix ? `${activeCondo.prefix}.condhub.com` : 'Dominio principal'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Acesso atual</p>
                    <p className="font-semibold text-slate-950 dark:text-slate-50">{currentUser.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{currentUser.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <Card className="border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <LayoutGrid className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.22em]">Primeiros passos</span>
              </div>
              <CardTitle className="text-2xl">Comece pela empresa e entre na operação quando fizer sentido.</CardTitle>
              <CardDescription className="text-base">
                A jornada ficou mais simples: primeiro você organiza a carteira, depois aprofunda no condomínio certo.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                currentUser.role === 'ADMIN_COMPANY'
                  ? 'Abra a visão da empresa para acompanhar indicadores, cobrança e carteira.'
                  : 'Entre no painel do condomínio para acompanhar moradores, agenda e cobrança.',
                `Entre na operação ativa${activeCondo ? `: ${activeCondo.name}` : ''} quando precisar resolver o detalhe.`,
                currentUser.role === 'ADMIN_COMPANY'
                  ? 'Adicione novos condomínios e distribua síndicos por operação.'
                  : 'Use o app do morador como canal de comunicação com a base residencial.',
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-[1.35rem] border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-300" />
                  <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Smartphone className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.22em]">App do morador</span>
              </div>
              <CardTitle className="text-2xl">CondHub | Morador já está na Play Store e na App Store.</CardTitle>
              <CardDescription className="text-base">
                Use a welcome para reforcar com síndicos e moradores que o app oficial já pode ser baixado para acompanhar boletos, reservas, agenda, comunicados e ocorrências.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950">
                      <FaGooglePlay className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Google Play</p>
                      <p className="font-semibold text-slate-950 dark:text-slate-50">CondHub | Morador</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-slate-100 dark:text-slate-950">
                      <FaAppStoreIos className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">App Store</p>
                      <p className="font-semibold text-slate-950 dark:text-slate-50">CondHub | Morador</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/70 dark:bg-emerald-950/30">
                <p className="text-sm leading-7 text-emerald-900 dark:text-emerald-200">
                  O app ajuda a fechar o ciclo da operação: a empresa organiza a carteira, o síndico toca a rotina do condomínio e o morador acompanha tudo pelo celular.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

function WelcomePageFallback() {
  return <WelcomePageSkeleton />;
}

function WelcomePageSkeleton() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-8 sm:px-8 lg:py-10">
        <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(250,204,21,0.12),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(250,204,21,0.12),transparent_24%)]" />
          <div className="relative grid gap-8 px-6 py-8 lg:grid-cols-[1.2fr,0.8fr] lg:px-10 lg:py-10">
            <div className="max-w-3xl">
              <Skeleton className="h-7 w-48 rounded-full" />
              <div className="mt-5 space-y-4">
                <Skeleton className="h-12 w-full max-w-2xl" />
                <Skeleton className="h-12 w-[90%] max-w-2xl" />
                <Skeleton className="h-5 w-full max-w-2xl" />
                <Skeleton className="h-5 w-[82%] max-w-2xl" />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Skeleton className="h-10 w-56 rounded-md" />
                <Skeleton className="h-10 w-52 rounded-md" />
              </div>
            </div>

            <div className="grid gap-3 self-start">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-52" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.05fr,0.95fr]">
          <Card className="border-slate-200/80 bg-white/90 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-8 w-[88%]" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-[78%]" />
            </CardHeader>
            <CardContent className="grid gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-start gap-3 rounded-[1.35rem] border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <Skeleton className="mt-0.5 h-5 w-5 rounded-full" />
                  <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[84%]" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-[82%]" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-[74%]" />
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-2xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/70 dark:bg-emerald-950/30">
                <Skeleton className="h-4 w-full bg-emerald-200 dark:bg-emerald-900/60" />
                <Skeleton className="mt-2 h-4 w-[88%] bg-emerald-200 dark:bg-emerald-900/60" />
                <Skeleton className="mt-2 h-4 w-[70%] bg-emerald-200 dark:bg-emerald-900/60" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
