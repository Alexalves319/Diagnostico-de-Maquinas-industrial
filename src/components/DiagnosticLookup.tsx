import React, { useState, useMemo } from "react";
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Wrench,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  Send,
  Loader2,
} from "lucide-react";
import { DiagnosticCode, SeverityLevel } from "../types";
import { Zap, Wind, Droplets } from "lucide-react";

interface DiagnosticLookupProps {
  codes: DiagnosticCode[];
  onSelectCodeForMaintenance: (code: string) => void;
  onNavigateToUpload: () => void;
  initialSearchTerm?: string;
  onNavigateToElectricalDiagram?: () => void;
  onNavigateToPneumaticDiagram?: () => void;
  onNavigateToHydraulicDiagram?: () => void;
}

export const DiagnosticLookup: React.FC<DiagnosticLookupProps> = ({
  codes,
  onSelectCodeForMaintenance,
  onNavigateToUpload,
  initialSearchTerm,
  onNavigateToElectricalDiagram,
  onNavigateToPneumaticDiagram,
  onNavigateToHydraulicDiagram,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || "");
  const [selectedCodeId, setSelectedCodeId] = useState<string | null>(null);

  // Sync if initialSearchTerm changes
  React.useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);
  const [aiAssistantOpen, setAiAssistantOpen] = useState(false);
  const [aiCustomQuestion, setAiCustomQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Search filtering
  const filteredCodes = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return codes;
    return codes.filter((c) => {
      return (
        c.code.toLowerCase().includes(term) ||
        c.title.toLowerCase().includes(term) ||
        c.causes.toLowerCase().includes(term) ||
        c.resolution.toLowerCase().includes(term) ||
        (c.relatedFunctions && c.relatedFunctions.toLowerCase().includes(term)) ||
        (c.sourceReference && c.sourceReference.toLowerCase().includes(term))
      );
    });
  }, [codes, searchTerm]);

  // Selected code detail
  const activeCode = useMemo(() => {
    if (selectedCodeId) {
      const found = codes.find((c) => c.id === selectedCodeId);
      if (found) return found;
    }
    // If searchTerm matches an exact code, pick it
    const exactMatch = codes.find(
      (c) => c.code.trim().toLowerCase() === searchTerm.trim().toLowerCase()
    );
    if (exactMatch) return exactMatch;

    return filteredCodes[0] || null;
  }, [selectedCodeId, filteredCodes, codes, searchTerm]);

  // Query AI for specialized diagnosis
  const handleQueryAI = async () => {
    if (!activeCode && !searchTerm.trim()) return;
    setAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch("/api/ai-diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: activeCode?.code || searchTerm,
          description: activeCode?.title || searchTerm,
          machineNotes: aiCustomQuestion || activeCode?.causes,
          knownCodesContext: codes.slice(0, 8).map((c) => ({
            code: c.code,
            title: c.title,
            causes: c.causes,
            resolution: c.resolution,
          })),
        }),
      });

      const data = await res.json();
      if (data.diagnosis) {
        setAiResponse(data.diagnosis);
      } else if (data.error) {
        setAiResponse(`Aviso: ${data.error} ${data.solution ? `(${data.solution})` : ""}`);
      }
    } catch (err: any) {
      setAiResponse(
        "Não foi possível conectar ao assistente de IA. Verifique sua conexão e tente novamente."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case "critica":
        return {
          bg: "bg-rose-950/60 text-rose-300 border-rose-800",
          dot: "bg-rose-500",
          label: "Severidade Crítica",
        };
      case "alta":
        return {
          bg: "bg-orange-950/60 text-orange-300 border-orange-800",
          dot: "bg-orange-500",
          label: "Severidade Alta",
        };
      case "media":
        return {
          bg: "bg-amber-950/60 text-amber-300 border-amber-800",
          dot: "bg-amber-500",
          label: "Severidade Média",
        };
      default:
        return {
          bg: "bg-blue-950/60 text-blue-300 border-blue-800",
          dot: "bg-blue-500",
          label: "Severidade Baixa / Aviso",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-400" />
              Consulta Rápida de Diagnóstico
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Digite o código de falha da máquina para visualizar instantaneamente o motivo do erro e o procedimento técnico para resolver.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onNavigateToElectricalDiagram && (
              <button
                onClick={onNavigateToElectricalDiagram}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Mapa Elétrico V4
              </button>
            )}
            {onNavigateToPneumaticDiagram && (
              <button
                onClick={onNavigateToPneumaticDiagram}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all"
              >
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                Mapa Pneumático V4
              </button>
            )}
            {onNavigateToHydraulicDiagram && (
              <button
                onClick={onNavigateToHydraulicDiagram}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-all"
              >
                <Droplets className="w-3.5 h-3.5 text-blue-400" />
                Mapa Hidráulico V4
              </button>
            )}
          </div>
        </div>

          {/* Search Input */}
          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              id="input-quick-search-code"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedCodeId(null);
                setAiResponse(null);
              }}
              placeholder="Digite o código da falha (ex: E-01, F104, ALM-22) ou palavra-chave..."
              className="w-full pl-11 pr-24 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-base text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCodeId(null);
                  setAiResponse(null);
                }}
                className="absolute inset-y-0 right-3 flex items-center text-xs text-slate-400 hover:text-white"
              >
                Limpar
              </button>
            )}
          </div>

          {/* Quick Filter Tags / Available codes */}
          {codes.length > 0 && (
            <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
              <span className="text-slate-500 whitespace-nowrap">Códigos disponíveis:</span>
              {codes.slice(0, 10).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSearchTerm(c.code);
                    setSelectedCodeId(c.id);
                  }}
                  className={`px-2.5 py-1 rounded-md font-mono transition-colors whitespace-nowrap border ${
                    activeCode?.id === c.id
                      ? "bg-blue-600 text-white border-blue-500"
                      : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                  }`}
                >
                  {c.code}
                </button>
              ))}
              {codes.length > 10 && (
                <span className="text-slate-500 text-xs font-mono">
                  +{codes.length - 10} mais
                </span>
              )}
            </div>
          )}
      </div>

      {/* Main Content Area */}
      {codes.length === 0 ? (
        /* Empty State (Respecting user request to not prefill fake machines/codes) */
        <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-xl p-10 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-blue-950/60 border border-blue-800/80 flex items-center justify-center text-blue-400">
            <BookOpen className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              Base limpa pronta para receber seus dados
            </h3>
            <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
              Como solicitado, nenhuma máquina ou código foi pré-cadastrado. Você já pode anexar seus manuais técnicos (PDF, texto ou notas) para que o sistema extraia todos os códigos, ou cadastrá-los manualmente.
            </p>
          </div>
          <div className="pt-2">
            <button
              id="btn-go-to-upload-manuals"
              onClick={onNavigateToUpload}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Anexar Manuais e Cadastrar Códigos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* List of matched codes on sidebar if multiple */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Resultados encontrados ({filteredCodes.length})</span>
              {searchTerm && <span>Filtro: "{searchTerm}"</span>}
            </div>

            {filteredCodes.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400 text-xs">
                Nenhum código corresponde à pesquisa.
              </div>
            ) : (
              <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
                {filteredCodes.map((item) => {
                  const isSelected = activeCode?.id === item.id;
                  const sev = getSeverityBadge(item.severity);
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedCodeId(item.id);
                        setAiResponse(null);
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        isSelected
                          ? "bg-slate-800/90 border-blue-500 ring-1 ring-blue-500/40 shadow-sm"
                          : "bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-base font-bold text-blue-400">
                          {item.code}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${sev.bg}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${sev.dot}`}
                          />
                          {item.severity}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-white mt-1 line-clamp-1">
                        {item.title}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {item.causes}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Code Detail View */}
          <div className="lg:col-span-8">
            {activeCode ? (
              <div
                id="diagnostic-detail-card"
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-slate-800 bg-slate-850/50">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-2xl font-black text-blue-400 tracking-wider bg-blue-950/60 border border-blue-800/60 px-3 py-1 rounded-lg">
                        {activeCode.code}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {activeCode.title}
                        </h3>
                        {activeCode.sourceReference && (
                          <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <BookOpen className="w-3 h-3 text-slate-500" />
                            Manual: {activeCode.sourceReference}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${
                          getSeverityBadge(activeCode.severity).bg
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full mr-1.5 ${
                            getSeverityBadge(activeCode.severity).dot
                          }`}
                        />
                        {getSeverityBadge(activeCode.severity).label}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* POR QUE OCORRE ESSA FALHA (Causas) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-amber-400">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Por que ocorre essa falha? (Causas Raízes)</span>
                    </div>
                    <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-900/40 text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                      {activeCode.causes}
                    </div>
                  </div>

                  {/* COMO RESOLVER (Solução Passo a Passo) */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Como resolver? (Procedimento de Correção)</span>
                    </div>
                    <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                      {activeCode.resolution}
                    </div>
                  </div>

                  {/* Funções e Finalidades Relacionadas */}
                  {activeCode.relatedFunctions && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                        <Layers className="w-4 h-4" />
                        <span>Funções &amp; Finalidades da Máquina Afetadas</span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs">
                        {activeCode.relatedFunctions}
                      </div>
                    </div>
                  )}

                  {/* Quick Action Footer */}
                  <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <button
                      id="btn-register-maint-from-code"
                      onClick={() => onSelectCodeForMaintenance(activeCode.code)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-medium transition-colors shadow-sm"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>Registrar Manutenção para {activeCode.code}</span>
                    </button>

                    <button
                      onClick={() => {
                        setAiAssistantOpen(!aiAssistantOpen);
                        if (!aiResponse && !aiLoading) {
                          handleQueryAI();
                        }
                      }}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs sm:text-sm font-medium transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>
                        {aiAssistantOpen
                          ? "Ocultar Suporte de IA"
                          : "Aprofundar Diagnóstico com IA"}
                      </span>
                    </button>
                  </div>

                  {/* Expandable AI Assistant Box */}
                  {aiAssistantOpen && (
                    <div className="mt-4 p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-purple-300">
                        <Sparkles className="w-4 h-4" />
                        <span>Assistente Técnico Especialista em Falhas (Gemini 3.8)</span>
                      </div>

                      {aiLoading ? (
                        <div className="flex items-center justify-center py-6 text-purple-300 text-xs gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Analisando diagrama de causa raiz e gerando guia técnico...</span>
                        </div>
                      ) : aiResponse ? (
                        <div className="p-3 bg-slate-900/80 rounded-lg border border-purple-900/60 text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                          {aiResponse}
                        </div>
                      ) : null}

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={aiCustomQuestion}
                          onChange={(e) => setAiCustomQuestion(e.target.value)}
                          placeholder="Perguntar algo específico (ex: 'O motor está zumbindo também, o que pode ser?')..."
                          className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleQueryAI();
                          }}
                        />
                        <button
                          onClick={handleQueryAI}
                          disabled={aiLoading}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          <span>Consultar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
                Selecione um código de falha para ver o diagnóstico detalhado.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
