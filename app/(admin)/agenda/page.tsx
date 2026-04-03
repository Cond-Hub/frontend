'use client';

import { ChevronLeft, ChevronRight, Plus, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { type CommonSpace, type CommonSpaceReservation, type ImportantDate, type Resident } from '../../../../shared/src';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { ConfirmDialog } from '../../../components/ui/confirm-dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Skeleton } from '../../../components/ui/skeleton';
import { dashboardApi } from '../../../src/store/useDashboardStore';
import { showToast } from '../../../src/store/useToastStore';

type CreationKind = 'reservation' | 'other';

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
  isAllDay: boolean;
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
    };

type DragPayload = {
  itemId: string;
  targetDayKey: string;
  targetHour: number;
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
  isAllDay: false,
};

const creationOptions = [
  {
    kind: 'reservation' as const,
    title: 'Reserva de espaco',
    description: 'Agende um espaco comum e vincule um morador.',
    icon: Users,
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
    <div className="fixed inset-0 z-[90] h-dvh min-h-dvh w-screen overflow-y-auto bg-slate-950/60 backdrop-blur-sm">
      <div className="flex min-h-dvh w-full items-center justify-center p-4 py-6">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
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

function toDateTimeLocalValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
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

function createDateAtHour(day: Date, hour: number) {
  const next = new Date(day);
  next.setHours(hour, 0, 0, 0);
  return next;
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

function minutesToTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

function applyTimeToLocalDateTime(value: string, timeHHMM: string) {
  if (!value) {
    return '';
  }
  const datePart = value.slice(0, 10);
  return `${datePart}T${timeHHMM}`;
}

export default function AgendaPage() {
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [reservations, setReservations] = useState<CommonSpaceReservation[]>([]);
  const [commonSpaces, setCommonSpaces] = useState<CommonSpace[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weekAnchor, setWeekAnchor] = useState(() => new Date());
  const [creationChooserOpen, setCreationChooserOpen] = useState(false);
  const [creationPromptDate, setCreationPromptDate] = useState<Date | undefined>();
  const [activeCreateKind, setActiveCreateKind] = useState<CreationKind | undefined>();
  const [selectedItem, setSelectedItem] = useState<CalendarItem | undefined>();
  const [itemToRemove, setItemToRemove] = useState<CalendarItem | undefined>();
  const [editingDate, setEditingDate] = useState<ImportantDate | undefined>();
  const [otherForm, setOtherForm] = useState<OtherFormState>(emptyOtherForm);
  const [reservationForm, setReservationForm] = useState<ReservationFormState>(emptyReservationForm);
  const [draggingItemId, setDraggingItemId] = useState<string>();
  const [dragOverCell, setDragOverCell] = useState<string>();

  const load = async () => {
    setLoading(true);

    try {
      const weekStart = startOfWeek(weekAnchor);
      const weekEnd = addDays(weekStart, 7);
      const [nextDates, nextReservations, nextCommonSpaces, nextResidents] = await Promise.all([
        dashboardApi.dates.list(),
        dashboardApi.commonSpaceReservations.list({
          startISO: weekStart.toISOString(),
          endISO: weekEnd.toISOString(),
        }),
        dashboardApi.commonSpaces.list(),
        dashboardApi.residents.list(),
      ]);

      setDates(nextDates);
      setReservations(nextReservations);
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
  const selectedReservationSpace = useMemo(
    () => commonSpaces.find((space) => space.id === reservationForm.commonSpaceId),
    [commonSpaces, reservationForm.commonSpaceId],
  );

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

    return [...otherItems, ...reservationItems];
  }, [commonSpaceNameById, dates, reservations, weekDays]);

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
    setItemToRemove(undefined);
    setOtherForm(emptyOtherForm);
    setReservationForm(emptyReservationForm);
  };

  const removeItem = async (item: CalendarItem) => {
    setSaving(true);
    try {
      if (item.kind === 'other') {
        await dashboardApi.dates.remove(item.source.id);
        showToast({ tone: 'success', title: 'Item removido' });
      } else {
        await dashboardApi.commonSpaceReservations.remove(item.source.id);
        showToast({ tone: 'success', title: 'Reserva removida' });
      }

      setItemToRemove(undefined);
      setSelectedItem(undefined);
      await load();
    } catch (removeError) {
      showToast({
        tone: 'error',
        title: 'Falha ao remover item',
        description: removeError instanceof Error ? removeError.message : 'Tente novamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  const moveItem = async ({ itemId, targetDayKey, targetHour }: DragPayload) => {
    const item = calendarItems.find((entry) => entry.id === itemId);
    const targetDay = weekDays.find((day) => toDateKey(day) === targetDayKey);

    if (!item || !targetDay) {
      return;
    }

    const targetStart = createDateAtHour(targetDay, targetHour);

    try {
      if (item.kind === 'other') {
        await dashboardApi.dates.update(item.source.id, {
          title: item.source.title,
          dateISO: toDateTimeLocalValue(targetStart),
          type: item.source.type,
          notes: item.source.notes ?? undefined,
        });
      } else {
        const currentStart = parseDateTimeLike(item.source.startAtISO);
        const currentEnd = parseDateTimeLike(item.source.endAtISO);
        const durationMs = currentEnd.getTime() - currentStart.getTime();
        const targetEnd = new Date(targetStart.getTime() + durationMs);

        await dashboardApi.commonSpaceReservations.update(item.source.id, {
          commonSpaceId: item.source.commonSpaceId,
          title: item.source.title,
          notes: item.source.notes ?? undefined,
          startAtISO: toDateTimeLocalValue(targetStart),
          endAtISO: toDateTimeLocalValue(targetEnd),
        });
      }

      await load();
    } catch (moveError) {
      showToast({
        tone: 'error',
        title: 'Falha ao mover item',
        description: moveError instanceof Error ? moveError.message : 'Tente novamente.',
      });
    }
  };

  const beginCreateFlow = (kind: CreationKind) => {
    const baseDateISO = creationPromptDate ? toDateTimeLocalValue(creationPromptDate) : '';

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
        endAtISO: endDate ? toDateTimeLocalValue(endDate) : '',
        isAllDay: false,
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
          dateISO: otherForm.dateISO,
          type: otherForm.type.trim(),
          notes: otherForm.notes.trim() || undefined,
        });
        showToast({ tone: 'success', title: 'Evento atualizado' });
      } else {
        await dashboardApi.dates.create({
          title: otherForm.title.trim(),
          dateISO: otherForm.dateISO,
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

  useEffect(() => {
    if (!reservationForm.isAllDay || !selectedReservationSpace) {
      return;
    }

    setReservationForm((prev) => {
      const baseStart = prev.startAtISO || prev.endAtISO;
      const baseEnd = prev.endAtISO || prev.startAtISO;
      if (!baseStart && !baseEnd) {
        return prev;
      }

      const nextStart = applyTimeToLocalDateTime(baseStart || baseEnd, minutesToTime(selectedReservationSpace.openMinutes));
      const nextEnd = applyTimeToLocalDateTime(baseEnd || baseStart, minutesToTime(selectedReservationSpace.closeMinutes));

      if (nextStart === prev.startAtISO && nextEnd === prev.endAtISO) {
        return prev;
      }

      return {
        ...prev,
        startAtISO: nextStart,
        endAtISO: nextEnd,
      };
    });
  }, [reservationForm.isAllDay, selectedReservationSpace]);

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
          <CardDescription>Calendario da semana com reservas e outros compromissos.</CardDescription>
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
                          className={`relative min-h-20 border-b border-r border-slate-200 bg-white p-2 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 ${dragOverCell === `${dayKey}-${hour}` ? 'ring-2 ring-emerald-400 ring-inset' : ''}`}
                          onDragOver={(event) => {
                            event.preventDefault();
                            setDragOverCell(`${dayKey}-${hour}`);
                          }}
                          onDragLeave={() => {
                            if (dragOverCell === `${dayKey}-${hour}`) {
                              setDragOverCell(undefined);
                            }
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            const itemId = event.dataTransfer.getData('text/plain');
                            setDragOverCell(undefined);
                            if (!itemId) {
                              return;
                            }
                            void moveItem({ itemId, targetDayKey: dayKey, targetHour: hour });
                          }}
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
                              <div
                                key={item.id}
                                draggable
                                onDragStart={(event) => {
                                  event.dataTransfer.setData('text/plain', item.id);
                                  event.dataTransfer.effectAllowed = 'move';
                                  setDraggingItemId(item.id);
                                }}
                                onDragEnd={() => {
                                  setDraggingItemId(undefined);
                                  setDragOverCell(undefined);
                                }}
                                className={`relative z-10 block w-full rounded-xl border border-slate-200 bg-slate-50 p-2 pr-8 text-left shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 ${draggingItemId === item.id ? 'opacity-60' : ''}`}
                              >
                                <button
                                  type="button"
                                  aria-label="Remover item"
                                  className="absolute right-2 top-2 rounded-md p-1 text-slate-400 transition hover:bg-slate-200 hover:text-rose-600 dark:hover:bg-slate-800"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setItemToRemove(item);
                                  }}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    if (item.kind === 'other') {
                                      openEditOther(item.source);
                                      return;
                                    }
                                    setSelectedItem(item);
                                  }}
                                  className="block w-full text-left"
                                >
                                  <div className="flex items-start gap-2">
                                    <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.colorClass}`} />
                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-medium text-slate-950 dark:text-slate-50">{item.title}</p>
                                      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{item.subtitle}</p>
                                    </div>
                                  </div>
                                </button>
                              </div>
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
              {selectedReservationSpace ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Janela permitida: {minutesToTime(selectedReservationSpace.openMinutes)} ate {minutesToTime(selectedReservationSpace.closeMinutes)}
                </p>
              ) : null}
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

            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={reservationForm.isAllDay}
                  onChange={(event) => {
                    const checked = event.target.checked;
                    setReservationForm((prev) => {
                      if (!checked || !selectedReservationSpace) {
                        return { ...prev, isAllDay: checked };
                      }

                      const baseStart = prev.startAtISO || prev.endAtISO;
                      const baseEnd = prev.endAtISO || prev.startAtISO;
                      return {
                        ...prev,
                        isAllDay: true,
                        startAtISO: applyTimeToLocalDateTime(baseStart, minutesToTime(selectedReservationSpace.openMinutes)),
                        endAtISO: applyTimeToLocalDateTime(baseEnd, minutesToTime(selectedReservationSpace.closeMinutes)),
                      };
                    });
                  }}
                />
                Dia todo
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reservation-start">Inicio</Label>
              <Input
                id="reservation-start"
                type="datetime-local"
                value={reservationForm.startAtISO}
                onChange={(event) => setReservationForm((prev) => ({ ...prev, startAtISO: event.target.value }))}
                disabled={reservationForm.isAllDay}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reservation-end">Fim</Label>
              <Input
                id="reservation-end"
                type="datetime-local"
                value={reservationForm.endAtISO}
                onChange={(event) => setReservationForm((prev) => ({ ...prev, endAtISO: event.target.value }))}
                disabled={reservationForm.isAllDay}
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
          description={
            selectedItem.kind === 'reservation'
              ? 'Detalhes da reserva.'
              : 'Detalhes do item.'
          }
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
              <p><strong>Tipo:</strong> {selectedItem.source.type}</p>
              <p><strong>Data:</strong> {formatDateTimeBR(selectedItem.source.dateISO)}</p>
              <p><strong>Observacoes:</strong> {selectedItem.source.notes?.trim() || 'Sem observacoes.'}</p>
            </div>
          )}
        </ModalFrame>
      ) : null}

      <ConfirmDialog
        open={!!itemToRemove}
        title={itemToRemove?.kind === 'reservation' ? 'Remover reserva' : 'Remover item'}
        description={
          itemToRemove
            ? itemToRemove.kind === 'reservation'
              ? `Deseja remover a reserva "${itemToRemove.title}" da agenda?`
              : `Deseja remover o item "${itemToRemove.title}" da agenda?`
            : ''
        }
        confirmLabel={saving ? 'Removendo...' : 'Remover'}
        destructive
        onCancel={() => setItemToRemove(undefined)}
        onConfirm={() => {
          if (itemToRemove && !saving) {
            void removeItem(itemToRemove);
          }
        }}
      />
    </div>
  );
}
