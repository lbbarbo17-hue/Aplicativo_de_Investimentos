import React, { useState } from "react";
import { ActiveInvestment, InvestmentType } from "../types";
import { getTaxRate, simulateInvestment } from "../utils/financeUtils";
import { Calendar, RefreshCw, Landmark, ArrowUpRight, Ban, DollarSign } from "lucide-react";

interface ActiveInvestmentsProps {
  investments: ActiveInvestment[];
  onAdvanceMonths: (id: string, months: number) => void;
  onRedeem: (id: string, bruteAmountToRedeem: number, taxAmount: number, netAmount: number) => void;
  darkMode?: boolean;
}

export default function ActiveInvestments({
  investments,
  onAdvanceMonths,
  onRedeem,
  darkMode = true
}: ActiveInvestmentsProps) {
  // Redemption modal trigger state
  const [redeemingInvestment, setRedeemingInvestment] = useState<ActiveInvestment | null>(null);
  const [redemptionAmount, setRedemptionAmount] = useState<number>(0);
  const [redemptionType, setRedemptionType] = useState<"total" | "parcial">("total");

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  const handleOpenRedeem = (inv: ActiveInvestment) => {
    setRedeemingInvestment(inv);
    setRedemptionType("total");
    setRedemptionAmount(inv.currentBalance);
  };

  const handleConfirmRedeem = () => {
    if (!redeemingInvestment) return;
    
    let bruteAmount = redemptionAmount;
    if (redemptionType === "total") {
      bruteAmount = redeemingInvestment.currentBalance;
    }

    if (bruteAmount <= 0) {
      alert("Por favor, selecione um valor válido superior a R$ 0,00.");
      return;
    }

    if (bruteAmount > redeemingInvestment.currentBalance) {
      alert(`Você não pode resgatar mais do que o saldo atual do investimento (${formatBRL(redeemingInvestment.currentBalance)}).`);
      return;
    }

    // Dynamic tax calculation proportional to interest ratio
    // interest ratio of current gross balance
    const interestRatio = redeemingInvestment.currentBalance > 0 
      ? redeemingInvestment.totalInterest / redeemingInvestment.currentBalance
      : 0;
    
    const redeemedInterest = bruteAmount * interestRatio;
    const taxRate = getTaxRate(redeemingInvestment.monthsPassed, redeemingInvestment.type);
    const taxAmount = redeemedInterest * taxRate;
    const netAmount = bruteAmount - taxAmount;

    // Trigger parent redemption flow
    onRedeem(redeemingInvestment.id, bruteAmount, taxAmount, netAmount);
    
    // Close modal
    setRedeemingInvestment(null);
  };

  return (
    <div className={`rounded-2xl p-6 border transition-colors duration-200 ${
      darkMode ? "bg-slate-900 border-slate-800 text-slate-100 shadow-md" : "bg-white border-slate-100 text-slate-800"
    }`}>
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4 mb-5 ${
        darkMode ? "border-slate-800" : "border-indigo-50"
      }`}>
        <div>
          <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>Meus Investimentos Aplicados</h2>
          <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Seus aportes simulados em andamento. Avance o tempo para fazê-los render.</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
          darkMode ? "bg-indigo-950/60 text-indigo-300 border border-indigo-900/30" : "bg-indigo-50 text-indigo-700"
        }`}>
          {investments.length} Ativo(s)
        </span>
      </div>

      {investments.length === 0 ? (
        <div className={`text-center py-12 px-4 border-2 border-dashed rounded-2xl ${
          darkMode ? "border-slate-800 bg-slate-950/30 text-slate-400" : "border-slate-200 bg-white text-slate-505"
        }`}>
          <Landmark className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className={`text-sm font-bold ${darkMode ? "text-slate-300" : "text-slate-705"}`}>Nenhum investimento simulado ativo</h3>
          <p className="text-xs text-slate-455 mt-1 max-w-sm mx-auto">
            Preencha os dados na seção de <strong>"Cálculo de Investimento"</strong> acima e clique em <strong>"Aplicar e Salvar"</strong> para começar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          {investments.map((inv) => {
            const taxPct = getTaxRate(inv.monthsPassed, inv.type) * 100;
            return (
              <div
                key={inv.id}
                className={`rounded-2xl p-5 border flex flex-col justify-between gap-4 shadow-sm transition duration-150 ${
                  darkMode 
                    ? "bg-slate-950/40 border-slate-800/65 text-slate-300 hover:border-slate-700" 
                    : "bg-slate-50/50 border-slate-200/60 text-slate-650 hover:bg-slate-100/50"
                }`}
              >
                {/* Header Information */}
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      darkMode ? "bg-indigo-950/70 text-indigo-300 border border-indigo-900/30" : "bg-indigo-50 text-indigo-700"
                    }`}>
                      {inv.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Contratado em {new Date(inv.startDate).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  
                  <h3 className={`text-sm font-bold mt-1 ${darkMode ? "text-white" : "text-slate-800"}`}>Simulação de Aporte Progressivo</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Depósito Inicial: {formatBRL(inv.initialAmount)} | Aporte Mensal: {formatBRL(inv.monthlyContribution)}
                  </p>
                </div>

                {/* Progress Stats */}
                <div className={`grid grid-cols-3 gap-2 p-3 rounded-xl border font-mono text-[11px] ${
                  darkMode ? "bg-slate-900/40 border-slate-800/80 text-white" : "bg-white border-slate-100 text-slate-700"
                }`}>
                  <div>
                    <span className="text-[8px] text-slate-400 uppercase font-sans">Prazo Decorrido</span>
                    <div className="font-bold">{inv.monthsPassed} meses</div>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 uppercase font-sans">Juros Brutos</span>
                    <div className="font-bold text-indigo-400">+{formatBRL(inv.totalInterest)}</div>
                  </div>
                  <div>
                    <span className="text-[8px] text-slate-400 uppercase font-sans">Alíquota IR</span>
                    <div className="font-bold text-rose-450 text-rose-400">{taxPct > 0 ? `${taxPct.toFixed(1)}%` : "Isento"}</div>
                  </div>
                </div>

                {/* Balance Summary */}
                <div className={`p-4 rounded-xl flex justify-between items-center px-4 ${
                  darkMode ? "bg-slate-950 border border-slate-850" : "bg-slate-900 text-white"
                }`}>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase">Saldo Líquido Atual</span>
                    <span className="text-base font-extrabold font-mono text-emerald-400">{formatBRL(inv.netBalance)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-450 block font-semibold uppercase">Bruto</span>
                    <span className="text-xs font-mono text-slate-300">{formatBRL(inv.currentBalance)}</span>
                  </div>
                 </div>

                {/* Action Buttons */}
                <div className={`flex gap-2 border-t pt-3 ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                  {/* Simulate Time trigger */}
                  <div className="flex-1 flex gap-1">
                    <button
                      onClick={() => onAdvanceMonths(inv.id, 1)}
                      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition active:scale-95 cursor-pointer border ${
                        darkMode 
                          ? "bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800" 
                          : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                      title="Avance 1 mês nesta simulação"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
                      +1 Mês
                    </button>
                    <button
                      onClick={() => onAdvanceMonths(inv.id, 12)}
                      className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition active:scale-95 cursor-pointer border ${
                        darkMode 
                          ? "bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800" 
                          : "bg-white hover:bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                      title="Avance 12 meses nesta simulação"
                    >
                      <Calendar className="w-3.5 h-3.5 text-indigo-450" />
                      +12 Meses
                    </button>
                  </div>

                  {/* Redeem Button */}
                  <button
                    onClick={() => handleOpenRedeem(inv)}
                    className="bg-emerald-600 hover:bg-emerald-550 text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition active:scale-95 cursor-pointer shadow-xs"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    Resgatar
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* REDEMPTION ACTION MODAL/DIALOG */}
      {redeemingInvestment && (
        <div id="redemption-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4 animate-fade-in font-sans">
          <div className={`rounded-3xl max-w-md w-full p-6 shadow-2xl border flex flex-col gap-4 ${
            darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-100 text-slate-800"
          }`}>
            
            <div className="flex justify-between items-start">
              <div>
                <span className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                  darkMode ? "bg-indigo-950 text-indigo-300 border border-indigo-900/35" : "bg-indigo-50 text-indigo-700"
                }`}>
                  {redeemingInvestment.type}
                </span>
                <h3 className={`text-md font-bold mt-2 ${darkMode ? "text-white" : "text-slate-800"}`}>Resgatar Capital de Investimento</h3>
              </div>
              <button
                onClick={() => setRedeemingInvestment(null)}
                className={`text-lg font-bold ${darkMode ? "text-slate-400 hover:text-slate-200" : "text-slate-400 hover:text-slate-600"}`}
              >
                ✕
              </button>
            </div>

            <div className={`p-4 rounded-xl border text-xs font-mono ${
              darkMode ? "bg-slate-950 border-slate-800/80 text-slate-350" : "bg-slate-50 border-slate-150 text-slate-600"
            }`}>
              <div className="flex justify-between mb-1.5">
                <span>Saldo Bruto Disponível:</span>
                <span className={`font-bold ${darkMode ? "text-slate-200" : "text-slate-800"}`}>{formatBRL(redeemingInvestment.currentBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span>Saldo Líquido Disponível:</span>
                <span className={`font-bold ${darkMode ? "text-emerald-400" : "text-slate-800"}`}>{formatBRL(redeemingInvestment.netBalance)}</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-sans leading-tight">
                *O resgate incidirá imposto de renda regressivo sobre os rendimentos proporcionais gerados em {redeemingInvestment.monthsPassed} meses de aplicação física.
              </p>
            </div>

            {/* Redemption configuration options */}
            <div className="flex flex-col gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${darkMode ? "text-slate-400" : "text-slate-700"}`}>Tipo de Liquidação:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRedemptionType("total");
                    setRedemptionAmount(redeemingInvestment.currentBalance);
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition cursor-pointer ${
                    redemptionType === "total"
                      ? darkMode
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "bg-slate-900 border-slate-900 text-white"
                      : darkMode
                        ? "bg-slate-950 border-slate-850 hover:bg-slate-800 text-slate-300"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                  }`}
                >
                  Resgatar Tudo (Integral)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRedemptionType("parcial");
                    setRedemptionAmount(Math.round(redeemingInvestment.currentBalance / 2));
                  }}
                  className={`py-2 px-3 text-xs font-bold rounded-lg border transition cursor-pointer ${
                    redemptionType === "parcial"
                      ? darkMode
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "bg-slate-900 border-slate-900 text-white"
                      : darkMode
                        ? "bg-slate-950 border-slate-850 hover:bg-slate-800 text-slate-300"
                        : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                  }`}
                >
                  Resgate Parcial (R$)
                </button>
              </div>
            </div>

            {/* If partial, show value selector */}
            {redemptionType === "parcial" && (
              <div className="animate-fade-in flex flex-col gap-1.5">
                <label className="text-xs text-slate-400">Valor do Resgate Parcial:</label>
                <div className="relative">
                  <span className={`absolute left-3 top-2 text-xs font-mono ${darkMode ? "text-slate-550" : "text-slate-400"}`}>R$</span>
                  <input
                    type="number"
                    min="1"
                    max={redeemingInvestment.currentBalance}
                    value={redemptionAmount}
                    onChange={(e) => setRedemptionAmount(Math.min(Math.max(Number(e.target.value) || 0, 0), redeemingInvestment.currentBalance))}
                    className={`w-full pl-9 pr-3 py-1.5 text-xs font-mono rounded-lg outline-none border ${
                      darkMode 
                        ? "bg-slate-950 border-slate-800 text-white" 
                        : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white"
                    }`}
                  />
                </div>
                <input
                  type="range"
                  min="1"
                  max={redeemingInvestment.currentBalance}
                  value={redemptionAmount}
                  onChange={(e) => setRedemptionAmount(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            )}

            {/* Dynamic Receipt estimate box */}
            <div className={`rounded-xl p-3.5 border text-xs ${
              darkMode ? "bg-emerald-950/40 border-emerald-900/40 text-emerald-300" : "bg-emerald-50 border-emerald-100 text-emerald-700"
            }`}>
              <span className={`font-bold uppercase text-[9px] tracking-wider block mb-1.5 ${darkMode ? "text-emerald-400" : "text-emerald-800"}`}>
                Demonstrativo de Resgate Estimado
              </span>
              
              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span>Valor Líquido creditado:</span>
                  <span className={`font-extrabold ${darkMode ? "text-emerald-300" : "text-emerald-800"}`}>
                    {formatBRL(
                      redemptionType === "total"
                        ? redeemingInvestment.netBalance
                        : redemptionAmount - (redemptionAmount * (redeemingInvestment.currentBalance > 0 ? redeemingInvestment.totalInterest / redeemingInvestment.currentBalance : 0) * getTaxRate(redeemingInvestment.monthsPassed, redeemingInvestment.type))
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Valor de Entrada (Bruto):</span>
                  <span>{formatBRL(redemptionType === "total" ? redeemingInvestment.currentBalance : redemptionAmount)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Retenção de IR ({ (getTaxRate(redeemingInvestment.monthsPassed, redeemingInvestment.type)*100).toFixed(1) }%):</span>
                  <span className="text-red-400">
                    -{formatBRL(
                      (redemptionType === "total" ? redeemingInvestment.currentBalance : redemptionAmount) * (redeemingInvestment.currentBalance > 0 ? redeemingInvestment.totalInterest / redeemingInvestment.currentBalance : 0) * getTaxRate(redeemingInvestment.monthsPassed, redeemingInvestment.type)
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 mt-2">
              <button
                type="button"
                onClick={() => setRedeemingInvestment(null)}
                className={`px-4 py-2 border rounded-xl text-xs font-semibold cursor-pointer ${
                  darkMode 
                    ? "bg-slate-950 border-slate-850 hover:bg-slate-800 text-slate-400" 
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-505"
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRedeem}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-550 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer active:scale-95"
              >
                Confirmar e Liquidar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
