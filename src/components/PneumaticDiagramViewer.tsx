import React, { useState } from "react";
import {
  Wind,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Search,
  ShieldAlert,
  ArrowRight,
  Activity,
  Sliders,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Wrench,
  Gauge,
  CircleDot,
  RotateCw,
  Flame,
  Maximize2,
  Box,
  Split,
  Power,
  Info,
  FileSpreadsheet,
  Copy,
  Check,
} from "lucide-react";
import {
  PNEUMATIC_COMPONENTS,
  PNEUMATIC_FAILURES_MATRIX,
  PNEUMATIC_SAFETY_PROCEDURE,
  PNEUMATIC_LAYOUT_ITEMS,
  PNEUMATIC_LAYOUT_NOTES,
  PneumaticComponent,
  PneumaticLayoutItem,
} from "../data/pneumaticData";
import { DiagnosticCode, User } from "../types";

interface PneumaticDiagramViewerProps {
  codes: DiagnosticCode[];
  currentUser: User;
  onSelectCodeForMaintenance: (code: string) => void;
  onNavigateToDiagnostic: (codeQuery: string) => void;
}

export const PneumaticDiagramViewer: React.FC<PneumaticDiagramViewerProps> = ({
  onSelectCodeForMaintenance,
  onNavigateToDiagnostic,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    "layout" | "fluxo" | "componentes" | "sopro" | "matriz" | "seguranca" | "observacoes"
  >("layout");
  const [layoutCategory, setLayoutCategory] = useState<
    "TODOS" | "CONDICIONAMENTO" | "TRAVAMENTO / POSICIONAMENTO" | "ESTIRAMENTO" | "SOPRO" | "EXTRAÇÃO"
  >("TODOS");
  const [layoutSearch, setLayoutSearch] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [compSearch, setCompSearch] = useState("");
  const [selectedCircuit, setSelectedCircuit] = useState<string>("todos");
  const [selectedGroup, setSelectedGroup] = useState<string>("todos");
  const [selectedType, setSelectedType] = useState<string>("todos");
  const [failureSearch, setFailureSearch] = useState("");
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtered layout items
  const filteredLayoutItems = PNEUMATIC_LAYOUT_ITEMS.filter((item) => {
    const matchesCat =
      layoutCategory === "TODOS" || item.category === layoutCategory;
    const q = layoutSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.av.toLowerCase().includes(q) ||
      item.partCode.toLowerCase().includes(q) ||
      item.model.toLowerCase().includes(q) ||
      item.manufacturer.toLowerCase().includes(q) ||
      item.actuation.toLowerCase().includes(q) ||
      item.functionDesc.toLowerCase().includes(q) ||
      item.purpose.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const getManufacturerBadge = (mfg: string) => {
    switch (mfg) {
      case "KOGANEI":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-950 text-sky-300 border border-sky-800">
            KOGANEI
          </span>
        );
      case "SMC":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
            SMC
          </span>
        );
      case "TAIYO":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950 text-amber-300 border border-amber-800">
            TAIYO
          </span>
        );
      case "PISCO":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-950 text-purple-300 border border-purple-800">
            PISCO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            {mfg}
          </span>
        );
    }
  };

  // Filtered components list
  const filteredComponents = PNEUMATIC_COMPONENTS.filter((comp) => {
    const matchesCircuit =
      selectedCircuit === "todos" ||
      (selectedCircuit === "operacao" && comp.circuit.includes("Operação")) ||
      (selectedCircuit === "sopro" && comp.circuit.includes("Sopro"));

    const matchesGroup =
      selectedGroup === "todos" || comp.positionGroup === selectedGroup;

    const matchesType =
      selectedType === "todos" || comp.type === selectedType;

    const query = compSearch.toLowerCase().trim();
    const matchesSearch =
      !query ||
      comp.tag.toLowerCase().includes(query) ||
      comp.partCode.toLowerCase().includes(query) ||
      comp.type.toLowerCase().includes(query) ||
      comp.positionDetail.toLowerCase().includes(query) ||
      comp.functionDesc.toLowerCase().includes(query) ||
      comp.purpose.toLowerCase().includes(query);

    return matchesCircuit && matchesGroup && matchesType && matchesSearch;
  });

  // Filtered failures
  const filteredFailures = PNEUMATIC_FAILURES_MATRIX.filter((fail) => {
    const query = failureSearch.toLowerCase().trim();
    if (!query) return true;
    return (
      fail.symptom.toLowerCase().includes(query) ||
      fail.probableComponents.some((c) => c.toLowerCase().includes(query)) ||
      fail.priorityCheck.toLowerCase().includes(query) ||
      fail.correction.toLowerCase().includes(query) ||
      fail.relatedCode.toLowerCase().includes(query)
    );
  });

  // Unique component types for filter
  const componentTypes = Array.from(
    new Set(PNEUMATIC_COMPONENTS.map((c) => c.type))
  ).sort();

  // Unique position groups
  const positionGroups = [
    "Travamento / posicionamento / rotação",
    "Aquecimento / condicionamento",
    "Estiramento",
    "Sopro / núcleo de sopro",
    "Extração / empurrador",
    "Distribuição / preparação / controle",
    "Unidade de injeção",
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Wind className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Diagrama Pneumático Funcional
              </h1>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                NISSEI ASB-70DPW V4
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-3xl">
              Mapeamento completo dos circuitos de operação (A66U65201) e ar de sopro (A65U64601), 
              identificação funcional por conjunto mecânico, códigos de peças originais (Z00P/Z10P) e rotinas de intervenção segura.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateToDiagnostic("PNEUM")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              Consultar Códigos Pneumáticos
            </button>
            <button
              onClick={() => onSelectCodeForMaintenance("PNEUM-AIR-SUPPLY")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-colors"
            >
              <Wrench className="w-3.5 h-3.5" />
              Nova O.S. Pneumática
            </button>
          </div>
        </div>

        {/* Quick Specs Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-slate-400 block text-[11px]">Unidade Principal</span>
            <span className="text-slate-200 font-mono font-medium">A66U65201 (Operation Air)</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-slate-400 block text-[11px]">Circuito de Sopro</span>
            <span className="text-slate-200 font-mono font-medium">A65U64601 (Blow Air)</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-slate-400 block text-[11px]">Componentes Catalogados</span>
            <span className="text-cyan-400 font-mono font-bold">54 Itens (AV1 a AV260)</span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
            <span className="text-slate-400 block text-[11px]">Pressão de Trabalho</span>
            <span className="text-slate-200 font-mono font-medium">0.55-0.65 MPa / Sopro até 3.5 MPa</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveSubTab("layout")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === "layout"
              ? "border-cyan-500 text-cyan-400 bg-slate-800/60 shadow-sm"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
          <span>Layout Pneumático (Tabela Oficial)</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono font-semibold">
            {PNEUMATIC_LAYOUT_ITEMS.length} Válvulas & Funções
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("fluxo")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === "fluxo"
              ? "border-cyan-500 text-cyan-400 bg-slate-800/60"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
          }`}
        >
          <Split className="w-4 h-4" />
          <span>Fluxograma dos Blocos</span>
        </button>

        <button
          onClick={() => setActiveSubTab("componentes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === "componentes"
              ? "border-cyan-500 text-cyan-400 bg-slate-800/60"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Catálogo de Componentes AV</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">
            {PNEUMATIC_COMPONENTS.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("sopro")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === "sopro"
              ? "border-cyan-500 text-cyan-400 bg-slate-800/60"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
          }`}
        >
          <Gauge className="w-4 h-4" />
          <span>Circuito de Ar de Sopro</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800">
            A65U64601
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("matriz")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === "matriz"
              ? "border-cyan-500 text-cyan-400 bg-slate-800/60"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>Matriz de Falhas Pneumáticas</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
            {PNEUMATIC_FAILURES_MATRIX.length} Casos
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("seguranca")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === "seguranca"
              ? "border-cyan-500 text-cyan-400 bg-slate-800/60"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span>Despressurização & LOTO</span>
        </button>

        <button
          onClick={() => setActiveSubTab("observacoes")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeSubTab === "observacoes"
              ? "border-cyan-500 text-cyan-400 bg-slate-800/60"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
          }`}
        >
          <Info className="w-4 h-4 text-blue-400" />
          <span>Notas Técnicas do Manual</span>
        </button>
      </div>

      {/* TAB 0: LAYOUT PNEUMÁTICO OFICIAL (Válvulas & Funções) */}
      {activeSubTab === "layout" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
            {/* Header matching the document */}
            <div className="text-center space-y-2 pb-6 border-b border-slate-800">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 mb-1">
                <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
                Documento de Engenharia & Operação
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
                LAYOUT PNEUMÁTICO – NISSEI ASB-70DPW V4
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Identificação dos componentes AV, função e finalidade — baseado no Manual NISSEI ASB-70DPW
              </p>
            </div>

            {/* Category Filter Bar matching the document top buttons */}
            <div className="pt-6 space-y-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
                Selecione o Grupo Operacional da Máquina
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setLayoutCategory("TODOS")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                    layoutCategory === "TODOS"
                      ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                      : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80"
                  }`}
                >
                  <span>TODOS</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                    layoutCategory === "TODOS" ? "bg-slate-950/30 text-slate-950 font-black" : "bg-slate-900 text-slate-400"
                  }`}>
                    {PNEUMATIC_LAYOUT_ITEMS.length}
                  </span>
                </button>

                {(
                  [
                    "CONDICIONAMENTO",
                    "TRAVAMENTO / POSICIONAMENTO",
                    "ESTIRAMENTO",
                    "SOPRO",
                    "EXTRAÇÃO",
                  ] as const
                ).map((cat) => {
                  const count = PNEUMATIC_LAYOUT_ITEMS.filter(
                    (i) => i.category === cat
                  ).length;
                  const isActive = layoutCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setLayoutCategory(cat)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                        isActive
                          ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                          : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80"
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                        isActive ? "bg-slate-950/30 text-slate-950 font-black" : "bg-slate-900 text-slate-400"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Quick Search & Count Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={layoutSearch}
                    onChange={(e) => setLayoutSearch(e.target.value)}
                    placeholder="Filtrar por AV, código, modelo ou atuação..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  {layoutSearch && (
                    <button
                      onClick={() => setLayoutSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>
                    Mostrando <strong className="text-white">{filteredLayoutItems.length}</strong> de{" "}
                    <strong>{PNEUMATIC_LAYOUT_ITEMS.length}</strong> componentes do layout
                  </span>
                  {(layoutCategory !== "TODOS" || layoutSearch) && (
                    <button
                      onClick={() => {
                        setLayoutCategory("TODOS");
                        setLayoutSearch("");
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 underline font-medium ml-1"
                    >
                      Resetar filtros
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Layout Official Table */}
            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-300 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3.5 text-center font-bold text-cyan-400 w-16">AV</th>
                    <th className="py-3 px-3.5 font-bold text-amber-400 w-28">Código NISSEI</th>
                    <th className="py-3 px-3.5 font-bold text-slate-200 min-w-[220px]">Modelo / componente</th>
                    <th className="py-3 px-3.5 font-bold text-slate-300 w-24">Fabricante</th>
                    <th className="py-3 px-3.5 font-bold text-slate-200 min-w-[150px]">Atuação</th>
                    <th className="py-3 px-3.5 font-bold text-slate-300 min-w-[200px]">Função</th>
                    <th className="py-3 px-3.5 font-bold text-slate-300 min-w-[260px]">Finalidade</th>
                    <th className="py-3 px-3 text-center font-bold text-slate-400 w-24">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-normal">
                  {filteredLayoutItems.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        Nenhum componente encontrado para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredLayoutItems.map((item, idx) => (
                      <tr
                        key={`${item.av}-${idx}`}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* 1. AV */}
                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 shadow-xs">
                            {item.av}
                          </span>
                        </td>

                        {/* 2. Código NISSEI */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-semibold text-amber-300">
                              {item.partCode}
                            </span>
                            <button
                              onClick={() => handleCopy(item.partCode)}
                              title="Copiar código de peça"
                              className="opacity-60 hover:opacity-100 text-slate-400 hover:text-white transition-opacity p-0.5"
                            >
                              {copiedCode === item.partCode ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* 3. Modelo / componente */}
                        <td className="py-3 px-3.5 text-white font-medium">
                          <span className="font-mono text-[11px] text-slate-100 bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-800">
                            {item.model}
                          </span>
                        </td>

                        {/* 4. Fabricante */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          {getManufacturerBadge(item.manufacturer)}
                        </td>

                        {/* 5. Atuação */}
                        <td className="py-3 px-3.5 font-medium text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                            <span>{item.actuation}</span>
                          </div>
                        </td>

                        {/* 6. Função */}
                        <td className="py-3 px-3.5 text-slate-300">
                          {item.functionDesc}
                        </td>

                        {/* 7. Finalidade */}
                        <td className="py-3 px-3.5 text-slate-400 text-xs leading-relaxed">
                          {item.purpose}
                        </td>

                        {/* 8. Ações */}
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() =>
                                onSelectCodeForMaintenance(`PNEUM-${item.av}`)
                              }
                              title="Abrir Ordem de Serviço com esta válvula"
                              className="p-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-colors"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onNavigateToDiagnostic(item.av)}
                              title="Buscar diagnósticos deste componente"
                              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                            >
                              <Search className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Official Footnotes Box directly from the uploaded document */}
            <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-3">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div className="space-y-1.5">
                  <p className="leading-relaxed">
                    <strong className="text-slate-200">Critério usado:</strong>{" "}
                    {PNEUMATIC_LAYOUT_NOTES.criterio}
                  </p>
                  <p className="leading-relaxed text-amber-300/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    <strong className="text-amber-200">Correção importante em relação ao layout anterior:</strong>{" "}
                    {PNEUMATIC_LAYOUT_NOTES.correcao}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: FLUXOGRAMA DOS BLOCOS */}
      {activeSubTab === "fluxo" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Split className="w-4 h-4 text-cyan-400" />
                  Arquitetura Funcional do Circuito Pneumático
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Conforme diagrama simplificado do manual NISSEI ASB-70DPW V4. Clique em qualquer bloco para ver seus componentes ou filtrar o catálogo.
                </p>
              </div>
            </div>

            {/* Visual Interactive Flow Diagram */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/80 overflow-x-auto">
              <div className="min-w-[760px] flex flex-col md:flex-row items-stretch gap-4">
                
                {/* 1. ENTRADA DE AR */}
                <div
                  onClick={() => {
                    setSelectedBlock("entrada");
                    setSelectedGroup("Distribuição / preparação / controle");
                    setActiveSubTab("componentes");
                  }}
                  className="flex-1 bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:bg-slate-900 shadow-sm group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                      Entrada de Ar
                    </span>
                    <Power className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="my-3">
                    <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      AV21 — Filtro Regulador
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Preparação, secagem e filtragem do ar primário de alimentação da máquina
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-cyan-400 font-mono">
                    <span>Pressão: 0.55~0.65 MPa</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex items-center justify-center text-slate-600">
                  <ArrowRight className="w-6 h-6" />
                </div>

                {/* 2. DISTRIBUIÇÃO */}
                <div
                  onClick={() => {
                    setSelectedBlock("distribuicao");
                    setSelectedGroup("Distribuição / preparação / controle");
                    setActiveSubTab("componentes");
                  }}
                  className="flex-1 bg-slate-900/90 border border-blue-500/40 hover:border-blue-400 rounded-xl p-4 flex flex-col justify-between cursor-pointer transition-all hover:bg-slate-900 shadow-sm group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                      Distribuição
                    </span>
                    <Sliders className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="my-3">
                    <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                      AV82 / AV83 / AV104
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Manifolds centrais e sub-manifolds de distribuição pneumática
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-blue-400 font-mono">
                    <span>3 Manifolds</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex items-center justify-center text-slate-600">
                  <ArrowRight className="w-6 h-6" />
                </div>

                {/* 3. RAMOS DE ATUAÇÃO E PROCESSO */}
                <div className="flex-[2] flex flex-col gap-2.5">
                  {/* Travamento / Posicionamento */}
                  <div
                    onClick={() => {
                      setSelectedGroup("Travamento / posicionamento / rotação");
                      setActiveSubTab("componentes");
                    }}
                    className="bg-slate-900/80 border border-slate-700/70 hover:border-amber-500/60 p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all hover:bg-slate-800/80 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <RotateCw className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white group-hover:text-amber-300">
                          Travamento / Posicionamento
                        </span>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          AV1, AV12, AV42, AV52, AV60
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">5 componentes</span>
                  </div>

                  {/* Aquecimento / Condicionamento */}
                  <div
                    onClick={() => {
                      setSelectedGroup("Aquecimento / condicionamento");
                      setActiveSubTab("componentes");
                    }}
                    className="bg-slate-900/80 border border-slate-700/70 hover:border-orange-500/60 p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all hover:bg-slate-800/80 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-orange-500/10 text-orange-400 flex items-center justify-center">
                        <Flame className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white group-hover:text-orange-300">
                          Aquecimento / Condicionamento
                        </span>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          AV2, AV4, AV43, AV44, AV84, AV85, AV93, AV94, AV122-123
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">11 componentes</span>
                  </div>

                  {/* Estiramento */}
                  <div
                    onClick={() => {
                      setSelectedGroup("Estiramento");
                      setActiveSubTab("componentes");
                    }}
                    className="bg-slate-900/80 border border-slate-700/70 hover:border-emerald-500/60 p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all hover:bg-slate-800/80 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                        <Maximize2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white group-hover:text-emerald-300">
                          Estiramento (Stretch)
                        </span>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          AV6, AV19-1,2, AV37-1,2, AV46-1,2, AV96-2, AV125
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">10 componentes</span>
                  </div>

                  {/* Sopro & Núcleo */}
                  <div
                    onClick={() => {
                      setSelectedGroup("Sopro / núcleo de sopro");
                      setActiveSubTab("componentes");
                    }}
                    className="bg-slate-900/80 border border-slate-700/70 hover:border-cyan-500/60 p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all hover:bg-slate-800/80 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                        <Gauge className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white group-hover:text-cyan-300">
                          Sopro / Núcleo de Sopro (Blow Core)
                        </span>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          AV5, AV16, AV20, AV45, AV47, AV88, AV95, AV105 + Blow Circuit (AV7, AV8, AV10)
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-cyan-400 font-mono font-bold">25 componentes</span>
                  </div>

                  {/* Extração / Empurrador */}
                  <div
                    onClick={() => {
                      setSelectedGroup("Extração / empurrador");
                      setActiveSubTab("componentes");
                    }}
                    className="bg-slate-900/80 border border-slate-700/70 hover:border-purple-500/60 p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all hover:bg-slate-800/80 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center">
                        <Box className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white group-hover:text-purple-300">
                          Extração / Empurrador (Eject)
                        </span>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          AV11, AV41-1,2, AV49-1,2, AV51, AV78, AV86, AV91, AV121
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">10 componentes</span>
                  </div>

                  {/* Controle / Monitoramento */}
                  <div
                    onClick={() => {
                      setSelectedGroup("Distribuição / preparação / controle");
                      setActiveSubTab("componentes");
                    }}
                    className="bg-slate-900/80 border border-slate-700/70 hover:border-indigo-500/60 p-3 rounded-lg flex items-center justify-between cursor-pointer transition-all hover:bg-slate-800/80 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                        <Activity className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-white group-hover:text-indigo-300">
                          Controle & Monitoramento
                        </span>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          AV90, AV140-155, AV260 (Pressostato)
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">8 componentes</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Explanatory Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Gauge className="w-4 h-4" />
                <h4 className="text-sm font-semibold text-white">Pressões de Trabalho</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                O circuito de operação trabalha com ar comprimido estabilizado em <strong className="text-slate-200">0.55 a 0.65 MPa (5.5 a 6.5 bar)</strong> via filtro regulador AV21. O circuito adicional de sopro opera com pré-sopro regulado por AV23 (0.4~1.0 MPa) e sopro de alta pressão (até 3.5 MPa) gerenciado pelo tanque AV30 e válvula AV8.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <h4 className="text-sm font-semibold text-white">Retenção Pilotada</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                As válvulas de retenção pilotada <strong className="text-slate-200">AV95 (Blow Core)</strong> e <strong className="text-slate-200">AV96-2 (Estiramento)</strong> impedem a queda livre ou perda de posição dos cilindros mesmo em caso de corte repentino de ar, exigindo despressurização manual durante manutenção.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <h4 className="text-sm font-semibold text-white">Silenciadores & Exaustão</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                A máquina possui múltiplos silenciadores de alto fluxo (AV25, AV26, AV27, AV38, AV79, AV97, AV100, AV103, AV157). O silenciador de descompressão <strong className="text-slate-200">AV25</strong> deve ser inspecionado preventivamente contra entupimento para evitar abertura forçada do molde de sopro.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATÁLOGO DE COMPONENTES AV */}
      {activeSubTab === "componentes" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={compSearch}
                  onChange={(e) => setCompSearch(e.target.value)}
                  placeholder="Buscar por Tag (ex: AV1, AV43, AV7), código de peça (Z00P..., Z10P...), tipo ou função..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                />
                {compSearch && (
                  <button
                    onClick={() => setCompSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {/* Circuit Filter */}
              <select
                value={selectedCircuit}
                onChange={(e) => setSelectedCircuit(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="todos">Todos os Circuitos</option>
                <option value="operacao">Operação (A66U65201)</option>
                <option value="sopro">Sopro (Blow Air A65U64601)</option>
              </select>

              {/* Group Filter */}
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 max-w-xs"
              >
                <option value="todos">Todos os Conjuntos da Máquina</option>
                {positionGroups.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              >
                <option value="todos">Todos os Tipos</option>
                {componentTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Active filters pill display */}
            {(selectedCircuit !== "todos" || selectedGroup !== "todos" || selectedType !== "todos" || compSearch) && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">Filtros ativos:</span>
                <span className="text-cyan-400 font-medium">
                  {filteredComponents.length} de {PNEUMATIC_COMPONENTS.length} componentes encontrados
                </span>
                <button
                  onClick={() => {
                    setSelectedCircuit("todos");
                    setSelectedGroup("todos");
                    setSelectedType("todos");
                    setCompSearch("");
                  }}
                  className="ml-auto text-xs text-slate-400 hover:text-white underline"
                >
                  Resetar todos os filtros
                </button>
              </div>
            )}
          </div>

          {/* Table Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-3 w-16">Tag</th>
                    <th className="py-3 px-3 w-28">Código Peça</th>
                    <th className="py-3 px-3 w-36">Tipo</th>
                    <th className="py-3 px-3">Conjunto / Posição</th>
                    <th className="py-3 px-3">Função Operacional</th>
                    <th className="py-3 px-3">Finalidade</th>
                    <th className="py-3 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredComponents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Nenhum componente encontrado para os critérios de busca selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredComponents.map((item) => (
                      <tr
                        key={`${item.tag}-${item.partCode}-${item.manualPage}`}
                        className="hover:bg-slate-800/40 transition-colors group"
                      >
                        {/* Tag */}
                        <td className="py-2.5 px-3">
                          <span className="font-mono font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                            {item.tag}
                          </span>
                        </td>

                        {/* Código de Peça */}
                        <td className="py-2.5 px-3 font-mono text-slate-200 font-semibold">
                          {item.partCode}
                        </td>

                        {/* Tipo */}
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60">
                            {item.type}
                          </span>
                        </td>

                        {/* Posição / Conjunto */}
                        <td className="py-2.5 px-3">
                          <div className="text-white font-medium">{item.positionDetail}</div>
                          <div className="text-[11px] text-slate-400">{item.positionGroup}</div>
                        </td>

                        {/* Função */}
                        <td className="py-2.5 px-3 text-slate-300">
                          {item.functionDesc}
                        </td>

                        {/* Finalidade & Circuito */}
                        <td className="py-2.5 px-3">
                          <div className="text-slate-300">{item.purpose}</div>
                          <span className={`inline-block mt-0.5 text-[10px] px-1 rounded ${
                            item.circuit.includes("Sopro")
                              ? "bg-cyan-950 text-cyan-300 border border-cyan-800/60"
                              : "bg-slate-950 text-slate-400"
                          }`}>
                            {item.manualPage}
                          </span>
                        </td>

                        {/* Ação */}
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => onSelectCodeForMaintenance(item.tag)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 border border-slate-700 transition-colors"
                            title={`Abrir Ordem de Serviço referenciando ${item.tag} (${item.partCode})`}
                          >
                            <Wrench className="w-3 h-3" />
                            <span>O.S.</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CIRCUITO DE AR DE SOPRO (A65U64601) */}
      {activeSubTab === "sopro" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    Unidade A65U64601
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Circuito de Ar de Sopro (Blow Air Circuit)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Circuito dedicado de alta performance para injeção-estiramento-sopro de frascos PET. Controla o pré-sopro primário, sopro de alta pressão e descompressão rápida.
                </p>
              </div>

              <button
                onClick={() => onSelectCodeForMaintenance("BLOW-PRIM-FAIL")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-colors shrink-0"
              >
                <Wrench className="w-3.5 h-3.5" />
                Registrar Manutenção de Sopro
              </button>
            </div>

            {/* Visual Step Pipeline of Blow Process */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mb-1">
                  <span>1. ACUMULAÇÃO & SEGURANÇA</span>
                  <Box className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold text-white">Tanque AV30 & Válvula AV31</div>
                <p className="text-xs text-slate-400 mt-1">
                  Reservatório Z00P07802 com válvula de alívio mecânico AV31 e purga inferior de água condensada pela válvula esfera AV29.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mb-1">
                  <span>2. SOPRO PRIMÁRIO</span>
                  <Wind className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold text-white">AV7, AV18, AV22, AV23</div>
                <p className="text-xs text-slate-400 mt-1">
                  Pré-sopro para inflar suavemente a pré-forma durante a descida da haste de estiramento. Pressão monitorada pelo manômetro AV35.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mb-1">
                  <span>3. SOPRO SECUNDÁRIO</span>
                  <Gauge className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold text-white">AV8, AV13, AV24</div>
                <p className="text-xs text-slate-400 mt-1">
                  Sopro de acabamento em alta pressão (até 3.5 MPa) para conformar a garrafa contra a parede gelada do molde. Monitorado por AV36.
                </p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mb-1">
                  <span>4. DESCOMPRESSÃO</span>
                  <Activity className="w-4 h-4" />
                </div>
                <div className="text-sm font-semibold text-white">AV10, AV25, AV126</div>
                <p className="text-xs text-slate-400 mt-1">
                  Exaustão supersônica silenciada por AV25. Pressostato AV126 garante pressão zero antes da abertura mecânica do molde.
                </p>
              </div>
            </div>

            {/* Blow Circuit Components Grid */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Componentes do Circuito A65U64601
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PNEUMATIC_COMPONENTS.filter((c) => c.circuit.includes("Sopro")).map((comp) => (
                <div
                  key={comp.tag}
                  className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-lg flex flex-col justify-between hover:border-cyan-500/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-400 text-sm">
                        {comp.tag}
                      </span>
                      <span className="font-mono text-xs text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                        {comp.partCode}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-white mt-1.5">
                      {comp.type} — {comp.positionDetail}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {comp.functionDesc}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 truncate mr-2">{comp.purpose}</span>
                    <button
                      onClick={() => onSelectCodeForMaintenance(comp.tag)}
                      className="text-cyan-400 hover:text-cyan-300 font-medium shrink-0 flex items-center gap-1"
                    >
                      <span>O.S.</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: MATRIZ DE FALHAS PNEUMÁTICAS */}
      {activeSubTab === "matriz" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={failureSearch}
                onChange={(e) => setFailureSearch(e.target.value)}
                placeholder="Filtrar falhas por sintoma, componente suspeito (ex: AV7, AV10, AV19, AV260) ou ação..."
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredFailures.map((fail) => (
              <div
                key={fail.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-sm transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div className="space-y-1 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {fail.relatedCode}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {fail.circuit}
                      </span>
                      <h4 className="text-sm sm:text-base font-semibold text-white">
                        {fail.symptom}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                      <span className="text-xs text-slate-400">Componentes suspeitos:</span>
                      {fail.probableComponents.map((c, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-slate-950 text-cyan-300 border border-slate-800"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0">
                    <button
                      onClick={() => onNavigateToDiagnostic(fail.relatedCode)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                    >
                      <Search className="w-3.5 h-3.5 text-blue-400" />
                      Ver Diagnóstico
                    </button>
                    <button
                      onClick={() => onSelectCodeForMaintenance(fail.relatedCode)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-colors"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Abrir O.S.
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                    <span className="font-semibold text-amber-400 block mb-1">
                      Verificação Imediata Prioritária:
                    </span>
                    <p className="text-slate-300 leading-relaxed">{fail.priorityCheck}</p>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                    <span className="font-semibold text-cyan-400 block mb-1">
                      Ação de Correção Recomendada:
                    </span>
                    <p className="text-slate-300 leading-relaxed">{fail.correction}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: DESPRESSURIZAÇÃO & LOTO */}
      {activeSubTab === "seguranca" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-300">
                  Norma Crítica de Segurança — Bloqueio de Energia Pneumática (LOTO)
                </h3>
                <p className="text-xs text-amber-200/90 mt-1 leading-relaxed">
                  O circuito pneumático da NISSEI ASB-70DPW V4 opera com altas pressões (sopro até 3.5 MPa / 35 bar) e cilindros com válvulas de retenção pilotada que retêm ar aprisionado mesmo após a despressurização da rede geral. Sempre execute o procedimento de 6 etapas abaixo antes de afrouxar conexões ou desmontar atuadores.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {PNEUMATIC_SAFETY_PROCEDURE.map((step) => {
                const isExpanded = expandedStep === step.stepNumber;
                return (
                  <div
                    key={step.stepNumber}
                    className="border border-slate-800 rounded-xl bg-slate-950/60 overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedStep(isExpanded ? null : step.stepNumber)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xs">
                          {step.stepNumber}
                        </span>
                        <span className="font-semibold text-white text-sm">
                          {step.title}
                        </span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-1 border-t border-slate-800/80 bg-slate-900/40 text-xs space-y-3">
                        <p className="text-slate-300 leading-relaxed font-normal">
                          {step.action}
                        </p>

                        {step.safetyWarning && (
                          <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                            <span>
                              <strong className="font-semibold text-red-300">Atenção:</strong>{" "}
                              {step.safetyWarning}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: OBSERVAÇÕES TÉCNICAS DO MANUAL */}
      {activeSubTab === "observacoes" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <div className="flex items-center gap-2 text-blue-400">
              <Info className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">
                Observações Técnicas Importantes (Documento de Apoio ao Manual)
              </h3>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <span className="p-1 rounded bg-blue-500/10 text-blue-400 mt-0.5 font-bold">1</span>
                <div>
                  <strong className="text-white block mb-0.5">Base Oficial de Códigos e Descrições</strong>
                  Os códigos e descrições dos componentes foram extraídos diretamente da lista <em>Operation Air Circuit</em> do manual oficial da máquina NISSEI ASB-70DPW V4, unidade <strong className="text-cyan-300 font-mono">A66U65201</strong>, e circuito de sopro <strong className="text-cyan-300 font-mono">A65U64601</strong>.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <span className="p-1 rounded bg-blue-500/10 text-blue-400 mt-0.5 font-bold">2</span>
                <div>
                  <strong className="text-white block mb-0.5">Correspondência Estrita de Cilindros Térmicos</strong>
                  Conforme o manual original: <strong className="text-amber-300 font-mono">AV43 = Z00P06910</strong> (Cilindro do Pote de Aquecimento / Heating Pot) e <strong className="text-amber-300 font-mono">AV44 = Z00P09525</strong> (Cilindro do Núcleo de Aquecimento / Heating Core).
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <span className="p-1 rounded bg-blue-500/10 text-blue-400 mt-0.5 font-bold">3</span>
                <div>
                  <strong className="text-white block mb-0.5">Critério de Localização e Posição dos Componentes</strong>
                  O manual lista os componentes e seus conjuntos funcionais, mas as páginas de Parts List não fornecem coordenadas físicas em grade (ex.: X/Y). Portanto, a coluna de posição do sistema adota o <strong className="text-white">conjunto funcional indicado pelo fabricante no campo REMARKS</strong>.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                <span className="p-1 rounded bg-blue-500/10 text-blue-400 mt-0.5 font-bold">4</span>
                <div>
                  <strong className="text-white block mb-0.5">Orientação para Tubulação e Calibração</strong>
                  Este diagrama funcional interativo é uma reorganização para rápida consulta e diagnóstico em campo. Para substituição completa de tubulação, dimensionamento de mangueiras ou ajustes finos de pressão pneumática, consulte sempre os esquemas de tubulação mecânica da unidade.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
