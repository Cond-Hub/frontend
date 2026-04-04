'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, CreditCard, LifeBuoy, Search, ShieldCheck, Users } from 'lucide-react';
import { ROLE_LABELS, type User } from '../../shared/src';
import { CondoHomeBrandImage } from '../../components/brand/condohome-brand-image';
import {
  dashboardApi,
  type CustomerPortal,
  type RegisterCompanyResult,
  type SaasBillingProvider,
  type SaasCompanySummary,
  type SaasInvoiceStatus,
  type SaasOverview,
  type SaasPlan,
  type SaasSubscriptionStatus,
  useDashboardStore,
} from '../../src/store/useDashboardStore';

const billingProviders: SaasBillingProvider[] = ['MANUAL', 'STRIPE', 'ASAAS'];
const subscriptionStatuses: SaasSubscriptionStatus[] = ['TRIALING', 'ACTIVE', 'SUSPENDED', 'CANCELED'];
const invoiceStatuses: SaasInvoiceStatus[] = ['PENDING', 'PAID', 'OVERDUE', 'CANCELED'];

const billingProviderLabels: Record<SaasBillingProvider, string> = {
  MANUAL: 'Manual',
  STRIPE: 'Stripe',
  ASAAS: 'Asaas',
};

const subscriptionStatusLabels: Record<SaasSubscriptionStatus, string> = {
  TRIALING: 'Trial',
  ACTIVE: 'Ativa',
  SUSPENDED: 'Suspensa',
  CANCELED: 'Cancelada',
};

const invoiceStatusLabels: Record<SaasInvoiceStatus, string> = {
  PENDING: 'Pendente',
  PAID: 'Paga',
  OVERDUE: 'Em atraso',
  CANCELED: 'Cancelada',
  DRAFT: 'Rascunho',
};

const formatDateTimeBR = (value?: string) => {
  if (!value) {
    return '-';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed);
};

const formatCurrency = (value: number, currency = 'BRL') =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);

const toDateInput = (value?: string) => (value ? value.slice(0, 10) : '');
const nextMonthDateInput = () => {
  const next = new Date();
  next.setMonth(next.getMonth() + 1);
  return next.toISOString().slice(0, 10);
};

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Falha ao executar a ação.');

const emptyRegisterForm = {
  companyName: '',
  condoName: '',
  condoAddress: '',
  condoPrefix: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  syndicName: '',
  syndicEmail: '',
  syndicPassword: '',
  planCode: '',
  billingProvider: 'MANUAL' as SaasBillingProvider,
};

const emptyPlanForm = {
  code: '',
  name: '',
  description: '',
  monthlyPrice: '199',
  maxCondos: '3',
  maxUnitsPerCondo: '120',
  maxResidents: '500',
  includesBillingPortal: true,
  includesPrioritySupport: false,
  isActive: true,
};

export default function SaasPage() {
  const hydrationComplete = useDashboardStore((state) => state.hydrationComplete);
  const bootstrapped = useDashboardStore((state) => state.bootstrapped);
  const bootstrap = useDashboardStore((state) => state.bootstrap);
  const logout = useDashboardStore((state) => state.logout);
  const currentUserId = useDashboardStore((state) => state.currentUserId);
  const users = useDashboardStore((state) => state.users);

  const currentUser = currentUserId ? users[currentUserId] : undefined;

  const [publicPlans, setPublicPlans] = useState<SaasPlan[]>([]);
  const [overview, setOverview] = useState<SaasOverview>();
  const [portal, setPortal] = useState<CustomerPortal>();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>();
  const [searchedUsers, setSearchedUsers] = useState<User[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm);
  const [planForm, setPlanForm] = useState(emptyPlanForm);
  const [editingPlanId, setEditingPlanId] = useState<string>();
  const [companyCondoForm, setCompanyCondoForm] = useState({ name: '', address: '', prefix: '' });
  const [supportNoteForm, setSupportNoteForm] = useState({ title: '', body: '' });
  const [subscriptionForm, setSubscriptionForm] = useState({
    planCode: '',
    status: 'ACTIVE' as SaasSubscriptionStatus,
    billingProvider: 'MANUAL' as SaasBillingProvider,
    trialDays: '14',
    notes: '',
  });
  const [invoiceForm, setInvoiceForm] = useState({
    amount: '199',
    dueAtUtc: nextMonthDateInput(),
    description: 'Mensalidade CondHub',
    currency: 'BRL',
    billingProvider: 'MANUAL' as SaasBillingProvider,
  });
  const [invoiceStatusForm, setInvoiceStatusForm] = useState({
    invoiceId: '',
    status: 'PAID' as SaasInvoiceStatus,
  });
  const [resultMessage, setResultMessage] = useState<string>();
  const [resultDetails, setResultDetails] = useState<RegisterCompanyResult>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [loadingOverview, setLoadingOverview] = useState(false);

  useEffect(() => {
    void dashboardApi.saas.publicPlans().then(setPublicPlans).catch(() => setPublicPlans([]));
  }, []);

  useEffect(() => {
    if (hydrationComplete && !bootstrapped) {
      void bootstrap();
    }
  }, [bootstrap, bootstrapped, hydrationComplete]);

  useEffect(() => {
    if (!currentUser || !hydrationComplete) {
      return;
    }

    if (currentUser.role === 'SYSTEM_ADMIN') {
      void loadOverview();
      return;
    }

    if (currentUser.role === 'ADMIN_COMPANY') {
      void loadPortal();
    }
  }, [currentUser?.id, currentUser?.role, hydrationComplete]);

  const selectedCompany = useMemo(
    () => overview?.companies.find((company) => company.id === selectedCompanyId) ?? overview?.companies[0],
    [overview?.companies, selectedCompanyId]
  );

  useEffect(() => {
    if (!selectedCompany && overview?.companies.length) {
      setSelectedCompanyId(overview.companies[0].id);
    }
  }, [overview?.companies, selectedCompany]);

  useEffect(() => {
    if (!selectedCompany) {
      return;
    }

    setSubscriptionForm({
      planCode: selectedCompany.currentSubscription?.subscriptionPlanCode ?? publicPlans[0]?.code ?? 'STARTER',
      status: selectedCompany.currentSubscription?.status ?? 'ACTIVE',
      billingProvider: selectedCompany.currentSubscription?.billingProvider ?? 'MANUAL',
      trialDays: '14',
      notes: selectedCompany.currentSubscription?.notes ?? '',
    });
    setInvoiceForm((current) => ({
      ...current,
      billingProvider: selectedCompany.currentSubscription?.billingProvider ?? current.billingProvider,
    }));
    setInvoiceStatusForm({
      invoiceId: selectedCompany.recentInvoices[0]?.id ?? '',
      status: selectedCompany.recentInvoices[0]?.status === 'DRAFT' ? 'PENDING' : selectedCompany.recentInvoices[0]?.status ?? 'PAID',
    });
  }, [publicPlans, selectedCompany]);

  const loadOverview = async () => {
    setLoadingOverview(true);
    try {
      const nextOverview = await dashboardApi.saas.overview();
      setOverview(nextOverview);
      setSelectedCompanyId((current) => current ?? nextOverview.companies[0]?.id);
      setErrorMessage(undefined);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoadingOverview(false);
    }
  };

  const loadPortal = async () => {
    try {
      const nextPortal = await dashboardApi.saas.customerPortal();
      setPortal(nextPortal);
      setErrorMessage(undefined);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleBackofficeLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(undefined);

    try {
      await dashboardApi.auth.loginBackoffice(authEmail, authPassword);
      setAuthPassword('');
      setResultMessage('Acesso SaaS liberado.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCompany = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(undefined);

    try {
      const result = await dashboardApi.saas.registerCompany({
        ...registerForm,
        planCode: registerForm.planCode || undefined,
        syndicName: registerForm.syndicName || undefined,
        syndicEmail: registerForm.syndicEmail || undefined,
        syndicPassword: registerForm.syndicPassword || undefined,
      });

      setResultDetails(result);
      setResultMessage(result.message);
      setAuthEmail(registerForm.adminEmail);
      setAuthPassword(registerForm.adminPassword);
      await dashboardApi.auth.loginBackoffice(registerForm.adminEmail, registerForm.adminPassword);
      setRegisterForm(emptyRegisterForm);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(undefined);

    try {
      const payload = {
        code: planForm.code.trim().toUpperCase(),
        name: planForm.name.trim(),
        description: planForm.description.trim() || undefined,
        monthlyPrice: Number(planForm.monthlyPrice),
        maxCondos: Number(planForm.maxCondos),
        maxUnitsPerCondo: Number(planForm.maxUnitsPerCondo),
        maxResidents: Number(planForm.maxResidents),
        includesBillingPortal: planForm.includesBillingPortal,
        includesPrioritySupport: planForm.includesPrioritySupport,
        isActive: planForm.isActive,
      };

      if (editingPlanId) {
        await dashboardApi.saas.updatePlan(editingPlanId, payload);
        setResultMessage('Plano atualizado.');
      } else {
        await dashboardApi.saas.createPlan(payload);
        setResultMessage('Plano criado.');
      }

      setPlanForm(emptyPlanForm);
      setEditingPlanId(undefined);
      await loadOverview();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCondo = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCompany) {
      return;
    }

    setLoading(true);
    setErrorMessage(undefined);

    try {
      await dashboardApi.saas.createCompanyCondo(selectedCompany.id, companyCondoForm);
      setCompanyCondoForm({ name: '', address: '', prefix: '' });
      setResultMessage('Condomínio criado para a empresa.');
      await loadOverview();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSubscription = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCompany) {
      return;
    }

    setLoading(true);
    setErrorMessage(undefined);

    try {
      await dashboardApi.saas.changeSubscription(selectedCompany.id, {
        planCode: subscriptionForm.planCode,
        status: subscriptionForm.status,
        billingProvider: subscriptionForm.billingProvider,
        trialDays: subscriptionForm.status === 'TRIALING' ? Number(subscriptionForm.trialDays) : undefined,
        notes: subscriptionForm.notes || undefined,
      });
      setResultMessage('Assinatura atualizada.');
      await loadOverview();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleIssueInvoice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCompany) {
      return;
    }

    setLoading(true);
    setErrorMessage(undefined);

    try {
      await dashboardApi.saas.issueInvoice(selectedCompany.id, {
        amount: Number(invoiceForm.amount),
        dueAtUtc: `${invoiceForm.dueAtUtc}T12:00:00Z`,
        description: invoiceForm.description,
        currency: invoiceForm.currency,
        billingProvider: invoiceForm.billingProvider,
      });
      setResultMessage('Fatura emitida.');
      await loadOverview();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleInvoiceStatusUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCompany) {
      return;
    }

    const invoice = selectedCompany.recentInvoices.find((item) => item.id === invoiceStatusForm.invoiceId);
    if (!invoice?.externalInvoiceId) {
      setErrorMessage('Selecione uma fatura válida com identificador externo.');
      return;
    }

    setLoading(true);
    setErrorMessage(undefined);

    try {
      await dashboardApi.saas.updateInvoiceStatus({
        billingProvider: invoice.billingProvider,
        externalInvoiceId: invoice.externalInvoiceId,
        providerEventId: `manual-${Date.now()}`,
        status: invoiceStatusForm.status,
        paidAtUtc: invoiceStatusForm.status === 'PAID' ? new Date().toISOString() : undefined,
      });
      setResultMessage('Status da fatura atualizado.');
      await loadOverview();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupportNote = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCompany) {
      return;
    }

    setLoading(true);
    setErrorMessage(undefined);

    try {
      await dashboardApi.saas.addSupportNote(selectedCompany.id, supportNoteForm);
      setSupportNoteForm({ title: '', body: '' });
      setResultMessage('Nota interna registrada.');
      await loadOverview();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleUserSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(undefined);

    try {
      const results = await dashboardApi.saas.searchUsers(userQuery);
      setSearchedUsers(results);
      setResultMessage(`Busca concluída: ${results.length} usuário(s).`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setOverview(undefined);
      setPortal(undefined);
      setResultMessage('Sessão encerrada.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(8,145,178,0.18),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
        <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 py-10 lg:px-10">
          <header className="grid gap-8 rounded-[32px] border border-white/70 bg-white/85 p-8 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <CondoHomeBrandImage className="h-14 w-auto object-contain" />
              <span className="inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-800">
                CondHub SaaS
              </span>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 lg:text-6xl">
                Venda, ative e administre novos condomínios sem depender do painel operacional.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-600 lg:text-lg">
                Esta camada adiciona onboarding comercial, planos, assinaturas, cobrança, backoffice e portal do cliente sobre o núcleo multi-tenant do CondHub.
              </p>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
                  <ShieldCheck className="h-4 w-4" /> Cadastro com trial
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
                  <CreditCard className="h-4 w-4" /> Assinaturas e invoices
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
                  <LifeBuoy className="h-4 w-4" /> Support notes e portal do cliente
                </span>
              </div>
            </div>

            <form className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl" onSubmit={handleBackofficeLogin}>
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Acesso</p>
                <h2 className="text-2xl font-semibold">Entrar no painel SaaS</h2>
                <p className="text-sm text-slate-300">Use um `SystemAdmin` para o backoffice ou um `AdminCompany` para o portal do cliente.</p>
              </div>

              <div className="mt-6 grid gap-4">
                <label className="grid gap-2 text-sm">
                  <span>E-mail</span>
                  <input className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none transition focus:border-cyan-400" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} />
                </label>
                <label className="grid gap-2 text-sm">
                  <span>Senha</span>
                  <input className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none transition focus:border-cyan-400" type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} />
                </label>
              </div>

              <button className="mt-6 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <p className="mt-4 text-xs text-slate-400">
                Ambiente local seeded: `platform@condohome.local` / `Platform@123`
              </p>
            </form>
          </header>

          {(errorMessage || resultMessage) && (
            <section className={`rounded-[24px] border px-5 py-4 text-sm ${errorMessage ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
              {errorMessage ?? resultMessage}
            </section>
          )}

          <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.45)]">
              <div className="mb-6 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Planos</p>
                <h2 className="text-2xl font-semibold text-slate-950">Pricing e limites operacionais</h2>
              </div>

              <div className="grid gap-4">
                {publicPlans.map((plan) => (
                  <article key={plan.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                        <p className="mt-1 text-sm text-slate-600">{plan.description}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">{formatCurrency(plan.monthlyPrice)}</div>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-slate-600">
                      <p>Condos: até {plan.maxCondos}</p>
                      <p>Unidades por condomínio: até {plan.maxUnitsPerCondo}</p>
                      <p>Moradores: até {plan.maxResidents}</p>
                      <p>Billing portal: {plan.includesBillingPortal ? 'incluso' : 'não incluso'}</p>
                      <p>Priority support: {plan.includesPrioritySupport ? 'sim' : 'não'}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <form className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.45)]" onSubmit={handleRegisterCompany}>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Onboarding</p>
                <h2 className="text-2xl font-semibold text-slate-950">Registrar nova empresa</h2>
                <p className="text-sm text-slate-600">Cria empresa, primeiro condomínio, administrador inicial, síndico opcional e assinatura em trial.</p>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  <span>Empresa</span>
                  <input className="rounded-2xl border border-slate-200 px-4 py-3" value={registerForm.companyName} onChange={(event) => setRegisterForm((current) => ({ ...current, companyName: event.target.value }))} />
                </label>
                <label className="grid gap-2 text-sm">
                  <span>Plano inicial</span>
                  <select className="rounded-2xl border border-slate-200 px-4 py-3" value={registerForm.planCode} onChange={(event) => setRegisterForm((current) => ({ ...current, planCode: event.target.value }))}>
                    <option value="">Menor plano ativo</option>
                    {publicPlans.map((plan) => (
                      <option key={plan.id} value={plan.code}>
                        {plan.name} ({plan.code})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm md:col-span-2">
                  <span>Endereço do condomínio</span>
                  <input className="rounded-2xl border border-slate-200 px-4 py-3" value={registerForm.condoAddress} onChange={(event) => setRegisterForm((current) => ({ ...current, condoAddress: event.target.value }))} />
                </label>
                <label className="grid gap-2 text-sm">
                  <span>Nome do condomínio</span>
                  <input className="rounded-2xl border border-slate-200 px-4 py-3" value={registerForm.condoName} onChange={(event) => setRegisterForm((current) => ({ ...current, condoName: event.target.value }))} />
                </label>
                <label className="grid gap-2 text-sm">
                  <span>Prefixo</span>
                  <input className="rounded-2xl border border-slate-200 px-4 py-3" value={registerForm.condoPrefix} onChange={(event) => setRegisterForm((current) => ({ ...current, condoPrefix: event.target.value.toLowerCase().replace(/\s+/g, '-') }))} />
                </label>
                <label className="grid gap-2 text-sm">
                  <span>Administrador</span>
                  <input className="rounded-2xl border border-slate-200 px-4 py-3" value={registerForm.adminName} onChange={(event) => setRegisterForm((current) => ({ ...current, adminName: event.target.value }))} />
                </label>
                <label className="grid gap-2 text-sm">
                  <span>E-mail do admin</span>
                  <input className="rounded-2xl border border-slate-200 px-4 py-3" value={registerForm.adminEmail} onChange={(event) => setRegisterForm((current) => ({ ...current, adminEmail: event.target.value }))} />
                </label>
                <label className="grid gap-2 text-sm">
                  <span>Senha do admin</span>
                  <input className="rounded-2xl border border-slate-200 px-4 py-3" type="password" value={registerForm.adminPassword} onChange={(event) => setRegisterForm((current) => ({ ...current, adminPassword: event.target.value }))} />
                </label>
                <label className="grid gap-2 text-sm">
                  <span>Billing provider</span>
                  <select className="rounded-2xl border border-slate-200 px-4 py-3" value={registerForm.billingProvider} onChange={(event) => setRegisterForm((current) => ({ ...current, billingProvider: event.target.value as SaasBillingProvider }))}>
                    {billingProviders.map((provider) => (
                      <option key={provider} value={provider}>
                        {billingProviderLabels[provider]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm">
                  <span>Síndico inicial</span>
                  <input className="rounded-2xl border border-slate-200 px-4 py-3" value={registerForm.syndicName} onChange={(event) => setRegisterForm((current) => ({ ...current, syndicName: event.target.value }))} />
                </label>
                <label className="grid gap-2 text-sm">
                  <span>E-mail do síndico</span>
                  <input className="rounded-2xl border border-slate-200 px-4 py-3" value={registerForm.syndicEmail} onChange={(event) => setRegisterForm((current) => ({ ...current, syndicEmail: event.target.value }))} />
                </label>
                <label className="grid gap-2 text-sm md:col-span-2">
                  <span>Senha do síndico</span>
                  <input className="rounded-2xl border border-slate-200 px-4 py-3" type="password" value={registerForm.syndicPassword} onChange={(event) => setRegisterForm((current) => ({ ...current, syndicPassword: event.target.value }))} />
                </label>
              </div>

              <button className="mt-6 w-full rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60" disabled={loading}>
                {loading ? 'Processando...' : 'Criar empresa e iniciar trial'}
              </button>

              {resultDetails && (
                <div className="mt-6 rounded-[22px] bg-slate-50 p-4 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">{resultDetails.company.name}</p>
                  <p>Admin inicial: {resultDetails.adminUser.email}</p>
                  <p>Assinatura: {resultDetails.portal.currentSubscription?.subscriptionPlanName ?? 'Plano padrão'}</p>
                </div>
              )}
            </form>
          </section>
        </div>
      </main>
    );
  }

  if (currentUser.role === 'ADMIN_COMPANY') {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
          <header className="mb-8 flex flex-col gap-4 rounded-[28px] bg-slate-950 px-8 py-7 text-white lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Portal do cliente</p>
              <h1 className="mt-2 text-3xl font-semibold">{portal?.companyName ?? 'Sua operação SaaS'}</h1>
              <p className="mt-2 text-sm text-slate-300">Assinatura, invoices e checklist comercial para a administradora.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/" className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300 hover:text-cyan-300">
                Ir para operação do condomínio
              </Link>
              <button className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950" onClick={handleLogout}>
                Sair
              </button>
            </div>
          </header>

          {(errorMessage || resultMessage) && (
            <section className={`mb-6 rounded-[22px] border px-5 py-4 text-sm ${errorMessage ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
              {errorMessage ?? resultMessage}
            </section>
          )}

          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <article className="rounded-[26px] bg-white p-6 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.45)]">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-cyan-700" />
                <h2 className="text-xl font-semibold">Assinatura</h2>
              </div>
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <p>Plano: <span className="font-semibold text-slate-900">{portal?.currentSubscription?.subscriptionPlanName ?? 'Sem assinatura'}</span></p>
                <p>Status: <span className="font-semibold text-slate-900">{portal?.currentSubscription ? subscriptionStatusLabels[portal.currentSubscription.status] : '-'}</span></p>
                <p>Billing provider: <span className="font-semibold text-slate-900">{portal?.currentSubscription ? billingProviderLabels[portal.currentSubscription.billingProvider] : '-'}</span></p>
                <p>Período atual até: <span className="font-semibold text-slate-900">{formatDateTimeBR(portal?.currentSubscription?.currentPeriodEndsAtUtc)}</span></p>
                <p>Trial até: <span className="font-semibold text-slate-900">{formatDateTimeBR(portal?.currentSubscription?.trialEndsAtUtc)}</span></p>
              </div>
            </article>

            <article className="rounded-[26px] bg-white p-6 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.45)]">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-cyan-700" />
                <h2 className="text-xl font-semibold">Checklist de ativação</h2>
              </div>
              <ul className="mt-5 grid gap-3 text-sm text-slate-700">
                {portal?.welcomeChecklist.map((item) => (
                  <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </section>

          <section className="mt-6 rounded-[26px] bg-white p-6 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.45)]">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-cyan-700" />
              <h2 className="text-xl font-semibold">Invoices</h2>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="pb-3 pr-4 font-medium">Descrição</th>
                    <th className="pb-3 pr-4 font-medium">Valor</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Vencimento</th>
                    <th className="pb-3 font-medium">Checkout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {portal?.invoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="py-3 pr-4">{invoice.description}</td>
                      <td className="py-3 pr-4">{formatCurrency(invoice.amount, invoice.currency)}</td>
                      <td className="py-3 pr-4">{invoiceStatusLabels[invoice.status]}</td>
                      <td className="py-3 pr-4">{formatDateTimeBR(invoice.dueAtUtc)}</td>
                      <td className="py-3">
                        {invoice.checkoutUrl ? (
                          <a className="font-medium text-cyan-700 hover:text-cyan-900" href={invoice.checkoutUrl} target="_blank" rel="noreferrer">
                            Abrir
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (currentUser.role !== 'SYSTEM_ADMIN') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="max-w-lg rounded-[28px] bg-white p-8 text-center shadow-[0_28px_80px_-44px_rgba(15,23,42,0.45)]">
          <h1 className="text-2xl font-semibold text-slate-950">Perfil sem acesso ao painel SaaS</h1>
          <p className="mt-3 text-sm text-slate-600">
            O usuário atual é {ROLE_LABELS[currentUser.role]}. Use um `SystemAdmin` ou `AdminCompany`.
          </p>
          <button className="mt-6 rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white" onClick={handleLogout}>
            Encerrar sessão
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#e2e8f0_0%,_#f8fafc_28%,_#f8fafc_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        <header className="mb-8 flex flex-col gap-5 rounded-[30px] bg-slate-950 px-8 py-7 text-white lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-cyan-300">Backoffice SaaS</p>
            <h1 className="mt-2 text-3xl font-semibold">Operação comercial CondHub</h1>
            <p className="mt-2 text-sm text-slate-300">Onboarding, planos, cobrança, suporte e visão consolidada por empresa.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-2xl border border-slate-700 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300 hover:text-cyan-300" onClick={() => void loadOverview()}>
              {loadingOverview ? 'Atualizando...' : 'Atualizar dados'}
            </button>
            <button className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-950" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </header>

        {(errorMessage || resultMessage) && (
          <section className={`mb-6 rounded-[22px] border px-5 py-4 text-sm ${errorMessage ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {errorMessage ?? resultMessage}
          </section>
        )}

        <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
          <div className="space-y-6">
            <article className="rounded-[26px] bg-white p-6 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.45)]">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-cyan-700" />
                <h2 className="text-xl font-semibold">Empresas</h2>
              </div>
              <div className="mt-5 grid gap-3">
                {overview?.companies.map((company) => (
                  <button
                    key={company.id}
                    className={`rounded-[22px] border px-4 py-4 text-left transition ${selectedCompany?.id === company.id ? 'border-cyan-400 bg-cyan-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                    onClick={() => setSelectedCompanyId(company.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-900">{company.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{company.condoCount} condomínios • {company.userCount} usuários</p>
                      </div>
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        {company.currentSubscription ? subscriptionStatusLabels[company.currentSubscription.status] : 'Sem assinatura'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </article>

            <article className="rounded-[26px] bg-white p-6 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.45)]">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-cyan-700" />
                <h2 className="text-xl font-semibold">Busca de usuários</h2>
              </div>
              <form className="mt-5 flex gap-3" onSubmit={handleUserSearch}>
                <input className="min-w-0 flex-1 rounded-2xl border border-slate-200 px-4 py-3" placeholder="nome ou e-mail" value={userQuery} onChange={(event) => setUserQuery(event.target.value)} />
                <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white" disabled={loading}>
                  Buscar
                </button>
              </form>
              <div className="mt-4 grid gap-3">
                {searchedUsers.map((user) => (
                  <div key={user.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-slate-600">{user.email}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{ROLE_LABELS[user.role]}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="space-y-6">
            <article className="grid gap-6 rounded-[26px] bg-white p-6 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.45)] lg:grid-cols-2">
              <form className="space-y-4" onSubmit={handlePlanSubmit}>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Planos</p>
                  <h2 className="mt-1 text-xl font-semibold">Criar ou editar plano</h2>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Código" value={planForm.code} onChange={(event) => setPlanForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} />
                  <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Nome" value={planForm.name} onChange={(event) => setPlanForm((current) => ({ ...current, name: event.target.value }))} />
                  <input className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" placeholder="Descrição" value={planForm.description} onChange={(event) => setPlanForm((current) => ({ ...current, description: event.target.value }))} />
                  <input className="rounded-2xl border border-slate-200 px-4 py-3" type="number" step="0.01" placeholder="Mensalidade" value={planForm.monthlyPrice} onChange={(event) => setPlanForm((current) => ({ ...current, monthlyPrice: event.target.value }))} />
                  <input className="rounded-2xl border border-slate-200 px-4 py-3" type="number" placeholder="Máx. condomínios" value={planForm.maxCondos} onChange={(event) => setPlanForm((current) => ({ ...current, maxCondos: event.target.value }))} />
                  <input className="rounded-2xl border border-slate-200 px-4 py-3" type="number" placeholder="Máx. unidades" value={planForm.maxUnitsPerCondo} onChange={(event) => setPlanForm((current) => ({ ...current, maxUnitsPerCondo: event.target.value }))} />
                  <input className="rounded-2xl border border-slate-200 px-4 py-3" type="number" placeholder="Máx. moradores" value={planForm.maxResidents} onChange={(event) => setPlanForm((current) => ({ ...current, maxResidents: event.target.value }))} />
                </div>
                <div className="grid gap-3 text-sm text-slate-700">
                  <label className="flex items-center gap-3">
                    <input checked={planForm.includesBillingPortal} onChange={(event) => setPlanForm((current) => ({ ...current, includesBillingPortal: event.target.checked }))} type="checkbox" />
                    Billing portal incluso
                  </label>
                  <label className="flex items-center gap-3">
                    <input checked={planForm.includesPrioritySupport} onChange={(event) => setPlanForm((current) => ({ ...current, includesPrioritySupport: event.target.checked }))} type="checkbox" />
                    Priority support
                  </label>
                  <label className="flex items-center gap-3">
                    <input checked={planForm.isActive} onChange={(event) => setPlanForm((current) => ({ ...current, isActive: event.target.checked }))} type="checkbox" />
                    Plano ativo
                  </label>
                </div>
                <div className="flex gap-3">
                  <button className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white" disabled={loading}>
                    {editingPlanId ? 'Salvar plano' : 'Criar plano'}
                  </button>
                  {editingPlanId && (
                    <button className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700" onClick={() => {
                      setEditingPlanId(undefined);
                      setPlanForm(emptyPlanForm);
                    }} type="button">
                      Cancelar
                    </button>
                  )}
                </div>
              </form>

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Catálogo</p>
                <div className="mt-4 grid gap-3">
                  {overview?.plans.map((plan) => (
                    <button
                      key={plan.id}
                      className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:border-slate-300"
                      onClick={() => {
                        setEditingPlanId(plan.id);
                        setPlanForm({
                          code: plan.code,
                          name: plan.name,
                          description: plan.description ?? '',
                          monthlyPrice: String(plan.monthlyPrice),
                          maxCondos: String(plan.maxCondos),
                          maxUnitsPerCondo: String(plan.maxUnitsPerCondo),
                          maxResidents: String(plan.maxResidents),
                          includesBillingPortal: plan.includesBillingPortal,
                          includesPrioritySupport: plan.includesPrioritySupport,
                          isActive: plan.isActive,
                        });
                      }}
                      type="button"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">{plan.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{plan.code}</p>
                        </div>
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{formatCurrency(plan.monthlyPrice)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </article>

            {selectedCompany && (
              <>
                <article className="rounded-[26px] bg-white p-6 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.45)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Empresa selecionada</p>
                      <h2 className="mt-1 text-2xl font-semibold">{selectedCompany.name}</h2>
                      <p className="mt-2 text-sm text-slate-600">Criada em {formatDateTimeBR(selectedCompany.createdAtUtc)} • {selectedCompany.condoCount} condomínios • {selectedCompany.userCount} usuários</p>
                    </div>
                    <div className="rounded-[22px] bg-slate-950 px-4 py-3 text-sm text-white">
                      {selectedCompany.currentSubscription ? (
                        <>
                          <p className="font-semibold">{selectedCompany.currentSubscription.subscriptionPlanName}</p>
                          <p className="text-slate-300">{subscriptionStatusLabels[selectedCompany.currentSubscription.status]}</p>
                        </>
                      ) : (
                        'Sem assinatura'
                      )}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 md:grid-cols-2">
                    {selectedCompany.condos.map((condo) => (
                      <div key={condo.id} className="rounded-2xl bg-slate-50 px-4 py-4 text-sm">
                        <p className="font-semibold text-slate-900">{condo.name}</p>
                        <p className="text-slate-600">{condo.address}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{condo.prefix}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <section className="grid gap-6 lg:grid-cols-2">
                  <form className="rounded-[26px] bg-white p-6 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.45)]" onSubmit={handleCreateCondo}>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Onboarding</p>
                    <h3 className="mt-1 text-xl font-semibold">Adicionar condomínio</h3>
                    <div className="mt-5 grid gap-3">
                      <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Nome" value={companyCondoForm.name} onChange={(event) => setCompanyCondoForm((current) => ({ ...current, name: event.target.value }))} />
                      <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Endereço" value={companyCondoForm.address} onChange={(event) => setCompanyCondoForm((current) => ({ ...current, address: event.target.value }))} />
                      <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Prefixo" value={companyCondoForm.prefix} onChange={(event) => setCompanyCondoForm((current) => ({ ...current, prefix: event.target.value.toLowerCase().replace(/\s+/g, '-') }))} />
                    </div>
                    <button className="mt-5 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white" disabled={loading}>
                      Criar condomínio
                    </button>
                  </form>

                  <form className="rounded-[26px] bg-white p-6 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.45)]" onSubmit={handleChangeSubscription}>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Assinatura</p>
                    <h3 className="mt-1 text-xl font-semibold">Ativar, suspender ou trocar plano</h3>
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <select className="rounded-2xl border border-slate-200 px-4 py-3" value={subscriptionForm.planCode} onChange={(event) => setSubscriptionForm((current) => ({ ...current, planCode: event.target.value }))}>
                        {overview?.plans.map((plan) => (
                          <option key={plan.id} value={plan.code}>
                            {plan.name} ({plan.code})
                          </option>
                        ))}
                      </select>
                      <select className="rounded-2xl border border-slate-200 px-4 py-3" value={subscriptionForm.status} onChange={(event) => setSubscriptionForm((current) => ({ ...current, status: event.target.value as SaasSubscriptionStatus }))}>
                        {subscriptionStatuses.map((status) => (
                          <option key={status} value={status}>
                            {subscriptionStatusLabels[status]}
                          </option>
                        ))}
                      </select>
                      <select className="rounded-2xl border border-slate-200 px-4 py-3" value={subscriptionForm.billingProvider} onChange={(event) => setSubscriptionForm((current) => ({ ...current, billingProvider: event.target.value as SaasBillingProvider }))}>
                        {billingProviders.map((provider) => (
                          <option key={provider} value={provider}>
                            {billingProviderLabels[provider]}
                          </option>
                        ))}
                      </select>
                      <input className="rounded-2xl border border-slate-200 px-4 py-3" type="number" placeholder="Trial em dias" value={subscriptionForm.trialDays} onChange={(event) => setSubscriptionForm((current) => ({ ...current, trialDays: event.target.value }))} />
                      <textarea className="min-h-28 rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" placeholder="Notas internas da assinatura" value={subscriptionForm.notes} onChange={(event) => setSubscriptionForm((current) => ({ ...current, notes: event.target.value }))} />
                    </div>
                    <button className="mt-5 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white" disabled={loading}>
                      Salvar assinatura
                    </button>
                  </form>
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                  <form className="rounded-[26px] bg-white p-6 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.45)]" onSubmit={handleIssueInvoice}>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Billing</p>
                    <h3 className="mt-1 text-xl font-semibold">Emitir nova fatura</h3>
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <input className="rounded-2xl border border-slate-200 px-4 py-3" type="number" step="0.01" placeholder="Valor" value={invoiceForm.amount} onChange={(event) => setInvoiceForm((current) => ({ ...current, amount: event.target.value }))} />
                      <input className="rounded-2xl border border-slate-200 px-4 py-3" type="date" value={invoiceForm.dueAtUtc} onChange={(event) => setInvoiceForm((current) => ({ ...current, dueAtUtc: event.target.value }))} />
                      <input className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" placeholder="Descrição" value={invoiceForm.description} onChange={(event) => setInvoiceForm((current) => ({ ...current, description: event.target.value }))} />
                      <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Moeda" value={invoiceForm.currency} onChange={(event) => setInvoiceForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))} />
                      <select className="rounded-2xl border border-slate-200 px-4 py-3" value={invoiceForm.billingProvider} onChange={(event) => setInvoiceForm((current) => ({ ...current, billingProvider: event.target.value as SaasBillingProvider }))}>
                        {billingProviders.map((provider) => (
                          <option key={provider} value={provider}>
                            {billingProviderLabels[provider]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button className="mt-5 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white" disabled={loading}>
                      Emitir invoice
                    </button>
                  </form>

                  <form className="rounded-[26px] bg-white p-6 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.45)]" onSubmit={handleInvoiceStatusUpdate}>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Webhook manual</p>
                    <h3 className="mt-1 text-xl font-semibold">Atualizar status da invoice</h3>
                    <div className="mt-5 grid gap-3">
                      <select className="rounded-2xl border border-slate-200 px-4 py-3" value={invoiceStatusForm.invoiceId} onChange={(event) => setInvoiceStatusForm((current) => ({ ...current, invoiceId: event.target.value }))}>
                        <option value="">Selecione uma fatura</option>
                        {selectedCompany.recentInvoices.map((invoice) => (
                          <option key={invoice.id} value={invoice.id}>
                            {invoice.description} • {formatCurrency(invoice.amount, invoice.currency)}
                          </option>
                        ))}
                      </select>
                      <select className="rounded-2xl border border-slate-200 px-4 py-3" value={invoiceStatusForm.status} onChange={(event) => setInvoiceStatusForm((current) => ({ ...current, status: event.target.value as SaasInvoiceStatus }))}>
                        {invoiceStatuses.map((status) => (
                          <option key={status} value={status}>
                            {invoiceStatusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button className="mt-5 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white" disabled={loading}>
                      Aplicar status
                    </button>
                  </form>
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                  <article className="rounded-[26px] bg-white p-6 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.45)]">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Invoices recentes</p>
                    <div className="mt-5 overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="text-slate-500">
                          <tr>
                            <th className="pb-3 pr-4 font-medium">Descrição</th>
                            <th className="pb-3 pr-4 font-medium">Valor</th>
                            <th className="pb-3 pr-4 font-medium">Status</th>
                            <th className="pb-3 pr-4 font-medium">Vencimento</th>
                            <th className="pb-3 font-medium">Checkout</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedCompany.recentInvoices.map((invoice) => (
                            <tr key={invoice.id}>
                              <td className="py-3 pr-4">{invoice.description}</td>
                              <td className="py-3 pr-4">{formatCurrency(invoice.amount, invoice.currency)}</td>
                              <td className="py-3 pr-4">{invoiceStatusLabels[invoice.status]}</td>
                              <td className="py-3 pr-4">{formatDateTimeBR(invoice.dueAtUtc)}</td>
                              <td className="py-3">
                                {invoice.checkoutUrl ? (
                                  <a className="font-medium text-cyan-700 hover:text-cyan-900" href={invoice.checkoutUrl} rel="noreferrer" target="_blank">
                                    Abrir
                                  </a>
                                ) : (
                                  '-'
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </article>

                  <form className="rounded-[26px] bg-white p-6 shadow-[0_28px_80px_-44px_rgba(15,23,42,0.45)]" onSubmit={handleAddSupportNote}>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Support</p>
                    <h3 className="mt-1 text-xl font-semibold">Adicionar nota interna</h3>
                    <div className="mt-5 grid gap-3">
                      <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Título" value={supportNoteForm.title} onChange={(event) => setSupportNoteForm((current) => ({ ...current, title: event.target.value }))} />
                      <textarea className="min-h-36 rounded-2xl border border-slate-200 px-4 py-3" placeholder="Contexto, decisão, follow-up ou histórico." value={supportNoteForm.body} onChange={(event) => setSupportNoteForm((current) => ({ ...current, body: event.target.value }))} />
                    </div>
                    <button className="mt-5 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white" disabled={loading}>
                      Registrar nota
                    </button>
                    <div className="mt-6 grid gap-3 text-sm">
                      {selectedCompany.supportNotes.map((note) => (
                        <article key={note.id} className="rounded-2xl bg-slate-50 px-4 py-4">
                          <p className="font-semibold text-slate-900">{note.title}</p>
                          <p className="mt-2 text-slate-600">{note.body}</p>
                          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                            {note.createdByUserName} • {formatDateTimeBR(note.createdAtUtc)}
                          </p>
                        </article>
                      ))}
                    </div>
                  </form>
                </section>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
