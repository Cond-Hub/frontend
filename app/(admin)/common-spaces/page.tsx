'use client';

import { CalendarDays, Clock3, DoorOpen, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { formatDateBR, type CommonSpace, type CommonSpaceReservation } from '../../../../shared/src';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { ConfirmDialog } from '../../../components/ui/confirm-dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Skeleton } from '../../../components/ui/skeleton';
import { dashboardApi } from '../../../src/store/useDashboardStore';
import { showToast } from '../../../src/store/useToastStore';

type SpaceFormState = {
  name: string;
  description: string;
  openTime: string;
  closeTime: string;
  isActive: boolean;
};

type ReservationFormState = {
  commonSpaceId: string;
  title: string;
  notes: string;
  startAtISO: string;
  endAtISO: string;
};

type ModalFrameProps = {
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
};

const emptySpaceForm: SpaceFormState = {
  name: '',
  description: '',
  openTime: '08:00',
  closeTime: '22:00',
  isActive: true,
};

const emptyReservationForm: ReservationFormState = {
  commonSpaceId: '',
  title: '',
  notes: '',
  startAtISO: '',
  endAtISO: '',
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

function minutesToTime(value: number) {
  const hours = String(Math.floor(value / 60)).padStart(2, '0');
  const minutes = String(value % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return (hours * 60) + minutes;
}

export default function CommonSpacesPage() {
  const [spaces, setSpaces] = useState<CommonSpace[]>([]);
  const [reservations, setReservations] = useState<CommonSpaceReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<CommonSpace | undefined>();
  const [spaceToRemove, setSpaceToRemove] = useState<CommonSpace | undefined>();
  const [reservationToRemove, setReservationToRemove] = useState<CommonSpaceReservation | undefined>();
  const [spaceForm, setSpaceForm] = useState<SpaceFormState>(emptySpaceForm);
  const [reservationForm, setReservationForm] = useState<ReservationFormState>(emptyReservationForm);

  const load = async () => {
    setLoading(true);

    try {
      const [nextSpaces, nextReservations] = await Promise.all([
        dashboardApi.commonSpaces.list(),
        dashboardApi.commonSpaceReservations.list(),
      ]);
      setSpaces(nextSpaces);
      setReservations(nextReservations);
    } catch (loadError) {
      showToast({
        tone: 'error',
        title: 'Falha ao carregar espacos',
        description: loadError instanceof Error ? loadError.message : 'Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const spaceNameById = useMemo(() => new Map(spaces.map((space) => [space.id, space.name])), [spaces]);
  const upcomingReservations = useMemo(
    () =>
      [...reservations]
        .sort((left, right) => new Date(left.startAtISO).getTime() - new Date(right.startAtISO).getTime())
        .slice(0, 8),
    [reservations],
  );

  const stats = useMemo(() => {
    const active = spaces.filter((space) => space.isActive).length;
    const inactive = spaces.length - active;
    return { total: spaces.length, active, inactive, reservations: reservations.length };
  }, [reservations.length, spaces]);

  const openCreateSpace = () => {
    setEditingSpace(undefined);
    setSpaceForm(emptySpaceForm);
    setIsSpaceModalOpen(true);
  };

  const openEditSpace = (space: CommonSpace) => {
    setEditingSpace(space);
    setSpaceForm({
      name: space.name,
      description: space.description ?? '',
      openTime: minutesToTime(space.openMinutes),
      closeTime: minutesToTime(space.closeMinutes),
      isActive: space.isActive,
    });
    setIsSpaceModalOpen(true);
  };

  const saveSpace = async () => {
    if (!spaceForm.name.trim()) {
      showToast({
        tone: 'error',
        title: 'Nome obrigatorio',
        description: 'Informe o nome do espaco.',
      });
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: spaceForm.name.trim(),
        description: spaceForm.description.trim() || undefined,
        openMinutes: timeToMinutes(spaceForm.openTime),
        closeMinutes: timeToMinutes(spaceForm.closeTime),
        isActive: spaceForm.isActive,
      };

      if (editingSpace) {
        await dashboardApi.commonSpaces.update(editingSpace.id, payload);
        showToast({
          tone: 'success',
          title: 'Espaco atualizado',
        });
      } else {
        await dashboardApi.commonSpaces.create(payload);
        showToast({
          tone: 'success',
          title: 'Espaco criado',
        });
      }

      setIsSpaceModalOpen(false);
      setEditingSpace(undefined);
      setSpaceForm(emptySpaceForm);
      await load();
    } catch (saveError) {
      showToast({
        tone: 'error',
        title: 'Falha ao salvar espaco',
        description: saveError instanceof Error ? saveError.message : 'Tente novamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  const removeSpace = async (space: CommonSpace) => {
    try {
      await dashboardApi.commonSpaces.remove(space.id);
      showToast({
        tone: 'success',
        title: 'Espaco removido',
      });
      await load();
    } catch (removeError) {
      showToast({
        tone: 'error',
        title: 'Falha ao remover espaco',
        description: removeError instanceof Error ? removeError.message : 'Tente novamente.',
      });
    } finally {
      setSpaceToRemove(undefined);
    }
  };

  const openCreateReservation = (commonSpaceId?: string) => {
    setReservationForm({
      ...emptyReservationForm,
      commonSpaceId: commonSpaceId ?? spaces[0]?.id ?? '',
    });
    setIsReservationModalOpen(true);
  };

  const saveReservation = async () => {
    if (!reservationForm.commonSpaceId || !reservationForm.title.trim() || !reservationForm.startAtISO || !reservationForm.endAtISO) {
      showToast({
        tone: 'error',
        title: 'Campos obrigatorios',
        description: 'Preencha espaco, titulo, inicio e fim da reserva.',
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
      });
      showToast({
        tone: 'success',
        title: 'Reserva criada',
      });
      setIsReservationModalOpen(false);
      setReservationForm(emptyReservationForm);
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

  const removeReservation = async (reservation: CommonSpaceReservation) => {
    try {
      await dashboardApi.commonSpaceReservations.remove(reservation.id);
      showToast({
        tone: 'success',
        title: 'Reserva removida',
      });
      await load();
    } catch (removeError) {
      showToast({
        tone: 'error',
        title: 'Falha ao remover reserva',
        description: removeError instanceof Error ? removeError.message : 'Tente novamente.',
      });
    } finally {
      setReservationToRemove(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription>Espacos totais</CardDescription>
            <CardTitle className="text-4xl text-slate-950 dark:text-slate-50">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">Cadastro geral de areas comuns.</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription>Ativos</CardDescription>
            <CardTitle className="text-4xl text-slate-950 dark:text-slate-50">{stats.active}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">Espacos disponiveis para uso.</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription>Inativos</CardDescription>
            <CardTitle className="text-4xl text-slate-950 dark:text-slate-50">{stats.inactive}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">Espacos temporariamente fora de uso.</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription>Reservas</CardDescription>
            <CardTitle className="text-4xl text-slate-950 dark:text-slate-50">{stats.reservations}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">Eventos e reservas registradas.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.05fr,0.95fr]">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="flex flex-col gap-4 border-b border-slate-200/80 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Espacos cadastrados</CardTitle>
              <CardDescription>Cadastro operacional com horario de funcionamento e status.</CardDescription>
            </div>
            <Button onClick={openCreateSpace} className="gap-2 lg:self-end">
              <Plus className="h-4 w-4" />
              Novo espaco
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-40 w-full rounded-2xl" />)
            ) : spaces.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                Nenhum espaco cadastrado.
              </div>
            ) : (
              spaces.map((space) => (
                <div key={space.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-950 dark:text-slate-50">{space.name}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{space.description?.trim() || 'Sem descricao cadastrada.'}</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${space.isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/80 dark:bg-emerald-950/30 dark:text-emerald-300' : 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'}`}>
                      {space.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        <Clock3 className="h-4 w-4" />
                        Funcionamento
                      </div>
                      <p className="mt-2 text-sm text-slate-950 dark:text-slate-50">
                        {minutesToTime(space.openMinutes)} ate {minutesToTime(space.closeMinutes)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        <CalendarDays className="h-4 w-4" />
                        Reservas
                      </div>
                      <p className="mt-2 text-sm text-slate-950 dark:text-slate-50">
                        {reservations.filter((item) => item.commonSpaceId === space.id).length} reserva(s)
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => openEditSpace(space)}>
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => openCreateReservation(space.id)}>
                      <Plus className="h-4 w-4" />
                      Nova reserva
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 border-rose-200 bg-rose-50/80 text-rose-600 hover:bg-rose-100 dark:border-rose-800 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-950/30" onClick={() => setSpaceToRemove(space)}>
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="flex flex-col gap-4 border-b border-slate-200/80 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Agenda de reservas</CardTitle>
              <CardDescription>Leitura direta das proximas ocupacoes dos espacos comuns.</CardDescription>
            </div>
            <Button onClick={() => openCreateReservation()} className="gap-2 lg:self-end">
              <Plus className="h-4 w-4" />
              Nova reserva
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-28 w-full rounded-2xl" />)
            ) : upcomingReservations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                Nenhuma reserva cadastrada.
              </div>
            ) : (
              upcomingReservations.map((reservation) => (
                <div key={reservation.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-slate-50">{reservation.title}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{spaceNameById.get(reservation.commonSpaceId) ?? 'Espaco nao encontrado'}</p>
                    </div>
                    <DoorOpen className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                    <p>Inicio: {formatDateBR(reservation.startAtISO)}</p>
                    <p>Fim: {formatDateBR(reservation.endAtISO)}</p>
                    <p>Criado por: {reservation.createdByUserName ?? 'Administracao'}</p>
                    <p>{reservation.notes?.trim() || 'Sem observacoes.'}</p>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="gap-2 border-rose-200 bg-rose-50/80 text-rose-600 hover:bg-rose-100 dark:border-rose-800 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-950/30" onClick={() => setReservationToRemove(reservation)}>
                      <Trash2 className="h-4 w-4" />
                      Remover reserva
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {isSpaceModalOpen ? (
        <ModalFrame
          title={editingSpace ? 'Editar espaco' : 'Novo espaco'}
          description="Cadastre o espaco comum com nome, horario e disponibilidade."
          onClose={() => {
            setIsSpaceModalOpen(false);
            setEditingSpace(undefined);
            setSpaceForm(emptySpaceForm);
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="space-name">Nome</Label>
              <Input id="space-name" value={spaceForm.name} onChange={(event) => setSpaceForm((prev) => ({ ...prev, name: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="space-open">Abertura</Label>
              <Input id="space-open" type="time" value={spaceForm.openTime} onChange={(event) => setSpaceForm((prev) => ({ ...prev, openTime: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="space-close">Fechamento</Label>
              <Input id="space-close" type="time" value={spaceForm.closeTime} onChange={(event) => setSpaceForm((prev) => ({ ...prev, closeTime: event.target.value }))} />
            </div>
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
              <input type="checkbox" checked={spaceForm.isActive} onChange={(event) => setSpaceForm((prev) => ({ ...prev, isActive: event.target.checked }))} />
              Espaco ativo
            </label>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="space-description">Descricao</Label>
              <textarea
                id="space-description"
                className="input min-h-28 resize-y py-3"
                value={spaceForm.description}
                onChange={(event) => setSpaceForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsSpaceModalOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={() => void saveSpace()} disabled={saving}>
                {saving ? 'Salvando...' : editingSpace ? 'Salvar alteracoes' : 'Criar espaco'}
              </Button>
            </div>
          </div>
        </ModalFrame>
      ) : null}

      <ConfirmDialog
        open={!!spaceToRemove}
        title="Remover espaco"
        description={spaceToRemove ? `Deseja remover o espaco ${spaceToRemove.name}?` : ''}
        confirmLabel="Remover"
        destructive
        onCancel={() => setSpaceToRemove(undefined)}
        onConfirm={() => {
          if (spaceToRemove) {
            void removeSpace(spaceToRemove);
          }
        }}
      />

      <ConfirmDialog
        open={!!reservationToRemove}
        title="Remover reserva"
        description={reservationToRemove ? `Deseja remover a reserva ${reservationToRemove.title}?` : ''}
        confirmLabel="Remover"
        destructive
        onCancel={() => setReservationToRemove(undefined)}
        onConfirm={() => {
          if (reservationToRemove) {
            void removeReservation(reservationToRemove);
          }
        }}
      />

      {isReservationModalOpen ? (
        <ModalFrame
          title="Nova reserva"
          description="Registre a ocupacao de um espaco comum."
          onClose={() => {
            setIsReservationModalOpen(false);
            setReservationForm(emptyReservationForm);
          }}
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
                {spaces.map((space) => (
                  <option key={space.id} value={space.id}>
                    {space.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reservation-title">Titulo</Label>
              <Input id="reservation-title" value={reservationForm.title} onChange={(event) => setReservationForm((prev) => ({ ...prev, title: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reservation-start">Inicio</Label>
              <Input id="reservation-start" type="datetime-local" value={reservationForm.startAtISO} onChange={(event) => setReservationForm((prev) => ({ ...prev, startAtISO: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reservation-end">Fim</Label>
              <Input id="reservation-end" type="datetime-local" value={reservationForm.endAtISO} onChange={(event) => setReservationForm((prev) => ({ ...prev, endAtISO: event.target.value }))} />
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
              <Button variant="outline" onClick={() => setIsReservationModalOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={() => void saveReservation()} disabled={saving}>
                {saving ? 'Salvando...' : 'Criar reserva'}
              </Button>
            </div>
          </div>
        </ModalFrame>
      ) : null}
    </div>
  );
}
