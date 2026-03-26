'use client';

import { ChevronLeft, ChevronRight, FileText, Plus, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { type CommonSpace, type CommonSpaceReservation, type Document, type ImportantDate, type Resident } from '../../../../shared/src';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Skeleton } from '../../../components/ui/skeleton';
import { dashboardApi } from '../../../src/store/useDashboardStore';
import { showToast } from '../../../src/store/useToastStore';

type CreationKind = 'reservation' | 'document' | 'other';

type OtherFormState = {
  title: string;
  dateISO: string;
  type: string;
  notes: string;
};

type ReservationFormState = {
  commonSpaceId: string;
  residentId: string;
  title: string;
  notes: string;
  startAtISO: string;
  endAtISO: string;
};

type DocumentFormState = {
  title: string;
  category: string;
  description: string;
  expiresAtISO: string;
  file: File | null;
};

type CalendarItem =
  | {
      id: string;
      kind: 'other';
      title: string;
      startsAtISO: string;
      subtitle: string;
      colorClass: string;
      source: ImportantDate;
    }
  | {
      id: string;
      kind: 'reservation';
      title: string;
      startsAtISO: string;
      subtitle: string;
      colorClass: string;
      source: CommonSpaceReservation;
    }
  | {
      id: string;
      kind: 'document';
      title: string;
      startsAtISO: string;
      subtitle: string;
      colorClass: string;
      source: Document;
    };

type ModalFrameProps = {
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
};

const emptyOtherForm: OtherFormState = {
  title: '',
  dateISO: '',
  type: 'Outro',
  notes: '',
};

const emptyReservationForm: ReservationFormState = {
  commonSpaceId: '',
  residentId: '',
  title: '',
  notes: '',
  startAtISO: '',
  endAtISO: '',
};

const emptyDocumentForm: DocumentFormState = {
  title: '',
  category: 'Documento geral',
  description: '',
  expiresAtISO: '',
  file: null,
};

const creationOptions = [
  {
    kind: 'reservation' as const,
    title: 'Reserva de espaco',
    description: 'Agende um espaco comum e vincule um morador.',
    icon: Users,
  },
  {
    kind: 'document' as const,
    title: 'Novo documento',
    description: 'Cadastre um documento com vencimento ou data de referencia.',
    icon: FileText,
  },
  {
    kind: 'other' as const,
    title: 'Outros',
    description: 'Reunioes, manutencoes, assembleias ou compromissos gerais.',
    icon: Plus,
  },
];

const hourLabels = Array.from({ length: 24 }, (_, index) => index);
const DATE_TIME_LIKE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/;

function ModalFrame({ title, description, children, onClose }: ModalFrameProps) {
  return (
    <div className="fixed inset-0 z-[90] min-h-screen min-h-dvh w-screen overflow-y-auto bg-slate-950/60 backdrop-blur-sm">
      <div className="flex min-h-screen min-h-dvh items-center justify-center p-4 py-6">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
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

function startOfWeek(date: Date) {
  const clone = new Date(date);
  const day = clone.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  clone.setDate(clone.getDate() + diff);
  clone.setHours(0, 0, 0, 0);
  return clone;
}

function addDays(date: Date, days: number) {
  const clone = new Date(date);
  clone.setDate(clone.getDate() + days);
  return clone;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatDayLabel(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

function formatWeekLabel(date: Date) {
  const weekStart = startOfWeek(date);
  const weekEnd = addDays(weekStart, 6);
  return `${new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(weekStart)} - ${new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(weekEnd)}`;
}

function toLocalDateTimeInput(iso: string) {
  const match = DATE_TIME_LIKE_PATTERN.exec(iso);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}`;
  }
  const date = new Date(iso);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function parseDateTimeLike(value: string) {
  const match = DATE_TIME_LIKE_PATTERN.exec(value);
  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3]),
      Number(match[4]),
      Number(match[5]),
      match[6] ? Number(match[6]) : 0,
      0,
    );
  }

  return new Date(value);
}

function formatDateTimeBR(value: string) {
  const match = DATE_TIME_LIKE_PATTERN.exec(value);
  if (match) {
    return `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}`;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
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

export default function AgendaPage() {
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [reservations, setReservations] = useState<CommonSpaceReservation[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [commonSpaces, setCommonSpaces] = useState<CommonSpace[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [creationChooserOpen, setCreationChooserOpen] = useState(false);
  const [creationPromptDate, setCreationPromptDate] = useState<Date | undefined>();
  const [activeCreateKind, setActiveCreateKind] = useState<CreationKind | undefined>();
  const [selectedItem, setSelectedItem] = useState<CalendarItem | undefined>();
  const [editingDate, setEditingDate] = useState<ImportantDate | undefined>();
  const [otherForm, setOtherForm] = useState<OtherFormState>(emptyOtherForm);
  const [reservationForm, setReservationForm] = useState<ReservationFormState>(emptyReservationForm);
  const [documentForm, setDocumentForm] = useState<DocumentFormState>(emptyDocumentForm);

  const load = async () => {
    setLoading(true);

    try {
      const weekStart = startOfWeek(weekAnchor);
      const weekEnd = addDays(weekStart, 7);
      const [nextDates, nextReservations, nextDocuments, nextCommonSpaces, nextResidents] = await Promise.all([
        dashboardApi.dates.list(),
        dashboardApi.commonSpaceReservations.list({
          startISO: weekStart.toISOString(),
          endISO: weekEnd.toISOString(),
        }),
        dashboardApi.documents.list(),
        dashboardApi.commonSpaces.list(),
        dashboardApi.residents.list(),
      ]);

      setDates(nextDates);
      setReservations(nextReservations);
      setDocuments(nextDocuments);
      setCommonSpaces(nextCommonSpaces);
      setResidents(nextResidents);
    } catch (loadError) {
      showToast({
        tone: 'error',
        title: 'Falha ao carregar agenda',
        description: loadError instanceof Error ? loadError.message : 'Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [weekAnchor]);

  const groupedResidents = useMemo(() => {
    const groups = new Map<string, Resident>();
    for (const resident of residents) {
      const key = [resident.name.trim().toLowerCase(), resident.email?.trim().toLowerCase() ?? ''].join('::');
      if (!groups.has(key)) {
        groups.set(key, resident);
      }
    }
    return Array.from(groups.values()).sort((left, right) => left.name.localeCompare(right.name));
  }, [residents]);

  const commonSpaceNameById = useMemo(() => new Map(commonSpaces.map((space) => [space.id, space.name])), [commonSpaces]);
  const residentNameById = useMemo(() => new Map(groupedResidents.map((resident) => [resident.id, resident.name])), [groupedResidents]);

  const weekStart = useMemo(() => startOfWeek(weekAnchor), [weekAnchor]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);

  const calendarItems = useMemo<CalendarItem[]>(() => {
    const weekKeys = new Set(weekDays.map(toDateKey));

    const otherItems: CalendarItem[] = dates
      .filter((item) => weekKeys.has(toDateKey(parseDateTimeLike(item.dateISO))))
      .map((item) => ({
        id: `other-${item.id}`,
        kind: 'other',
        title: item.title,
        startsAtISO: item.dateISO,
        subtitle: item.type,
        colorClass: 'bg-emerald-500',
        source: item,
      }));

    const reservationItems: CalendarItem[] = reservations
      .filter((item) => weekKeys.has(toDateKey(parseDateTimeLike(item.startAtISO))))
      .map((item) => ({
        id: `reservation-${item.id}`,
        kind: 'reservation',
        title: item.title,
        startsAtISO: item.startAtISO,
        subtitle: commonSpaceNameById.get(item.commonSpaceId) ?? 'Reserva',
        colorClass: 'bg-amber-500',
        source: item,
      }));

    const documentItems: CalendarItem[] = documents
      .filter((item) => item.expiresAtISO && weekKeys.has(toDateKey(parseDateTimeLike(item.expiresAtISO))))
      .map((item) => ({
        id: `document-${item.id}`,
        kind: 'document',
        title: item.title,
        startsAtISO: item.expiresAtISO!,
        subtitle: item.category,
        colorClass: 'bg-cyan-500',
        source: item,
      }));

    return [...otherItems, ...reservationItems, ...documentItems];
  }, [commonSpaceNameById, dates, documents, reservations, weekDays]);

  const openCreationChooser = (date?: Date) => {
    setCreationChooserOpen(true);
    setCreationPromptDate(date);
    setActiveCreateKind(undefined);
  };

  const closeAllModals = () => {
    setCreationChooserOpen(false);
    setCreationPromptDate(undefined);
    setActiveCreateKind(undefined);
    setEditingDate(undefined);
    setSelectedItem(undefined);
    setOtherForm(emptyOtherForm);
    setReservationForm(emptyReservationForm);
    setDocumentForm(emptyDocumentForm);
  };

  const beginCreateFlow = (kind: CreationKind) => {
    const baseDateISO = creationPromptDate ? toLocalDateTimeInput(creationPromptDate.toISOString()) : '';

    setCreationChooserOpen(false);

    if (kind === 'reservation') {
      const endDate = creationPromptDate ? new Date(creationPromptDate) : undefined;
      if (endDate) {
        endDate.setHours(endDate.getHours() + 1);
      }

      setReservationForm({
        commonSpaceId: commonSpaces[0]?.id ?? '',
        residentId: groupedResidents[0]?.id ?? '',
        title: '',
        notes: '',
        startAtISO: baseDateISO,
        endAtISO: endDate ? toLocalDateTimeInput(endDate.toISOString()) : '',
      });
    }

    if (kind === 'document') {
      setDocumentForm({
        ...emptyDocumentForm,
        expiresAtISO: baseDateISO,
      });
    }

    if (kind === 'other') {
      setOtherForm({
        ...emptyOtherForm,
        dateISO: baseDateISO,
      });
    }

    setActiveCreateKind(kind);
  };

  const openEditOther = (item: ImportantDate) => {
    setEditingDate(item);
    setOtherForm({
      title: item.title,
      dateISO: toLocalDateTimeInput(item.dateISO),
      type: item.type,
      notes: item.notes ?? '',
    });
    setActiveCreateKind('other');
    setCreationChooserOpen(false);
    setCreationPromptDate(undefined);
  };

  const saveOther = async () => {
    if (!otherForm.title.trim() || !otherForm.dateISO || !otherForm.type.trim()) {
      showToast({
        tone: 'error',
        title: 'Campos obrigatorios',
        description: 'Preencha titulo, data e tipo.',
      });
      return;
    }

    setSaving(true);
    try {
      if (editingDate) {
        await dashboardApi.dates.update(editingDate.id, {
          title: otherForm.title.trim(),
          dateISO: new Date(otherForm.dateISO).toISOString(),
          type: otherForm.type.trim(),
          notes: otherForm.notes.trim() || undefined,
        });
        showToast({ tone: 'success', title: 'Evento atualizado' });
      } else {
        await dashboardApi.dates.create({
          title: otherForm.title.trim(),
          dateISO: new Date(otherForm.dateISO).toISOString(),
          type: otherForm.type.trim(),
          notes: otherForm.notes.trim() || undefined,
        });
        showToast({ tone: 'success', title: 'Evento criado' });
      }

      closeAllModals();
      await load();
    } catch (saveError) {
      showToast({
        tone: 'error',
        title: 'Falha ao salvar evento',
        description: saveError instanceof Error ? saveError.message : 'Tente novamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  const saveReservation = async () => {
    if (!reservationForm.commonSpaceId || !reservationForm.title.trim() || !reservationForm.startAtISO || !reservationForm.endAtISO) {
      showToast({
        tone: 'error',
        title: 'Campos obrigatorios',
        description: 'Preencha espaco, titulo, inicio e fim.',
      });
      return;
    }

    setSaving(true);
    try {
        await dashboardApi.commonSpaceReservations.create({
          commonSpaceId: reservationForm.commonSpaceId,
          title: reservationForm.title.trim(),
          notes: reservationForm.notes.trim() || undefined,
          startAtISO: reservationForm.startAtISO,
          endAtISO: reservationForm.endAtISO,
          residentId: reservationForm.residentId || undefined,
        });
      showToast({ tone: 'success', title: 'Reserva criada' });
      closeAllModals();
      await load();
    } catch (saveError) {
      showToast({
        tone: 'error',
        title: 'Falha ao criar reserva',
        description: saveError instanceof Error ? saveError.message : 'Tente novamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  const saveDocument = async () => {
    if (!documentForm.title.trim() || !documentForm.category.trim() || !documentForm.expiresAtISO) {
      showToast({
        tone: 'error',
        title: 'Campos obrigatorios',
        description: 'Preencha titulo, categoria e data.',
      });
      return;
    }

    setSaving(true);
    try {
      const fileUrl = documentForm.file ? await uploadDocumentFile(documentForm.file) : undefined;
      await dashboardApi.documents.upload({
        title: documentForm.title.trim(),
        category: documentForm.category.trim(),
        description: documentForm.description.trim() || undefined,
        expiresAtISO: new Date(documentForm.expiresAtISO).toISOString(),
        fileUrl,
      });
      showToast({ tone: 'success', title: 'Documento criado' });
      closeAllModals();
      await load();
    } catch (saveError) {
      showToast({
        tone: 'error',
        title: 'Falha ao criar documento',
        description: saveError instanceof Error ? saveError.message : 'Tente novamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Semana atual</p>
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">{formatWeekLabel(weekAnchor)}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setWeekAnchor((current) => addDays(current, -7))}>
            <ChevronLeft className="h-4 w-4" />
            Semana anterior
          </Button>
          <Button variant="outline" onClick={() => setWeekAnchor(new Date())}>
            Hoje
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setWeekAnchor((current) => addDays(current, 7))}>
            Proxima semana
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button className="gap-2" onClick={() => openCreationChooser()}>
            <Plus className="h-4 w-4" />
            Novo item
          </Button>
        </div>
      </div>

      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="border-b border-slate-200/80 dark:border-slate-800">
          <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Agenda semanal</CardTitle>
          <CardDescription>Calendario da semana com reservas, documentos e outros compromissos.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid min-w-[1120px] grid-cols-[88px_repeat(7,minmax(140px,1fr))]">
                <div className="sticky top-0 z-20 border-b border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950" />
                {weekDays.map((day) => (
                  <div key={toDateKey(day)} className="sticky top-0 z-20 border-b border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{formatDayLabel(day)}</p>
                  </div>
                ))}

                {hourLabels.map((hour) => (
                  <div key={hour} className="contents">
                    <div className="border-b border-r border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                      {String(hour).padStart(2, '0')}:00
                    </div>

                    {weekDays.map((day) => {
                      const dayKey = toDateKey(day);
                      const items = calendarItems.filter((item) => {
                        const startDate = parseDateTimeLike(item.startsAtISO);
                        return toDateKey(startDate) === dayKey && startDate.getHours() === hour;
                      });

                      return (
                        <div
                          key={`${dayKey}-${hour}`}
                          className="relative min-h-20 border-b border-r border-slate-200 bg-white p-2 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900"
                        >
                          <button
                            type="button"
                            className="absolute inset-0"
                            aria-label={`Adicionar item em ${dayKey} as ${String(hour).padStart(2, '0')}:00`}
                            onClick={() => {
                              const date = new Date(day);
                              date.setHours(hour, 0, 0, 0);
                              openCreationChooser(date);
                            }}
                          />
                          <div className="space-y-2">
                            {items.map((item) => (
                              <button
                                key={item.id}
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  if (item.kind === 'other') {
                                    openEditOther(item.source);
                                    return;
                                  }
                                  setSelectedItem(item);
                                }}
                                className="relative z-10 block w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-left shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                              >
                                <div className="flex items-start gap-2">
                                  <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.colorClass}`} />
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-slate-950 dark:text-slate-50">{item.title}</p>
                                    <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {creationChooserOpen && !activeCreateKind ? (
        <ModalFrame
          title="O que voce vai criar?"
          description="Escolha o tipo de item para abrir o formulario correto."
          onClose={closeAllModals}
        >
          <div className="grid gap-3">
            {creationOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.kind}
                  type="button"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-900"
                  onClick={() => beginCreateFlow(option.kind)}
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{option.title}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{option.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </ModalFrame>
      ) : null}

      {activeCreateKind === 'reservation' ? (
        <ModalFrame
          title="Reserva de espaco"
          description="Mesmo fluxo de agendamento de espaco, agora com selecao de morador."
          onClose={closeAllModals}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reservation-space">Espaco</Label>
              <select
                id="reservation-space"
                className="input"
                value={reservationForm.commonSpaceId}
                onChange={(event) => setReservationForm((prev) => ({ ...prev, commonSpaceId: event.target.value }))}
              >
                <option value="">Selecione o espaco</option>
                {commonSpaces.map((space) => (
                  <option key={space.id} value={space.id}>
                    {space.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reservation-resident">Morador</Label>
              <select
                id="reservation-resident"
                className="input"
                value={reservationForm.residentId}
                onChange={(event) => setReservationForm((prev) => ({ ...prev, residentId: event.target.value }))}
              >
                <option value="">Sem morador vinculado</option>
                {groupedResidents.map((resident) => (
                  <option key={resident.id} value={resident.id}>
                    {resident.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="reservation-title">Titulo</Label>
              <Input
                id="reservation-title"
                value={reservationForm.title}
                onChange={(event) => setReservationForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reservation-start">Inicio</Label>
              <Input
                id="reservation-start"
                type="datetime-local"
                value={reservationForm.startAtISO}
                onChange={(event) => setReservationForm((prev) => ({ ...prev, startAtISO: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reservation-end">Fim</Label>
              <Input
                id="reservation-end"
                type="datetime-local"
                value={reservationForm.endAtISO}
                onChange={(event) => setReservationForm((prev) => ({ ...prev, endAtISO: event.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="reservation-notes">Observacoes</Label>
              <textarea
                id="reservation-notes"
                className="input min-h-28 resize-y py-3"
                value={reservationForm.notes}
                onChange={(event) => setReservationForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3">
              <Button variant="outline" onClick={closeAllModals} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={() => void saveReservation()} disabled={saving}>
                {saving ? 'Salvando...' : 'Criar reserva'}
              </Button>
            </div>
          </div>
        </ModalFrame>
      ) : null}

      {activeCreateKind === 'document' ? (
        <ModalFrame
          title="Novo documento"
          description="Cadastre um documento com data e, se quiser, anexe o arquivo."
          onClose={closeAllModals}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="document-title">Titulo</Label>
              <Input
                id="document-title"
                value={documentForm.title}
                onChange={(event) => setDocumentForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-category">Categoria</Label>
              <Input
                id="document-category"
                value={documentForm.category}
                onChange={(event) => setDocumentForm((prev) => ({ ...prev, category: event.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-date">Data de referencia</Label>
              <Input
                id="document-date"
                type="datetime-local"
                value={documentForm.expiresAtISO}
                onChange={(event) => setDocumentForm((prev) => ({ ...prev, expiresAtISO: event.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="document-file">Arquivo</Label>
              <Input
                id="document-file"
                type="file"
                accept="application/pdf"
                onChange={(event) => setDocumentForm((prev) => ({ ...prev, file: event.target.files?.[0] ?? null }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="document-description">Descricao</Label>
              <textarea
                id="document-description"
                className="input min-h-28 resize-y py-3"
                value={documentForm.description}
                onChange={(event) => setDocumentForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3">
              <Button variant="outline" onClick={closeAllModals} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={() => void saveDocument()} disabled={saving}>
                {saving ? 'Salvando...' : 'Criar documento'}
              </Button>
            </div>
          </div>
        </ModalFrame>
      ) : null}

      {activeCreateKind === 'other' ? (
        <ModalFrame
          title={editingDate ? 'Editar item' : 'Novo item'}
          description="Use esta opcao para compromissos gerais da agenda."
          onClose={closeAllModals}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="agenda-title">Titulo</Label>
              <Input id="agenda-title" value={otherForm.title} onChange={(event) => setOtherForm((prev) => ({ ...prev, title: event.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agenda-type">Tipo</Label>
              <Input id="agenda-type" value={otherForm.type} onChange={(event) => setOtherForm((prev) => ({ ...prev, type: event.target.value }))} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="agenda-date">Data e horario</Label>
              <Input
                id="agenda-date"
                type="datetime-local"
                value={otherForm.dateISO}
                onChange={(event) => setOtherForm((prev) => ({ ...prev, dateISO: event.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="agenda-notes">Observacoes</Label>
              <textarea
                id="agenda-notes"
                className="input min-h-28 resize-y py-3"
                value={otherForm.notes}
                onChange={(event) => setOtherForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3">
              <Button variant="outline" onClick={closeAllModals} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={() => void saveOther()} disabled={saving}>
                {saving ? 'Salvando...' : editingDate ? 'Salvar alteracoes' : 'Criar item'}
              </Button>
            </div>
          </div>
        </ModalFrame>
      ) : null}

      {selectedItem ? (
        <ModalFrame
          title={selectedItem.title}
          description={selectedItem.kind === 'reservation' ? 'Detalhes da reserva.' : 'Detalhes do documento.'}
          onClose={closeAllModals}
        >
          {selectedItem.kind === 'reservation' ? (
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <p><strong>Espaco:</strong> {commonSpaceNameById.get(selectedItem.source.commonSpaceId) ?? 'Nao encontrado'}</p>
              <p><strong>Morador:</strong> {selectedItem.source.createdByUserName ?? residentNameById.get(selectedItem.source.createdByUserId) ?? 'Nao informado'}</p>
              <p><strong>Inicio:</strong> {formatDateTimeBR(selectedItem.source.startAtISO)}</p>
              <p><strong>Fim:</strong> {formatDateTimeBR(selectedItem.source.endAtISO)}</p>
              <p><strong>Observacoes:</strong> {selectedItem.source.notes?.trim() || 'Sem observacoes.'}</p>
            </div>
          ) : (
            <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
              <p><strong>Categoria:</strong> {selectedItem.source.category}</p>
              <p><strong>Data:</strong> {selectedItem.source.expiresAtISO ? formatDateTimeBR(selectedItem.source.expiresAtISO) : 'Sem data definida'}</p>
              <p><strong>Descricao:</strong> {selectedItem.source.description?.trim() || 'Sem descricao.'}</p>
            </div>
          )}
        </ModalFrame>
      ) : null}
    </div>
  );
}
