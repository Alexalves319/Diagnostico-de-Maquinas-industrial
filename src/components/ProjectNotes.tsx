import React, { useState, useMemo } from "react";
import {
  ProjectNote,
  PriorityLevel,
  TaskStatus,
  User,
} from "../types";
import {
  CheckSquare,
  Plus,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Trash2,
  Tag,
  FolderOpen,
  Search,
} from "lucide-react";

interface ProjectNotesProps {
  notes: ProjectNote[];
  currentUser: User;
  onAddNote: (note: Omit<ProjectNote, "id" | "createdAt">) => void;
  onUpdateNote: (id: string, updates: Partial<ProjectNote>) => void;
  onDeleteNote: (id: string) => void;
}

export const ProjectNotes: React.FC<ProjectNotesProps> = ({
  notes,
  currentUser,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>("todos");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    projectName: "",
    title: "",
    description: "",
    priority: "media" as PriorityLevel,
    status: "pendente" as TaskStatus,
    dueDate: "",
    assignedTo: currentUser.name,
  });

  // Unique project names for filter pill list
  const uniqueProjects = useMemo(() => {
    const list = Array.from(new Set(notes.map((n) => n.projectName.trim()))).filter(Boolean);
    return list;
  }, [notes]);

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesProject =
        selectedProjectFilter === "todos" ||
        n.projectName.toLowerCase() === selectedProjectFilter.toLowerCase();

      const matchesStatus =
        selectedStatusFilter === "todos" || n.status === selectedStatusFilter;

      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.projectName.toLowerCase().includes(q);

      return matchesProject && matchesStatus && matchesQuery;
    });
  }, [notes, selectedProjectFilter, selectedStatusFilter, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectName.trim() || !formData.title.trim()) {
      alert("Informe o nome do projeto/máquina e o título da pendência.");
      return;
    }

    onAddNote({
      projectName: formData.projectName.trim(),
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      assignedTo: formData.assignedTo.trim() || currentUser.name,
    });

    setFormData({
      projectName: "",
      title: "",
      description: "",
      priority: "media",
      status: "pendente",
      dueDate: "",
      assignedTo: currentUser.name,
    });
    setIsModalOpen(false);
  };

  const handleToggleStatus = (note: ProjectNote) => {
    let nextStatus: TaskStatus = "em_andamento";
    if (note.status === "pendente") nextStatus = "em_andamento";
    else if (note.status === "em_andamento") nextStatus = "concluido";
    else if (note.status === "concluido") nextStatus = "pendente";

    onUpdateNote(note.id, {
      status: nextStatus,
      completedAt: nextStatus === "concluido" ? new Date().toISOString() : undefined,
    });
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case "urgente":
        return {
          label: "Urgente",
          classes: "bg-rose-950/60 text-rose-300 border-rose-800",
        };
      case "alta":
        return {
          label: "Alta",
          classes: "bg-orange-950/60 text-orange-300 border-orange-800",
        };
      case "media":
        return {
          label: "Média",
          classes: "bg-amber-950/60 text-amber-300 border-amber-800",
        };
      default:
        return {
          label: "Baixa",
          classes: "bg-blue-950/60 text-blue-300 border-blue-800",
        };
    }
  };

  const pendingCount = notes.filter((n) => n.status !== "concluido").length;
  const completedCount = notes.filter((n) => n.status === "concluido").length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-blue-400" />
            Pendências &amp; Lembretes por Projeto
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Anotações de manutenções futuras, revisões programadas, ajustes pendentes e lembretes para projetos específicos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 hidden sm:flex items-center gap-3 mr-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              {pendingCount} Pendente(s)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              {completedCount} Concluído(s)
            </span>
          </div>

          <button
            id="btn-open-new-note-modal"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Pendência / Lembrete</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="relative min-w-[220px] flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar em pendências e notas..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente">Apenas Pendentes</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluido">Concluídos</option>
            </select>
          </div>
        </div>

        {/* Project Tags Bar */}
        {uniqueProjects.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5 text-xs scrollbar-none">
            <span className="text-slate-500 text-[11px] whitespace-nowrap">Projetos:</span>
            <button
              onClick={() => setSelectedProjectFilter("todos")}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap border ${
                selectedProjectFilter === "todos"
                  ? "bg-blue-600 text-white border-blue-500"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              }`}
            >
              Todos os Projetos
            </button>
            {uniqueProjects.map((proj) => (
              <button
                key={proj}
                onClick={() => setSelectedProjectFilter(proj)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap border ${
                  selectedProjectFilter === proj
                    ? "bg-blue-600 text-white border-blue-500"
                    : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                }`}
              >
                {proj}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* List of Notes */}
      {filteredNotes.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-10 text-center text-slate-400">
          <FolderOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="font-medium text-white text-sm">Nenhuma pendência ou lembrete encontrado.</p>
          <p className="text-xs text-slate-500 mt-1">
            Utilize esta aba para anotar itens a inspecionar, trocas de óleo preventivas ou revisões específicas de cada projeto.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => {
            const priority = getPriorityBadge(note.priority);
            const isDone = note.status === "concluido";

            return (
              <div
                key={note.id}
                className={`bg-slate-900 border rounded-xl p-4 flex flex-col justify-between transition-all shadow-sm ${
                  isDone
                    ? "border-slate-800 opacity-60"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-300 bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded">
                      <Tag className="w-3 h-3 text-blue-400" />
                      {note.projectName}
                    </span>
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${priority.classes}`}
                    >
                      {priority.label}
                    </span>
                  </div>

                  {/* Title & Status Toggle */}
                  <div className="flex items-start gap-2.5 mt-2">
                    <button
                      onClick={() => handleToggleStatus(note)}
                      className="mt-0.5 text-slate-400 hover:text-white transition-colors"
                      title="Clique para alternar status (Pendente -> Em Andamento -> Concluído)"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : note.status === "em_andamento" ? (
                        <Clock className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                    <div className="flex-1">
                      <h4
                        className={`text-sm font-semibold text-white ${
                          isDone ? "line-through text-slate-400" : ""
                        }`}
                      >
                        {note.title}
                      </h4>
                      {note.description && (
                        <p className="text-xs text-slate-400 mt-1 whitespace-pre-line leading-relaxed">
                          {note.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <span
                      className={`capitalize px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                        isDone
                          ? "bg-emerald-950 text-emerald-400"
                          : note.status === "em_andamento"
                          ? "bg-amber-950 text-amber-400"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {note.status.replace("_", " ")}
                    </span>
                    {note.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(note.dueDate).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (confirm("Remover esta anotação?")) {
                        onDeleteNote(note.id);
                      }
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                    title="Excluir anotação"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NEW NOTE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Nova Pendência ou Lembrete
                  </h3>
                  <p className="text-xs text-slate-400">
                    Organize pendências específicas por máquina ou projeto
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Projeto ou Máquina Específica *
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="Ex: Reforma Prensa Hidráulica, Linha de Corte 02, etc..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Título do Lembrete / Pendência *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Trocar filtro de óleo após 50h de operação..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Observações / Checklist Detalhado
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes adicionais, ferramentas necessárias, peças sob encomenda..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Prioridade
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as PriorityLevel })
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Data Limite (Opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                >
                  Salvar Pendência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
