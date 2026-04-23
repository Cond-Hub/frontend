'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { ApiError, dashboardApi, type SaasCompanySummary, useDashboardStore } from '../../src/store/useDashboardStore';
import type { Condo } from '../../shared/src';

type Tab = 'companies' | 'condos';
type EditTarget =
  | { type: 'company'; company: SaasCompanySummary; form: { name: string } }
  | { type: 'condo'; condo: Condo; form: { name: string; address: string; prefix: string } };
type DeleteTarget =
  | { type: 'company'; id: string; label: string }
  | { type: 'condo'; id: string; label: string };

const normalizePrefix = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

function ModalFrame({
  title,
  description,
  children,
  onClose,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function SecretPage() {
  const state = useDashboardStore();
  const currentUser = state.currentUserId ? state.users[state.currentUserId] : undefined;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<Tab>('companies');
  const [companies, setCompanies] = useState<SaasCompanySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [editTarget, setEditTarget] = useState<EditTarget>();
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>();

  useEffect(() => {
    if (state.hydrationComplete && !state.bootstrapped) {
      void state.bootstrap();
    }
  }, [state]);

  const isMasterAdmin = currentUser?.role === 'SYSTEM_ADMIN';
  const condos = useMemo(
    () =>
      companies
        .flatMap((company) => company.condos.map((condo) => ({ ...condo, companyName: company.name })))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [companies],
  );

  const load = useCallback(async () => {
    if (!isMasterAdmin) {
      return;
    }

    setLoading(true);
    setError(undefined);
    try {
      const data = await dashboardApi.saas.overview();
      setCompanies(data.companies);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, [isMasterAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  const login = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await dashboardApi.auth.loginBackoffice(email.trim(), password);
      if (result.user.role !== 'SYSTEM_ADMIN') {
        await state.logout();
        setError('Esta página é exclusiva para MASTER ADMIN.');
        return;
      }
      setEmail('');
      setPassword('');
    } catch (loginError) {
      if (loginError instanceof ApiError && loginError.code === 'subscription_payment_required') {
        setError('MASTER ADMIN não deve depender do fluxo de assinatura.');
        return;
      }
      setError(loginError instanceof Error ? loginError.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = async () => {
    if (!editTarget) {
      return;
    }

    setSaving(true);
    setError(undefined);
    try {
      if (editTarget.type === 'company') {
        await dashboardApi.saas.updateCompany(editTarget.company.id, {
          name: editTarget.form.name.trim(),
        });
      } else {
        await dashboardApi.tenant.updateMasterCondo(editTarget.condo.id, {
          name: editTarget.form.name.trim(),
          address: editTarget.form.address.trim(),
          prefix: normalizePrefix(editTarget.form.prefix),
        });
      }
      setEditTarget(undefined);
      await load();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setSaving(true);
    setError(undefined);
    try {
      if (deleteTarget.type === 'company') {
        await dashboardApi.saas.deleteCompany(deleteTarget.id);
      } else {
        await dashboardApi.tenant.deleteMasterCondo(deleteTarget.id);
      }
      setDeleteTarget(undefined);
      await load();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Não foi possível remover.');
    } finally {
      setSaving(false);
    }
  };

  if (!state.hydrationComplete || !state.bootstrapped) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <p>Carregando...</p>
      </main>
    );
  }

  if (!isMasterAdmin) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md items-center">
          <Card className="w-full border-slate-800 bg-slate-900 text-slate-50 shadow-2xl">
            <CardHeader>
              <CardTitle>Acesso secreto</CardTitle>
              <CardDescription className="text-slate-400">
                Entre com o usuário MASTER ADMIN para gerenciar empresas e condomínios.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="off" className="bg-slate-950" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="off"
                  className="bg-slate-950"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      void login();
                    }
                  }}
                />
              </div>
              {error ? <p className="rounded-xl border border-rose-900 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">{error}</p> : null}
              <Button className="w-full" onClick={() => void login()} disabled={loading || !email.trim() || !password}>
                {loading ? 'Entrando...' : 'Entrar como MASTER ADMIN'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7f3] text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[280px,1fr]">
        <aside className="border-b border-slate-200 bg-slate-950 p-5 text-white lg:border-b-0 lg:border-r lg:border-slate-800">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300">Secret page</p>
            <h1 className="mt-2 text-2xl font-semibold">Master Admin</h1>
            <p className="mt-2 text-sm text-slate-400">{currentUser.name}</p>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
          </div>

          <nav className="space-y-2">
            <button
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${tab === 'companies' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
              onClick={() => setTab('companies')}
            >
              Empresas
            </button>
            <button
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${tab === 'condos' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
              onClick={() => setTab('condos')}
            >
              Condomínios
            </button>
          </nav>

          <Button variant="outline" className="mt-8 w-full border-slate-700 bg-transparent text-white hover:bg-slate-900" onClick={() => void state.logout()}>
            Sair
          </Button>
        </aside>

        <section className="p-5 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Logado como MASTER ADMIN</p>
              <h2 className="mt-1 text-3xl font-semibold">{tab === 'companies' ? 'Empresas' : 'Condomínios'}</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {tab === 'companies' ? `${companies.length} empresas cadastradas.` : `${condos.length} condomínios cadastrados.`}
              </p>
            </div>
            <Button onClick={() => void load()} disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>

          {error ? <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200">{error}</p> : null}

          {tab === 'companies' ? (
            <div className="grid gap-4">
              {companies.map((company) => (
                <Card key={company.id}>
                  <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>{company.name}</CardTitle>
                      <CardDescription>
                        {company.condoCount} condomínio(s) · {company.userCount} usuário(s) · criada em {new Date(company.createdAtUtc).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setEditTarget({ type: 'company', company, form: { name: company.name } })}>
                        Editar
                      </Button>
                      <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/30" onClick={() => setDeleteTarget({ type: 'company', id: company.id, label: company.name })}>
                        Deletar
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4">
              {condos.map((condo) => (
                <Card key={condo.id}>
                  <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>{condo.name}</CardTitle>
                      <CardDescription>
                        Empresa: {condo.companyName} · Prefixo: {condo.prefix ?? '-'} · {condo.address}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          setEditTarget({
                            type: 'condo',
                            condo,
                            form: {
                              name: condo.name,
                              address: condo.address,
                              prefix: condo.prefix ?? '',
                            },
                          })
                        }
                      >
                        Editar
                      </Button>
                      <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/30" onClick={() => setDeleteTarget({ type: 'condo', id: condo.id, label: condo.name })}>
                        Deletar
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      {editTarget ? (
        <ModalFrame
          title={editTarget.type === 'company' ? 'Editar empresa' : 'Editar condomínio'}
          description={editTarget.type === 'company' ? 'Atualize o nome da empresa.' : 'Atualize nome, endereço e prefixo do condomínio.'}
          onClose={() => setEditTarget(undefined)}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={editTarget.form.name}
                onChange={(event) =>
                  setEditTarget((current) =>
                    current ? { ...current, form: { ...current.form, name: event.target.value } } as EditTarget : current,
                  )
                }
              />
            </div>
            {editTarget.type === 'condo' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-prefix">Prefixo</Label>
                  <Input
                    id="edit-prefix"
                    value={editTarget.form.prefix}
                    onChange={(event) =>
                      setEditTarget((current) =>
                        current && current.type === 'condo'
                          ? { ...current, form: { ...current.form, prefix: normalizePrefix(event.target.value) } }
                          : current,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Endereço</Label>
                  <Input
                    id="edit-address"
                    value={editTarget.form.address}
                    onChange={(event) =>
                      setEditTarget((current) =>
                        current && current.type === 'condo'
                          ? { ...current, form: { ...current.form, address: event.target.value } }
                          : current,
                      )
                    }
                  />
                </div>
              </>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditTarget(undefined)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={() => void saveEdit()} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </ModalFrame>
      ) : null}

      {deleteTarget ? (
        <ModalFrame title="Confirmar exclusão" description="Essa ação remove o registro e seus dados relacionados conforme as regras do banco." onClose={() => setDeleteTarget(undefined)}>
          <div className="space-y-5">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Deseja deletar <strong>{deleteTarget.label}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteTarget(undefined)} disabled={saving}>
                Cancelar
              </Button>
              <Button className="bg-rose-600 hover:bg-rose-700" onClick={() => void confirmDelete()} disabled={saving}>
                {saving ? 'Deletando...' : 'Deletar'}
              </Button>
            </div>
          </div>
        </ModalFrame>
      ) : null}
    </main>
  );
}
