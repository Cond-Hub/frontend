'use client';

import { Eye, FileText, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { Document, Resident, Unit } from '../../../../shared/src';
import { formatDateBR } from '../../../../shared/src';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { ConfirmDialog } from '../../../components/ui/confirm-dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Skeleton } from '../../../components/ui/skeleton';
import { dashboardApi } from '../../../src/store/useDashboardStore';
import { showToast } from '../../../src/store/useToastStore';

type DocumentFormState = {
  unitId: string;
  title: string;
  category: string;
  description: string;
  expiresAtISO: string;
  file: File | null;
};

type ModalFrameProps = {
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
};

const emptyForm: DocumentFormState = {
  unitId: '',
  title: '',
  category: 'Luz',
  description: '',
  expiresAtISO: '',
  file: null,
};

const documentCategoryOptions = [
  'Luz',
  'Agua',
  'Gas',
  'Internet',
  'Condominio',
  'Seguro',
  'Manutencao',
  'Contrato',
  'Laudo',
  'Assembleia',
  'Outros',
];

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

function DocumentsTableSkeleton() {
  return (
    <tbody>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="border-b border-slate-200 dark:border-slate-800">
          <td className="px-6 py-4" colSpan={7}>
            <div className="grid gap-3 md:grid-cols-[1fr,1fr,0.9fr,0.8fr,0.8fr,0.8fr,1.2fr]">
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

async function uploadDocumentFile(file: File) {
  const upload = await dashboardApi.documents.createUploadUrl({
    fileName: file.name,
    contentType: file.type || 'application/pdf',
  });

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

  return upload.storageRef;
}

export default function DocumentsPage() {
  const searchParams = useSearchParams();
  const requestedUnitId = searchParams.get('unitId') ?? '';
  const autoOpenedRef = useRef(false);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | undefined>();
  const [documentToRemove, setDocumentToRemove] = useState<Document | undefined>();
  const [form, setForm] = useState<DocumentFormState>(emptyForm);

  const load = async () => {
    setLoading(true);

    try {
      const [nextDocuments, nextResidents, nextUnits] = await Promise.all([
        dashboardApi.documents.list(),
        dashboardApi.residents.list(),
        dashboardApi.map.getUnits(),
      ]);

      setDocuments(nextDocuments);
      setResidents(nextResidents);
      setUnits(nextUnits);
    } catch (error) {
      showToast({
        tone: 'error',
        title: 'Falha ao carregar documentos',
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const unitOptions = useMemo(() => {
    const unitById = new Map(units.map((unit) => [unit.id, unit]));

    return Array.from(
      residents.reduce<Map<string, { id: string; label: string }>>((acc, resident) => {
        const unit = unitById.get(resident.unitId);
        const current = acc.get(resident.unitId);
        const baseLabel = unit?.label ?? 'Unidade';

        if (!current) {
          acc.set(resident.unitId, {
            id: resident.unitId,
            label: `${baseLabel} - ${resident.name}`,
          });
          return acc;
        }

        const residentNames = current.label
          .split(' - ')[1]
          ?.split(', ')
          .filter(Boolean) ?? [];

        if (!residentNames.includes(resident.name)) {
          acc.set(resident.unitId, {
            id: resident.unitId,
            label: `${baseLabel} - ${[...residentNames, resident.name].join(', ')}`,
          });
        }

        return acc;
      }, new Map()).values(),
    ).sort((left, right) => left.label.localeCompare(right.label));
  }, [residents, units]);

  useEffect(() => {
    if (!requestedUnitId || autoOpenedRef.current || unitOptions.length === 0) {
      return;
    }

    const requestedUnitExists = unitOptions.some((unit) => unit.id === requestedUnitId);
    if (!requestedUnitExists) {
      return;
    }

    autoOpenedRef.current = true;
    setUnitFilter(requestedUnitId);
    setEditingDocument(undefined);
    setForm({
      ...emptyForm,
      unitId: requestedUnitId,
    });
    setIsFormOpen(true);
  }, [requestedUnitId, unitOptions]);

  const openCreate = () => {
    setEditingDocument(undefined);
    setForm({
      ...emptyForm,
      unitId: unitFilter || requestedUnitId || unitOptions[0]?.id || '',
    });
    setIsFormOpen(true);
  };

  const openEdit = (document: Document) => {
    setEditingDocument(document);
    setForm({
      unitId: document.unitId ?? '',
      title: document.title,
      category: document.category,
      description: document.description ?? '',
      expiresAtISO: document.expiresAtISO ? document.expiresAtISO.slice(0, 16) : '',
      file: null,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingDocument(undefined);
    setForm(emptyForm);
  };

  const filteredDocuments = useMemo(() => {
    const term = search.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesSearch =
        !term ||
        [document.title, document.category, document.description, document.unitLabel]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(term));
      const matchesUnit = !unitFilter || document.unitId === unitFilter;
      return matchesSearch && matchesUnit;
    });
  }, [documents, search, unitFilter]);

  const save = async () => {
    if (!form.unitId || !form.title.trim() || !form.category.trim() || !form.expiresAtISO) {
      showToast({
        tone: 'error',
        title: 'Campos obrigatorios',
        description: 'Preencha unidade, titulo, categoria e data.',
      });
      return;
    }

    setSaving(true);

    try {
      const fileUrl = form.file ? await uploadDocumentFile(form.file) : undefined;

      if (editingDocument) {
        await dashboardApi.documents.update(editingDocument.id, {
          unitId: form.unitId,
          title: form.title.trim(),
          category: form.category.trim(),
          description: form.description.trim() || undefined,
          expiresAtISO: new Date(form.expiresAtISO).toISOString(),
          fileUrl,
        });
        showToast({ tone: 'success', title: 'Documento atualizado' });
      } else {
        await dashboardApi.documents.upload({
          unitId: form.unitId,
          title: form.title.trim(),
          category: form.category.trim(),
          description: form.description.trim() || undefined,
          expiresAtISO: new Date(form.expiresAtISO).toISOString(),
          fileUrl,
        });
        showToast({ tone: 'success', title: 'Documento criado' });
      }

      closeForm();
      await load();
    } catch (error) {
      showToast({
        tone: 'error',
        title: editingDocument ? 'Falha ao atualizar documento' : 'Falha ao criar documento',
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (document: Document) => {
    try {
      await dashboardApi.documents.remove(document.id);
      showToast({ tone: 'success', title: 'Documento removido' });
      await load();
    } catch (error) {
      showToast({
        tone: 'error',
        title: 'Falha ao remover documento',
        description: error instanceof Error ? error.message : 'Tente novamente.',
      });
    } finally {
      setDocumentToRemove(undefined);
    }
  };

  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <ModalFrame
          title={editingDocument ? 'Editar documento' : 'Novo documento'}
          description="Cadastre ou atualize um documento vinculado a uma unidade."
          onClose={closeForm}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="document-unit">Unidade</Label>
              <select
                id="document-unit"
                className="input"
                value={form.unitId}
                onChange={(event) => setForm((prev) => ({ ...prev, unitId: event.target.value }))}
              >
                <option value="">Selecione uma unidade</option>
                {unitOptions.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="document-title">Titulo</Label>
              <Input id="document-title" value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-category">Categoria</Label>
              <select
                id="document-category"
                className="input"
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
              >
                {documentCategoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-date">Data de referencia</Label>
              <Input
                id="document-date"
                type="datetime-local"
                value={form.expiresAtISO}
                onChange={(event) => setForm((prev) => ({ ...prev, expiresAtISO: event.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="document-file">Arquivo</Label>
              <Input
                id="document-file"
                type="file"
                accept="application/pdf,image/png,image/jpeg,image/webp"
                onChange={(event) => setForm((prev) => ({ ...prev, file: event.target.files?.[0] ?? null }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="document-description">Descricao</Label>
              <textarea
                id="document-description"
                className="input min-h-28 resize-y py-3"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3">
              <Button variant="outline" onClick={closeForm} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={() => void save()} disabled={saving}>
                {saving ? 'Salvando...' : editingDocument ? 'Salvar alteracoes' : 'Criar documento'}
              </Button>
            </div>
          </div>
        </ModalFrame>
      ) : null}

      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-200/80 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="text-2xl text-slate-950 dark:text-slate-50">Documentos</CardTitle>
            <CardDescription>Lista de documentos por unidade, com edicao e remocao.</CardDescription>
          </div>
          <div className="flex w-full flex-col gap-3 lg:max-w-3xl lg:flex-row">
            <div className="flex-1">
              <Label htmlFor="document-search" className="sr-only">Buscar documentos</Label>
              <Input
                id="document-search"
                placeholder="Buscar por titulo, categoria ou unidade"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <div className="lg:w-72">
              <Label htmlFor="document-unit-filter" className="sr-only">Filtrar por unidade</Label>
              <select
                id="document-unit-filter"
                className="input"
                value={unitFilter}
                onChange={(event) => setUnitFilter(event.target.value)}
              >
                <option value="">Todas as unidades</option>
                {unitOptions.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={openCreate} className="gap-2 lg:self-end">
              <Plus className="h-4 w-4" />
              Novo documento
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4 pt-6 md:hidden">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-56 w-full rounded-2xl" />)
            ) : filteredDocuments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                Nenhum documento encontrado para o filtro atual.
              </div>
            ) : (
              filteredDocuments.map((document) => (
                <div key={document.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-base font-semibold text-slate-950 dark:text-slate-50">{document.title}</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <p><strong>Unidade:</strong> {document.unitLabel ?? 'Sem unidade'}</p>
                    <p><strong>Categoria:</strong> {document.category}</p>
                    <p><strong>Referencia:</strong> {document.expiresAtISO ? formatDateBR(document.expiresAtISO) : 'Sem data'}</p>
                    <p><strong>Descricao:</strong> {document.description?.trim() || 'Sem descricao'}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {document.fileUrl ? (
                      <a href={document.fileUrl} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Eye className="h-4 w-4" />
                          Abrir arquivo
                        </Button>
                      </a>
                    ) : null}
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => openEdit(document)}>
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 border-rose-200 bg-rose-50/80 text-rose-600 hover:bg-rose-100 dark:border-rose-800 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-950/30" onClick={() => setDocumentToRemove(document)}>
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1080px]">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4 font-medium">Titulo</th>
                  <th className="px-6 py-4 font-medium">Unidade</th>
                  <th className="px-6 py-4 font-medium">Categoria</th>
                  <th className="px-6 py-4 font-medium">Referencia</th>
                  <th className="px-6 py-4 font-medium">Enviado em</th>
                  <th className="px-6 py-4 font-medium">Arquivo</th>
                  <th className="px-6 py-4 font-medium text-right">Acoes</th>
                </tr>
              </thead>
              {loading ? (
                <DocumentsTableSkeleton />
              ) : (
                <tbody>
                  {filteredDocuments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                        Nenhum documento encontrado para o filtro atual.
                      </td>
                    </tr>
                  ) : (
                    filteredDocuments.map((document) => (
                      <tr key={document.id} className="border-b border-slate-200 last:border-b-0 dark:border-slate-800">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-slate-950 dark:text-slate-50">{document.title}</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{document.description?.trim() || 'Sem descricao'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{document.unitLabel ?? 'Sem unidade'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{document.category}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{document.expiresAtISO ? formatDateBR(document.expiresAtISO) : 'Sem data'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{formatDateBR(document.uploadedAtISO)}</td>
                        <td className="px-6 py-4">
                          {document.fileUrl ? (
                            <a href={document.fileUrl} target="_blank" rel="noreferrer">
                              <Button variant="outline" size="sm" className="gap-2">
                                <Eye className="h-4 w-4" />
                                Abrir
                              </Button>
                            </a>
                          ) : (
                            <span className="text-sm text-slate-500 dark:text-slate-400">Sem arquivo</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" className="gap-2" onClick={() => openEdit(document)}>
                              <Pencil className="h-4 w-4" />
                              Editar
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2 border-rose-200 bg-rose-50/80 text-rose-600 hover:bg-rose-100 dark:border-rose-800 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-950/30" onClick={() => setDocumentToRemove(document)}>
                              <Trash2 className="h-4 w-4" />
                              Remover
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              )}
            </table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(documentToRemove)}
        title="Remover documento"
        description={documentToRemove ? `Deseja remover ${documentToRemove.title}?` : ''}
        confirmLabel="Remover"
        destructive
        onCancel={() => setDocumentToRemove(undefined)}
        onConfirm={() => {
          if (documentToRemove) {
            void remove(documentToRemove);
          }
        }}
      />
    </div>
  );
}
