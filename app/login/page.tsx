'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { CondoHomeBrandImage } from '../../components/brand/condohome-brand-image';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useDashboardStore } from '../../src/store/useDashboardStore';
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

  const [email, setEmail] = useState('syndic.aurora@condohome.local');
  const [password, setPassword] = useState('Syndic@123');
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
      router.replace('/dashboard');
    }
  }, [currentUser, router, state.bootstrapped]);

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
    if (!tenantPrefix) {
      showToast({
        tone: 'error',
        title: 'Endereco invalido',
        description: 'Entre pelo endereco oficial do seu condominio para abrir o painel correto.',
      });
      return;
    }

    try {
      await state.loginStaff(email, password);
      router.replace('/dashboard');
    } catch (error) {
      showToast({
        tone: 'error',
        title: 'Nao foi possivel entrar',
        description: error instanceof Error ? error.message : 'Revise seus dados e tente novamente.',
      });
    }
  };

  if (!state.hydrationComplete || !state.bootstrapped) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600 dark:bg-slate-950 dark:text-slate-300">Carregando...</main>;
  }

  return (
    <main className="min-h-screen bg-[#f5f7f3] dark:bg-slate-950">
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
                <p className="text-sm font-medium text-emerald-300">Painel do condominio</p>
                <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white">
                  Entre para acompanhar a operacao diaria do seu condominio.
                </h1>
                <p className="mt-6 text-base leading-8 text-slate-300">
                  Consulte moradores, boletos, ocorrencias, agenda, reservas e documentos em um unico painel.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.75rem] border border-emerald-400/20 bg-emerald-500/10 p-6">
                <div className="flex items-center gap-2 text-emerald-200">
                  <ShieldCheck className="h-4 w-4" />
                  <p className="text-sm font-medium">Acesso vinculado ao endereco do condominio</p>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-200">
                  Use sempre o link oficial da sua operacao. Assim o sistema abre o painel, os moradores e os dados do condominio correto.
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
                <CardTitle>Entrar no painel do condominio</CardTitle>
                <CardDescription>
                  Use seu e-mail e sua senha para acessar moradores, cobranca, agenda e ocorrencias.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seuemail@condominio.com.br" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Digite sua senha"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      void login();
                    }
                  }}
                />
              </div>

              {!tenantPrefix ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm leading-6 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200">
                  Para entrar, use o link oficial do seu condominio. Exemplo: <span className="font-mono">aurora.localhost:3000/login</span>
                </div>
              ) : null}

              {apiHealth !== 'online' ? (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                  <span>O sistema nao conseguiu se conectar agora.</span>
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => void checkApiHealth()}>
                    Tentar novamente
                  </Button>
                </div>
              ) : null}

              <Button className="w-full" onClick={login} disabled={!tenantPrefix}>
                Entrar
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
