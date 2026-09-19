import React, { useState } from "react";
import { User } from "../types";
import {
  Lock,
  UserCheck,
  Zap,
  Wind,
  Droplets,
  Eye,
  EyeOff,
  AlertCircle,
  Cpu,
  ArrowRight,
} from "lucide-react";

interface LoginPageProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ users, onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authenticate submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser) {
      setError("Por favor, digite o nome de usuário.");
      return;
    }

    const found = users.find(
      (u) =>
        u.username.toLowerCase() === cleanUser &&
        (!u.password || u.password === password)
    );

    if (found) {
      onLoginSuccess(found);
    } else {
      setError("Credenciais inválidas. Verifique o usuário e a senha.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Bar with Machine Identity */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold shadow-xs">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-wide font-mono">
                NISSEI ASB-70DPW V4
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/50">
                SERVO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sistema de Engenharia &bull; Elétrica, Pneumática e Hidráulica
            </p>
          </div>
        </div>
      </div>

      {/* Main Login Card Section */}
      <div className="max-w-md mx-auto w-full my-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header Inside Card */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 mb-3 shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Acesso ao Sistema
            </h1>
            <p className="text-xs text-slate-400">
              Entre com suas credenciais de operador ou administrador
            </p>
          </div>

          {/* Machine Modules Badge Strip */}
          <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-center">
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <div className="flex items-center justify-center text-amber-400 mb-0.5">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="text-[10px] font-medium text-slate-300">Elétrica V4</div>
              <div className="text-[9px] text-slate-500">43 Pranchas</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <div className="flex items-center justify-center text-cyan-400 mb-0.5">
                <Wind className="w-3.5 h-3.5" />
              </div>
              <div className="text-[10px] font-medium text-slate-300">Pneumática</div>
              <div className="text-[9px] text-slate-500">54 Itens / Sopro</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <div className="flex items-center justify-center text-blue-400 mb-0.5">
                <Droplets className="w-3.5 h-3.5" />
              </div>
              <div className="text-[10px] font-medium text-slate-300">Hidráulica</div>
              <div className="text-[9px] text-slate-500">9 Circuitos</div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="login-username"
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Digite seu usuário"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold text-slate-300 mb-1"
              >
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-950/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-login"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <span>Entrar no Sistema</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer Info */}
      <div className="max-w-md mx-auto w-full text-center text-xs text-slate-400 pt-4 border-t border-slate-800/80">
        <p>
          Engenharia de Manutenção &bull; Sopradora 1-Estágio NISSEI ASB-70DPW V4 SERVO
        </p>
        <p className="text-xs text-slate-300 mt-2 font-medium">
          Desenvolvido por <strong className="text-white font-semibold">Alex Alves</strong>
        </p>
      </div>
    </div>
  );
};
