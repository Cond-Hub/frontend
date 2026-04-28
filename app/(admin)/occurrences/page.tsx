'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle2, Clock3, Eye, Filter, GripVertical, X } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  formatDateBR,
  OCCURRENCE_STATUS_LABELS,
  PRIORITY_LABELS,
  type Occurrence,
  type OccurrencePriority,
  type OccurrenceStatus,
  type Unit,
} from '../../../shared/src';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Skeleton } from '../../../components/ui/skeleton';
import { dashboardApi } from '../../../src/store/useDashboardStore';
import { showToast } from '../../../src/store/useToastStore';

type ModalFrameProps = {
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
};

const statusColumns: OccurrenceStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const statusTone: Record<OccurrenceStatus, string> = {
  OPEN: 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/80 dark:bg-rose-950/30 dark:text-rose-300',
  IN_PROGRESS: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/80 dark:bg-amber-950/30 dark:text-amber-300',
  RESOLVED: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/80 dark:bg-emerald-950/30 dark:text-emerald-300',
  CLOSED: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
};

const priorityTone: Record<OccurrencePriority, string> = {
  HIGH: 'text-rose-700 dark:text-rose-300',
  MEDIUM: 'text-amber-700 dark:text-amber-300',
  LOW: 'text-slate-600 dark:text-slate-300',
};

function ModalFrame({ title, description, children, onClose }: ModalFrameProps) {
  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" />
      <div className="relative h-full w-full overflow-y-auto">
        <div className="flex min-h-screen w-full items-center justify-center p-4 py-6">
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
    </div>
  );
}

function OccurrenceBoardSkeleton() {
  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, columnIndex) => (
        <Card key={columnIndex} className="border-slate-200/80 dark:border-slate-800">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((__, itemIndex) => (
              <Skeleton key={itemIndex} className="h-32 w-full rounded-2xl" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function OccurrencesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedOccurrenceId = searchParams.get('occurrenceId') ?? '';
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string>();
  const [draggingId, setDraggingId] = useState<string>();
  const [dragOverStatus, setDragOverStatus] = useState<OccurrenceStatus | undefined>();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | OccurrencePriority>('ALL');
  const [unitFilter, setUnitFilter] = useState('');
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | undefined>();

  const load = async () => {
    setLoading(true);

    try {
      const [nextOccurrences, nextUnits] = await Promise.all([
        dashboardApi.occurrences.list(),
        dashboardApi.map.getUnits(),
      ]);
      setOccurrences(nextOccurrences);
      setUnits(nextUnits);
    } catch (loadError) {
      showToast({
        tone: 'error',
        title: 'Falha ao carregar ocorrências',
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
    if (!requestedOccurrenceId || occurrences.length === 0) {
      return;
    }

    const requestedOccurrence = occurrences.find((item) => item.id === requestedOccurrenceId);
    if (!requestedOccurrence) {
      return;
    }

    if (requestedOccurrence.unitId) {
      setUnitFilter(requestedOccurrence.unitId);
    }

    setSelectedOccurrence(requestedOccurrence);
  }, [occurrences, requestedOccurrenceId]);

  const unitLabelById = useMemo(() => new Map(units.map((unit) => [unit.id, unit.label])), [units]);

  const filteredOccurrences = useMemo(() => {
    const term = search.trim().toLowerCase();

    return occurrences.filter((occurrence) => {
      if (priorityFilter !== 'ALL' && occurrence.priority !== priorityFilter) {
        return false;
      }

      if (unitFilter && occurrence.unitId !== unitFilter) {
        return false;
      }

      if (!term) {
        return true;
      }

      const unitLabel = occurrence.unitId ? unitLabelById.get(occurrence.unitId) ?? '' : '';
      return [occurrence.title, occurrence.description, occurrence.category, unitLabel]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term));
    });
  }, [occurrences, priorityFilter, search, unitFilter, unitLabelById]);

  const stats = useMemo(() => {
    const open = occurrences.filter((item) => item.status === 'OPEN').length;
    const inProgress = occurrences.filter((item) => item.status === 'IN_PROGRESS').length;
    const resolved = occurrences.filter((item) => item.status === 'RESOLVED').length;
    const highPriority = occurrences.filter((item) => item.priority === 'HIGH').length;

    return { open, inProgress, resolved, highPriority };
  }, [occurrences]);

  const occurrencesByStatus = useMemo(() => {
    return statusColumns.map((status) => ({
      status,
      items: filteredOccurrences.filter((occurrence) => occurrence.status === status),
    }));
  }, [filteredOccurrences]);

  const moveOccurrence = async (occurrenceId: string, nextStatus: OccurrenceStatus) => {
    const currentOccurrence = occurrences.find((item) => item.id === occurrenceId);
    if (!currentOccurrence || currentOccurrence.status === nextStatus) {
      return;
    }

    setUpdatingId(occurrenceId);
    const previousOccurrences = occurrences;
    setOccurrences((current) =>
      current.map((item) => (item.id === occurrenceId ? { ...item, status: nextStatus } : item)),
    );

    try {
      await dashboardApi.occurrences.updateStatus(occurrenceId, nextStatus);
      showToast({
        tone: 'success',
        title: 'Ocorrência atualizada',
        description: `Movida para ${OCCURRENCE_STATUS_LABELS[nextStatus].toLowerCase()}.`,
      });
    } catch (statusError) {
      setOccurrences(previousOccurrences);
      showToast({
        tone: 'error',
        title: 'Falha ao atualizar ocorrência',
        description: statusError instanceof Error ? statusError.message : 'Tente novamente.',
      });
    } finally {
      setUpdatingId(undefined);
      setDraggingId(undefined);
      setDragOverStatus(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription>Abertas</CardDescription>
            <CardTitle className="text-4xl text-slate-950 dark:text-slate-50">{stats.open}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">Itens que ainda precisam entrar em fluxo.</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription>Em andamento</CardDescription>
            <CardTitle className="text-4xl text-slate-950 dark:text-slate-50">{stats.inProgress}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">Chamados em tratamento pela administração.</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription>Resolvidas</CardDescription>
            <CardTitle className="text-4xl text-slate-950 dark:text-slate-50">{stats.resolved}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">Itens já encerrados tecnicamente.</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription>Alta prioridade</CardDescription>
            <CardTitle className="text-4xl text-slate-950 dark:text-slate-50">{stats.highPriority}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">Itens que pedem triagem imediata.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-200/80 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Quadro de ocorrências</CardTitle>
            <CardDescription>Arraste os cards entre colunas para mover o chamado no fluxo.</CardDescription>
          </div>

          <div className="flex w-full flex-col gap-3 lg:max-w-4xl lg:flex-row lg:items-end">
            <div className="flex-1">
              <Label htmlFor="occurrence-search" className="sr-only">
                Buscar ocorrências
              </Label>
              <Input
                id="occurrence-search"
                placeholder="Buscar por título, descrição, categoria ou unidade"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="w-full lg:w-44">
              <Label htmlFor="occurrence-priority">Prioridade</Label>
              <select
                id="occurrence-priority"
                className="input"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value as 'ALL' | OccurrencePriority)}
              >
                <option value="ALL">Todas</option>
                <option value="HIGH">Alta</option>
                <option value="MEDIUM">Media</option>
                <option value="LOW">Baixa</option>
              </select>
            </div>

            <div className="w-full lg:w-52">
              <Label htmlFor="occurrence-unit">Unidade</Label>
              <select
                id="occurrence-unit"
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
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {loading ? <OccurrenceBoardSkeleton /> : null}

          {!loading ? (
            <div className="grid gap-4 xl:grid-cols-4">
              {occurrencesByStatus.map((column) => (
                <Card
                  key={column.status}
                  className={`border-slate-200/80 bg-slate-50/60 transition-colors dark:border-slate-800 dark:bg-slate-900/30 ${
                    dragOverStatus === column.status ? 'ring-2 ring-slate-300 dark:ring-slate-700' : ''
                  }`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverStatus(column.status);
                  }}
                  onDragLeave={() => setDragOverStatus((current) => (current === column.status ? undefined : current))}
                  onDrop={(event) => {
                    event.preventDefault();
                    const occurrenceId = event.dataTransfer.getData('text/plain');
                    if (occurrenceId) {
                      void moveOccurrence(occurrenceId, column.status);
                    }
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg text-slate-950 dark:text-slate-50">{OCCURRENCE_STATUS_LABELS[column.status]}</CardTitle>
                        <CardDescription>{column.items.length} item(ns)</CardDescription>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone[column.status]}`}>
                        {column.items.length}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {column.items.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                        Nenhuma ocorrência nesta etapa.
                      </div>
                    ) : null}

                    {column.items.map((occurrence) => (
                      <div
                        key={occurrence.id}
                        draggable={updatingId !== occurrence.id}
                        onDragStart={(event) => {
                          event.dataTransfer.setData('text/plain', occurrence.id);
                          event.dataTransfer.effectAllowed = 'move';
                          setDraggingId(occurrence.id);
                        }}
                        onDragEnd={() => {
                          setDraggingId(undefined);
                          setDragOverStatus(undefined);
                        }}
                        className={`rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 ${
                          draggingId === occurrence.id ? 'opacity-50' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            <GripVertical className="mt-0.5 h-4 w-4 text-slate-400" />
                            <div>
                              <p className="font-semibold text-slate-950 dark:text-slate-50">{occurrence.title}</p>
                              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{occurrence.category}</p>
                            </div>
                          </div>
                          <span className={`text-xs font-medium ${priorityTone[occurrence.priority]}`}>{PRIORITY_LABELS[occurrence.priority]}</span>
                        </div>

                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{occurrence.description}</p>

                        <div className="mt-4 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <p>Unidade: {occurrence.unitId ? unitLabelById.get(occurrence.unitId) ?? occurrence.unitId : 'Não vinculada'}</p>
                          <p>Atualizado em {formatDateBR(occurrence.updatedAtISO)}</p>
                          <p>{occurrence.attachments.length} anexo(s)</p>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" className="gap-2" onClick={() => setSelectedOccurrence(occurrence)}>
                            <Eye className="h-4 w-4" />
                            Ver detalhe
                          </Button>
                          <div className="flex flex-wrap gap-2 md:hidden">
                            {statusColumns
                              .filter((status) => status !== occurrence.status)
                              .map((status) => (
                                <Button
                                  key={status}
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  disabled={updatingId === occurrence.id}
                                  onClick={() => void moveOccurrence(occurrence.id, status)}
                                >
                                  {status === 'CLOSED' ? <CheckCircle2 className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                                  {OCCURRENCE_STATUS_LABELS[status]}
                                </Button>
                              ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {selectedOccurrence ? (
        <ModalFrame
          title={selectedOccurrence.title}
          description="Detalhes completos da ocorrência, contexto e anexos."
          onClose={() => {
            setSelectedOccurrence(undefined);
            if (requestedOccurrenceId) {
              router.replace('/occurrences');
            }
          }}
        >
          <div className="space-y-6">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</p>
                <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-slate-50">{OCCURRENCE_STATUS_LABELS[selectedOccurrence.status]}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Prioridade</p>
                <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-slate-50">{PRIORITY_LABELS[selectedOccurrence.priority]}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Categoria</p>
                <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-slate-50">{selectedOccurrence.category}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Unidade</p>
                <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-slate-50">
                  {selectedOccurrence.unitId ? unitLabelById.get(selectedOccurrence.unitId) ?? selectedOccurrence.unitId : 'Não vinculada'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/50">
              <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">{selectedOccurrence.description}</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Criada em</p>
                <p className="mt-2 text-sm text-slate-950 dark:text-slate-50">{formatDateBR(selectedOccurrence.createdAtISO)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Atualizada em</p>
                <p className="mt-2 text-sm text-slate-950 dark:text-slate-50">{formatDateBR(selectedOccurrence.updatedAtISO)}</p>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                <Filter className="h-4 w-4" />
                Anexos
              </div>

              {selectedOccurrence.attachments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                  Esta ocorrência não possui anexos.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedOccurrence.attachments.map((attachment) => (
                    <Link
                      key={attachment.id}
                      href={attachment.fileUrl}
                      target="_blank"
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-900"
                    >
                      <span>{attachment.fileName ?? 'Abrir anexo'}</span>
                      <Clock3 className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ModalFrame>
      ) : null}
    </div>
  );
}
