import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Wrench,
  Search,
  BookOpen,
  FileText,
  CheckSquare,
  Shield,
  UserCheck,
  LogOut,
  RefreshCw,
  Lock,
  Zap,
  Wind,
  Droplets,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { User } from "../types";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onOpenLoginModal: () => void;
  onQuickSwitchUser: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenLoginModal,
  onQuickSwitchUser,
  onLogout,
}) => {
  const isAdmin = currentUser.role === "admin";

  const navItems = [
    {
      id: "diagnostico",
      label: "Diagnóstico Rápido",
      icon: Search,
      badge: null,
    },
    {
      id: "diagrama",
      label: "Mapa Elétrico V4",
      icon: Zap,
      badge: "43 Pranchas",
    },
    {
      id: "pneumatico",
      label: "Mapa Pneumático V4",
      icon: Wind,
      badge: "Operação & Sopro",
    },
    {
      id: "hidraulico",
      label: "Mapa Hidráulico V4",
      icon: Droplets,
      badge: "9 Circuitos",
    },
    {
      id: "codigos",
      label: "Códigos & Manuais",
      icon: BookOpen,
      badge: null,
    },
    {
      id: "manutencoes",
      label: "Histórico & Relatórios PDF",
      icon: FileText,
      badge: null,
    },
    {
      id: "pendencias",
      label: "Pendências & Lembretes",
      icon: CheckSquare,
      badge: null,
    },
    {
      id: "painel",
      label: "Painel de Controle",
      icon: Shield,
      adminOnly: true,
      badge: isAdmin ? "Admin" : "Bloqueado",
    },
  ];

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const checkScrollability = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    checkScrollability();
    window.addEventListener("resize", checkScrollability);
    return () => window.removeEventListener("resize", checkScrollability);
  }, [checkScrollability]);

  useEffect(() => {
    const activeEl = document.getElementById(`tab-${activeTab}`);
    if (activeEl && navRef.current) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
    const timer = setTimeout(checkScrollability, 300);
    return () => clearTimeout(timer);
  }, [activeTab, checkScrollability]);

  const handleScrollLeft = () => {
    if (navRef.current) {
      navRef.current.scrollBy({ left: -260, behavior: "smooth" });
      setTimeout(checkScrollability, 300);
    }
  };

  const handleScrollRight = () => {
    if (navRef.current) {
      navRef.current.scrollBy({ left: 260, behavior: "smooth" });
      setTimeout(checkScrollability, 300);
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm ring-1 ring-blue-400/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold tracking-tight text-base sm:text-lg">
                  Diagnóstico de Máquinas
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-950 text-blue-300 border border-blue-800">
                  Industrial v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Consulta de falhas, soluções técnicas e gestão de manutenção
              </p>
            </div>
          </div>

          {/* User Session & Role Badge */}
          <div className="flex items-center gap-3">
            <div
              id="user-badge-container"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs"
            >
              <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-200 font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-slate-200 font-medium leading-none">
                  {currentUser.name}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      isAdmin
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    }`}
                  >
                    {isAdmin ? "Administrador" : "Operador"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    (@{currentUser.username})
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Switch Role button */}
            <button
              id="btn-quick-switch-role"
              onClick={onQuickSwitchUser}
              title={`Alternar para ${isAdmin ? "Operador" : "Administrador"}`}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Trocar p/ {isAdmin ? "Operador" : "Admin"}</span>
            </button>

            {/* Login / Auth modal trigger */}
            <button
              id="btn-open-login"
              onClick={onOpenLoginModal}
              title="Trocar perfil ou gerenciar usuários"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Perfis</span>
            </button>

            {/* Logout button */}
            <button
              id="btn-logout"
              onClick={onLogout}
              title="Sair do sistema e voltar para a tela de login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs with Left and Right Arrows */}
        <div className="relative flex items-center border-t border-slate-800/80 py-1.5">
          {/* Seta para retroceder / avançar para a esquerda */}
          <button
            type="button"
            id="btn-scroll-tabs-left"
            onClick={handleScrollLeft}
            disabled={!canScrollLeft}
            title="Avançar menus para a esquerda"
            aria-label="Avançar menus para a esquerda"
            className={`shrink-0 p-1.5 sm:p-2 rounded-lg border transition-all mr-1 sm:mr-2 z-10 flex items-center justify-center ${
              canScrollLeft
                ? "bg-slate-800 hover:bg-slate-700 text-cyan-400 border-slate-700 hover:border-cyan-500/60 shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                : "bg-slate-900/40 text-slate-600 border-slate-800/60 cursor-not-allowed opacity-35"
            }`}
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Barra de Menus com Rolagem */}
          <nav
            ref={navRef}
            onScroll={checkScrollability}
            className="flex-1 flex space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none scroll-smooth"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isLocked = item.adminOnly && !isAdmin;

              return (
                <button
                  key={item.id}
                  id={`tab-${item.id}`}
                  onClick={() => {
                    if (isLocked) {
                      setActiveTab("painel");
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : isLocked
                      ? "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`ml-1 px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                        isActive
                          ? "bg-blue-800 text-blue-100"
                          : isLocked
                          ? "bg-slate-800 text-slate-400 border border-slate-700"
                          : "bg-amber-900/60 text-amber-300 border border-amber-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isLocked && <Lock className="w-3 h-3 text-slate-500" />}
                </button>
              );
            })}
          </nav>

          {/* Seta para avançar para a direita */}
          <button
            type="button"
            id="btn-scroll-tabs-right"
            onClick={handleScrollRight}
            disabled={!canScrollRight}
            title="Avançar menus para a direita"
            aria-label="Avançar menus para a direita"
            className={`shrink-0 p-1.5 sm:p-2 rounded-lg border transition-all ml-1 sm:ml-2 z-10 flex items-center justify-center ${
              canScrollRight
                ? "bg-slate-800 hover:bg-slate-700 text-cyan-400 border-slate-700 hover:border-cyan-500/60 shadow-sm cursor-pointer hover:scale-105 active:scale-95"
                : "bg-slate-900/40 text-slate-600 border-slate-800/60 cursor-not-allowed opacity-35"
            }`}
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
