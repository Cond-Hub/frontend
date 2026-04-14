"use client";

import { Bot, Eye, FileText, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import type { Document } from "../../../shared/src";
import { formatDateBR } from "../../../shared/src";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { ConfirmDialog } from "../../../components/ui/confirm-dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Skeleton } from "../../../components/ui/skeleton";
import { dashboardApi, useDashboardStore } from "../../../src/store/useDashboardStore";
import { showToast } from "../../../src/store/useToastStore";

const DOCUMENT_CATEGORY = "Regimento Interno";

type RegimentoRowDraft = {
  id: string;
  title: string;
  description: string;
};

type RuleFormState = {
  title: string;
};

type ModalFrameProps = {
  title: string;
  description: string;
  children: ReactNode;
  onClose: () => void;
  loading?: boolean;
  loadingLabel?: string;
};

const emptyForm: RuleFormState = {
  title: "",
};

const emptyRow = (): RegimentoRowDraft => ({
  id: crypto.randomUUID(),
  title: "",
  description: "",
});

function ModalFrame({ title, description, children, onClose, loading = false, loadingLabel = "Carregando..." }: ModalFrameProps) {
  return (
    <div className="fixed inset-0 z-[90] h-dvh min-h-dvh w-screen overflow-y-auto bg-slate-950/60 backdrop-blur-sm">
      <div className="flex min-h-dvh w-full items-center justify-center p-4 py-6">
        <div className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-50">{title}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
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
          <div className="min-h-0 flex-1 overflow-y-auto p-6">{children}</div>
          {loading ? (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/85 backdrop-blur-sm dark:bg-slate-950/80">
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                <Loader2 className="h-5 w-5 animate-spin text-sky-500" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{loadingLabel}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DropzoneIcon() {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-300">
      <Upload className="h-6 w-6" />
    </div>
  );
}

function uploadRuleFile(file: File) {
  return dashboardApi.documents
    .createUploadUrl({
      fileName: file.name,
      contentType: file.type || "application/pdf",
    })
    .then(async (upload) => {
      const response = await fetch(upload.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/pdf",
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Falha ao enviar o arquivo ${file.name}.`);
      }

      return upload.storageRef;
    });
}

function inferTitleFromFileName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || "Regimento Interno";
}

function formatVersionLabel(document: Document, index: number) {
  return document.description?.trim() || `Versão ${index + 1}`;
}

function parseRowsJson(rowsJson?: string): RegimentoRowDraft[] {
  if (!rowsJson?.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(rowsJson) as Array<{ title?: string; description?: string }>;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => ({
        id: crypto.randomUUID(),
        title: item.title?.trim() ?? "",
        description: item.description?.trim() ?? "",
      }))
      .filter((item) => item.title || item.description);
  } catch {
    return [];
  }
}

function RuleSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
      </Card>
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-2xl" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegimentoInternoPage() {
  const state = useDashboardStore();
  const currentUser = state.currentUserId ? state.users[state.currentUserId] : undefined;
  const canManageRules = currentUser?.role === "ADMIN_COMPANY" || currentUser?.role === "SYSTEM_ADMIN" || currentUser?.role === "SYNDIC";
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [documentToRemove, setDocumentToRemove] = useState<Document | undefined>();
  const [selectedDocument, setSelectedDocument] = useState<Document | undefined>();
  const [draftRows, setDraftRows] = useState<RegimentoRowDraft[]>([]);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const [analysisFileName, setAnalysisFileName] = useState<string>("");
  const [manualMode, setManualMode] = useState(false);
  const [form, setForm] = useState<RuleFormState>(emptyForm);
  const analysisRequestId = useRef(0);

  const load = async () => {
    setLoading(true);

    try {
      const nextDocuments = await dashboardApi.documents.list({ category: DOCUMENT_CATEGORY });
      setDocuments(
        nextDocuments
          .filter((document) => !document.unitId)
          .sort((left, right) => new Date(right.uploadedAtISO).getTime() - new Date(left.uploadedAtISO).getTime()),
      );
    } catch (error) {
      showToast({
        tone: "error",
        title: "Falha ao carregar regimento interno",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const latestDocument = documents[0];
  const versionsCount = documents.length;
  const latestRows = useMemo(() => parseRowsJson(latestDocument?.regimentoRowsJson), [latestDocument]);
  const selectedDocumentRows = useMemo(() => parseRowsJson(selectedDocument?.regimentoRowsJson), [selectedDocument]);

  const openNewVersion = () => {
    setForm(emptyForm);
    setDraftRows([]);
    setUploadedFileUrl("");
    setAnalysisFileName("");
    setManualMode(false);
    setDragging(false);
    setFormOpen(true);
  };

  const analyzeFile = async (file: File) => {
    const requestId = ++analysisRequestId.current;
    setAnalyzing(true);

    try {
      const storageRef = await uploadRuleFile(file);
      if (requestId !== analysisRequestId.current) {
        return;
      }

      setUploadedFileUrl(storageRef);
      setAnalysisFileName(file.name);

      const response = await dashboardApi.documents.analyzeRegimento({ fileUrl: storageRef });
      if (requestId !== analysisRequestId.current) {
        return;
      }

      const rows = response.rows.length
        ? response.rows
        : [{ title: "Resumo geral", description: "O arquivo não retornou itens estruturados. Ajuste os pontos manualmente antes de salvar." }];

      setDraftRows(
        rows.map((row) => ({
          id: crypto.randomUUID(),
          title: row.title.trim(),
          description: row.description.trim(),
        })),
      );

      setForm({
        title: response.title?.trim() || inferTitleFromFileName(file.name),
      });

      showToast({
        tone: "success",
        title: "Arquivo analisado",
        description: "A estrutura inicial do regimento foi gerada automaticamente.",
      });
    } catch (error) {
      if (requestId === analysisRequestId.current) {
        showToast({
          tone: "error",
          title: "Falha ao analisar arquivo",
          description: error instanceof Error ? error.message : "Tente novamente.",
        });
      }
    } finally {
      if (requestId === analysisRequestId.current) {
        setAnalyzing(false);
      }
    }
  };

  const handleFileChange = (file: File | null) => {
    setDraftRows([]);
    setUploadedFileUrl("");
    setAnalysisFileName("");
    setManualMode(false);
    setDragging(false);

    if (!file) {
      return;
    }

    void analyzeFile(file);
  };

  const addRow = () => {
    setDraftRows((current) => [...current, emptyRow()]);
  };

  const updateRow = (id: string, patch: Partial<RegimentoRowDraft>) => {
    setDraftRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const removeRow = (id: string) => {
    setDraftRows((current) => current.filter((row) => row.id !== id));
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      showToast({
        tone: "error",
        title: "Campos obrigatórios",
        description: "Informe o título da versão.",
      });
      return;
    }

    const normalizedRows = draftRows
      .map((row) => ({
        title: row.title.trim(),
        description: row.description.trim(),
      }))
      .filter((row) => row.title || row.description);

    if (normalizedRows.length === 0) {
      showToast({
        tone: "error",
        title: "Adicione os itens do regimento",
        description: "A versão precisa de pelo menos uma linha para ser publicada.",
      });
      return;
    }

    setSaving(true);
    try {
      await dashboardApi.documents.upload({
        unitId: null,
        title: form.title.trim(),
        category: DOCUMENT_CATEGORY,
        regimentoRowsJson: JSON.stringify(normalizedRows),
        fileUrl: uploadedFileUrl || undefined,
      });

      showToast({
        tone: "success",
        title: "Regimento salvo",
      });

      setFormOpen(false);
      setForm(emptyForm);
      setDraftRows([]);
      setUploadedFileUrl("");
      setAnalysisFileName("");
      setManualMode(false);
      await load();
    } catch (error) {
      showToast({
        tone: "error",
        title: "Falha ao salvar regimento",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!documentToRemove) {
      return;
    }

    setSaving(true);
    try {
      await dashboardApi.documents.remove(documentToRemove.id);
      showToast({
        tone: "success",
        title: "Versão removida",
      });
      setDocumentToRemove(undefined);
      await load();
    } catch (error) {
      showToast({
        tone: "error",
        title: "Falha ao remover versão",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Condomínio ativo</p>
          <h2 className="text-2xl font-semibold text-slate-950 dark:text-slate-50">Regimento Interno</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
            Envie o arquivo, deixe a IA estruturar os pontos principais e revise antes de publicar a nova versão.
          </p>
        </div>
        {canManageRules ? (
          <Button className="gap-2" onClick={openNewVersion}>
            <Plus className="h-4 w-4" />
            Nova versão
          </Button>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
            Somente a administração pode publicar novas versões.
          </div>
        )}
      </div>

      {loading ? (
        <RuleSkeleton />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <CardHeader>
                <CardDescription>Versões registradas</CardDescription>
                <CardTitle className="text-3xl">{versionsCount}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <CardHeader>
                <CardDescription>Última atualização</CardDescription>
                <CardTitle className="text-3xl">{latestDocument ? formatDateBR(latestDocument.uploadedAtISO) : "-"}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
              <CardHeader>
                <CardDescription>Pontos estruturados</CardDescription>
                <CardTitle className="text-3xl">{latestRows.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <CardHeader>
              <CardTitle>Versão atual</CardTitle>
              <CardDescription>O documento mais recente fica no topo da fila.</CardDescription>
            </CardHeader>
            <CardContent>
              {latestDocument ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Documento atual</p>
                      <p className="text-xl font-semibold text-slate-950 dark:text-slate-50">{latestDocument.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{latestDocument.description || "Sem observações adicionais."}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Publicado em {formatDateBR(latestDocument.uploadedAtISO)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" className="gap-2" onClick={() => setSelectedDocument(latestDocument)}>
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                      {canManageRules ? (
                        <Button variant="outline" className="gap-2" onClick={() => setDocumentToRemove(latestDocument)}>
                          <Trash2 className="h-4 w-4" />
                          Remover
                        </Button>
                      ) : null}
                    </div>
                  </div>

                  {latestRows.length ? (
                    <div className="mt-5 grid gap-3">
                      {latestRows.slice(0, 4).map((row, index) => (
                        <div key={`${latestDocument.id}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                          <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">{row.title}</p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{row.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                      Esta versão ainda não possui linhas estruturadas.
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                  Nenhuma versão cadastrada ainda.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <CardHeader>
              <CardTitle>Histórico de versões</CardTitle>
              <CardDescription>Registre atualizações sempre que houver revisão do texto ou do arquivo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {documents.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                  Sem histórico de versões.
                </div>
              ) : (
                documents.map((document, index) => {
                  const rows = parseRowsJson(document.regimentoRowsJson);

                  return (
                    <div key={document.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                              {formatVersionLabel(document, index)}
                            </span>
                            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                              {formatDateBR(document.uploadedAtISO)}
                            </span>
                            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                              {rows.length} linhas
                            </span>
                          </div>
                          <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-50">{document.title}</p>
                          <p className="truncate text-sm text-slate-600 dark:text-slate-400">{document.description || "Sem observações adicionais."}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" className="gap-2" onClick={() => setSelectedDocument(document)}>
                            <FileText className="h-4 w-4" />
                            Abrir
                          </Button>
                          {canManageRules ? (
                            <Button variant="outline" className="gap-2" onClick={() => setDocumentToRemove(document)}>
                              <Trash2 className="h-4 w-4" />
                              Remover
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {formOpen && canManageRules ? (
        <ModalFrame
          title="Nova versão do regimento"
          description="Comece enviando o arquivo. A IA vai gerar o título e a estrutura inicial automaticamente."
          onClose={() => !saving && !analyzing && setFormOpen(false)}
          loading={analyzing}
          loadingLabel="Analisando o arquivo com IA..."
        >
          <div className="grid gap-5">
            {!uploadedFileUrl && !manualMode ? (
              <div
                className={`rounded-[28px] border-2 border-dashed px-6 py-12 transition ${
                  dragging
                    ? "border-sky-400 bg-sky-50/80 dark:border-sky-500 dark:bg-sky-950/30"
                    : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60"
                }`}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setDragging(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  handleFileChange(event.dataTransfer.files?.[0] ?? null);
                }}
              >
                <input
                  ref={fileInputRef}
                  className="hidden"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  onChange={(event) => {
                    const nextFile = event.target.files?.[0] ?? null;
                    event.currentTarget.value = "";
                    handleFileChange(nextFile);
                  }}
                />
                <button
                  type="button"
                  className="flex w-full flex-col items-center justify-center gap-4 rounded-3xl px-4 py-10 text-left"
                  onClick={openFilePicker}
                >
                  <DropzoneIcon />
                  <div className="max-w-lg text-center">
                    <p className="text-xl font-semibold text-slate-950 dark:text-slate-50">Arraste o arquivo do regimento ou clique para selecionar</p>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      A IA vai ler o arquivo, gerar o título e estruturar os pontos principais em linhas editáveis.
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    Selecionar arquivo
                  </span>
                </button>
                <div className="my-5 flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  <span className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">ou</span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>
                <button
                  type="button"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                  onClick={() => {
                    setManualMode(true);
                    setDraftRows((current) => (current.length ? current : [emptyRow()]));
                    setForm((current) => ({ ...current, title: current.title || "Regimento Interno" }));
                  }}
                >
                  Ou faça manualmente
                </button>
              </div>
            ) : (
              <div className="grid gap-5">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {manualMode ? "Modo manual" : "Arquivo carregado"}
                      </p>
                      <p className="text-sm font-semibold text-slate-950 dark:text-slate-50">
                        {manualMode ? "Você está criando a versão manualmente." : analysisFileName}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setForm(emptyForm);
                        setDraftRows([]);
                        setUploadedFileUrl("");
                        setAnalysisFileName("");
                        setManualMode(false);
                        setDragging(false);
                        fileInputRef.current && (fileInputRef.current.value = "");
                      }}
                    >
                      {manualMode ? "Voltar ao arquivo" : "Trocar arquivo"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rule-title">Título da versão</Label>
                  <Input
                    id="rule-title"
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="Ex.: Regimento Interno - Revisão 2026"
                  />
                </div>

                <Card className="border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
                  <CardHeader className="space-y-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Bot className="h-4 w-4" />
                      {manualMode ? "Estrutura manual" : "Estrutura sugerida pela IA"}
                    </CardTitle>
                    <CardDescription>
                      {manualMode
                        ? "Edite, remova ou adicione linhas manualmente. A lista mostra um item por vez e usa scroll para o restante."
                        : "Revise, edite, remova ou adicione linhas. A lista mostra um item por vez e usa scroll para o restante."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="max-h-[12rem] overflow-y-auto pr-1">
                      <div className="space-y-3">
                        {draftRows.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                            Nenhuma linha gerada ainda.
                          </div>
                        ) : (
                          draftRows.map((row, index) => (
                            <div
                              key={row.id}
                              className="h-[10.75rem] overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
                            >
                              <div className="flex h-full flex-col gap-3">
                                <div className="grid gap-2 md:grid-cols-[1fr,auto]">
                                  <Input
                                    value={row.title}
                                    onChange={(event) => updateRow(row.id, { title: event.target.value })}
                                    placeholder={`Linha ${index + 1}`}
                                  />
                                  <Button
                                    variant="outline"
                                    className="gap-2 border-rose-200 bg-rose-50/80 text-rose-600 hover:bg-rose-100 dark:border-rose-800 dark:bg-transparent dark:text-rose-300 dark:hover:bg-rose-950/30"
                                    onClick={() => removeRow(row.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Remover
                                  </Button>
                                </div>
                                <textarea
                                  className="input h-full resize-none py-3"
                                  value={row.description}
                                  onChange={(event) => updateRow(row.id, { description: event.target.value })}
                                  placeholder="Descreva a regra ou orientação principal..."
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <Button variant="outline" className="gap-2" onClick={addRow}>
                      <Plus className="h-4 w-4" />
                      Adicionar linha
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <Button variant="outline" onClick={() => setFormOpen(false)} disabled={saving || analyzing}>
                Cancelar
              </Button>
              <Button className="gap-2" onClick={() => void handleSave()} disabled={saving || analyzing}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {saving ? "Salvando..." : "Salvar versão"}
              </Button>
            </div>
          </div>
        </ModalFrame>
      ) : null}

      <ConfirmDialog
        open={!!documentToRemove}
        title="Remover versão"
        description={documentToRemove ? `Deseja remover a versão "${documentToRemove.title}" do regimento interno?` : ""}
        confirmLabel="Remover"
        destructive
        onCancel={() => setDocumentToRemove(undefined)}
        onConfirm={() => void handleRemove()}
      />

      {selectedDocument ? (
        <ModalFrame title={selectedDocument.title} description="Detalhes da versão do regimento interno." onClose={() => setSelectedDocument(undefined)}>
          <div className="space-y-5 text-sm text-slate-600 dark:text-slate-300">
            <p>
              <strong className="text-slate-900 dark:text-slate-50">Categoria:</strong> {selectedDocument.category}
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-50">Versão:</strong> {selectedDocument.description || "Sem observações adicionais."}
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-50">Publicado em:</strong> {formatDateBR(selectedDocument.uploadedAtISO)}
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-50">Arquivo:</strong> {selectedDocument.fileUrl}
            </p>

            <div className="space-y-3">
              <p className="text-base font-semibold text-slate-950 dark:text-slate-50">Linhas estruturadas</p>
              {selectedDocumentRows.length ? (
                selectedDocumentRows.map((row, index) => (
                  <div key={`${selectedDocument.id}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                    <p className="font-semibold text-slate-950 dark:text-slate-50">{row.title}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{row.description}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                  Esta versão não possui linhas estruturadas.
                </div>
              )}
            </div>
          </div>
        </ModalFrame>
      ) : null}
    </div>
  );
}
