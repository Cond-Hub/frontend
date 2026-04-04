"use client";

import { Building2, Check, Pencil, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import type { Building, Floor, Unit, UnitStatus } from "../../../shared/src";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Skeleton } from "../../../components/ui/skeleton";
import { dashboardApi } from "../../../src/store/useDashboardStore";
import { showToast } from "../../../src/store/useToastStore";

type ModalFrameProps = {
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
};

type BuildingFormState = {
  name: string;
};

type FloorFormState = {
  buildingId: string;
  number: string;
};

type UnitFormState = {
  floorId: string;
  label: string;
  status: UnitStatus;
};

const emptyBuildingForm: BuildingFormState = {
  name: "",
};

const emptyFloorForm: FloorFormState = {
  buildingId: "",
  number: "",
};

const emptyUnitForm: UnitFormState = {
  floorId: "",
  label: "",
  status: "GREEN",
};

const unitStatusTone: Record<UnitStatus, string> = {
  GREEN:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/80 dark:bg-emerald-950/30 dark:text-emerald-300",
  YELLOW:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/80 dark:bg-amber-950/30 dark:text-amber-300",
  RED: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/80 dark:bg-rose-950/30 dark:text-rose-300",
};

const unitStatusLabel: Record<UnitStatus, string> = {
  GREEN: "Regular",
  YELLOW: "Atencao",
  RED: "Critico",
};

function ModalFrame({
  title,
  description,
  children,
  onClose,
}: ModalFrameProps) {
  return (
    <div className="fixed inset-0 z-[90] h-dvh min-h-dvh w-screen overflow-y-auto bg-slate-950/60 backdrop-blur-sm">
      <div className="flex min-h-dvh w-full items-center justify-center p-4 py-6">
        <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">
                {title}
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-50"
              onClick={onClose}
              aria-label="Fechar modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function MapPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>();
  const [selectedFloorId, setSelectedFloorId] = useState<string>();
  const [buildingModalOpen, setBuildingModalOpen] = useState(false);
  const [floorModalOpen, setFloorModalOpen] = useState(false);
  const [unitModalOpen, setUnitModalOpen] = useState(false);
  const [buildingForm, setBuildingForm] =
    useState<BuildingFormState>(emptyBuildingForm);
  const [floorForm, setFloorForm] = useState<FloorFormState>(emptyFloorForm);
  const [unitForm, setUnitForm] = useState<UnitFormState>(emptyUnitForm);
  const [editingUnitId, setEditingUnitId] = useState<string>();
  const [editingUnitLabel, setEditingUnitLabel] = useState("");
  const [renamingUnitId, setRenamingUnitId] = useState<string>();

  const load = async () => {
    setLoading(true);

    try {
      const [nextBuildings, nextFloors, nextUnits] = await Promise.all([
        dashboardApi.map.getBuildings(),
        dashboardApi.map.getFloors(),
        dashboardApi.map.getUnits(),
      ]);
      setBuildings(nextBuildings);
      setFloors(nextFloors);
      setUnits(nextUnits);

      const fallbackBuildingId =
        selectedBuildingId &&
        nextBuildings.some((item) => item.id === selectedBuildingId)
          ? selectedBuildingId
          : nextBuildings[0]?.id;
      setSelectedBuildingId(fallbackBuildingId);

      const visibleFloors = nextFloors.filter(
        (item) => item.buildingId === fallbackBuildingId,
      );
      const fallbackFloorId =
        selectedFloorId &&
        visibleFloors.some((item) => item.id === selectedFloorId)
          ? selectedFloorId
          : visibleFloors[0]?.id;
      setSelectedFloorId(fallbackFloorId);
    } catch (loadError) {
      showToast({
        tone: "error",
        title: "Falha ao carregar mapa",
        description:
          loadError instanceof Error ? loadError.message : "Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const visibleFloors = useMemo(
    () =>
      floors
        .filter((floor) => floor.buildingId === selectedBuildingId)
        .sort((left, right) => left.number - right.number),
    [floors, selectedBuildingId],
  );

  const visibleUnits = useMemo(
    () =>
      units
        .filter((unit) => unit.floorId === selectedFloorId)
        .sort((left, right) => left.label.localeCompare(right.label)),
    [units, selectedFloorId],
  );

  const selectedBuilding = buildings.find(
    (building) => building.id === selectedBuildingId,
  );
  const selectedFloor = floors.find((floor) => floor.id === selectedFloorId);

  const stats = useMemo(() => {
    return {
      buildings: buildings.length,
      floors: floors.length,
      units: units.length,
      critical: units.filter((unit) => unit.status === "RED").length,
    };
  }, [buildings.length, floors.length, units]);

  const createBuilding = async () => {
    if (!buildingForm.name.trim()) {
      showToast({
        tone: "error",
        title: "Nome obrigatorio",
        description: "Informe o nome do bloco.",
      });
      return;
    }

    setSaving(true);
    try {
      const created = await dashboardApi.map.createBuilding(
        buildingForm.name.trim(),
      );
      showToast({
        tone: "success",
        title: "Bloco criado",
      });
      setBuildingModalOpen(false);
      setBuildingForm(emptyBuildingForm);
      setSelectedBuildingId(created.id);
      await load();
    } catch (saveError) {
      showToast({
        tone: "error",
        title: "Falha ao criar bloco",
        description:
          saveError instanceof Error ? saveError.message : "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const createFloor = async () => {
    if (!floorForm.buildingId || !floorForm.number.trim()) {
      showToast({
        tone: "error",
        title: "Campos obrigatorios",
        description: "Selecione o bloco e informe o numero do andar.",
      });
      return;
    }

    setSaving(true);
    try {
      const created = await dashboardApi.map.createFloor(
        floorForm.buildingId,
        Number(floorForm.number),
      );
      showToast({
        tone: "success",
        title: "Andar criado",
      });
      setFloorModalOpen(false);
      setFloorForm(emptyFloorForm);
      setSelectedBuildingId(created.buildingId);
      setSelectedFloorId(created.id);
      await load();
    } catch (saveError) {
      showToast({
        tone: "error",
        title: "Falha ao criar andar",
        description:
          saveError instanceof Error ? saveError.message : "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const createUnit = async () => {
    if (!unitForm.floorId || !unitForm.label.trim()) {
      showToast({
        tone: "error",
        title: "Campos obrigatorios",
        description: "Selecione o andar e informe o identificador da unidade.",
      });
      return;
    }

    setSaving(true);
    try {
      const created = await dashboardApi.map.createUnit(
        unitForm.floorId,
        unitForm.label.trim(),
        unitForm.status,
      );
      showToast({
        tone: "success",
        title: "Unidade criada",
      });
      setUnitModalOpen(false);
      setUnitForm(emptyUnitForm);
      setSelectedFloorId(created.floorId);
      await load();
    } catch (saveError) {
      showToast({
        tone: "error",
        title: "Falha ao criar unidade",
        description:
          saveError instanceof Error ? saveError.message : "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const cycleUnitStatus = async (unit: Unit) => {
    const nextStatus: UnitStatus =
      unit.status === "GREEN"
        ? "YELLOW"
        : unit.status === "YELLOW"
          ? "RED"
          : "GREEN";

    try {
      await dashboardApi.units.setStatus(unit.id, nextStatus);
      showToast({
        tone: "success",
        title: "Status da unidade atualizado",
      });
      await load();
    } catch (statusError) {
      showToast({
        tone: "error",
        title: "Falha ao atualizar unidade",
        description:
          statusError instanceof Error
            ? statusError.message
            : "Tente novamente.",
      });
    }
  };

  const startEditingUnit = (unit: Unit) => {
    setEditingUnitId(unit.id);
    setEditingUnitLabel(unit.label);
  };

  const cancelEditingUnit = () => {
    setEditingUnitId(undefined);
    setEditingUnitLabel("");
    setRenamingUnitId(undefined);
  };

  const saveUnitLabel = async (unit: Unit) => {
    const trimmedLabel = editingUnitLabel.trim();

    if (!trimmedLabel) {
      showToast({
        tone: "error",
        title: "Nome obrigatorio",
        description: "Informe o nome da unidade.",
      });
      return;
    }

    if (trimmedLabel === unit.label) {
      cancelEditingUnit();
      return;
    }

    setRenamingUnitId(unit.id);
    try {
      await dashboardApi.units.update(unit.id, trimmedLabel);
      showToast({
        tone: "success",
        title: "Unidade atualizada",
      });
      cancelEditingUnit();
      await load();
    } catch (updateError) {
      showToast({
        tone: "error",
        title: "Falha ao atualizar unidade",
        description:
          updateError instanceof Error
            ? updateError.message
            : "Tente novamente.",
      });
    } finally {
      setRenamingUnitId(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription>Blocos</CardDescription>
            <CardTitle className="text-4xl text-slate-950 dark:text-slate-50">
              {stats.buildings}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Estrutura principal cadastrada.
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription>Andares</CardDescription>
            <CardTitle className="text-4xl text-slate-950 dark:text-slate-50">
              {stats.floors}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Distribuicao vertical do condominio.
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription>Unidades</CardDescription>
            <CardTitle className="text-4xl text-slate-950 dark:text-slate-50">
              {stats.units}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Inventario total de portas e apartamentos.
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-2">
            <CardDescription>Criticas</CardDescription>
            <CardTitle className="text-4xl text-slate-950 dark:text-slate-50">
              {stats.critical}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Unidades com status vermelho.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.78fr,1.22fr]">
        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="flex flex-col gap-4 border-b border-slate-200/80 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-xl text-slate-950 dark:text-slate-50">
                Estrutura
              </CardTitle>
              <CardDescription>
                Selecione um bloco e depois um andar para navegar pelas
                unidades.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setBuildingModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Bloco
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-28 w-full rounded-2xl" />
              ))
            ) : buildings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                Nenhum bloco cadastrado.
              </div>
            ) : (
              buildings.map((building) => (
                <div
                  key={building.id}
                  className={`rounded-2xl border p-4 transition ${
                    selectedBuildingId === building.id
                      ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
                  }`}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => {
                      setSelectedBuildingId(building.id);
                      setSelectedFloorId(
                        floors
                          .filter((floor) => floor.buildingId === building.id)
                          .sort((a, b) => a.number - b.number)[0]?.id,
                      );
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                          selectedBuildingId === building.id
                            ? "bg-white/10 text-white dark:bg-slate-900 dark:text-white"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300"
                        }`}
                      >
                        <Building2 className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-semibold">{building.name}</p>
                        <p
                          className={`mt-1 text-sm ${selectedBuildingId === building.id ? "text-slate-300 dark:text-slate-600" : "text-slate-500 dark:text-slate-400"}`}
                        >
                          {
                            floors.filter(
                              (floor) => floor.buildingId === building.id,
                            ).length
                          }{" "}
                          andar(es)
                        </p>
                      </div>
                    </div>
                  </button>

                  {selectedBuildingId === building.id ? (
                    <div className="mt-4 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {visibleFloors.map((floor) => (
                          <button
                            key={floor.id}
                            type="button"
                            onClick={() => setSelectedFloorId(floor.id)}
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                              selectedFloorId === floor.id
                                ? "border-white bg-white/10 text-white dark:border-slate-900 dark:bg-slate-900 dark:text-slate-100"
                                : "border-white/20 text-slate-300 dark:border-slate-700 dark:text-slate-600"
                            }`}
                          >
                            Andar {floor.number}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setFloorForm((prev) => ({
                              ...prev,
                              buildingId: building.id,
                            }));
                            setFloorModalOpen(true);
                          }}
                          className={`flex gap-1 rounded-full border px-3 py-1.5 text-xs font-medium border-white/20 text-slate-300 dark:border-slate-700 dark:text-slate-600`}
                          >
                          <Plus className="h-4 w-4" />
                          Andar
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800">
          <CardHeader className="flex flex-col gap-4 border-b border-slate-200/80 dark:border-slate-800 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-xl text-slate-950 dark:text-slate-50">
                {selectedBuilding && selectedFloor
                  ? `${selectedBuilding.name} • Andar ${selectedFloor.number}`
                  : "Unidades"}
              </CardTitle>
              <CardDescription>
                Mapa operacional das unidades do andar selecionado.
              </CardDescription>
            </div>
            <Button
              className="gap-2"
              onClick={() => {
                setUnitForm((prev) => ({
                  ...prev,
                  floorId: selectedFloorId ?? visibleFloors[0]?.id ?? "",
                }));
                setUnitModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Nova unidade
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="h-36 w-full rounded-2xl" />
                ))}
              </div>
            ) : visibleUnits.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                Nenhuma unidade cadastrada para este andar.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {visibleUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {editingUnitId === unit.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editingUnitLabel}
                              onChange={(event) =>
                                setEditingUnitLabel(event.target.value)
                              }
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  void saveUnitLabel(unit);
                                }

                                if (event.key === "Escape") {
                                  event.preventDefault();
                                  cancelEditingUnit();
                                }
                              }}
                              disabled={renamingUnitId === unit.id}
                              aria-label="Nome da unidade"
                              className="h-9"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="h-8 gap-1 px-3"
                                onClick={() => void saveUnitLabel(unit)}
                                disabled={renamingUnitId === unit.id}
                              >
                                <Check className="h-4 w-4" />
                                {renamingUnitId === unit.id
                                  ? "Salvando..."
                                  : "Salvar"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1 px-3"
                                onClick={cancelEditingUnit}
                                disabled={renamingUnitId === unit.id}
                              >
                                <X className="h-4 w-4" />
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2">
                            <p className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                              {unit.label}
                            </p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 shrink-0 p-0 text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-50"
                              onClick={() => startEditingUnit(unit)}
                              aria-label={`Editar unidade ${unit.label}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {selectedBuilding?.name} • Andar{" "}
                          {selectedFloor?.number}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${unitStatusTone[unit.status]}`}
                      >
                        {unitStatusLabel[unit.status]}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Status operacional
                        </p>
                        <p className="mt-2 text-sm text-slate-950 dark:text-slate-50">
                          {unitStatusLabel[unit.status]}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className=""
                        onClick={() => void cycleUnitStatus(unit)}
                      >
                        Alternar status
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {buildingModalOpen ? (
        <ModalFrame
          title="Novo bloco"
          description="Cadastre um novo bloco ou torre dentro do condominio."
          onClose={() => {
            setBuildingModalOpen(false);
            setBuildingForm(emptyBuildingForm);
          }}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="building-name">Nome do bloco</Label>
              <Input
                id="building-name"
                value={buildingForm.name}
                onChange={(event) =>
                  setBuildingForm({ name: event.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setBuildingModalOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button onClick={() => void createBuilding()} disabled={saving}>
                {saving ? "Salvando..." : "Criar bloco"}
              </Button>
            </div>
          </div>
        </ModalFrame>
      ) : null}

      {floorModalOpen ? (
        <ModalFrame
          title="Novo andar"
          description="Adicione um novo andar a um bloco ja existente."
          onClose={() => {
            setFloorModalOpen(false);
            setFloorForm(emptyFloorForm);
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="floor-building">Bloco</Label>
              <select
                id="floor-building"
                className="input"
                value={floorForm.buildingId}
                onChange={(event) =>
                  setFloorForm((prev) => ({
                    ...prev,
                    buildingId: event.target.value,
                  }))
                }
              >
                <option value="">Selecione o bloco</option>
                {buildings.map((building) => (
                  <option key={building.id} value={building.id}>
                    {building.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor-number">Numero do andar</Label>
              <Input
                id="floor-number"
                type="number"
                value={floorForm.number}
                onChange={(event) =>
                  setFloorForm((prev) => ({
                    ...prev,
                    number: event.target.value,
                  }))
                }
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setFloorModalOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button onClick={() => void createFloor()} disabled={saving}>
                {saving ? "Salvando..." : "Criar andar"}
              </Button>
            </div>
          </div>
        </ModalFrame>
      ) : null}

      {unitModalOpen ? (
        <ModalFrame
          title="Nova unidade"
          description="Cadastre uma unidade no andar selecionado."
          onClose={() => {
            setUnitModalOpen(false);
            setUnitForm(emptyUnitForm);
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="unit-floor">Andar</Label>
              <select
                id="unit-floor"
                className="input"
                value={unitForm.floorId}
                onChange={(event) =>
                  setUnitForm((prev) => ({
                    ...prev,
                    floorId: event.target.value,
                  }))
                }
              >
                <option value="">Selecione o andar</option>
                {floors
                  .slice()
                  .sort((left, right) => left.number - right.number)
                  .map((floor) => {
                    const building = buildings.find(
                      (item) => item.id === floor.buildingId,
                    );
                    return (
                      <option key={floor.id} value={floor.id}>
                        {building?.name ?? "Bloco"} • Andar {floor.number}
                      </option>
                    );
                  })}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit-label">Identificacao da unidade</Label>
              <Input
                id="unit-label"
                value={unitForm.label}
                onChange={(event) =>
                  setUnitForm((prev) => ({
                    ...prev,
                    label: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Status inicial</Label>
              <div className="grid gap-2 md:grid-cols-3">
                {(["GREEN", "YELLOW", "RED"] as UnitStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`rounded-2xl border px-4 py-3 text-left ${unitForm.status === status ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-950" : "border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-100"}`}
                    onClick={() => setUnitForm((prev) => ({ ...prev, status }))}
                  >
                    <span className="block text-sm font-medium">
                      {unitStatusLabel[status]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setUnitModalOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button onClick={() => void createUnit()} disabled={saving}>
                {saving ? "Salvando..." : "Criar unidade"}
              </Button>
            </div>
          </div>
        </ModalFrame>
      ) : null}
    </div>
  );
}
