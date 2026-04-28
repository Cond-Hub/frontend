'use client';

import { useRouter } from 'next/navigation';
import { FileText, Pencil, Plus, ReceiptText, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { ConfirmDialog } from '../../../components/ui/confirm-dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Skeleton } from '../../../components/ui/skeleton';
import { dashboardApi } from '../../../src/store/useDashboardStore';
import { useDashboardStore } from '../../../src/store/useDashboardStore';
import { showToast } from '../../../src/store/useToastStore';
import type { Building, Floor, Resident, Unit } from '../../../shared/src';

type ResidentFormState = {
  unitIds: string[];
  name: string;
  email: string;
  phone: string;
  isOwner: boolean;
};

const emptyForm: ResidentFormState = {
  unitIds: [],
  name: '',
  email: '',
  phone: '',
  isOwner: false,
};

type GroupedResident = {
  key: string;
  source: Resident;
  records: Resident[];
  units: Unit[];
};

type ModalFrameProps = {
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
};

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

export default function ResidentsPage() {
  const router = useRouter();
  const state = useDashboardStore();
  const currentUser = state.currentUserId ? state.users[state.currentUserId] : undefined;
  const canManageFinance = currentUser?.role === 'ADMIN_COMPANY' || currentUser?.role === 'SYSTEM_ADMIN';
  const [residents, setResidents] = useState<Resident[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | undefined>();
  const [residentForBoleto, setResidentForBoleto] = useState<GroupedResident | undefined>();
  const [residentForDocument, setResidentForDocument] = useState<GroupedResident | undefined>();
  const [residentToRemove, setResidentToRemove] = useState<Resident | undefined>();
  const [selectedBoletoUnitId, setSelectedBoletoUnitId] = useState('');
  const [selectedDocumentUnitId, setSelectedDocumentUnitId] = useState('');
  const [form, setForm] = useState<ResidentFormState>(emptyForm);
  const [search, setSearch] = useState('');

  const groupedResidents = useMemo<GroupedResident[]>(() => {
    const unitsById = new Map(units.map((unit) => [unit.id, unit]));
    const groups = new Map<string, GroupedResident>();

    for (const resident of residents) {
      const key = [resident.condoId, resident.name.trim().toLowerCase(), resident.email?.trim().toLowerCase() ?? '', resident.phone?.trim() ?? ''].join('::');
      const unit = unitsById.get(resident.unitId);

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          source: resident,
          records: [resident],
          units: unit ? [unit] : [],
        });
        continue;
      }

      const current = groups.get(key)!;
      current.records.push(resident);
      if (unit && !current.units.some((item) => item.id === unit.id)) {
        current.units.push(unit);
      }
    }

    return Array.from(groups.values()).sort((left, right) => left.source.name.localeCompare(right.source.name));
  }, [residents, units]);

  const filteredResidents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return groupedResidents;
    }

    return groupedResidents.filter((resident) => {
      const unitLabels = resident.units.map((unit) => unit.label).join(' ');
      return [resident.source.name, resident.source.email, resident.source.phone, unitLabels]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(term));
    });
  }, [groupedResidents, search]);

  const occupiedUnitById = useMemo(() => {
    const map = new Map<string, GroupedResident>();

    for (const resident of groupedResidents) {
      const isCurrentEditingGroup = editingResident && resident.source.id === editingResident.id;
      if (isCurrentEditingGroup) {
        continue;
      }

      for (const unit of resident.units) {
        map.set(unit.id, resident);
      }
    }

    return map;
  }, [editingResident, groupedResidents]);

  const selectableUnits = useMemo(() => {
    return units.filter((unit) => form.unitIds.includes(unit.id) || !occupiedUnitById.has(unit.id));
  }, [form.unitIds, occupiedUnitById, units]);

  const floorById = useMemo(() => new Map(floors.map((floor) => [floor.id, floor])), [floors]);
  const buildingById = useMemo(() => new Map(buildings.map((building) => [building.id, building])), [buildings]);
  const unitDescriptionById = useMemo(() => {
    return new Map(
      units.map((unit) => {
        const floor = floorById.get(unit.floorId);
        const building = floor ? buildingById.get(floor.buildingId) : undefined;
        const context = [building?.name, floor ? `Andar ${floor.number}` : undefined].filter(Boolean).join(' • ');
        return [unit.id, context ? `${unit.label} • ${context}` : unit.label];
      }),
    );
  }, [buildingById, floorById, units]);

  const load = async () => {
    setLoading(true);

    try {
      const [nextResidents, nextBuildings, nextFloors, nextUnits] = await Promise.all([
        dashboardApi.residents.list(),
        dashboardApi.map.getBuildings(),
        dashboardApi.map.getFloors(),
        dashboardApi.map.getUnits(),
      ]);
      setResidents(nextResidents);
      setBuildings(nextBuildings);
      setFloors(nextFloors);
      setUnits(nextUnits);
    } catch (loadError) {
      showToast({
        tone: 'error',
        title: 'Falha ao carregar moradores',
        description: loadError instanceof Error ? loadError.message : 'Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const openCreate = () => {
    setEditingResident(undefined);
    setForm(emptyForm);
    setIsFormOpen(true);
  };

  const openEdit = (resident: GroupedResident) => {
    setEditingResident(resident.source);
    setForm({
      unitIds: resident.units.map((unit) => unit.id),
      name: resident.source.name,
      email: resident.source.email ?? '',
      phone: resident.source.phone ?? '',
      isOwner: resident.source.isOwner,
    });
    setIsFormOpen(true);
  };

  const openBoletoFlow = (resident: GroupedResident) => {
    if (!canManageFinance) {
      return;
    }

    if (resident.units.length <= 1) {
      const unitId = resident.units[0]?.id ?? resident.source.unitId;
      router.push(`/boletos?unitId=${unitId}`);
      return;
    }

    setResidentForBoleto(resident);
    setSelectedBoletoUnitId(resident.units[0]?.id ?? resident.source.unitId);
  };

  const openDocumentFlow = (resident: GroupedResident) => {
    if (resident.units.length <= 1) {
      const unitId = resident.units[0]?.id ?? resident.source.unitId;
      router.push(`/documents?unitId=${unitId}`);
      return;
    }

    setResidentForDocument(resident);
    setSelectedDocumentUnitId(resident.units[0]?.id ?? resident.source.unitId);
  };

  const save = async () => {
    if (form.unitIds.length === 0 || !form.name.trim() || !form.email.trim()) {
      showToast({
        tone: 'error',
        title: 'Campos obrigatorios',
        description: 'Selecione ao menos uma unidade, nome e e-mail.',
      });
      return;
    }

    setSaving(true);

    try {
      if (editingResident) {
        const residentGroup = groupedResidents.find((item) => item.source.id === editingResident.id);
        if (!residentGroup) {
          throw new Error('Morador agrupado não encontrado para edição.');
        }

        const normalizedPayload = {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          isOwner: form.isOwner,
        };

        await Promise.all(
          residentGroup.records.map((record) =>
            dashboardApi.residents.update(record.id, normalizedPayload),
          ),
        );

        const existingUnitIds = residentGroup.records.map((record) => record.unitId);
        const removedUnitIds = existingUnitIds.filter((unitId) => !form.unitIds.includes(unitId));
        const addedUnitIds = form.unitIds.filter((unitId) => !existingUnitIds.includes(unitId));

        await Promise.all(
          residentGroup.records
            .filter((record) => removedUnitIds.includes(record.unitId))
            .map((record) => dashboardApi.residents.remove(record.id)),
        );

        if (addedUnitIds.length > 0) {
          await dashboardApi.residents.create({
            unitIds: addedUnitIds,
            name: normalizedPayload.name,
            email: normalizedPayload.email,
            phone: normalizedPayload.phone,
            isOwner: normalizedPayload.isOwner,
          });
        }

        showToast({
          tone: 'success',
          title: 'Morador atualizado',
        });
      } else {
        await dashboardApi.residents.create({
          unitIds: form.unitIds,
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim() || undefined,
          isOwner: form.isOwner,
        });
        showToast({
          tone: 'success',
          title: 'Morador criado',
        });
      }

      setIsFormOpen(false);
      setEditingResident(undefined);
      setForm(emptyForm);
      await load();
    } catch (saveError) {
      showToast({
        tone: 'error',
        title: 'Falha ao salvar morador',
        description: saveError instanceof Error ? saveError.message : 'Tente novamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (resident: Resident) => {
    try {
      await dashboardApi.residents.remove(resident.id);
      showToast({
        tone: 'success',
        title: 'Morador removido',
      });
      await load();
    } catch (removeError) {
      showToast({
        tone: 'error',
        title: 'Falha ao remover morador',
        description: removeError instanceof Error ? removeError.message : 'Tente novamente.',
      });
    } finally {
      setResidentToRemove(undefined);
    }
  };

  return (
    <div className="space-y-6">
      {isFormOpen ? (
        <ModalFrame
          title={editingResident ? 'Editar morador' : 'Novo morador'}
          description="Atualize os dados do morador e a unidade vinculada."
          onClose={() => {
            setIsFormOpen(false);
            setEditingResident(undefined);
            setForm(emptyForm);
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3 md:col-span-2">
              <Label>Unidades</Label>
              <div className="grid gap-2 rounded-2xl border border-slate-200 p-4 dark:border-slate-800 md:grid-cols-2">
                {selectableUnits.map((unit) => (
                  <label
                    key={unit.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={form.unitIds.includes(unit.id)}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          unitIds: event.target.checked
                            ? [...prev.unitIds, unit.id]
                            : prev.unitIds.filter((item) => item !== unit.id),
                        }))
                      }
                    />
                    <span>
                      <span className="block font-medium">{unit.label}</span>
                      <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                        {unitDescriptionById.get(unit.id)?.replace(`${unit.label} • `, '') || 'Sem contexto adicional'}
                      </span>
                    </span>
                  </label>
                ))}
                {selectableUnits.length === 0 ? (
                  <p className="md:col-span-2 text-sm text-slate-500 dark:text-slate-400">Nenhuma unidade disponível no momento.</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resident-name">Nome</Label>
              <Input id="resident-name" value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resident-email">E-mail</Label>
              <Input id="resident-email" value={form.email} onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resident-phone">Telefone</Label>
              <Input id="resident-phone" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} />
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
              <input
                type="checkbox"
                checked={form.isOwner}
                onChange={(event) => setForm((prev) => ({ ...prev, isOwner: event.target.checked }))}
              />
              Proprietário(a)
            </label>

            <div className="md:col-span-2 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingResident(undefined);
                  setForm(emptyForm);
                }}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button onClick={() => void save()} disabled={saving}>
                {saving ? 'Salvando...' : editingResident ? 'Salvar alterações' : 'Criar morador'}
              </Button>
            </div>
          </div>
        </ModalFrame>
      ) : null}

      {residentForBoleto ? (
        <ModalFrame
          title="Selecionar unidade"
          description={`Escolha a unidade de ${residentForBoleto.source.name} para anexar o boleto.`}
          onClose={() => {
            setResidentForBoleto(undefined);
            setSelectedBoletoUnitId('');
          }}
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="boleto-unit">Unidade</Label>
              <select
                id="boleto-unit"
                className="input"
                value={selectedBoletoUnitId}
                onChange={(event) => setSelectedBoletoUnitId(event.target.value)}
              >
                {residentForBoleto.units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setResidentForBoleto(undefined);
                  setSelectedBoletoUnitId('');
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  router.push(`/boletos?unitId=${selectedBoletoUnitId}`);
                  setResidentForBoleto(undefined);
                  setSelectedBoletoUnitId('');
                }}
              >
                Continuar
              </Button>
            </div>
          </div>
        </ModalFrame>
      ) : null}

      {residentForDocument ? (
        <ModalFrame
          title="Selecionar unidade"
          description={`Escolha a unidade de ${residentForDocument.source.name} para anexar o documento.`}
          onClose={() => {
            setResidentForDocument(undefined);
            setSelectedDocumentUnitId('');
          }}
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="document-unit">Unidade</Label>
              <select
                id="document-unit"
                className="input"
                value={selectedDocumentUnitId}
                onChange={(event) => setSelectedDocumentUnitId(event.target.value)}
              >
                {residentForDocument.units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setResidentForDocument(undefined);
                  setSelectedDocumentUnitId('');
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  router.push(`/documents?unitId=${selectedDocumentUnitId}`);
                  setResidentForDocument(undefined);
                  setSelectedDocumentUnitId('');
                }}
              >
                Continuar
              </Button>
            </div>
          </div>
        </ModalFrame>
      ) : null}

      <Card className="border-slate-200/80 dark:border-slate-800">
        <CardHeader className="flex flex-col gap-4 border-b border-slate-200/80 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle className="text-xl text-slate-950 dark:text-slate-50">Lista de moradores</CardTitle>
            <CardDescription>Visualização em tabela agrupada por pessoa, com unidades reunidas na mesma linha.</CardDescription>
          </div>
          <div className="flex w-full flex-col gap-3 lg:max-w-xl lg:flex-row">
            <div className="flex-1">
              <Label htmlFor="resident-search" className="sr-only">
                Buscar moradores
              </Label>
              <Input
                id="resident-search"
                placeholder="Buscar por nome, unidade ou contato"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <Button onClick={openCreate} className="gap-2 lg:self-end">
              <Plus className="h-4 w-4" />
              Novo morador
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-4 pt-6 md:hidden">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-48 w-full rounded-2xl" />)
            ) : filteredResidents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                Nenhum morador encontrado para o filtro atual.
              </div>
            ) : (
              filteredResidents.map((resident) => (
                <div key={resident.key} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-base font-semibold text-slate-950 dark:text-slate-50">{resident.source.name}</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <p><strong>Unidade:</strong> {resident.units.map((unit) => unitDescriptionById.get(unit.id) ?? unit.label).join(', ')}</p>
                    <p><strong>E-mail:</strong> {resident.source.email ?? 'Sem e-mail'}</p>
                    <p><strong>Telefone:</strong> {resident.source.phone ?? 'Sem telefone'}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap" onClick={() => openDocumentFlow(resident)}>
                      <FileText className="h-4 w-4" />
                      Anexar documento
                    </Button>
                    {canManageFinance ? (
                      <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap" onClick={() => openBoletoFlow(resident)}>
                        <ReceiptText className="h-4 w-4" />
                        Anexar boleto
                      </Button>
                    ) : null}
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => openEdit(resident)}>
                      <Pencil className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 border-rose-200 bg-rose-50/80 text-rose-600 hover:bg-rose-100 dark:border-rose-800 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-950/30" onClick={() => setResidentToRemove(resident.source)}>
                      <Trash2 className="h-4 w-4" />
                      Remover
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[960px]">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4 font-medium">Nome</th>
                  <th className="px-6 py-4 font-medium">Unidade</th>
                  <th className="px-6 py-4 font-medium">E-mail</th>
                  <th className="px-6 py-4 font-medium">Telefone</th>
                  <th className="px-6 py-4 font-medium">Perfil</th>
                  {canManageFinance ? <th className="px-6 py-4 font-medium">Financeiro</th> : null}
                  <th className="px-6 py-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index} className="border-b border-slate-200 dark:border-slate-800">
                      <td className="px-6 py-4" colSpan={canManageFinance ? 7 : 6}>
                        <div className={`grid gap-3 ${canManageFinance ? 'md:grid-cols-[1.1fr,0.8fr,1fr,0.9fr,0.7fr,0.8fr,1.1fr]' : 'md:grid-cols-[1.2fr,0.9fr,1fr,0.9fr,0.8fr,1.1fr]'}`}>
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                          {canManageFinance ? <Skeleton className="h-10 w-full" /> : null}
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredResidents.length === 0 ? (
                  <tr>
                    <td colSpan={canManageFinance ? 7 : 6} className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                      Nenhum morador encontrado para o filtro atual.
                    </td>
                  </tr>
                ) : (
                  filteredResidents.map((resident) => (
                    <tr key={resident.key} className="border-b border-slate-200 last:border-b-0 dark:border-slate-800">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-950 dark:text-slate-50">{resident.source.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex flex-wrap gap-2">
                          {resident.units.map((unit) => (
                            <span key={unit.id} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                              {unitDescriptionById.get(unit.id) ?? unit.label}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{resident.source.email ?? 'Sem e-mail'}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">{resident.source.phone ?? 'Sem telefone'}</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                          {resident.source.isOwner ? 'Proprietário(a)' : 'Morador(a)'}
                        </span>
                      </td>
                      {canManageFinance ? (
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2 whitespace-nowrap"
                            onClick={() => openBoletoFlow(resident)}
                          >
                            <ReceiptText className="h-4 w-4" />
                            Anexar boleto
                          </Button>
                        </td>
                      ) : null}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap" onClick={() => openDocumentFlow(resident)}>
                            <FileText className="h-4 w-4" />
                            Anexar documento
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2" onClick={() => openEdit(resident)}>
                            <Pencil className="h-4 w-4" />
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2 border-rose-200 bg-rose-50/80 text-rose-600 hover:bg-rose-100 dark:border-rose-800 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-950/30" onClick={() => setResidentToRemove(resident.source)}>
                            <Trash2 className="h-4 w-4" />
                            Remover
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!residentToRemove}
        title="Remover morador"
        description={residentToRemove ? `Deseja remover ${residentToRemove.name}?` : ''}
        confirmLabel="Remover"
        destructive
        onCancel={() => setResidentToRemove(undefined)}
        onConfirm={() => {
          if (residentToRemove) {
            void remove(residentToRemove);
          }
        }}
      />
    </div>
  );
}
