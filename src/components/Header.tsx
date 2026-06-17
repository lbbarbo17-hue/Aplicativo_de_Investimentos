import React from "react";
import { Wallet, TrendingUp, HandCoins, Building2, Sun, Moon } from "lucide-react";

interface HeaderProps {
  availableBalance: number;
  totalInvested: number;
  activePortfolioValue: number;
  totalEarnings: number;
  onResetData: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Header({
  availableBalance,
  totalInvested,
  activePortfolioValue,
  totalEarnings,
  onResetData,
  darkMode,
  onToggleDarkMode
}: HeaderProps) {
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  return (
    <header id="app-header" className={`rounded-2xl p-8 border transition-all duration-200 ${
      darkMode 
        ? "bg-slate-900 text-white border-slate-800 shadow-xl" 
        : "bg-white text-slate-800 border-slate-100 shadow-sm"
    }`}>
      <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b transition-colors duration-200 ${
        darkMode ? "border-slate-800" : "border-slate-100"
      }`}>
        <div>
          <span className={`text-xs font-mono uppercase tracking-widest font-semibold ${
            darkMode ? "text-indigo-450 text-indigo-400" : "text-indigo-600"
          }`}>Simulador de Patrimônio</span>
          <h1 className={`text-3xl font-extrabold tracking-tight mt-1 ${
            darkMode ? "text-white" : "text-slate-900"
          }`}>
            NEXUS<span className={`font-light underline underline-offset-4 decoration-indigo-400 ${
              darkMode ? "text-slate-350" : "text-slate-400"
            }`}>INVEST</span>
          </h1>
          <p className={`text-sm mt-1 transition-colors ${
            darkMode ? "text-slate-400" : "text-slate-500"
          }`}>Planeje e simule o seu futuro financeiro e imobiliário com precisão.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle Switch */}
          <button
            onClick={onToggleDarkMode}
            className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center gap-1.5 ${
              darkMode 
                ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-750" 
                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
            title={darkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400 animate-pulse" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            <span className="text-xs font-semibold hidden sm:inline">
              {darkMode ? "Claro" : "Escuro"}
            </span>
          </button>

          <button
            onClick={onResetData}
            className={`text-xs font-bold px-4.5 py-2.5 rounded-xl border transition active:scale-95 shadow-2xs ${
              darkMode 
                ? "bg-slate-850 hover:bg-slate-800 text-slate-200 border-slate-700" 
                : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
            }`}
          >
            Reiniciar Exercício
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Saldo Simulado */}
        <div className={`p-5 rounded-2xl border transition duration-150 ${
          darkMode 
            ? "bg-slate-950/40 border-slate-800/60 hover:border-emerald-950" 
            : "bg-slate-50 border-slate-100 hover:border-indigo-100"
        }`}>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Wallet className="w-4 h-4 text-emerald-500" />
            <span>Saldo Disponível</span>
          </div>
          <div className={`text-xl font-extrabold font-mono ${
            darkMode ? "text-emerald-400" : "text-slate-900"
          }`}>
            {formatBRL(availableBalance)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Capital virtual para novas aplicações</p>
        </div>

        {/* Card 2: Valor Alocado em Investimentos */}
        <div className={`p-5 rounded-2xl border transition duration-150 ${
          darkMode 
            ? "bg-slate-950/40 border-slate-800/60 hover:border-indigo-950" 
            : "bg-slate-50 border-slate-100 hover:border-indigo-100"
        }`}>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <span>Valor Aplicado</span>
          </div>
          <div className={`text-xl font-extrabold font-mono ${
            darkMode ? "text-white" : "text-slate-900"
          }`}>
            {formatBRL(activePortfolioValue)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Soma líquida atual das aplicações</p>
        </div>

        {/* Card 3: Total Acumulado */}
        <div className={`p-5 rounded-2xl border transition duration-150 ${
          darkMode 
            ? "bg-slate-950/40 border-slate-800/60 hover:border-indigo-950" 
            : "bg-slate-50 border-slate-100 hover:border-indigo-100"
        }`}>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <HandCoins className="w-4 h-4 text-indigo-400" />
            <span>Rendimento Líquido</span>
          </div>
          <div className={`text-xl font-extrabold font-mono ${
            darkMode ? "text-indigo-400" : "text-indigo-600"
          }`}>
            {formatBRL(totalEarnings)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Ganhos reais obtidos no decurso</p>
        </div>

        {/* Card 4: Total Alocado */}
        <div className={`p-5 rounded-2xl border transition duration-150 ${
          darkMode 
            ? "bg-slate-950/40 border-slate-800/60 hover:border-indigo-950" 
            : "bg-slate-50 border-slate-100 hover:border-indigo-100"
        }`}>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Total Investido</span>
          </div>
          <div className={`text-xl font-extrabold font-mono ${
            darkMode ? "text-slate-300" : "text-slate-900"
          }`}>
            {formatBRL(totalInvested)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Soma dos aportes iniciais e mensais</p>
        </div>
      </div>
    </header>
  );
}
