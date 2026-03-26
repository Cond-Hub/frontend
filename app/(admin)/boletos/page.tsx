'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Eye, FilePlus2, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { formatDateBR, type Boleto, type Unit } from '../../../../shared/src';
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

const statusLabel: Record<Boleto['status'], string> = {
  OPEN: 'Aberto',
  OVERDUE: 'Em atraso',
  PAID: 'Pago',
};

function ModalFrame({ title, description, children, onClose }: ModalFrameProps) {
  return (
    <div className="fixed inset-0 z-[90] min-h-screen min-h-dvh w-screen overflow-y-auto bg-slate-950/60 backdrop-blur-sm">
      <div className="flex min-h-screen min-h-dvh items-center justify-center p-4 py-6">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">{title}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
          </div>
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0" onClick={onClose} aria-label="Fechar modal">
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
    });
    setIsFormOpen(true);
  };

  const openEdit = (boleto: Boleto) => {
    setEditingBoleto(boleto);
    setForm({
      unitId: boleto.unitId,
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
    if (!form.unitId || !form.referenceMonthISO || !form.dueDateISO) {
      showToast({
        tone: 'error',
        title: 'Campos obrigatorios',
        description: 'Preencha unidade, competencia e vencimento.',
      });
      return;
    }

    if (!editingBoleto && form.files.length === 0) {
      showToast({
        tone: 'error',
        title: 'Arquivo obrigatorio',
        description: 'Adicione pelo menos um PDF para criar o boleto.',
      });
      return;
    }

    setSaving(true);

    try {
      const uploadedUrls = form.files.length > 0 ? await uploadBoletoFiles(form.files) : [];

      if (editingBoleto) {
        await dashboardApi.boletos.update(editingBoleto.id, {
          unitId: form.unitId,
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
                    <p><strong>Competencia:</strong> {toMonthInputValue(boleto.referenceMonthISO)}</p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone[boleto.status]}`}>
                        {statusLabel[boleto.status]}
                      </span>
                    </p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => void toggleStatus(boleto)}>
                      <Check className="h-4 w-4" />
                      {boleto.status === 'PAID' ? 'Reabrir' : 'Marcar pago'}
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => openEdit(boleto)}>
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-rose-700 dark:text-rose-300" onClick={() => setBoletoToRemove(boleto)}>
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
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
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
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{toMonthInputValue(boleto.referenceMonthISO)}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{formatDateBR(boleto.dueDateISO)}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone[boleto.status]}`}>
                            {statusLabel[boleto.status]}
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
                            ) : (
                              <Link
                                href={boleto.fileUrl}
                                target="_blank"
                                className="inline-flex items-center gap-2 text-sm text-slate-900 hover:text-slate-700 dark:text-slate-100 dark:hover:text-slate-300"
                              >
                                <Eye className="h-4 w-4" />
                                Visualizar PDF
                              </Link>
                            )}
                            {boleto.files.length > 2 ? (
                              <p className="text-xs text-slate-500 dark:text-slate-400">+{boleto.files.length - 2} arquivo(s)</p>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{boleto.notes?.trim() || 'Sem observacoes'}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => void toggleStatus(boleto)}>
                              <Check className="h-4 w-4" />
                              {boleto.status === 'PAID' ? 'Reabrir' : 'Marcar pago'}
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => openEdit(boleto)}>
                              <Pencil className="h-4 w-4" />
                              Editar
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2 text-rose-700 dark:text-rose-300" onClick={() => setBoletoToRemove(boleto)}>
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
              : 'Cadastre um novo boleto com unidade, competencia, vencimento e arquivo PDF.'
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
                {editingBoleto ? 'Voce pode anexar novos PDFs mantendo os arquivos atuais.' : 'Envie um ou mais PDFs do boleto.'}
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
    </div>
  );
}
