"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Building2, Loader2, Pencil, Plus, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { OpenCondoButton } from "@/components/admin/company-workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dashboardApi, useDashboardStore, type CustomerPortal } from "@/src/store/useDashboardStore";
import { showToast } from "@/src/store/useToastStore";
import type { User } from "@/shared/src";

type SyndicFormState = {
  condoId: string;
  name: string;
  email: string;
  password: string;
};

const emptySyndicForm: SyndicFormState = {
  condoId: "",
  name: "",
  email: "",
  password: "",
};

type SyndicManagerState = {
  condoId: string;
  condoName: string;
};

export default function MyCondosPage() {
  const searchParams = useSearchParams();
  const state = useDashboardStore();
  const currentUser = state.currentUserId ? state.users[state.currentUserId] : undefined;
  const canManageCondos = currentUser?.role === "ADMIN_COMPANY" || currentUser?.role === "SYSTEM_ADMIN";
  const [portal, setPortal] = useState<CustomerPortal>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [creatingCondo, setCreatingCondo] = useState(false);
  const [creatingSyndic, setCreatingSyndic] = useState(false);
  const [createCondoModalOpen, setCreateCondoModalOpen] = useState(false);
  const [manageSyndicsModalOpen, setManageSyndicsModalOpen] = useState(false);
  const [createSyndicModalOpen, setCreateSyndicModalOpen] = useState(false);
  const [editSyndicModalOpen, setEditSyndicModalOpen] = useState(false);
  const [deleteSyndicConfirmOpen, setDeleteSyndicConfirmOpen] = useState(false);
  const [createCondoForm, setCreateCondoForm] = useState({
    name: "",
    address: "",
    prefix: "",
  });
  const [createSyndicForm, setCreateSyndicForm] = useState<SyndicFormState>(emptySyndicForm);
  const [editSyndicForm, setEditSyndicForm] = useState<SyndicFormState>(emptySyndicForm);
  const [managedSyndics, setManagedSyndics] = useState<User[]>([]);
  const [loadingManagedSyndics, setLoadingManagedSyndics] = useState(false);
  const [savingEditedSyndic, setSavingEditedSyndic] = useState(false);
  const [deletingSyndic, setDeletingSyndic] = useState(false);
  const [syndicManager, setSyndicManager] = useState<SyndicManagerState | undefined>();
  const [editingSyndic, setEditingSyndic] = useState<User | undefined>();
  const [syndicToDelete, setSyndicToDelete] = useState<User | undefined>();

  const onboardingMode = searchParams.get("onboarding") === "1";

  const condos = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return currentUser.accessibleCondoIds
      .map((id) => state.condos[id])
      .filter(Boolean)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [currentUser, state.condos]);

  const selectedSyndicCondo = createSyndicForm.condoId ? condos.find((condo) => condo.id === createSyndicForm.condoId) : undefined;
  const managedCondo = syndicManager ? condos.find((condo) => condo.id === syndicManager.condoId) : undefined;

  const loadPortal = async () => {
    const data = await dashboardApi.saas.customerPortal();
    setPortal(data);
  };

  useEffect(() => {
    if (!canManageCondos) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(undefined);

    loadPortal()
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Não foi possível carregar os condomínios.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [canManageCondos]);

  const normalizePrefix = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);

  const loadSyndics = async (condoId: string) => {
    setLoadingManagedSyndics(true);
    try {
      const users = await dashboardApi.auth.listSyndicsByCondo(condoId);
      setManagedSyndics(users);
    } catch (err) {
      showToast({
        tone: "error",
        title: "Não foi possível carregar os síndicos",
        description: err instanceof Error ? err.message : "Tente novamente em alguns instantes.",
      });
    } finally {
      setLoadingManagedSyndics(false);
    }
  };

  const openSyndicModal = async (condoId: string) => {
    const condo = condos.find((item) => item.id === condoId);
    setSyndicManager({
      condoId,
      condoName: condo?.name ?? "Condomínio",
    });
    setManageSyndicsModalOpen(true);
    await loadSyndics(condoId);
  };

  const openCreateSyndicModal = () => {
    setCreateSyndicForm({
      condoId: syndicManager?.condoId ?? "",
      name: "",
      email: "",
      password: "",
    });
    setCreateSyndicModalOpen(true);
  };

  const openEditSyndicModal = (user: User) => {
    setEditingSyndic(user);
    setEditSyndicForm({
      condoId: syndicManager?.condoId ?? "",
      name: user.name,
      email: user.email,
      password: "",
    });
    setEditSyndicModalOpen(true);
  };

  const handleCreateCondo = async () => {
    if (!portal?.companyId || creatingCondo) {
      return;
    }

    const payload = {
      name: createCondoForm.name.trim(),
      address: createCondoForm.address.trim(),
      prefix: normalizePrefix(createCondoForm.prefix),
    };

    if (!payload.name || !payload.address || !payload.prefix) {
      showToast({
        tone: "error",
        title: "Campos obrigatórios",
        description: "Informe nome, endereço e prefixo para criar o novo condomínio.",
      });
      return;
    }

    setCreatingCondo(true);
    try {
      await dashboardApi.saas.createCompanyCondo(portal.companyId, payload);
      await loadPortal();
      setCreateCondoForm({ name: "", address: "", prefix: "" });
      setCreateCondoModalOpen(false);
      showToast({
        tone: "success",
        title: "Condomínio criado",
        description: "O novo condomínio já foi adicionado à sua carteira.",
      });
    } catch (err) {
      showToast({
        tone: "error",
        title: "Não foi possível criar o condomínio",
        description: err instanceof Error ? err.message : "Tente novamente em alguns instantes.",
      });
    } finally {
      setCreatingCondo(false);
    }
  };

  const handleCreateSyndic = async () => {
    if (!currentUser?.companyId || creatingSyndic) {
      return;
    }

    if (
      !createSyndicForm.condoId ||
      !createSyndicForm.name.trim() ||
      !createSyndicForm.email.trim() ||
      !createSyndicForm.password.trim()
    ) {
      showToast({
        tone: "error",
        title: "Campos obrigatórios",
        description: "Preencha nome, e-mail e senha para criar o síndico.",
      });
      return;
    }

    setCreatingSyndic(true);
    try {
      await dashboardApi.auth.register({
        name: createSyndicForm.name.trim(),
        email: createSyndicForm.email.trim(),
        password: createSyndicForm.password,
        role: "SYNDIC",
        companyId: currentUser.companyId,
        accessibleCondoIds: [createSyndicForm.condoId],
        residentUnitId: null,
      });
      setCreateSyndicForm(emptySyndicForm);
      setCreateSyndicModalOpen(false);
      if (syndicManager?.condoId) {
        await loadSyndics(syndicManager.condoId);
      }
      showToast({
        tone: "success",
        title: "Síndico criado",
        description: "O novo síndico já pode acessar o condomínio selecionado.",
      });
    } catch (err) {
      showToast({
        tone: "error",
        title: "Não foi possível criar o síndico",
        description: err instanceof Error ? err.message : "Tente novamente em alguns instantes.",
      });
    } finally {
      setCreatingSyndic(false);
    }
  };

  const handleUpdateSyndic = async () => {
    if (!editingSyndic || !syndicManager?.condoId || savingEditedSyndic) {
      return;
    }

    if (!editSyndicForm.name.trim() || !editSyndicForm.email.trim()) {
      showToast({
        tone: "error",
        title: "Campos obrigatórios",
        description: "Preencha nome e e-mail para atualizar o síndico.",
      });
      return;
    }

    setSavingEditedSyndic(true);
    try {
      await dashboardApi.auth.updateManagedUser(editingSyndic.id, {
        name: editSyndicForm.name.trim(),
        email: editSyndicForm.email.trim(),
        password: editSyndicForm.password.trim() || undefined,
        accessibleCondoIds: [syndicManager.condoId],
      });
      setEditSyndicModalOpen(false);
      setEditingSyndic(undefined);
      setEditSyndicForm(emptySyndicForm);
      await loadSyndics(syndicManager.condoId);
      showToast({
        tone: "success",
        title: "Síndico atualizado",
      });
    } catch (err) {
      showToast({
        tone: "error",
        title: "Não foi possível atualizar o síndico",
        description: err instanceof Error ? err.message : "Tente novamente em alguns instantes.",
      });
    } finally {
      setSavingEditedSyndic(false);
    }
  };

  const handleDeleteSyndic = async () => {
    if (!syndicToDelete || !syndicManager?.condoId || deletingSyndic) {
      return;
    }

    setDeletingSyndic(true);
    try {
      await dashboardApi.auth.deleteManagedUser(syndicToDelete.id);
      setDeleteSyndicConfirmOpen(false);
      setSyndicToDelete(undefined);
      await loadSyndics(syndicManager.condoId);
      showToast({
        tone: "success",
        title: "Síndico removido",
      });
    } catch (err) {
      showToast({
        tone: "error",
        title: "Não foi possível remover o síndico",
        description: err instanceof Error ? err.message : "Tente novamente em alguns instantes.",
      });
    } finally {
      setDeletingSyndic(false);
    }
  };

  if (!canManageCondos) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meus condomínios</CardTitle>
          <CardDescription>Esta área é exclusiva para administradores da empresa.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex min-h-48 items-center justify-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando condomínios...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meus condomínios</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {onboardingMode ? (
        <Card className="border-emerald-200 bg-emerald-50 text-emerald-950">
          <CardHeader>
            <CardTitle className="text-xl">Sua empresa foi criada</CardTitle>
            <CardDescription className="text-emerald-900/80">
              Agora voce pode continuar adicionando operacoes a carteira e delegar sindicos para cada condominio.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Meus condomínios</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Carteira operacional da empresa, com acesso e gestao por condominio.</p>
        </div>
        <Button onClick={() => setCreateCondoModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar condomínio
        </Button>
      </div>

      <div className="grid gap-4">
        <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardHeader>
            <CardTitle>Condomínios da carteira</CardTitle>
            <CardDescription>Liste, acompanhe e gerencie os condominios vinculados a sua empresa.</CardDescription>
          </CardHeader>
          <CardContent>
            {condos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                Nenhum condomínio cadastrado ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {condos.map((condo) => {
                  const condoAccent = condo.primaryColor?.trim() || "#0f766e";
                  const condoLogoUrl = condo.logoUrl?.trim();
                  const isDarkMode = state.themeMode === "dark";
                  const cardBackground = isDarkMode
                    ? `linear-gradient(135deg, ${condoAccent}38 0%, rgba(15,23,42,0.9) 34%, rgba(2,6,23,0.98) 100%)`
                    : `linear-gradient(135deg, ${condoAccent}2c 0%, rgba(255,255,255,0.94) 34%, rgba(248,250,252,0.98) 100%)`;

                  return (
                  <div
                    key={condo.id}
                    className="rounded-2xl border p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
                    style={{
                      borderColor: `${condoAccent}33`,
                      background: cardBackground,
                    }}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-sm"
                          style={{
                            backgroundColor: condoLogoUrl ? "transparent" : condoAccent,
                            boxShadow: "inset 0 0 0 1px rgba(15, 23, 42, 0.06)",
                          }}
                        >
                          {condoLogoUrl ? (
                            <img
                              src={condoLogoUrl}
                              alt={condo.name}
                              className="h-12 w-12 rounded-2xl object-contain"
                              onError={(event) => {
                                const image = event.currentTarget;
                                image.style.display = "none";
                                const fallback = image.nextElementSibling as HTMLElement | null;
                                fallback?.classList.remove("hidden");
                                fallback?.classList.add("flex");
                              }}
                            />
                          ) : null}
                          <span
                            className={`${condoLogoUrl ? "hidden" : "flex"} h-12 w-12 items-center justify-center rounded-2xl text-white`}
                            style={{ backgroundColor: condoAccent }}
                          >
                            <Building2 className="h-5 w-5" />
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-950 dark:text-slate-50">{condo.name}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{condo.address}</p>
                        </div>
                      </div>
                      <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                        {condo.prefix}.condhub.com
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                      <OpenCondoButton prefix={condo.prefix} condoId={condo.id} accessToken={state.accessToken} />
                      <Button variant="outline" size="sm" onClick={() => openSyndicModal(condo.id)}>
                        Gerenciar Síndico(s)
                      </Button>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={createCondoModalOpen}
        title="Adicionar condomínio"
        description="Crie uma nova operacao para esta empresa."
        confirmLabel={creatingCondo ? "Criando..." : "Criar condomínio"}
        cancelLabel="Cancelar"
        onCancel={() => {
          if (!creatingCondo) {
            setCreateCondoModalOpen(false);
          }
        }}
        onConfirm={() => void handleCreateCondo()}
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="new-condo-name">Nome do condomínio</Label>
            <Input
              id="new-condo-name"
              value={createCondoForm.name}
              onChange={(event) => setCreateCondoForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Ex.: Jardins Central"
              disabled={creatingCondo}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-condo-prefix">Prefixo</Label>
            <div className="flex overflow-hidden rounded-xl border border-input bg-background">
              <Input
                id="new-condo-prefix"
                value={createCondoForm.prefix}
                onChange={(event) => setCreateCondoForm((prev) => ({ ...prev, prefix: normalizePrefix(event.target.value) }))}
                placeholder="jardins-central"
                className="rounded-none border-0 shadow-none focus-visible:ring-0"
                disabled={creatingCondo}
              />
              <span className="flex items-center justify-center border-l border-border bg-slate-50 px-3 text-center text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                .condhub.com
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-condo-address">Endereço</Label>
            <Input
              id="new-condo-address"
              value={createCondoForm.address}
              onChange={(event) => setCreateCondoForm((prev) => ({ ...prev, address: event.target.value }))}
              placeholder="Rua, número, bairro e cidade"
              disabled={creatingCondo}
            />
          </div>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={manageSyndicsModalOpen}
        title={`Gerenciar síndicos${syndicManager ? ` • ${syndicManager.condoName}` : ""}`}
        description="Liste, edite, remova e cadastre até 3 síndicos por condomínio."
        confirmLabel="Fechar"
        cancelLabel="Cancelar"
        onCancel={() => {
          setManageSyndicsModalOpen(false);
          setManagedSyndics([]);
          setSyndicManager(undefined);
        }}
        onConfirm={() => {
          setManageSyndicsModalOpen(false);
          setManagedSyndics([]);
          setSyndicManager(undefined);
        }}
      >
        <div className="grid gap-4">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
            <span>{managedSyndics.length} de 3 síndicos cadastrados</span>
            <Button
              size="sm"
              onClick={openCreateSyndicModal}
              disabled={!syndicManager?.condoId || managedSyndics.length >= 3}
            >
              Criar síndico
            </Button>
          </div>
          {loadingManagedSyndics ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-8 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando síndicos...
            </div>
          ) : managedSyndics.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              Nenhum síndico cadastrado para este condomínio.
            </div>
          ) : (
            <div className="space-y-3">
              {managedSyndics.map((user) => (
                <div key={user.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-950 dark:text-slate-50">{user.name}</p>
                      <p className="truncate text-sm text-slate-600 dark:text-slate-400" title={user.email}>
                        {user.email}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                      <Button variant="outline" size="sm" onClick={() => openEditSyndicModal(user)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/30"
                        onClick={() => {
                          setSyndicToDelete(user);
                          setDeleteSyndicConfirmOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={createSyndicModalOpen}
        title="Novo síndico"
        description={selectedSyndicCondo ? `Cadastre um síndico para ${selectedSyndicCondo.name}.` : "Cadastre um síndico para o condomínio selecionado."}
        confirmLabel={creatingSyndic ? "Criando..." : "Criar síndico"}
        cancelLabel="Cancelar"
        onCancel={() => {
          if (!creatingSyndic) {
            setCreateSyndicModalOpen(false);
            setCreateSyndicForm(emptySyndicForm);
          }
        }}
        onConfirm={() => void handleCreateSyndic()}
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label>Condomínio</Label>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
              {selectedSyndicCondo ? (
                <div>
                  <p className="font-medium">{selectedSyndicCondo.name}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{selectedSyndicCondo.prefix}.condhub.com</p>
                </div>
              ) : (
                <p>Nenhum condomínio selecionado.</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-syndic-name">Nome</Label>
            <Input
              id="new-syndic-name"
              value={createSyndicForm.name}
              onChange={(event) => setCreateSyndicForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Ex.: Carlos Henrique"
              disabled={creatingSyndic}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-syndic-email">E-mail</Label>
            <Input
              id="new-syndic-email"
              type="email"
              value={createSyndicForm.email}
              onChange={(event) => setCreateSyndicForm((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="sindico@empresa.com"
              disabled={creatingSyndic}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-syndic-password">Senha inicial</Label>
            <Input
              id="new-syndic-password"
              type="password"
              value={createSyndicForm.password}
              onChange={(event) => setCreateSyndicForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Minimo de 8 caracteres"
              disabled={creatingSyndic}
            />
          </div>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={editSyndicModalOpen}
        title="Editar síndico"
        description="Atualize os dados do síndico deste condomínio."
        confirmLabel={savingEditedSyndic ? "Salvando..." : "Salvar alterações"}
        cancelLabel="Cancelar"
        onCancel={() => {
          if (!savingEditedSyndic) {
            setEditSyndicModalOpen(false);
            setEditingSyndic(undefined);
            setEditSyndicForm(emptySyndicForm);
          }
        }}
        onConfirm={() => void handleUpdateSyndic()}
      >
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="edit-syndic-name">Nome</Label>
            <Input
              id="edit-syndic-name"
              value={editSyndicForm.name}
              onChange={(event) => setEditSyndicForm((prev) => ({ ...prev, name: event.target.value }))}
              disabled={savingEditedSyndic}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-syndic-email">E-mail</Label>
            <Input
              id="edit-syndic-email"
              type="email"
              value={editSyndicForm.email}
              onChange={(event) => setEditSyndicForm((prev) => ({ ...prev, email: event.target.value }))}
              disabled={savingEditedSyndic}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-syndic-password">Nova senha</Label>
            <Input
              id="edit-syndic-password"
              type="password"
              value={editSyndicForm.password}
              onChange={(event) => setEditSyndicForm((prev) => ({ ...prev, password: event.target.value }))}
              placeholder="Deixe em branco para manter"
              disabled={savingEditedSyndic}
            />
          </div>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteSyndicConfirmOpen}
        title="Excluir síndico"
        description={syndicToDelete ? `Deseja remover ${syndicToDelete.name}?` : ""}
        confirmLabel={deletingSyndic ? "Excluindo..." : "Excluir"}
        cancelLabel="Cancelar"
        destructive
        onCancel={() => {
          if (!deletingSyndic) {
            setDeleteSyndicConfirmOpen(false);
            setSyndicToDelete(undefined);
          }
        }}
        onConfirm={() => void handleDeleteSyndic()}
      />
    </div>
  );
}
