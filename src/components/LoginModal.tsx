import React, { useState } from "react";
import { User, UserRole } from "../types";
import { X, ShieldCheck, HardHat, Lock, UserCheck, KeyRound, AlertCircle } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
  onSelectUser: (user: User) => void;
  onAuthenticate: (username: string, password: string) => boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSelectUser,
  onAuthenticate,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim()) {
      setError("Informe o nome de usuário.");
      return;
    }
    const success = onAuthenticate(username.trim(), password);
    if (success) {
      setUsername("");
      setPassword("");
      onClose();
    } else {
      setError("Credenciais inválidas. Verifique o usuário e senha.");
    }
  };

  const handleQuickSwitch = (user: User) => {
    onSelectUser(user);
    onClose();
  };

  return (
    <div
      id="login-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
    >
      <div
        id="login-modal-container"
        className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden text-slate-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Painel de Acesso &amp; Login
              </h3>
              <p className="text-xs text-slate-400">
                Selecione um perfil ou insira suas credenciais
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick User Switcher Section */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>Perfis Padrão do Sistema</span>
              <span className="text-[11px] text-blue-400 font-normal">
                Clique para trocar instantaneamente
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Admin Card */}
              {users
                .filter((u) => u.role === "admin")
                .map((adminUser) => {
                  const isCurrent = currentUser.id === adminUser.id;
                  return (
                    <button
                      key={adminUser.id}
                      onClick={() => handleQuickSwitch(adminUser)}
                      className={`text-left p-3.5 rounded-lg border transition-all ${
                        isCurrent
                          ? "bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/40"
                          : "bg-slate-800/60 border-slate-700 hover:border-amber-500/50 hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          <ShieldCheck className="w-3 h-3" />
                          Administrador
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] text-amber-400 font-bold">
                            Ativo
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-white text-sm">
                        {adminUser.name}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        login: {adminUser.username}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-2 border-t border-slate-700/60 pt-1.5">
                        Acesso total: cadastrar códigos, gerenciar usuários e permissões.
                      </div>
                    </button>
                  );
                })}

              {/* Operador Card */}
              {users
                .filter((u) => u.role === "operador")
                .map((opUser) => {
                  const isCurrent = currentUser.id === opUser.id;
                  return (
                    <button
                      key={opUser.id}
                      onClick={() => handleQuickSwitch(opUser)}
                      className={`text-left p-3.5 rounded-lg border transition-all ${
                        isCurrent
                          ? "bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/40"
                          : "bg-slate-800/60 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <HardHat className="w-3 h-3" />
                          Operador
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] text-emerald-400 font-bold">
                            Ativo
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-white text-sm">
                        {opUser.name}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        login: {opUser.username}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-2 border-t border-slate-700/60 pt-1.5">
                        Consultar diagnósticos, registrar manutenções e ver pendências.
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-xs text-slate-500 uppercase tracking-wider font-mono">
              Ou entrar com usuário específico
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Nome de Usuário
              </label>
              <input
                id="input-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: admin ou operador"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Senha
              </label>
              <input
                id="input-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ex: admin123 ou operador123"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Entrar no Sistema
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
