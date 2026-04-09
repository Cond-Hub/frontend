"use client";

import { useEffect, useState } from "react";

import { CondoHomeBrandImage } from "@/components/brand/condohome-brand-image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDashboardStore } from "@/src/store/useDashboardStore";

const DEFAULT_PRIMARY = "#0f766e";

const normalizeEmpty = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const LOGO_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_LOGO_DATA_URL_LENGTH = 500_000;

export default function SettingsPage() {
  const state = useDashboardStore();
  const activeCondo = state.activeCondoId ? state.condos[state.activeCondoId] : undefined;
  const currentUser = state.currentUserId ? state.users[state.currentUserId] : undefined;
  const canManageBranding = currentUser?.role === "ADMIN_COMPANY" || currentUser?.role === "SYSTEM_ADMIN";
  const [primaryColor, setPrimaryColor] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>();
  const [pendingLogoFile, setPendingLogoFile] = useState<File>();
  const [logoInputKey, setLogoInputKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    setPrimaryColor(activeCondo?.primaryColor ?? "");
    setLogoUrl(activeCondo?.logoUrl ?? "");
    setLogoPreviewUrl(undefined);
    setPendingLogoFile(undefined);
    setMessage(undefined);
    setError(undefined);
  }, [activeCondo?.id, activeCondo?.primaryColor, activeCondo?.logoUrl]);

  const previewPrimary = primaryColor || DEFAULT_PRIMARY;

  const persist = async (next?: { primaryColor?: string; logoUrl?: string }) => {
    const nextPrimary = next?.primaryColor ?? primaryColor;

    setSaving(true);
    setError(undefined);
    setMessage(undefined);
    try {
      let nextLogo = next?.logoUrl ?? logoUrl;
      if (pendingLogoFile) {
        const upload = await state.createCondoBrandingUploadUrl({
          fileName: pendingLogoFile.name,
          contentType: pendingLogoFile.type || "image/png",
        });

        const response = await fetch(upload.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": pendingLogoFile.type || "image/png",
          },
          body: pendingLogoFile,
        });

        if (!response.ok) {
          throw new Error("Não foi possível enviar a logo para o storage.");
        }

        nextLogo = upload.storageRef;
      }

      await state.updateCondoBranding({
        primaryColor: normalizeEmpty(nextPrimary),
        logoUrl: normalizeEmpty(nextLogo),
      });
      setPendingLogoFile(undefined);
      setLogoPreviewUrl(undefined);
      setLogoInputKey((value) => value + 1);
      setMessage("Configurações salvas.");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar as configurações.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const save = async () => {
    await persist();
  };

  const resetField = async (field: "primaryColor" | "logoUrl") => {
    const next = {
      primaryColor,
      logoUrl,
      [field]: "",
    };

    if (field === "primaryColor") {
      setPrimaryColor("");
    } else {
      setLogoUrl("");
      setLogoPreviewUrl(undefined);
      setPendingLogoFile(undefined);
      setLogoInputKey((value) => value + 1);
    }

    if (await persist(next)) {
      setMessage("Configuração restaurada para o padrão.");
    }
  };

  const handleLogoFile = (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!LOGO_FILE_TYPES.includes(file.type)) {
      setError("A logo deve ser um arquivo JPEG, JPG, PNG ou WEBP.");
      setLogoInputKey((value) => value + 1);
      return;
    }

    setError(undefined);
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result || result.length > MAX_LOGO_DATA_URL_LENGTH) {
        setError("A logo é muito grande. Use uma imagem menor, preferencialmente abaixo de 350 KB.");
        setLogoInputKey((value) => value + 1);
        return;
      }

      setLogoUrl(result);
      setLogoPreviewUrl(result);
      setPendingLogoFile(file);
      setMessage("Logo carregada. Clique em salvar para aplicar.");
    };
    reader.onerror = () => {
      setError("Não foi possível ler o arquivo da logo.");
      setLogoInputKey((value) => value + 1);
    };
    try {
      reader.readAsDataURL(file);
    } catch {
      setError("Não foi possível ler o arquivo da logo.");
      setLogoInputKey((value) => value + 1);
    }
  };

  if (!activeCondo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
          <CardDescription>Selecione um condomínio ativo para personalizar a marca.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!canManageBranding) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configurações</CardTitle>
          <CardDescription>Esta área é exclusiva para administradores.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <Card>
        <CardHeader>
          <CardTitle>Marca do condomínio</CardTitle>
          <CardDescription>
            Personalize as cores e a logo exibidas no painel de {activeCondo.name}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <Label htmlFor="primaryColorPicker">Cor primária</Label>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Usada na navegação, botões e destaques principais.</p>
              </div>
              <Button variant="outline" className="shrink-0" onClick={() => void resetField("primaryColor")} disabled={saving}>
                Restaurar padrão
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-end">
              <Input
                id="primaryColorPicker"
                type="color"
                value={primaryColor || DEFAULT_PRIMARY}
                onChange={(event) => setPrimaryColor(event.target.value)}
                aria-label="Selecionar cor primária"
                className="h-12"
              />
              <div className="space-y-2">
                <Label htmlFor="primaryColorText">Hexadecimal</Label>
                <Input
                  id="primaryColorText"
                  placeholder={DEFAULT_PRIMARY}
                  value={primaryColor}
                  onChange={(event) => setPrimaryColor(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800 sm:p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Label htmlFor="logoFile">Logo</Label>
              <Button variant="outline" className="shrink-0" onClick={() => void resetField("logoUrl")} disabled={saving}>
                Remover logo
              </Button>
            </div>
            <div className="space-y-3">
              <Input
                key={logoInputKey}
                id="logoFile"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => handleLogoFile(event.target.files?.[0])}
              />
              <div className="flex h-20 items-center justify-center rounded-xl bg-slate-100 p-3 dark:bg-slate-900">
                {logoPreviewUrl || logoUrl ? (
                  <img src={logoPreviewUrl || logoUrl} alt={activeCondo.name} className="max-h-16 max-w-full object-contain" />
                ) : (
                  <CondoHomeBrandImage className="h-12 w-auto object-contain" />
                )}
              </div>
            </div>
          </div>

          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}

          <div className="flex flex-wrap gap-3">
            <Button className="w-full sm:w-auto" onClick={save} disabled={saving}>
              {saving ? "Salvando..." : "Salvar configurações"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="h-2" style={{ backgroundColor: previewPrimary }} />
        <CardHeader>
          <CardTitle>Prévia</CardTitle>
          <CardDescription>Como a identidade aparece no painel.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-slate-200 p-6 shadow-sm dark:border-slate-800" style={{ background: `linear-gradient(180deg, ${previewPrimary} 0%, #0f172a 70%)`, color: "#ffffff" }}>
            <div className="mb-8 flex items-center justify-center">
              {logoPreviewUrl || logoUrl ? (
                <img src={logoPreviewUrl || logoUrl} alt={activeCondo.name} className="max-h-20 w-auto object-contain" />
              ) : (
                <CondoHomeBrandImage className="h-16 w-auto object-contain" />
              )}
            </div>
            <p className="text-sm text-white/70">Condomínio ativo</p>
            <h2 className="mt-1 text-2xl font-semibold">{activeCondo.name}</h2>
            <div className="mt-6">
              <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Cor aplicada</p>
                <p className="mt-2 font-semibold">{previewPrimary}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
