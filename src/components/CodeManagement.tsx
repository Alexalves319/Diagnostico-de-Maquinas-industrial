import React, { useState } from "react";
import {
  DiagnosticCode,
  SeverityLevel,
  User,
  ROLE_PERMISSIONS,
} from "../types";
import {
  BookOpen,
  Plus,
  UploadCloud,
  FileText,
  Trash2,
  Edit2,
  Search,
  Check,
  AlertTriangle,
  Loader2,
  Sparkles,
  ShieldAlert,
  Save,
  X,
  FileUp,
  HelpCircle,
} from "lucide-react";

interface CodeManagementProps {
  codes: DiagnosticCode[];
  currentUser: User;
  onAddCode: (code: Omit<DiagnosticCode, "id" | "createdAt" | "updatedAt">) => void;
  onBatchAddCodes: (codes: Omit<DiagnosticCode, "id" | "createdAt" | "updatedAt">[]) => number;
  onUpdateCode: (id: string, updates: Partial<DiagnosticCode>) => void;
  onDeleteCode: (id: string) => void;
}

export const CodeManagement: React.FC<CodeManagementProps> = ({
  codes,
  currentUser,
  onAddCode,
  onBatchAddCodes,
  onUpdateCode,
  onDeleteCode,
}) => {
  const permissions = ROLE_PERMISSIONS[currentUser.role];
  const canModify = permissions.canAddCodes;

  // Views / Tabs inside Code Management
  const [activeSubTab, setActiveSubTab] = useState<"list" | "add_single" | "upload_manual">("list");
  const [searchTerm, setSearchTerm] = useState("");

  // Single code form state
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    causes: "",
    resolution: "",
    relatedFunctions: "",
    severity: "media" as SeverityLevel,
    sourceReference: "",
  });

  // Editing state
  const [editingCodeId, setEditingCodeId] = useState<string | null>(null);

  // Manual Upload / AI parsing state
  const [manualName, setManualName] = useState("");
  const [manualText, setManualText] = useState("");
  const [isParsingManual, setIsParsingManual] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [extractedCodes, setExtractedCodes] = useState<any[]>([]);
  const [selectedExtractedIndices, setSelectedExtractedIndices] = useState<Set<number>>(new Set());
  const [parseSuccessMsg, setParseSuccessMsg] = useState<string | null>(null);

  // Filtered code list
  const filteredCodes = codes.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.code.toLowerCase().includes(term) ||
      c.title.toLowerCase().includes(term) ||
      c.causes.toLowerCase().includes(term) ||
      (c.sourceReference && c.sourceReference.toLowerCase().includes(term))
    );
  });

  const handleResetForm = () => {
    setFormData({
      code: "",
      title: "",
      causes: "",
      resolution: "",
      relatedFunctions: "",
      severity: "media",
      sourceReference: "",
    });
    setEditingCodeId(null);
  };

  const handleSubmitSingleCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModify) return;

    if (!formData.code.trim() || !formData.title.trim() || !formData.causes.trim() || !formData.resolution.trim()) {
      alert("Por favor, preencha os campos obrigatórios: Código, Nome da Falha, Causas e Como Resolver.");
      return;
    }

    if (editingCodeId) {
      onUpdateCode(editingCodeId, {
        ...formData,
        code: formData.code.trim().toUpperCase(),
      });
    } else {
      onAddCode({
        ...formData,
        code: formData.code.trim().toUpperCase(),
        addedBy: currentUser.name,
      });
    }

    handleResetForm();
    setActiveSubTab("list");
  };

  const handleStartEdit = (code: DiagnosticCode) => {
    if (!canModify) return;
    setEditingCodeId(code.id);
    setFormData({
      code: code.code,
      title: code.title,
      causes: code.causes,
      resolution: code.resolution,
      relatedFunctions: code.relatedFunctions || "",
      severity: code.severity,
      sourceReference: code.sourceReference || "",
    });
    setActiveSubTab("add_single");
  };

  // Handle file drop or selection
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setManualName(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      setManualText(content);
    };

    // Read as text (works for txt, md, json, csv, or extracted text)
    reader.readAsText(file);
  };

  // Trigger server-side manual parsing with Gemini
  const handleParseManualWithAI = async () => {
    if (!manualText.trim()) {
      setParseError("Por favor, cole o texto do manual ou selecione um arquivo.");
      return;
    }

    setIsParsingManual(true);
    setParseError(null);
    setParseSuccessMsg(null);
    setExtractedCodes([]);

    try {
      const res = await fetch("/api/parse-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manualText,
          manualName: manualName || "Manual Fornecido",
        }),
      });

      const data = await res.json();
      if (data.extractedCodes && data.extractedCodes.length > 0) {
        setExtractedCodes(data.extractedCodes);
        // Pre-select all by default
        setSelectedExtractedIndices(new Set(data.extractedCodes.map((_: any, idx: number) => idx)));
        setParseSuccessMsg(
          `Sucesso! Extraídos ${data.extractedCodes.length} código(s) de falha do documento.`
        );
      } else {
        setParseError("Nenhum código de falha identificado no trecho do manual informado.");
      }
    } catch (err: any) {
      setParseError("Falha na comunicação com o analisador de manual: " + err.message);
    } finally {
      setIsParsingManual(false);
    }
  };

  // Save selected extracted codes to system database
  const handleConfirmImport = () => {
    if (extractedCodes.length === 0) return;

    const toImport = extractedCodes
      .filter((_, idx) => selectedExtractedIndices.has(idx))
      .map((item) => ({
        code: item.code || "SEM_CODIGO",
        title: item.title || "Falha Técnica",
        causes: item.causes || "Verificar diagnóstico.",
        resolution: item.resolution || "Inspecionar componentes.",
        relatedFunctions: item.relatedFunctions || "",
        severity: (item.severity as SeverityLevel) || "media",
        sourceReference: item.sourceReference || manualName || "Manual Anexado",
        addedBy: currentUser.name,
      }));

    if (toImport.length === 0) {
      alert("Selecione pelo menos um código para importar.");
      return;
    }

    const count = onBatchAddCodes(toImport);
    alert(`${count} código(s) foram adicionados/atualizados com sucesso na base!`);
    setExtractedCodes([]);
    setManualText("");
    setManualName("");
    setParseSuccessMsg(null);
    setActiveSubTab("list");
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Sub-navigation Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Gestão de Códigos de Falha &amp; Manuais
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastre novos códigos individualmente ou anexe manuais completos para extração automática.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              handleResetForm();
              setActiveSubTab("list");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSubTab === "list"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Códigos Cadastrados ({codes.length})
          </button>

          {canModify ? (
            <>
              <button
                id="btn-tab-upload-manual"
                onClick={() => setActiveSubTab("upload_manual")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeSubTab === "upload_manual"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-900/60"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Anexar Manual (IA)</span>
              </button>

              <button
                id="btn-tab-add-single-code"
                onClick={() => {
                  handleResetForm();
                  setActiveSubTab("add_single");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeSubTab === "add_single"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-blue-600/90 hover:bg-blue-600 text-white"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Código</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-400">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Modo Leitura (Apenas Administrador cadastra)</span>
            </div>
          )}
        </div>
      </div>

      {/* Operator Permission Banner if trying to modify */}
      {!canModify && activeSubTab !== "list" && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400" />
          <div>
            <span className="font-semibold">Acesso Restrito:</span> Seu perfil atual é de{" "}
            <strong>Operador</strong>. O operador tem permissão total para consultar diagnósticos, soluções e registrar manutenções. Para adicionar ou modificar códigos, alterne para o usuário <strong>Administrador</strong>.
          </div>
        </div>
      )}

      {/* SUB-VIEW 1: UPLOAD MANUAL / AI EXTRACTION */}
      {activeSubTab === "upload_manual" && canModify && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="max-w-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-purple-400" />
              Anexar Manual Técnico &amp; Extrair Códigos com IA
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Cole o texto do manual de instruções, relatórios de falhas da máquina ou anexe arquivos com funções e finalidades. A IA identificará cada código de erro, porque ocorre e como resolver.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input column */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nome ou Identificação do Manual / Fabricante
                </label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Ex: Manual Prensa Hidráulica Série X - Seção Diagnósticos"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* File Attachment Dropzone */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Carregar Arquivo (.txt, .md, .csv, .json)
                </label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-purple-500 rounded-xl bg-slate-800/50 cursor-pointer transition-colors">
                  <FileUp className="w-6 h-6 text-purple-400 mb-1" />
                  <span className="text-xs text-slate-300 font-medium">
                    {manualName ? manualName : "Clique para selecionar ou arraste o arquivo aqui"}
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Arquivos de texto, notas técnicas ou relatórios
                  </span>
                  <input
                    type="file"
                    accept=".txt,.md,.csv,.json,.doc,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Or Paste Manual Text */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Ou Cole o Conteúdo do Manual / Seção de Erros Diretamente:
                </label>
                <textarea
                  rows={8}
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Cole aqui a tabela de erros, descrições, funções afetadas, procedimentos de reparo e diagnósticos do manual..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {parseError && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                  {parseError}
                </div>
              )}

              {parseSuccessMsg && (
                <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{parseSuccessMsg}</span>
                </div>
              )}

              <button
                id="btn-process-manual-ai"
                onClick={handleParseManualWithAI}
                disabled={isParsingManual || !manualText.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-sm font-medium transition-colors shadow-sm"
              >
                {isParsingManual ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando e Extraindo Códigos com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Processar Manual &amp; Extrair Códigos</span>
                  </>
                )}
              </button>
            </div>

            {/* Extracted Codes Preview Column */}
            <div className="lg:col-span-6 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Pré-visualização dos Códigos Extraídos ({extractedCodes.length})
                </span>
                {extractedCodes.length > 0 && (
                  <button
                    onClick={() => {
                      if (selectedExtractedIndices.size === extractedCodes.length) {
                        setSelectedExtractedIndices(new Set());
                      } else {
                        setSelectedExtractedIndices(
                          new Set(extractedCodes.map((_, i) => i))
                        );
                      }
                    }}
                    className="text-[11px] text-purple-400 hover:underline"
                  >
                    {selectedExtractedIndices.size === extractedCodes.length
                      ? "Desmarcar Todos"
                      : "Marcar Todos"}
                  </button>
                )}
              </div>

              <div className="flex-1 bg-slate-800/40 border border-slate-800 rounded-xl p-3 overflow-y-auto max-h-[420px] space-y-2">
                {extractedCodes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 text-xs">
                    <FileText className="w-8 h-8 text-slate-600 mb-2" />
                    <span>Nenhum código extraído ainda.</span>
                    <span className="text-[11px] text-slate-600 mt-1">
                      Anexe o documento ao lado e clique em "Processar Manual".
                    </span>
                  </div>
                ) : (
                  extractedCodes.map((item, idx) => {
                    const isChecked = selectedExtractedIndices.has(idx);
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border transition-all ${
                          isChecked
                            ? "bg-slate-800 border-purple-500/60"
                            : "bg-slate-850/50 border-slate-700/50 opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const next = new Set(selectedExtractedIndices);
                              if (next.has(idx)) next.delete(idx);
                              else next.add(idx);
                              setSelectedExtractedIndices(next);
                            }}
                            className="mt-1 rounded text-purple-600 focus:ring-purple-500"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm font-bold text-purple-300">
                                {item.code}
                              </span>
                              <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">
                                {item.severity || "media"}
                              </span>
                            </div>
                            <div className="text-xs font-semibold text-white mt-0.5">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-amber-300/90 mt-1">
                              <strong>Por quê:</strong> {item.causes}
                            </div>
                            <div className="text-[11px] text-emerald-300/90 mt-1">
                              <strong>Solução:</strong> {item.resolution}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {extractedCodes.length > 0 && (
                <div className="pt-3">
                  <button
                    id="btn-confirm-import-codes"
                    onClick={handleConfirmImport}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      Cadastrar {selectedExtractedIndices.size} Código(s) Selecionado(s) na Base
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: ADD / EDIT SINGLE CODE */}
      {activeSubTab === "add_single" && canModify && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="max-w-2xl mb-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-400" />
              {editingCodeId ? "Editar Código de Falha" : "Cadastrar Novo Código de Falha"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Preencha os detalhes técnicos para que você ou o operador consigam diagnosticar e resolver rapidamente esta falha no chão de fábrica.
            </p>
          </div>

          <form onSubmit={handleSubmitSingleCode} className="space-y-4 max-w-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Código da Falha *
                </label>
                <input
                  id="input-new-code"
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Ex: E-01, F104, ALM-22, ERR_PRES_01"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Severidade da Falha *
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) =>
                    setFormData({ ...formData, severity: e.target.value as SeverityLevel })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="baixa">Baixa (Aviso / Informativo)</option>
                  <option value="media">Média (Atenção / Rendimento Reduzido)</option>
                  <option value="alta">Alta (Parada de Subsistema)</option>
                  <option value="critica">Crítica (Parada de Emergência / Risco)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nome da Falha / Descrição do Alarme *
              </label>
              <input
                id="input-new-title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Sobrecarga Térmica no Inversor do Eixo Principal"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-amber-300 mb-1">
                O Porquê dar esse tipo de falha? (Causas Raízes Técnicas) *
              </label>
              <textarea
                id="input-new-causes"
                rows={3}
                required
                value={formData.causes}
                onChange={(e) => setFormData({ ...formData, causes: e.target.value })}
                placeholder="Explique detalhadamente os motivos: exaustor de resfriamento obstruído, temperatura ambiente acima de 45°C, curto na fiação ou sobrecarga mecânica prolongada..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-emerald-300 mb-1">
                Como Resolver? (Procedimento Passo a Passo) *
              </label>
              <textarea
                id="input-new-resolution"
                rows={3}
                required
                value={formData.resolution}
                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                placeholder="Descreva o passo a passo: 1. Desligar a chave geral e aguardar 10 min. 2. Verificar se o ventilador gira livremente. 3. Medir resistência dos enrolamentos do motor..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Funções &amp; Finalidades Afetadas da Máquina (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.relatedFunctions}
                  onChange={(e) =>
                    setFormData({ ...formData, relatedFunctions: e.target.value })
                  }
                  placeholder="Ex: Avanço hidráulico, Tração de corte, Bomba de lubrificação"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Referência do Manual / Página (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.sourceReference}
                  onChange={(e) =>
                    setFormData({ ...formData, sourceReference: e.target.value })
                  }
                  placeholder="Ex: Manual Técnico pág. 142 ou Seção 8.4"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  handleResetForm();
                  setActiveSubTab("list");
                }}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                id="btn-save-single-code"
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{editingCodeId ? "Salvar Alterações" : "Cadastrar Código"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-VIEW 3: CODES LIST */}
      {activeSubTab === "list" && (
        <div className="space-y-4">
          {/* Search bar inside list */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar códigos cadastrados por código, falha ou manual..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="text-xs text-slate-400">
              Total: <strong className="text-white">{filteredCodes.length}</strong> código(s)
            </div>
          </div>

          {filteredCodes.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-400 text-sm">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p>Nenhum código de falha cadastrado ainda.</p>
              {canModify && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setActiveSubTab("upload_manual")}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium rounded-lg"
                  >
                    Anexar Manual Técnico
                  </button>
                  <button
                    onClick={() => setActiveSubTab("add_single")}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg"
                  >
                    Cadastrar Código Manualmente
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCodes.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-base font-bold text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded">
                        {item.code}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {item.severity}
                      </span>
                    </div>

                    <h4 className="font-semibold text-white text-sm mt-2 line-clamp-1">
                      {item.title}
                    </h4>

                    <div className="mt-3 space-y-2 text-xs">
                      <div className="p-2 rounded bg-amber-950/20 border border-amber-900/30 text-slate-300">
                        <span className="text-amber-400 font-semibold block text-[10px] uppercase">
                          Por quê ocorre:
                        </span>
                        <p className="line-clamp-2 mt-0.5">{item.causes}</p>
                      </div>

                      <div className="p-2 rounded bg-emerald-950/20 border border-emerald-900/30 text-slate-300">
                        <span className="text-emerald-400 font-semibold block text-[10px] uppercase">
                          Como resolver:
                        </span>
                        <p className="line-clamp-2 mt-0.5">{item.resolution}</p>
                      </div>
                    </div>

                    {item.sourceReference && (
                      <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-slate-600" />
                        <span>Manual: {item.sourceReference}</span>
                      </div>
                    )}
                  </div>

                  {canModify && (
                    <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors"
                        title="Editar código"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Excluir o código ${item.code} definitivamente?`)) {
                            onDeleteCode(item.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                        title="Excluir código"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
