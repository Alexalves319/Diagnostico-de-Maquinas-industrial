import React, { useState } from "react";
import { User, UserRole, ROLE_PERMISSIONS } from "../types";
import {
  Shield,
  UserPlus,
  Lock,
  Trash2,
  Edit,
  Check,
  X,
  HardHat,
  ShieldCheck,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  Key,
  Database,
  Server,
  CheckCircle2,
  HardDrive,
  FileCode,
} from "lucide-react";
import { storageService } from "../services/storage";

interface UserControlPanelProps {
  users: User[];
  currentUser: User;
  onAddUser: (userData: Omit<User, "id" | "createdAt">) => void;
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onSelectUser: (user: User) => void;
  onReloadDatabase: () => void;
}

export const UserControlPanel: React.FC<UserControlPanelProps> = ({
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onSelectUser,
  onReloadDatabase,
}) => {
  const isAdmin = currentUser.role === "admin";
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form state for creating new user
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "operador" as UserRole,
  });

  const [formError, setFormError] = useState<string | null>(null);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanUsername = formData.username.trim().toLowerCase();
    if (!formData.name.trim() || !cleanUsername || !formData.password.trim()) {
      setFormError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      setFormError("Este nome de usuário já está em uso.");
      return;
    }

    onAddUser({
      name: formData.name.trim(),
      username: cleanUsername,
      password: formData.password,
      role: formData.role,
    });

    setFormData({
      name: "",
      username: "",
      password: "",
      role: "operador",
    });
    setIsAddUserModalOpen(false);
  };

  const handleExportBackup = () => {
    const data = storageService.exportBackupData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup-diagnostico-maquinas-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = storageService.importBackupData(text);
        alert(
          `Backup restaurado com sucesso!\n- ${result.importedCodes} Códigos\n- ${result.importedMaintenance} Manutenções\n- ${result.importedNotes} Pendências`
        );
        onReloadDatabase();
      } catch (err: any) {
        alert("Erro ao importar arquivo de backup: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  // MySQL & XAMPP Integration State
  const [dbState, setDbState] = useState<{
    status: "idle" | "testing" | "connected" | "disconnected";
    message: string;
    database?: string;
    tables?: string[];
    counts?: Record<string, number>;
  }>({
    status: "idle",
    message: "Clique para testar a comunicação com o MySQL do XAMPP.",
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleTestMySQL = async () => {
    setDbState({ status: "testing", message: "Verificando conexão com o MySQL..." });
    setSyncFeedback(null);
    const result = await storageService.testMySQLConnection();
    if (result.connected) {
      setDbState({
        status: "connected",
        message: result.message,
        database: result.database,
        tables: result.tables,
        counts: result.counts,
      });
    } else {
      setDbState({
        status: "disconnected",
        message: result.message,
      });
    }
  };

  const handleSyncToMySQL = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const res = await storageService.syncLocalToMySQL();
    setIsSyncing(false);
    if (res.success) {
      setSyncFeedback({ type: "success", text: res.message });
      handleTestMySQL();
    } else {
      setSyncFeedback({ type: "error", text: res.message });
    }
  };

  const handleSyncFromMySQL = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const res = await storageService.syncMySQLToLocal();
    setIsSyncing(false);
    if (res.success) {
      setSyncFeedback({ type: "success", text: res.message });
      onReloadDatabase();
      handleTestMySQL();
    } else {
      setSyncFeedback({ type: "error", text: res.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Painel de Controle: Usuários &amp; Permissões
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerencie perfis de acesso, banco de dados MySQL e credenciais do sistema.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
              title="Baixar cópia de segurança em JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup JSON</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Restaurar</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>

            <button
              id="btn-open-new-user-modal"
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Cadastrar Usuário</span>
            </button>
          </div>
        )}
      </div>

      {/* PAINEL DE BANCO DE DADOS MYSQL (XAMPP) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-850 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Banco de Dados MySQL (XAMPP / phpMyAdmin)
                {dbState.status === "connected" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" /> Conectado ao MySQL
                  </span>
                )}
                {dbState.status === "disconnected" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <HardDrive className="w-3 h-3" /> Armazenamento Local
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Base de dados <code className="text-blue-300 font-mono">db_nissei</code> com tabelas de usuários, diagnósticos, manutenções e pendências
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTestMySQL}
              disabled={dbState.status === "testing"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${dbState.status === "testing" ? "animate-spin text-blue-400" : ""}`} />
              <span>{dbState.status === "testing" ? "Testando..." : "Testar Conexão"}</span>
            </button>

            <button
              onClick={() => storageService.downloadDatabaseSQL()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium border border-emerald-500/30 transition-colors"
              title="Baixar database.sql para importar no phpMyAdmin"
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Baixar database.sql</span>
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={handleSyncToMySQL}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-medium border border-blue-500/30 transition-colors disabled:opacity-50"
                  title="Exportar todos os dados locais para as tabelas do MySQL"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Enviar para MySQL</span>
                </button>

                <button
                  onClick={handleSyncFromMySQL}
                  disabled={isSyncing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-medium border border-purple-500/30 transition-colors disabled:opacity-50"
                  title="Carregar dados gravados no MySQL para a aplicação"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Carregar do MySQL</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Status Message / Feedback */}
        <div className="p-4 bg-slate-900/60 border-b border-slate-800/80">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium">Status da Conexão:</span>
              <span className={dbState.status === "connected" ? "text-emerald-400 font-semibold" : dbState.status === "disconnected" ? "text-amber-400" : "text-slate-300"}>
                {dbState.message}
              </span>
            </div>

            {dbState.counts && (
              <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                <span>users: <strong className="text-white">{dbState.counts.users ?? 0}</strong></span>
                <span>códigos: <strong className="text-white">{dbState.counts.diagnostic_codes ?? 0}</strong></span>
                <span>manutenções: <strong className="text-white">{dbState.counts.maintenance_records ?? 0}</strong></span>
                <span>pendências: <strong className="text-white">{dbState.counts.project_notes ?? 0}</strong></span>
              </div>
            )}
          </div>

          {syncFeedback && (
            <div className={`mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2 ${syncFeedback.type === "success" ? "bg-emerald-950/60 border border-emerald-800 text-emerald-300" : "bg-rose-950/60 border border-rose-800 text-rose-300"}`}>
              {syncFeedback.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{syncFeedback.text}</span>
            </div>
          )}
        </div>

        {/* Guia Rápido de Configuração no XAMPP */}
        <div className="p-4 bg-slate-950/40 text-xs text-slate-300 space-y-2">
          <div className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Server className="w-4 h-4 text-blue-400" />
            Como usar com o XAMPP no seu computador (Passo a Passo):
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-400 ml-1">
            <li>
              Abra o <strong>XAMPP Control Panel</strong> e clique em <strong className="text-white">Start</strong> nos módulos <strong>Apache</strong> e <strong>MySQL</strong>.
            </li>
            <li>
              Clique no botão verde acima <strong className="text-emerald-300">"Baixar database.sql"</strong> para salvar o script do banco.
            </li>
            <li>
              Abra seu navegador em <a href="http://localhost/phpmyadmin" target="_blank" rel="noreferrer" className="text-blue-400 underline font-mono">http://localhost/phpmyadmin</a>, vá na aba <strong>Importar</strong> e selecione o arquivo <code>database.sql</code> (ele cria automaticamente o banco <code>db_nissei</code> com todas as tabelas e dados).
            </li>
            <li>
              Copie os arquivos do sistema para a pasta <code className="text-amber-300 font-mono">C:\xampp\htdocs\</code> e acesse <code className="text-blue-400 font-mono">http://localhost</code>. Todas as inserções e alterações serão gravadas diretamente no MySQL!
            </li>
          </ol>
        </div>
      </div>

      {/* Operator Notice if logged as operator */}
      {!isAdmin && (
        <div className="p-4 rounded-xl bg-slate-900 border border-amber-800/60 text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              Você está conectado como <strong>Operador</strong>. Você tem permissão para visualizar todas as funções e tabelas de permissão abaixo, porém ações de exclusão ou criação de usuários são exclusivas do perfil <strong>Administrador</strong>.
            </div>
          </div>
          <button
            onClick={() => {
              const admin = users.find((u) => u.role === "admin");
              if (admin) onSelectUser(admin);
            }}
            className="px-3 py-1.5 bg-amber-500 text-slate-950 font-semibold rounded-md hover:bg-amber-400 whitespace-nowrap"
          >
            Entrar como Admin
          </button>
        </div>
      )}

      {/* Side-by-Side Permissions Matrix (Operador vs Administrador) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-850">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Matriz Comparativa de Níveis de Acesso
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Diferenças explícitas entre os perfis Operador e Administrador
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Funcionalidade / Ação do Sistema</th>
                <th className="py-3 px-4 text-center w-40 bg-emerald-950/20 text-emerald-300">
                  Operador Técnico
                </th>
                <th className="py-3 px-4 text-center w-40 bg-amber-950/20 text-amber-300">
                  Administrador Geral
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              <tr>
                <td className="py-2.5 px-4 font-medium text-white">
                  Consultar Códigos de Falha &amp; Soluções Técnicas
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className="inline-flex items-center text-emerald-400 gap-1 font-semibold">
                    <Check className="w-4 h-4" /> Permitido
                  </span>
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className="inline-flex items-center text-emerald-400 gap-1 font-semibold">
                    <Check className="w-4 h-4" /> Permitido
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-2.5 px-4 font-medium text-white">
                  Registrar Intervenções de Manutenção Realizadas
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className="inline-flex items-center text-emerald-400 gap-1 font-semibold">
                    <Check className="w-4 h-4" /> Permitido
                  </span>
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className="inline-flex items-center text-emerald-400 gap-1 font-semibold">
                    <Check className="w-4 h-4" /> Permitido
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-2.5 px-4 font-medium text-white">
                  Exportar Relatórios Oficiais em PDF
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className="inline-flex items-center text-emerald-400 gap-1 font-semibold">
                    <Check className="w-4 h-4" /> Permitido
                  </span>
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className="inline-flex items-center text-emerald-400 gap-1 font-semibold">
                    <Check className="w-4 h-4" /> Permitido
                  </span>
                </td>
              </tr>

              <tr>
                <td className="py-2.5 px-4 font-medium text-white">
                  Gerenciar Pendências e Lembretes de Projetos
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className="inline-flex items-center text-emerald-400 gap-1 font-semibold">
                    <Check className="w-4 h-4" /> Permitido
                  </span>
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className="inline-flex items-center text-emerald-400 gap-1 font-semibold">
                    <Check className="w-4 h-4" /> Permitido
                  </span>
                </td>
              </tr>

              <tr className="bg-slate-800/20">
                <td className="py-2.5 px-4 font-medium text-white">
                  Cadastrar Novos Códigos de Falha no Banco
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className="inline-flex items-center text-rose-400 gap-1 font-semibold">
                    <X className="w-4 h-4" /> Bloqueado
                  </span>
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className="inline-flex items-center text-emerald-400 gap-1 font-semibold">
                    <Check className="w-4 h-4" /> Total
                  </span>
                </td>
              </tr>

              <tr className="bg-slate-800/20">
                <td className="py-2.5 px-4 font-medium text-white">
                  Anexar Manuais e Processar Extração com IA
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className="inline-flex items-center text-rose-400 gap-1 font-semibold">
                    <X className="w-4 h-4" /> Bloqueado
                  </span>
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className="inline-flex items-center text-emerald-400 gap-1 font-semibold">
                    <Check className="w-4 h-4" /> Total
                  </span>
                </td>
              </tr>

              <tr className="bg-slate-800/20">
                <td className="py-2.5 px-4 font-medium text-white">
                  Editar ou Excluir Códigos de Falha Existentes
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className="inline-flex items-center text-rose-400 gap-1 font-semibold">
                    <X className="w-4 h-4" /> Bloqueado
                  </span>
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className="inline-flex items-center text-emerald-400 gap-1 font-semibold">
                    <Check className="w-4 h-4" /> Total
                  </span>
                </td>
              </tr>

              <tr className="bg-slate-800/20">
                <td className="py-2.5 px-4 font-medium text-white">
                  Gerenciar Usuários, Senhas &amp; Permissões
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className="inline-flex items-center text-rose-400 gap-1 font-semibold">
                    <X className="w-4 h-4" /> Bloqueado
                  </span>
                </td>
                <td className="py-2.5 px-4 text-center">
                  <span className="inline-flex items-center text-emerald-400 gap-1 font-semibold">
                    <Check className="w-4 h-4" /> Total
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">
            Usuários Cadastrados no Sistema ({users.length})
          </h3>
          <span className="text-xs text-slate-400">
            Você está autenticado como <strong>{currentUser.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {users.map((u) => {
            const isUserAdmin = u.role === "admin";
            const isSelf = u.id === currentUser.id;

            return (
              <div
                key={u.id}
                className={`p-4 rounded-xl border transition-all ${
                  isSelf
                    ? "bg-slate-800/90 border-blue-500/60 ring-1 ring-blue-500/30"
                    : "bg-slate-850/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                      isUserAdmin
                        ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    }`}
                  >
                    {isUserAdmin ? (
                      <ShieldCheck className="w-3 h-3" />
                    ) : (
                      <HardHat className="w-3 h-3" />
                    )}
                    {isUserAdmin ? "Administrador" : "Operador"}
                  </span>

                  {isSelf && (
                    <span className="text-[10px] text-blue-400 font-bold bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                      Sua Sessão
                    </span>
                  )}
                </div>

                <div className="font-semibold text-white text-sm">{u.name}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Usuário: @{u.username}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onSelectUser(u)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    {isSelf ? "Sessão Ativa" : "Alternar p/ este"}
                  </button>

                  {isAdmin && !isSelf && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const newRole: UserRole = isUserAdmin ? "operador" : "admin";
                          if (
                            confirm(
                              `Alterar o cargo de ${u.name} para ${
                                newRole === "admin" ? "Administrador" : "Operador"
                              }?`
                            )
                          ) {
                            onUpdateUser(u.id, { role: newRole });
                          }
                        }}
                        className="text-[11px] text-slate-400 hover:text-white"
                        title="Trocar cargo"
                      >
                        Tornar {isUserAdmin ? "Operador" : "Admin"}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Excluir o usuário ${u.name}?`)) {
                            try {
                              onDeleteUser(u.id);
                            } catch (err: any) {
                              alert(err.message);
                            }
                          }
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Excluir usuário"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE NEW USER MODAL */}
      {isAddUserModalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-md w-full overflow-hidden text-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Novo Usuário do Sistema
                  </h3>
                  <p className="text-xs text-slate-400">
                    Defina nome, credenciais e categoria de permissão
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Carlos Mecânico, Ana Supervisora..."
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Nome de Usuário (Login) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Ex: carlos_mecanica ou operador2"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Senha de Acesso *
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Defina uma senha"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Categoria de Acesso / Nível de Permissão *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as UserRole })
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                >
                  <option value="operador">
                    Operador (Consultar diagnósticos, registrar manutenções, relatórios)
                  </option>
                  <option value="admin">
                    Administrador (Acesso completo: cadastrar códigos, gerenciar usuários)
                  </option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                >
                  Criar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
