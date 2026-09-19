import React, { useState } from "react";
import {
  Zap,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Search,
  ShieldAlert,
  Cpu,
  Flame,
  ArrowRight,
  Activity,
  Sliders,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Radio,
  FileCheck,
  Server,
  Cable,
  Wrench,
} from "lucide-react";
import {
  ELECTRICAL_SHEETS,
  ELECTRICAL_FAILURES_MATRIX,
  SAFE_DIAGNOSTIC_STEPS,
  ELECTRICAL_COMPONENTS_SUMMARY,
  ElectricalSheet,
} from "../data/electricalData";
import { DiagnosticCode, User } from "../types";

interface ElectricalDiagramViewerProps {
  codes: DiagnosticCode[];
  currentUser: User;
  onSelectCodeForMaintenance: (code: string) => void;
  onNavigateToDiagnostic: (codeQuery: string) => void;
}

export const ElectricalDiagramViewer: React.FC<ElectricalDiagramViewerProps> = ({
  onSelectCodeForMaintenance,
  onNavigateToDiagnostic,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"matriz" | "pranchas" | "roteiro" | "componentes" | "arquitetura">("matriz");
  const [sheetSearch, setSheetSearch] = useState("");
  const [sheetCategory, setSheetCategory] = useState<string>("todos");
  const [failureSearch, setFailureSearch] = useState("");
  const [expandedStep, setExpandedStep] = useState<number | null>(1);
  const [activePowerNode, setActivePowerNode] = useState<string | null>("tc2");

  // Filtering sheets
  const filteredSheets = ELECTRICAL_SHEETS.filter((sheet) => {
    const matchesCategory = sheetCategory === "todos" || sheet.category === sheetCategory;
    const query = sheetSearch.toLowerCase();
    const matchesSearch =
      sheet.name.toLowerCase().includes(query) ||
      sheet.description.toLowerCase().includes(query) ||
      sheet.page.toString().includes(query) ||
      (sheet.keyComponents && sheet.keyComponents.some((k) => k.toLowerCase().includes(query)));
    return matchesCategory && matchesSearch;
  });

  // Filtering failure matrix
  const filteredFailures = ELECTRICAL_FAILURES_MATRIX.filter((item) => {
    const query = failureSearch.toLowerCase();
    return (
      item.symptom.toLowerCase().includes(query) ||
      item.probableBlocks.toLowerCase().includes(query) ||
      item.priorityCheck.toLowerCase().includes(query) ||
      item.correction.toLowerCase().includes(query) ||
      item.relatedCode.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/80">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Mapa Elétrico Funcional
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                NISSEI ASB-70DPW Ver.4 SERVO
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono text-slate-400 bg-slate-950 border border-slate-800">
                Doc. Nº 389A61809 (43 Pranchas)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Diagrama Elétrico & Matriz Rápida de Falhas
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Arquitetura de 380 V 3P / 60 Hz • Transformador 25 kVA • Servo Drives AMSE (P1/P2/P3/SM1) • Aquecimento SSR • PLC Yokogawa F3SP71-4S com IHM Pro-face
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-amber-950/40 border border-amber-800/60 rounded-lg p-3 text-xs text-amber-200 flex items-start gap-2.5 max-w-xs">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-300 font-semibold mb-0.5">Segurança Crítica (LOTO)</strong>
                Desligue e bloqueie o disjuntor <code className="text-amber-200 font-mono">QF1 (225 A)</code> antes de qualquer medição interna.
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubTab("matriz")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeSubTab === "matriz"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Activity className="w-4 h-4" />
            Matriz Rápida de Falhas ({ELECTRICAL_FAILURES_MATRIX.length})
          </button>

          <button
            onClick={() => setActiveSubTab("arquitetura")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeSubTab === "arquitetura"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            Fluxo de Potência & Arquitetura
          </button>

          <button
            onClick={() => setActiveSubTab("pranchas")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeSubTab === "pranchas"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            Índice das 43 Pranchas ({ELECTRICAL_SHEETS.length})
          </button>

          <button
            onClick={() => setActiveSubTab("roteiro")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeSubTab === "roteiro"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Sliders className="w-4 h-4" />
            Roteiro de 10 Etapas
          </button>

          <button
            onClick={() => setActiveSubTab("componentes")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeSubTab === "componentes"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Cpu className="w-4 h-4" />
            Componentes por Família
          </button>
        </div>
      </div>

      {/* TAB 1: MATRIZ RÁPIDA DE FALHAS */}
      {activeSubTab === "matriz" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={failureSearch}
                onChange={(e) => setFailureSearch(e.target.value)}
                placeholder="Filtrar por sintoma (ex: apaga, bomba não parte, servo, aquecedor, ar de sopro, chiller)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span className="font-semibold text-slate-200">{filteredFailures.length}</span> sintomas encontrados
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFailures.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="w-4 h-4" />
                      </span>
                      <h3 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                        {item.symptom}
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
                      {item.relatedCode}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium mb-0.5">Blocos e Componentes Prováveis:</span>
                      <p className="text-slate-200 font-mono text-[11px] bg-slate-950/70 px-2.5 py-1.5 rounded border border-slate-800/80">
                        {item.probableBlocks}
                      </p>
                    </div>

                    <div>
                      <span className="text-slate-400 block font-medium mb-0.5">Verificação Prioritária no Painel:</span>
                      <p className="text-slate-300 bg-slate-950/40 p-2 rounded border border-slate-800/60 leading-relaxed">
                        {item.priorityCheck}
                      </p>
                    </div>

                    <div>
                      <span className="text-amber-400 block font-medium mb-0.5">Ação de Correção Recomendada:</span>
                      <p className="text-slate-300 bg-amber-950/10 p-2 rounded border border-amber-900/30 leading-relaxed">
                        {item.correction}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onNavigateToDiagnostic(item.relatedCode)}
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Ver no Diagnóstico Geral
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSelectCodeForMaintenance(item.relatedCode)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-all"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    Abrir O.S.
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: FLUXO DE POTÊNCIA & ARQUITETURA INTERATIVA */}
      {activeSubTab === "arquitetura" && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Hierarquia de Tensão e Distribuição de Energia (Diagrama em Blocos)
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Clique em qualquer estágio do barramento para inspecionar os componentes, proteções e pranchas correspondentes.
            </p>

            {/* Architecture Flow Diagram */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {/* Node 1: 380V Main Infeed */}
              <button
                onClick={() => setActivePowerNode("qf1")}
                className={`text-left p-4 rounded-xl border transition-all ${
                  activePowerNode === "qf1"
                    ? "bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/30"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold">
                    380 V • 60 Hz 3P
                  </span>
                  <span className="text-xs text-slate-400">Prancha 2</span>
                </div>
                <h4 className="text-xs font-bold text-white">Entrada de Rede & QF1</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Disjuntor Geral 225A (Z00J08746), Protetor de Surto SPD1, Aterramento PE.
                </p>
              </button>

              {/* Node 2: Transformer TC2 */}
              <button
                onClick={() => setActivePowerNode("tc2")}
                className={`text-left p-4 rounded-xl border transition-all ${
                  activePowerNode === "tc2"
                    ? "bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/30"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                    25 kVA Trafo TC2
                  </span>
                  <span className="text-xs text-slate-400">Prancha 2 e 12</span>
                </div>
                <h4 className="text-xs font-bold text-white">Conversão 380V &rarr; 200V</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Transformador de isolamento e potência para servo bombas e aquecimento.
                </p>
              </button>

              {/* Node 3: 200V / 100V Distribution */}
              <button
                onClick={() => setActivePowerNode("dist200")}
                className={`text-left p-4 rounded-xl border transition-all ${
                  activePowerNode === "dist200"
                    ? "bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/30"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">
                    200V / 100V CA
                  </span>
                  <span className="text-xs text-slate-400">Pranchas 3 a 12</span>
                </div>
                <h4 className="text-xs font-bold text-white">Drives & Aquecimento</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Servos AMSE1-3, Canhão, Hot Runner, Bicos e transformador TC1 (1kVA/100V).
                </p>
              </button>

              {/* Node 4: DC24V & Automation */}
              <button
                onClick={() => setActivePowerNode("dc24")}
                className={`text-left p-4 rounded-xl border transition-all ${
                  activePowerNode === "dc24"
                    ? "bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/30"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                    24V CC & PLC
                  </span>
                  <span className="text-xs text-slate-400">Pranchas 11, 15, 30</span>
                </div>
                <h4 className="text-xs font-bold text-white">Fontes PSU & Controle</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Fontes PSU1 (válvulas), PSU3 (sensores), CPU F3SP71 e IHM Pro-face.
                </p>
              </button>
            </div>

            {/* Detailed Inspector for active power node */}
            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5">
              {activePowerNode === "qf1" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Entrada Geral 380V • QF1
                    </span>
                    <h4 className="text-sm font-bold text-white">Detalhes do Disjuntor Geral & Entrada CE</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block font-medium mb-1">Disjuntor Principal:</span>
                      <p className="font-mono text-slate-200">QF1 — 225 A (Z00J08746)</p>
                      <p className="text-[11px] text-slate-400 mt-1">Capacidade de interrupção dimensionada para toda a carga da injetora.</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block font-medium mb-1">Proteção Contra Surtos:</span>
                      <p className="font-mono text-slate-200">SPD1 (Z10L01410)</p>
                      <p className="text-[11px] text-slate-400 mt-1">Suprime transientes e descargas atmosféricas da rede de fornecimento.</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block font-medium mb-1">Relé de Fuga & Terra:</span>
                      <p className="font-mono text-slate-200">GF1 + Barramento PE</p>
                      <p className="text-[11px] text-slate-400 mt-1">Monitora corrente de fuga para carcaça e garante aterramento equipotencial.</p>
                    </div>
                  </div>
                </div>
              )}

              {activePowerNode === "tc2" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Transformador Interno TC2
                    </span>
                    <h4 className="text-sm font-bold text-white">Adequação de Tensão 380V &rarr; 200V CA</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block font-medium mb-1">Potência Nominal:</span>
                      <p className="font-mono text-slate-200">25 kVA (Trifásico)</p>
                      <p className="text-[11px] text-slate-400 mt-1">Isolamento galvânico entre a rede externa de 380V e a máquina.</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block font-medium mb-1">Disjuntores Secundários:</span>
                      <p className="font-mono text-slate-200">QF2 (63A) & QF3 (100A)</p>
                      <p className="text-[11px] text-slate-400 mt-1">Ramal QF2 alimenta controles; QF3 alimenta potências e aquecedores.</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block font-medium mb-1">Frequência de Operação:</span>
                      <p className="font-mono text-slate-200">60 Hz (Configuração Brasil/Américas)</p>
                      <p className="text-[11px] text-slate-400 mt-1">Taps de ajuste no primário para adequação de desvios da concessionária.</p>
                    </div>
                  </div>
                </div>
              )}

              {activePowerNode === "dist200" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Barramento 200V / 100V
                    </span>
                    <h4 className="text-sm font-bold text-white">Cargas de Acionamento e Sistema Térmico</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block font-medium mb-1">Servo Bombas P1 / P2 / P3:</span>
                      <p className="font-mono text-slate-200">3x Drives AMSE (22 kW) + QFM1-3</p>
                      <p className="text-[11px] text-slate-400 mt-1">Injeção (P1), Molde/Main Ram (P2) e Sopro/Estiramento (P3).</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block font-medium mb-1">Servomotor SM1 (Rotação):</span>
                      <p className="font-mono text-slate-200">Servo Amp + Resistor R1 + Filtro NF1</p>
                      <p className="text-[11px] text-slate-400 mt-1">Movimentação indexada de 4 posições da mesa com encoder óptico RE1.</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block font-medium mb-1">Aquecimento Modular:</span>
                      <p className="font-mono text-slate-200">Fusíveis FU + Relés SSR + Zonas H</p>
                      <p className="text-[11px] text-slate-400 mt-1">Canhão (H11-33), Hot Runner (H211-254), Pot (H51-90) e Core (H401-424).</p>
                    </div>
                  </div>
                </div>
              )}

              {activePowerNode === "dc24" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Controle Digital 24V CC & Rede
                    </span>
                    <h4 className="text-sm font-bold text-white">Arquitetura de Automação & Comunicação</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block font-medium mb-1">Fontes Reguladas 24V CC:</span>
                      <p className="font-mono text-slate-200">PSU1 (Solenóides) & PSU3 (Sensores)</p>
                      <p className="text-[11px] text-slate-400 mt-1">Fontes independentes para evitar ruídos de comutação nas entradas digitais.</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block font-medium mb-1">Sequenciador PLC Yokogawa:</span>
                      <p className="font-mono text-slate-200">CPU F3SP71-4S + Base F3BU13-0NCN</p>
                      <p className="text-[11px] text-slate-400 mt-1">Módulos DI-64P (X002/X004), DO-64P (Y003/Y005/Y006) e Thermo NX-D25.</p>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block font-medium mb-1">Rede Ethernet & Display:</span>
                      <p className="font-mono text-slate-200">PLC: 192.168.0.2 | HMI: 192.168.0.3</p>
                      <p className="text-[11px] text-slate-400 mt-1">IHM Pro-face PFXGP4401TAD e gateway Moxa UC-7112Plus.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ÍNDICE DAS 43 PRANCHAS */}
      {activeSubTab === "pranchas" && (
        <div className="space-y-4">
          {/* Filters and Search */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={sheetSearch}
                onChange={(e) => setSheetSearch(e.target.value)}
                placeholder="Buscar prancha por número, nome ou componente (ex: Barrel, Pump, DI-64P, Heater, AV, SQ)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              {["todos", "Potência", "Acionamentos", "Aquecimento", "Controle", "Sensoriamento", "Atuação", "Segurança", "Interface"].map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setSheetCategory(cat)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${
                      sheetCategory === cat
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Sheets Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-16 text-center">Nº</th>
                    <th className="py-3 px-4">Nome da Prancha</th>
                    <th className="py-3 px-4">Categoria</th>
                    <th className="py-3 px-4">Descrição Funcional</th>
                    <th className="py-3 px-4">Componentes Chave</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredSheets.map((sheet) => (
                    <tr key={sheet.page} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-center font-mono font-bold text-amber-400">
                        {sheet.page}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        {sheet.name}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${
                            sheet.category === "Potência"
                              ? "bg-red-950/80 text-red-300 border border-red-800/60"
                              : sheet.category === "Acionamentos"
                              ? "bg-purple-950/80 text-purple-300 border border-purple-800/60"
                              : sheet.category === "Aquecimento"
                              ? "bg-amber-950/80 text-amber-300 border border-amber-800/60"
                              : sheet.category === "Controle"
                              ? "bg-blue-950/80 text-blue-300 border border-blue-800/60"
                              : sheet.category === "Sensoriamento"
                              ? "bg-cyan-950/80 text-cyan-300 border border-cyan-800/60"
                              : sheet.category === "Atuação"
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                              : sheet.category === "Segurança"
                              ? "bg-rose-950/80 text-rose-300 border border-rose-800/60"
                              : "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {sheet.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-md">
                        {sheet.description}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {sheet.keyComponents?.map((comp, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-[10px] text-slate-400 border border-slate-800"
                            >
                              {comp}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSheets.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        Nenhuma prancha encontrada para a busca "{sheetSearch}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ROTEIRO SEGURO DE DIAGNÓSTICO (10 ETAPAS) */}
      {activeSubTab === "roteiro" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Roteiro Sistemático de Diagnóstico Elétrico Seguro</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Siga estas 10 etapas rigorosas estabelecidas no manual de manutenção elétrica para resolver qualquer anomalia sem colocar operadores em risco e sem queimar componentes eletrônicos sensíveis.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {SAFE_DIAGNOSTIC_STEPS.map((step) => {
              const isExpanded = expandedStep === step.stepNumber;
              return (
                <div
                  key={step.stepNumber}
                  className={`bg-slate-900 border rounded-xl transition-all ${
                    isExpanded
                      ? "border-amber-500/60 ring-1 ring-amber-500/20 shadow-md"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <button
                    onClick={() => setExpandedStep(isExpanded ? null : step.stepNumber)}
                    className="w-full text-left p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-amber-950 text-amber-300 border border-amber-800 flex items-center justify-center font-bold text-xs font-mono">
                        {step.stepNumber}
                      </span>
                      <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 text-xs space-y-3">
                      <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                        {step.action}
                      </p>

                      {step.criticalSafetyTip && (
                        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-950/30 border border-red-800/60 text-red-200">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="block text-red-300 font-semibold mb-0.5">Nota de Segurança Crítica:</strong>
                            <span>{step.criticalSafetyTip}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: COMPONENTES POR FAMÍLIA */}
      {activeSubTab === "componentes" && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              Tabela de Componentes Elétricos Principais por Família
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Consolidado dos aparelhos de proteção, comutação, sensoriamento e controle do NISSEI ASB-70DPW V4.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ELECTRICAL_COMPONENTS_SUMMARY.map((comp, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    {comp.family}
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    {comp.quantity}
                  </span>
                </div>

                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-200 leading-relaxed">
                  {comp.items}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed pt-1">
                  {comp.functionDesc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
