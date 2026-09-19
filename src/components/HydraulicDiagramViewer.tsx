import React, { useState } from "react";
import {
  Droplets,
  Search,
  Filter,
  Wrench,
  Check,
  Copy,
  Info,
  Layers,
  Zap,
  Wind,
  Gauge,
  Activity,
  Sliders,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import {
  HYDRAULIC_COMPONENTS,
  HYDRAULIC_CIRCUIT_GROUPS,
  HYDRAULIC_TECHNICAL_NOTE,
  HydraulicComponent,
} from "../data/hydraulicData";
import { User } from "../types";

interface HydraulicDiagramViewerProps {
  currentUser: User;
  onSelectCodeForMaintenance: (codeId: string) => void;
  onNavigateToDiagnostic: (query: string) => void;
  onNavigateToElectricalDiagram?: () => void;
  onNavigateToPneumaticDiagram?: () => void;
}

export const HydraulicDiagramViewer: React.FC<HydraulicDiagramViewerProps> = ({
  currentUser,
  onSelectCodeForMaintenance,
  onNavigateToDiagnostic,
  onNavigateToElectricalDiagram,
  onNavigateToPneumaticDiagram,
}) => {
  const [selectedCircuit, setSelectedCircuit] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("todos");
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"tabela" | "circuitos">("tabela");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTag(text);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  // Component Types list for filter
  const componentTypes = Array.from(
    new Set(HYDRAULIC_COMPONENTS.map((c) => c.type))
  ).sort();

  // Filter components
  const filteredComponents = HYDRAULIC_COMPONENTS.filter((comp) => {
    const matchesCircuit =
      selectedCircuit === "todos" || comp.circuitId === selectedCircuit;
    const matchesType =
      typeFilter === "todos" || comp.type === typeFilter;
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      comp.tag.toLowerCase().includes(q) ||
      comp.type.toLowerCase().includes(q) ||
      comp.circuitName.toLowerCase().includes(q) ||
      comp.componentFunction.toLowerCase().includes(q) ||
      comp.purpose.toLowerCase().includes(q);

    return matchesCircuit && matchesType && matchesSearch;
  });

  const getTypeBadge = (type: string) => {
    if (type.includes("solenoide")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950 text-amber-300 border border-amber-800/80">
          {type}
        </span>
      );
    }
    if (type.includes("Cilindro")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/80">
          {type}
        </span>
      );
    }
    if (type.includes("Pressostato") || type.includes("Transmissor") || type.includes("Manômetro")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
          {type}
        </span>
      );
    }
    if (type.includes("Bomba")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-950 text-rose-300 border border-rose-800/80">
          {type}
        </span>
      );
    }
    if (type.includes("alívio") || type.includes("redutora")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-950 text-red-300 border border-red-800/80">
          {type}
        </span>
      );
    }
    if (type.includes("Filtro") || type.includes("Microseparador") || type.includes("Resfriador") || type.includes("Respiro")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-950 text-teal-300 border border-teal-800/80">
          {type}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Droplets className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  NISSEI ASB – FUNÇÃO E FINALIDADE DOS COMPONENTES
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  Complemento técnico elaborado com base no PDF "NISSEI ASB - Listas por Molde e Circuito" (V4)
                </p>
              </div>
            </div>
          </div>

          {/* Quick Cross-diagram Switcher buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 font-medium mr-1 hidden sm:inline">
              Sistemas V4:
            </span>
            {onNavigateToElectricalDiagram && (
              <button
                onClick={onNavigateToElectricalDiagram}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Elétrico (43)
              </button>
            )}
            {onNavigateToPneumaticDiagram && (
              <button
                onClick={onNavigateToPneumaticDiagram}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all"
              >
                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                Pneumático (15)
              </button>
            )}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white border border-blue-400 shadow-sm">
              <Droplets className="w-3.5 h-3.5" />
              Hidráulico Ativo
            </div>
          </div>
        </div>

        {/* View mode toggle & Global Stats */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1.5">
              <strong className="text-white text-sm font-mono">9</strong> Circuitos Funcionais
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5">
              <strong className="text-white text-sm font-mono">{HYDRAULIC_COMPONENTS.length}</strong> Componentes Cadastrados
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-blue-400">
              <ShieldCheck className="w-4 h-4" />
              Bombas P1, P2, P3 e Proteções Alívio
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode("tabela")}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                viewMode === "tabela"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Visualização em Tabela
            </button>
            <button
              onClick={() => setViewMode("circuitos")}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                viewMode === "circuitos"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Visão por Circuitos (9 Blocos)
            </button>
          </div>
        </div>
      </div>

      {/* Circuit Filter Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-4">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Filtrar por Circuito Funcional
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedCircuit("todos")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedCircuit === "todos"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60"
            }`}
          >
            <span>TODOS</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
              selectedCircuit === "todos" ? "bg-blue-800 text-white" : "bg-slate-900 text-slate-400"
            }`}>
              {HYDRAULIC_COMPONENTS.length}
            </span>
          </button>

          {HYDRAULIC_CIRCUIT_GROUPS.map((grp) => {
            const count = HYDRAULIC_COMPONENTS.filter(
              (c) => c.circuitId === grp.id
            ).length;
            const isSelected = selectedCircuit === grp.id;
            return (
              <button
                key={grp.id}
                onClick={() => setSelectedCircuit(grp.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm font-semibold"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700/60"
                }`}
              >
                <span>{grp.number}. {grp.name}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  isSelected ? "bg-blue-800 text-white" : "bg-slate-900 text-slate-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Type Select */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por tag V..., função ou finalidade..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="todos">Todos os tipos de componentes</option>
              {componentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: TABELA */}
      {viewMode === "tabela" && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-300 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5 text-center font-bold text-blue-400 w-20">
                    Componente
                  </th>
                  <th className="py-3 px-3.5 font-bold text-slate-200 min-w-[150px]">
                    Tipo de Componente
                  </th>
                  <th className="py-3 px-3.5 font-bold text-amber-400 min-w-[160px]">
                    Circuito Funcional
                  </th>
                  <th className="py-3 px-3.5 font-bold text-slate-200 min-w-[240px]">
                    Função
                  </th>
                  <th className="py-3 px-3.5 font-bold text-slate-300 min-w-[280px]">
                    Finalidade
                  </th>
                  <th className="py-3 px-3 text-center font-bold text-slate-400 w-24">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredComponents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      Nenhum componente hidráulico encontrado para os critérios selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredComponents.map((comp, idx) => (
                    <tr
                      key={`${comp.tag}-${idx}`}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* 1. Componente Tag */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-mono font-bold bg-blue-950/80 text-blue-300 border border-blue-800/80 shadow-xs">
                            {comp.tag}
                          </span>
                          <button
                            onClick={() => handleCopy(comp.tag)}
                            title="Copiar tag do componente"
                            className="opacity-50 hover:opacity-100 text-slate-400 hover:text-white transition-opacity p-0.5"
                          >
                            {copiedTag === comp.tag ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* 2. Tipo de Componente */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {getTypeBadge(comp.type)}
                      </td>

                      {/* 3. Circuito Funcional */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-300">
                          {comp.circuitName}
                        </span>
                      </td>

                      {/* 4. Função */}
                      <td className="py-3 px-3.5 text-slate-200 font-medium">
                        {comp.componentFunction}
                      </td>

                      {/* 5. Finalidade */}
                      <td className="py-3 px-3.5 text-slate-400 leading-relaxed">
                        {comp.purpose}
                      </td>

                      {/* 6. Ações */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() =>
                              onSelectCodeForMaintenance(`HIDRAULICO-${comp.tag}`)
                            }
                            title="Criar Ordem de Serviço para este componente"
                            className="p-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-colors"
                          >
                            <Wrench className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onNavigateToDiagnostic(comp.tag)}
                            title="Ver diagnósticos correlatos"
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
        </div>
      )}

      {/* VIEW MODE 2: VISÃO POR CIRCUITOS (9 Blocos) */}
      {viewMode === "circuitos" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {HYDRAULIC_CIRCUIT_GROUPS.map((grp) => {
            const comps = HYDRAULIC_COMPONENTS.filter(
              (c) => c.circuitId === grp.id
            );
            return (
              <div
                key={grp.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center justify-center font-mono">
                        {grp.number}
                      </span>
                      <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                        {grp.name}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {comps.length} componentes
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2.5 font-medium leading-relaxed">
                    <strong className="text-slate-300">Circuito funcional:</strong> {grp.circuitFunction}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {grp.description}
                  </p>

                  <div className="mt-4 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Componentes Principais:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {comps.map((c) => (
                        <button
                          key={c.tag}
                          onClick={() => {
                            setSelectedCircuit(grp.id);
                            setViewMode("tabela");
                            setSearchTerm(c.tag);
                          }}
                          className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
                          title={`${c.tag}: ${c.componentFunction}`}
                        >
                          {c.tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setSelectedCircuit(grp.id);
                      setViewMode("tabela");
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                  >
                    Ver detalhes deste circuito &rarr;
                  </button>
                  <button
                    onClick={() =>
                      onSelectCodeForMaintenance(`CIRCUITO-HIDR-${grp.name}`)
                    }
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Wrench className="w-3 h-3" />
                    Abrir O.S.
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Official Technical Note Box directly matching document */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Observação Técnica
            </h4>
            <p className="leading-relaxed">
              {HYDRAULIC_TECHNICAL_NOTE.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
