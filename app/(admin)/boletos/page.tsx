'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Copy, Eye, FilePlus2, Pencil, Plus, QrCode, RefreshCw, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { BOLETO_STATUS_LABELS, PIX_CHARGE_STATUS_LABELS, formatDateBR, type Boleto, type BoletoPixCharge, type Unit } from '../../../shared/src';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { ConfirmDialog } from '../../../components/ui/confirm-dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Skeleton } from '../../../components/ui/skeleton';
import { dashboardApi } from '../../../src/store/useDashboardStore';
import { showToast } from '../../../src/store/useToastStore';

type BoletoFormState = {
  unitId: string;
  amountInput: string;
  referenceMonthISO: string;
  dueDateISO: string;
  notes: string;
  replaceExisting: boolean;
  files: File[];
};

type ModalFrameProps = {
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
};

const emptyForm: BoletoFormState = {
  unitId: '',
  amountInput: '',
  referenceMonthISO: '',
  dueDateISO: '',
  notes: '',
  replaceExisting: false,
  files: [],
};

const statusTone: Record<Boleto['status'], string> = {
  OPEN: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900/80 dark:bg-sky-950/30 dark:text-sky-300',
  OVERDUE: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/80 dark:bg-rose-950/30 dark:text-rose-300',
  PAID: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/80 dark:bg-emerald-950/30 dark:text-emerald-300',
};

const pixStatusTone: Record<BoletoPixCharge['status'], string> = {
  PENDING: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/80 dark:bg-amber-950/30 dark:text-amber-300',
  PAID: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/80 dark:bg-emerald-950/30 dark:text-emerald-300',
  EXPIRED: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300',
  CANCELLED: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/80 dark:bg-rose-950/30 dark:text-rose-300',
  REFUNDED: 'border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900/80 dark:bg-violet-950/30 dark:text-violet-300',
};

function ModalFrame({ title, description, children, onClose }: ModalFrameProps) {
  return (
    <div className="fixed inset-0 z-[90] h-dvh min-h-dvh w-screen overflow-y-auto bg-slate-950/60 backdrop-blur-sm">
      <div className="flex min-h-dvh w-full items-center justify-center p-4 py-6">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">{title}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
          </div>
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50" onClick={onClose} aria-label="Fechar modal">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6">{children}</div>
      </div>
      </div>
    </div>
  );
}

function BoletoTableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="border-b border-slate-200 dark:border-slate-800">
          <td className="px-6 py-4" colSpan={7}>
            <div className="grid gap-3 md:grid-cols-[1fr,0.8fr,0.8fr,0.7fr,1fr,0.8fr,1.2fr]">
              {Array.from({ length: 7 }).map((__, itemIndex) => (
                <Skeleton key={itemIndex} className="h-10 w-full" />
              ))}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  );
}

async function uploadBoletoFiles(files: File[]) {
  const uploadedUrls: string[] = [];

  for (const file of files) {
    const upload = await dashboardApi.boletos.createUploadUrl({ fileName: file.name });
    const response = await fetch(upload.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/pdf',
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error(`Falha ao enviar o arquivo ${file.name}.`);
    }

    uploadedUrls.push(upload.storageRef);
  }

  return uploadedUrls;
}

function toMonthInputValue(referenceMonthISO: string) {
  return referenceMonthISO.slice(0, 7);
}

function toReferenceMonthISO(monthValue: string) {
  return `${monthValue}-01`;
}

function formatCurrencyBRL(valueCents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valueCents / 100);
}

function formatDateTimeBR(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
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

export default function BoletosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedUnitId = searchParams.get('unitId') ?? '';
  const autoOpenedRef = useRef(false);

  const [boletos, setBoletos] = useState<Boleto[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Boleto['status']>('ALL');
  const [unitFilter, setUnitFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBoleto, setEditingBoleto] = useState<Boleto | undefined>();
  const [boletoToRemove, setBoletoToRemove] = useState<Boleto | undefined>();
  const [pixBoleto, setPixBoleto] = useState<Boleto | undefined>();
  const [pixCharge, setPixCharge] = useState<BoletoPixCharge | undefined>();
  const [pixLoading, setPixLoading] = useState(false);
  const [pixRefreshing, setPixRefreshing] = useState(false);
  const [form, setForm] = useState<BoletoFormState>(emptyForm);

  const load = async () => {
    setLoading(true);

    try {
      const [nextBoletos, nextUnits] = await Promise.all([
        dashboardApi.boletos.list(),
        dashboardApi.map.getUnits(),
      ]);

      setBoletos(nextBoletos);
      setUnits(nextUnits);
    } catch (loadError) {
      showToast({
        tone: 'error',
        title: 'Falha ao carregar boletos',
        description: loadError instanceof Error ? loadError.message : 'Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (!requestedUnitId || autoOpenedRef.current || units.length === 0) {
      return;
    }

    const requestedUnitExists = units.some((unit) => unit.id === requestedUnitId);
    if (!requestedUnitExists) {
      return;
    }

    autoOpenedRef.current = true;
    setUnitFilter(requestedUnitId);
    setEditingBoleto(undefined);
    setForm((previous) => ({
      ...emptyForm,
      amountInput: previous.amountInput,
      unitId: requestedUnitId,
      referenceMonthISO: previous.referenceMonthISO,
      dueDateISO: previous.dueDateISO,
    }));
    setIsFormOpen(true);
  }, [requestedUnitId, units]);

  const openCreate = () => {
    setEditingBoleto(undefined);
    setForm({
      ...emptyForm,
      unitId: unitFilter || requestedUnitId || units[0]?.id || '',
      amountInput: '',
    });
    setIsFormOpen(true);
  };

  const openEdit = (boleto: Boleto) => {
    setEditingBoleto(boleto);
    setForm({
      unitId: boleto.unitId,
      amountInput: formatCurrencyBRL(boleto.amountCents),
      referenceMonthISO: toMonthInputValue(boleto.referenceMonthISO),
      dueDateISO: boleto.dueDateISO.slice(0, 10),
      notes: boleto.notes ?? '',
      replaceExisting: false,
      files: [],
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingBoleto(undefined);
    setForm(emptyForm);

    if (requestedUnitId) {
      router.replace('/boletos');
    }
  };

  const filteredBoletos = useMemo(() => {
    const term = search.trim().toLowerCase();

    return boletos.filter((boleto) => {
      if (statusFilter !== 'ALL' && boleto.status !== statusFilter) {
        return false;
      }

      if (unitFilter && boleto.unitId !== unitFilter) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [boleto.unitLabel, boleto.notes, boleto.referenceMonthISO, boleto.dueDateISO]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term));
    });
  }, [boletos, search, statusFilter, unitFilter]);

  const stats = useMemo(() => {
    const total = boletos.length;
    const open = boletos.filter((item) => item.status === 'OPEN').length;
    const overdue = boletos.filter((item) => item.status === 'OVERDUE').length;
    const paid = boletos.filter((item) => item.status === 'PAID').length;
    return { total, open, overdue, paid };
  }, [boletos]);

  const save = async () => {
    const amountCents = currencyInputToCents(form.amountInput);

    if (!form.unitId || !form.referenceMonthISO || !form.dueDateISO || amountCents < 199) {
      showToast({
        tone: 'error',
        title: 'Campos obrigatorios',
        description: 'Preencha unidade, valor maior ou igual a R$ 1,99, competencia e vencimento.',
      });
      return;
    }

    setSaving(true);

    try {
      const uploadedUrls = form.files.length > 0 ? await uploadBoletoFiles(form.files) : [];

      if (editingBoleto) {
        await dashboardApi.boletos.update(editingBoleto.id, {
          unitId: form.unitId,
          amountCents,
          referenceMonthISO: toReferenceMonthISO(form.referenceMonthISO),
          dueDateISO: form.dueDateISO,
          notes: form.notes.trim() || undefined,
          fileUrls: uploadedUrls.length > 0 ? [...editingBoleto.files.map((file) => file.fileUrl), ...uploadedUrls] : undefined,
        });
        showToast({
          tone: 'success',
          title: 'Boleto atualizado',
        });
      } else {
        await dashboardApi.boletos.create({
          unitId: form.unitId,
          amountCents,
          referenceMonthISO: toReferenceMonthISO(form.referenceMonthISO),
          dueDateISO: form.dueDateISO,
          notes: form.notes.trim() || undefined,
          fileUrls: uploadedUrls,
          replaceExisting: form.replaceExisting,
        });
        showToast({
          tone: 'success',
          title: 'Boleto criado',
        });
      }

      closeForm();
      await load();
    } catch (saveError) {
      showToast({
        tone: 'error',
        title: 'Falha ao salvar boleto',
        description: saveError instanceof Error ? saveError.message : 'Tente novamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (boleto: Boleto) => {
    try {
      await dashboardApi.boletos.remove(boleto.id);
      showToast({
        tone: 'success',
        title: 'Boleto removido',
      });
      await load();
    } catch (removeError) {
      showToast({
        tone: 'error',
        title: 'Falha ao remover boleto',
        description: removeError instanceof Error ? removeError.message : 'Tente novamente.',
      });
    } finally {
      setBoletoToRemove(undefined);
    }
  };

  const toggleStatus = async (boleto: Boleto) => {
    try {
      const nextStatus = boleto.status === 'PAID' ? 'OPEN' : 'PAID';
      await dashboardApi.boletos.updateStatus(boleto.id, nextStatus);
      showToast({
        tone: 'success',
        title: nextStatus === 'PAID' ? 'Boleto marcado como pago' : 'Boleto reaberto',
      });
      await load();
    } catch (statusError) {
      showToast({
        tone: 'error',
        title: 'Falha ao atualizar status',
        description: statusError instanceof Error ? statusError.message : 'Tente novamente.',
      });
    }
  };

  const openPixModal = async (boleto: Boleto) => {
    setPixBoleto(boleto);
    setPixCharge(undefined);
    setPixLoading(true);

    try {
      const charge = await dashboardApi.boletos.createOrGetPixCharge(boleto.id);
      setPixCharge(charge);
    } catch (pixError) {
      showToast({
        tone: 'error',
        title: 'Falha ao gerar PIX',
        description: pixError instanceof Error ? pixError.message : 'Tente novamente.',
      });
      setPixBoleto(undefined);
    } finally {
      setPixLoading(false);
    }
  };

  const refreshPixCharge = async () => {
    if (!pixBoleto) {
      return;
    }

    setPixRefreshing(true);

    try {
      const charge = await dashboardApi.boletos.getPixCharge(pixBoleto.id);
      setPixCharge(charge);
    } catch (pixError) {
      showToast({
        tone: 'error',
        title: 'Falha ao atualizar PIX',
        description: pixError instanceof Error ? pixError.message : 'Tente novamente.',
      });
    } finally {
      setPixRefreshing(false);
    }
  };

  const copyPixCode = async () => {
    if (!pixCharge?.brCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(pixCharge.brCode);
      showToast({
        tone: 'success',
        title: 'Codigo PIX copiado',
      });
    } catch {
      showToast({
        tone: 'error',
        title: 'Falha ao copiar codigo PIX',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription>Total de boletos</CardDescription>
            <CardTitle className="text-4xl text-slate-950 dark:text-slate-50">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">Volume total carregado para acompanhamento.</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription>Em aberto</CardDescription>
            <CardTitle className="text-4xl text-slate-950 dark:text-slate-50">{stats.open}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">Itens aguardando pagamento.</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription>Em atraso</CardDescription>
            <CardTitle className="text-4xl text-slate-950 dark:text-slate-50">{stats.overdue}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">Boletos que ja passaram do vencimento.</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription>Pagos</CardDescription>
            <CardTitle className="text-4xl text-slate-950 dark:text-slate-50">{stats.paid}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">Itens liquidados dentro da operacao.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-200/80 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Lista de boletos</CardTitle>
            <CardDescription>Controle financeiro por unidade, competencia, vencimento e anexos.</CardDescription>
          </div>

          <div className="flex w-full flex-col gap-3 lg:max-w-4xl lg:flex-row lg:items-end">
            <div className="flex-1">
              <Label htmlFor="boleto-search" className="sr-only">
                Buscar boletos
              </Label>
              <Input
                id="boleto-search"
                placeholder="Buscar por unidade, observacao ou competencia"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="w-full lg:w-48">
              <Label htmlFor="boleto-status">Status</Label>
              <select
                id="boleto-status"
                className="input"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'ALL' | Boleto['status'])}
              >
                <option value="ALL">Todos</option>
                <option value="OPEN">Aberto</option>
                <option value="OVERDUE">Em atraso</option>
                <option value="PAID">Pago</option>
              </select>
            </div>

            <div className="w-full lg:w-52">
              <Label htmlFor="boleto-unit-filter">Unidade</Label>
              <select
                id="boleto-unit-filter"
                className="input"
                value={unitFilter}
                onChange={(event) => setUnitFilter(event.target.value)}
              >
                <option value="">Todas</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={openCreate} className="gap-2 lg:self-end">
              <Plus className="h-4 w-4" />
              Novo boleto
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="space-y-4 pt-4 md:hidden">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-48 w-full rounded-2xl" />)
            ) : filteredBoletos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                Nenhum boleto encontrado para os filtros atuais.
              </div>
            ) : (
              filteredBoletos.map((boleto) => (
                <div key={boleto.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-base font-semibold text-slate-950 dark:text-slate-50">{boleto.unitLabel}</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <p><strong>Valor:</strong> {formatCurrencyBRL(boleto.amountCents)}</p>
                    <p><strong>Competencia:</strong> {toMonthInputValue(boleto.referenceMonthISO)}</p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone[boleto.status]}`}>
                        {BOLETO_STATUS_LABELS[boleto.status]}
                      </span>
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => void openPixModal(boleto)}>
                      <QrCode className="h-4 w-4" />
                      Gerar PIX
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => void toggleStatus(boleto)}>
                      <Check className="h-4 w-4" />
                      {boleto.status === 'PAID' ? 'Reabrir' : 'Marcar pago'}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => openEdit(boleto)}>
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 border-rose-200 bg-rose-50/80 text-rose-600 hover:bg-rose-100 dark:border-rose-800 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-950/30" onClick={() => setBoletoToRemove(boleto)}>
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1120px]">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4 font-medium">Unidade</th>
                  <th className="px-6 py-4 font-medium">Valor</th>
                  <th className="px-6 py-4 font-medium">Competencia</th>
                  <th className="px-6 py-4 font-medium">Vencimento</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Arquivos</th>
                  <th className="px-6 py-4 font-medium">Observacoes</th>
                  <th className="px-6 py-4 font-medium text-right">Acoes</th>
                </tr>
              </thead>

              {loading ? <BoletoTableSkeleton /> : null}

              {!loading ? (
                <tbody>
                  {filteredBoletos.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                        Nenhum boleto encontrado para os filtros atuais.
                      </td>
                    </tr>
                  ) : (
                    filteredBoletos.map((boleto) => (
                      <tr key={boleto.id} className="border-b border-slate-200 last:border-b-0 dark:border-slate-800">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-950 dark:text-slate-50">{boleto.unitLabel}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Enviado em {formatDateBR(boleto.uploadedAtISO)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{formatCurrencyBRL(boleto.amountCents)}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{toMonthInputValue(boleto.referenceMonthISO)}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{formatDateBR(boleto.dueDateISO)}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone[boleto.status]}`}>
                            {BOLETO_STATUS_LABELS[boleto.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            {boleto.files.length > 0 ? (
                              boleto.files.slice(0, 2).map((file) => (
                                <Link
                                  key={file.id}
                                  href={file.fileUrl}
                                  target="_blank"
                                  className="inline-flex items-center gap-2 text-sm text-slate-900 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300"
                                >
                                  <Eye className="h-4 w-4" />
                                  {file.fileName ?? 'Visualizar PDF'}
                                </Link>
                              ))
                            ) : boleto.fileUrl ? (
                              <Link
                                href={boleto.fileUrl}
                                target="_blank"
                                className="inline-flex items-center gap-2 text-sm text-slate-900 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300"
                              >
                                <Eye className="h-4 w-4" />
                                Visualizar PDF
                              </Link>
                            ) : (
                              <p className="text-sm text-slate-500 dark:text-slate-400">Sem arquivo</p>
                            )}
                            {boleto.files.length > 2 ? (
                              <p className="text-xs text-slate-500 dark:text-slate-400">+{boleto.files.length - 2} arquivo(s)</p>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{boleto.notes?.trim() || 'Sem observacoes'}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => void openPixModal(boleto)}>
                              <QrCode className="h-4 w-4" />
                              Gerar PIX
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => void toggleStatus(boleto)}>
                              <Check className="h-4 w-4" />
                              {boleto.status === 'PAID' ? 'Reabrir' : 'Marcar pago'}
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => openEdit(boleto)}>
                              <Pencil className="h-4 w-4" />
                              Editar
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2 border-rose-200 bg-rose-50/80 text-rose-600 hover:bg-rose-100 dark:border-rose-800 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-950/30" onClick={() => setBoletoToRemove(boleto)}>
                              <Trash2 className="h-4 w-4" />
                              Remover
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              ) : null}
            </table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!boletoToRemove}
        title="Remover boleto"
        description={boletoToRemove ? `Deseja remover o boleto ${boletoToRemove.unitLabel} ${toMonthInputValue(boletoToRemove.referenceMonthISO)}?` : ''}
        confirmLabel="Remover"
        destructive
        onCancel={() => setBoletoToRemove(undefined)}
        onConfirm={() => {
          if (boletoToRemove) {
            void remove(boletoToRemove);
          }
        }}
      />

      {isFormOpen ? (
        <ModalFrame
          title={editingBoleto ? 'Editar boleto' : 'Novo boleto'}
          description={
            editingBoleto
              ? 'Atualize a unidade, vencimento, competencia e os anexos deste boleto.'
              : 'Cadastre um novo boleto com unidade, competencia, vencimento e, se quiser, anexe um ou mais PDFs.'
          }
          onClose={closeForm}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="boleto-unit">Unidade</Label>
              <select
                id="boleto-unit"
                className="input"
                value={form.unitId}
                onChange={(event) => setForm((previous) => ({ ...previous, unitId: event.target.value }))}
              >
                <option value="">Selecione a unidade</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="boleto-amount">Valor</Label>
              <Input
                id="boleto-amount"
                inputMode="numeric"
                placeholder="R$ 0,00"
                value={form.amountInput}
                onChange={(event) => setForm((previous) => ({ ...previous, amountInput: formatCurrencyInput(event.target.value) }))}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Informe o valor total do boleto. Exemplo: R$ 149,90.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="boleto-reference-month">Competencia</Label>
              <Input
                id="boleto-reference-month"
                type="month"
                value={form.referenceMonthISO}
                onChange={(event) => setForm((previous) => ({ ...previous, referenceMonthISO: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="boleto-due-date">Vencimento</Label>
              <Input
                id="boleto-due-date"
                type="date"
                value={form.dueDateISO}
                onChange={(event) => setForm((previous) => ({ ...previous, dueDateISO: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="boleto-files">Arquivos PDF</Label>
              <Input
                id="boleto-files"
                type="file"
                accept="application/pdf"
                multiple
                onChange={(event) => setForm((previous) => ({ ...previous, files: Array.from(event.target.files ?? []) }))}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {editingBoleto ? 'Voce pode anexar novos PDFs mantendo os arquivos atuais.' : 'Opcional. Envie um ou mais PDFs do boleto se quiser.'}
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="boleto-notes">Observacoes</Label>
              <textarea
                id="boleto-notes"
                className="input min-h-28 resize-y py-3"
                value={form.notes}
                onChange={(event) => setForm((previous) => ({ ...previous, notes: event.target.value }))}
                placeholder="Informacoes adicionais para a equipe administrativa"
              />
            </div>

            {!editingBoleto ? (
              <label className="md:col-span-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={form.replaceExisting}
                  onChange={(event) => setForm((previous) => ({ ...previous, replaceExisting: event.target.checked }))}
                />
                Substituir boleto existente da mesma unidade e competencia, se houver
              </label>
            ) : null}

            {editingBoleto?.files.length ? (
              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  <FilePlus2 className="h-4 w-4" />
                  Arquivos atuais
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {editingBoleto.files.map((file) => (
                    <Link
                      key={file.id}
                      href={file.fileUrl}
                      target="_blank"
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                    >
                      {file.fileName ?? 'Arquivo PDF'}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="md:col-span-2 flex justify-end gap-3">
              <Button variant="outline" onClick={closeForm} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={() => void save()} disabled={saving} className="gap-2">
                <Plus className="h-4 w-4" />
                {saving ? 'Salvando...' : editingBoleto ? 'Salvar alteracoes' : 'Criar boleto'}
              </Button>
            </div>
          </div>
        </ModalFrame>
      ) : null}

      {pixBoleto ? (
        <ModalFrame
          title="Pagamento com PIX"
          description={`Gere o QR Code e o codigo copia e cola do boleto ${pixBoleto.unitLabel} • Ref. ${toMonthInputValue(pixBoleto.referenceMonthISO)}`}
          onClose={() => {
            setPixBoleto(undefined);
            setPixCharge(undefined);
            setPixLoading(false);
            setPixRefreshing(false);
          }}
        >
          {pixLoading ? (
            <div className="grid gap-4 lg:grid-cols-[320px,1fr]">
              <Skeleton className="h-[320px] w-full rounded-3xl" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
              </div>
            </div>
          ) : pixCharge ? (
            <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
              <div className="rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.15),_transparent_55%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(241,245,249,0.98))] p-5 shadow-sm dark:border-slate-800 dark:bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.2),_transparent_55%),linear-gradient(180deg,_rgba(2,6,23,0.96),_rgba(15,23,42,0.98))]">
                <div className="rounded-[1.75rem] border border-white/80 bg-white p-5 shadow-lg shadow-emerald-950/5 dark:border-slate-700 dark:bg-slate-950">
                  <img
                    src={`data:image/png;base64,${pixCharge.brCodeBase64}`}
                    alt={`QR Code PIX do boleto ${pixBoleto.unitLabel}`}
                    className="h-full w-full rounded-2xl bg-white object-contain"
                  />
                </div>
                <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
                  Escaneie o QR Code ou use o codigo copia e cola ao lado.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Status da cobranca PIX</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${pixStatusTone[pixCharge.status]}`}>
                        {PIX_CHARGE_STATUS_LABELS[pixCharge.status]}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        Expira em {formatDateTimeBR(pixCharge.expiresAtUtc)}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" className="gap-2" onClick={() => void refreshPixCharge()} disabled={pixRefreshing}>
                    <RefreshCw className={`h-4 w-4 ${pixRefreshing ? 'animate-spin' : ''}`} />
                    {pixRefreshing ? 'Atualizando...' : 'Atualizar'}
                  </Button>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-950 dark:text-slate-50">PIX copia e cola</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Compartilhe este codigo ou use-o para pagar fora do app do banco.
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => void copyPixCode()}>
                      <Copy className="h-4 w-4" />
                      Copiar
                    </Button>
                  </div>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    <p className="break-all font-mono text-xs leading-6 text-slate-700 dark:text-slate-300">
                      {pixCharge.brCode}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Valor</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                      {formatCurrencyBRL(pixCharge.amountCents)}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Taxa da plataforma</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                      {formatCurrencyBRL(pixCharge.platformFeeCents)}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Vencimento do boleto</p>
                    <p className="mt-2 text-base font-medium text-slate-950 dark:text-slate-50">
                      {formatDateBR(pixBoleto.dueDateISO)}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Unidade</p>
                    <p className="mt-2 text-base font-medium text-slate-950 dark:text-slate-50">{pixBoleto.unitLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
              Nao foi possivel carregar a cobranca PIX deste boleto.
            </div>
          )}
        </ModalFrame>
      ) : null}
    </div>
  );
}
