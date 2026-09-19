import React, { useState } from "react";
import {
  MaintenanceRecord,
  MaintenanceStatus,
  User,
  DiagnosticCode,
  ROLE_PERMISSIONS,
} from "../types";
import { generateMaintenancePDF } from "../services/pdfReport";
import {
  FileText,
  Plus,
  Download,
  Filter,
  Search,
  Calendar,
  Wrench,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Trash2,
  Cpu,
  UserCheck,
} from "lucide-react";

interface MaintenanceHistoryProps {
  records: MaintenanceRecord[];
  codes: DiagnosticCode[];
  currentUser: User;
  onAddRecord: (record: Omit<MaintenanceRecord, "id" | "createdAt">) => void;
  onDeleteRecord: (id: string) => void;
  prefillCode?: string | null;
  onClearPrefillCode?: () => void;
}

export const MaintenanceHistory: React.FC<MaintenanceHistoryProps> = ({
  records,
  codes,
  currentUser,
  onAddRecord,
  onDeleteRecord,
  prefillCode,
  onClearPrefillCode,
}) => {
  const isAdmin = currentUser.role === "admin";
  const [isModalOpen, setIsModalOpen] = useState(Boolean(prefillCode));

  // Filters
  const [searchFilter, setSearchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [machineFilter, setMachineFilter] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    machineId: "",
    faultCode: prefillCode || "",
    description: "",
    actionTaken: "",
    partsReplaced: "",
    status: "concluida" as MaintenanceStatus,
    technician: currentUser.name,
    date: new Date().toISOString().slice(0, 16), // datetime-local format
    durationMinutes: 60,
    notes: "",
  });

  // If prefillCode changes, update form
  React.useEffect(() => {
    if (prefillCode) {
      setFormData((prev) => ({ ...prev, faultCode: prefillCode }));
      setIsModalOpen(true);
    }
  }, [prefillCode]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onClearPrefillCode) onClearPrefillCode();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.machineId.trim() || !formData.description.trim() || !formData.actionTaken.trim()) {
      alert("Informe a identificação da máquina, a descrição do problema e a ação realizada.");
      return;
    }

    onAddRecord({
      machineId: formData.machineId.trim(),
      faultCode: formData.faultCode ? formData.faultCode.trim().toUpperCase() : undefined,
      description: formData.description.trim(),
      actionTaken: formData.actionTaken.trim(),
      partsReplaced: formData.partsReplaced.trim() || undefined,
      status: formData.status,
      technician: formData.technician.trim() || currentUser.name,
      date: new Date(formData.date).toISOString(),
      durationMinutes: Number(formData.durationMinutes) || undefined,
      notes: formData.notes.trim() || undefined,
    });

    setFormData({
      machineId: "",
      faultCode: "",
      description: "",
      actionTaken: "",
      partsReplaced: "",
      status: "concluida",
      technician: currentUser.name,
      date: new Date().toISOString().slice(0, 16),
      durationMinutes: 60,
      notes: "",
    });

    handleCloseModal();
  };

  // Filter records
  const filteredRecords = records.filter((r) => {
    const term = searchFilter.toLowerCase();
    const matchesTerm =
      !term ||
      r.machineId.toLowerCase().includes(term) ||
      (r.faultCode && r.faultCode.toLowerCase().includes(term)) ||
      r.description.toLowerCase().includes(term) ||
      r.actionTaken.toLowerCase().includes(term) ||
      r.technician.toLowerCase().includes(term);

    const matchesStatus = statusFilter === "todos" || r.status === statusFilter;
    const matchesMachine =
      !machineFilter || r.machineId.toLowerCase().includes(machineFilter.toLowerCase());

    return matchesTerm && matchesStatus && matchesMachine;
  });

  // Trigger PDF download
  const handleExportPDF = () => {
    generateMaintenancePDF(filteredRecords, {
      machineFilter: machineFilter || undefined,
      statusFilter: statusFilter !== "todos" ? statusFilter : undefined,
      technicianName: currentUser.name,
    });
  };

  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case "concluida":
        return {
          icon: CheckCircle,
          label: "Concluída",
          classes: "bg-emerald-950/60 text-emerald-300 border-emerald-800",
        };
      case "em_andamento":
        return {
          icon: Clock,
          label: "Em Andamento",
          classes: "bg-amber-950/60 text-amber-300 border-amber-800",
        };
      case "aguardando_pecas":
        return {
          icon: AlertCircle,
          label: "Aguardando Peças",
          classes: "bg-orange-950/60 text-orange-300 border-orange-800",
        };
      case "cancelada":
        return {
          icon: XCircle,
          label: "Cancelada",
          classes: "bg-rose-950/60 text-rose-300 border-rose-800",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with PDF Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Histórico de Manutenções &amp; Exportação de Relatórios
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registro completo de intervenções técnicas com exportação de relatórios oficiais em formato PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-export-pdf-report"
            onClick={handleExportPDF}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Relatório em PDF ({filteredRecords.length})</span>
          </button>

          <button
            id="btn-open-new-maintenance-modal"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Manutenção</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative min-w-[200px] flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar por falha, ação ou técnico..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="w-40">
            <input
              type="text"
              value={machineFilter}
              onChange={(e) => setMachineFilter(e.target.value)}
              placeholder="Filtrar por Máquina..."
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          >
            <option value="todos">Todos os Status</option>
            <option value="concluida">Concluída</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="aguardando_pecas">Aguardando Peças</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Exibindo {filteredRecords.length} de {records.length} registro(s)
        </div>
      </div>

      {/* Records Table / List */}
      {filteredRecords.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-400">
          <Wrench className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="font-medium text-white text-sm">Nenhum registro de manutenção encontrado.</p>
          <p className="text-xs text-slate-500 mt-1">
            Clique em "Nova Manutenção" para registrar o primeiro atendimento técnico da máquina.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRecords.map((record) => {
            const status = getStatusBadge(record.status);
            const StatusIcon = status.icon;
            const dateStr = record.date
              ? new Date(record.date).toLocaleString("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })
              : "Não informada";

            return (
              <div
                key={record.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 hover:border-slate-700 transition-all shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-200 font-bold">
                      Máquina: {record.machineId}
                    </span>
                    {record.faultCode && (
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-950/70 border border-blue-800/60 text-blue-300 font-bold">
                        Código: {record.faultCode}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      {dateStr}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${status.classes}`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          if (confirm("Deseja realmente excluir este registro de manutenção?")) {
                            onDeleteRecord(record.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition-colors"
                        title="Excluir registro (Admin)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                      Diagnóstico / Problema:
                    </span>
                    <p className="text-slate-200 mt-1 leading-relaxed">{record.description}</p>
                  </div>

                  <div>
                    <span className="text-emerald-400 font-semibold block uppercase tracking-wider text-[10px]">
                      Ação Realizada / Solução:
                    </span>
                    <p className="text-slate-200 mt-1 leading-relaxed">{record.actionTaken}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
                  <div className="flex items-center gap-4">
                    <span>
                      Técnico: <strong className="text-slate-300">{record.technician}</strong>
                    </span>
                    {record.partsReplaced && (
                      <span>
                        Peças: <strong className="text-slate-300">{record.partsReplaced}</strong>
                      </span>
                    )}
                  </div>
                  {record.durationMinutes && (
                    <span>Duração: {record.durationMinutes} min</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NEW MAINTENANCE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden text-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Registrar Intervenção de Manutenção
                  </h3>
                  <p className="text-xs text-slate-400">
                    Registre a resolução da falha para alimentar o histórico e relatórios oficiais
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Identificação / Tag da Máquina *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.machineId}
                    onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
                    placeholder="Ex: Prensa 04, Torno CNC Setor 2, Injetora A..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Preenchimento livre conforme a sua fábrica
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Código de Falha Associado (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.faultCode}
                    onChange={(e) => setFormData({ ...formData, faultCode: e.target.value })}
                    placeholder="Ex: E-01, F104, ALM-2"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Diagnóstico Realizado / Sintoma Encontrado *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o que foi identificado na máquina durante a verificação..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-300 mb-1">
                  Ação Realizada / Procedimento de Solução *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.actionTaken}
                  onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
                  placeholder="Descreva as ações técnicas executadas: limpeza, recalibração, ajuste de pressão, etc..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Peças ou Componentes Substituídos (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.partsReplaced}
                    onChange={(e) => setFormData({ ...formData, partsReplaced: e.target.value })}
                    placeholder="Ex: Sensor indutivo M12, contator 24V, vedação"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Status da Intervenção *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as MaintenanceStatus })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="concluida">Concluída (Máquina Liberada)</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="aguardando_pecas">Aguardando Peças / Insumos</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Técnico Responsável
                  </label>
                  <input
                    type="text"
                    value={formData.technician}
                    onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Data e Hora
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tempo Gasto (minutos)
                  </label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMinutes: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  id="btn-submit-maintenance-record"
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Salvar Registro de Manutenção</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
