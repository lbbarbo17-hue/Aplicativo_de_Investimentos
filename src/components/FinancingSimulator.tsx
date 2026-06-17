import React, { useState, useMemo } from "react";
import { calculatePresentValue, generateFinancingSchedule } from "../utils/financeUtils";
import { Landmark, HelpCircle, FileText, ArrowRightLeft, BookOpen } from "lucide-react";

interface FinancingSimulatorProps {
  darkMode?: boolean;
}

export default function FinancingSimulator({ darkMode = true }: FinancingSimulatorProps) {
  // Inputs for Present Value Loan Simulation
  const [targetMonthlyPayment, setTargetMonthlyPayment] = useState<number>(3000);
  const [annualFinancingRate, setAnnualFinancingRate] = useState<number>(9.8); // 9.8% is standard Brazilian housing finance right now
  const [financingTermMonths, setFinancingTermMonths] = useState<number>(240); // 20 years

  // Show detailed amortization table toggle
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  // Compute Present Value
  const financeResult = useMemo(() => {
    return calculatePresentValue(
      targetMonthlyPayment,
      annualFinancingRate,
      financingTermMonths
    );
  }, [targetMonthlyPayment, annualFinancingRate, financingTermMonths]);

  // Compute Amortization Schedule
  const scheduleData = useMemo(() => {
    return generateFinancingSchedule(
      financeResult.presentValue,
      targetMonthlyPayment,
      financeResult.monthlyRate,
      financingTermMonths
    );
  }, [financeResult, targetMonthlyPayment, financingTermMonths]);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  return (
    <div className={`rounded-2xl p-6 border flex flex-col gap-6 transition-colors duration-200 ${
      darkMode ? "bg-slate-900 border-slate-800 text-slate-100 shadow-md" : "bg-white border-slate-100 text-slate-800"
    }`}>
      <div className={`flex items-center gap-3 border-b pb-4 ${darkMode ? "border-slate-800" : "border-indigo-55"}`}>
        <div className={`p-2.5 rounded-xl ${darkMode ? "bg-indigo-950/65 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}>
          <Landmark className="w-5 h-5" />
        </div>
        <div>
          <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>Cálculo de Financiamento (Valor Presente)</h2>
          <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
            Descubra o valor máximo de empréstimo (Valor Presente) baseado na sua capacidade de parcela mensal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-sans">
        
        {/* INPUT PANEL: Column Span 5 */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
            darkMode ? "bg-indigo-950/40 border-indigo-900/30 text-indigo-300" : "bg-indigo-50/50 border-indigo-100 text-indigo-955"
          }`}>
            <span className="font-semibold block mb-0.5">O que é Valor Presente no Financiamento?</span>
            Representa o capital total que o banco pode lhe emprestar hoje para que, amortizado com juros periódicos, resulte exatamente na parcela mensal que você pode comportar no orçamento.
          </div>

          {/* Parcela Mensal Suportada */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-700"}`}>
              Parcela Mensal Máxima Desejada (PMT)
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-2.5 text-xs font-mono ${darkMode ? "text-slate-550" : "text-slate-400"}`}>R$</span>
              <input
                type="number"
                min="100"
                step="200"
                value={targetMonthlyPayment}
                onChange={(e) => setTargetMonthlyPayment(Number(e.target.value) || 0)}
                className={`w-full pl-9 pr-3 py-2 text-sm font-mono rounded-xl outline-none focus:border-indigo-400 border transition ${
                  darkMode 
                    ? "bg-slate-950 border-slate-800 text-white" 
                    : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white"
                }`}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">O valor que planeja desembolsar todo mês na prestação.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Taxa de Juros Anual do Financiamento */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-700"}`}>
                Taxa de Juros Especial
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="40"
                  value={annualFinancingRate}
                  onChange={(e) => setAnnualFinancingRate(Number(e.target.value) || 5)}
                  className={`w-full pr-12 pl-3 py-2 text-sm font-mono rounded-xl outline-none focus:border-indigo-400 border transition ${
                    darkMode 
                      ? "bg-slate-950 border-slate-800 text-white" 
                      : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white"
                  }`}
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400 font-mono">% a.a.</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                ~ {(financeResult.monthlyRate * 100).toFixed(2)}% ao mês compostos
              </span>
            </div>

            {/* Prazo em Meses do Financiamento */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-slate-400" : "text-slate-700"}`}>
                Prazo Financiamento
              </label>
              <input
                type="number"
                min="12"
                max="480"
                value={financingTermMonths}
                onChange={(e) => setFinancingTermMonths(Number(e.target.value) || 120)}
                className={`w-full px-3 py-2 text-sm font-mono rounded-xl outline-none focus:border-indigo-400 border transition ${
                  darkMode 
                    ? "bg-slate-950 border-slate-800 text-white" 
                    : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white"
                }`}
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                = {(financingTermMonths / 12).toFixed(1)} Anos para quitar
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowSchedule(!showSchedule)}
            className={`mt-2 w-full text-xs font-bold py-2 px-4 rounded-xl border transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
              darkMode 
                ? "bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-300" 
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
            }`}
          >
            <FileText className="w-4 h-4 text-indigo-500" />
            {showSchedule ? "Ocultar Planilha de Parcelas" : "Visualizar Planilha de Parcelas (PRICE)"}
          </button>
        </div>

        {/* RESULTS PANEL: Column Span 7 */}
        <div className="lg:col-span-7 flex flex-col gap-6 justify-between">
          <div className={`rounded-2xl p-6 border shadow-md ${
            darkMode ? "bg-slate-950 border-slate-850 text-white" : "bg-slate-900 text-white border-slate-950"
          }`}>
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest block mb-4">Resultado do Financiamento (Valor Presente)</span>
            
            <div className="mt-4">
              <span className="text-xs text-slate-400">Você consegue financiar um imóvel de até:</span>
              <div className="text-3xl font-extrabold font-mono text-indigo-300 mt-1.5">
                {formatBRL(financeResult.presentValue)}
              </div>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">Este é o principal/limite de empréstimo concedido baseado nas condições informadas.</p>
            </div>

            <div className={`grid grid-cols-2 gap-4 mt-8 pt-6 border-t ${darkMode ? "border-slate-800" : "border-slate-800/60"}`}>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Total a Desembolsar</span>
                <span className="text-base font-extrabold font-mono text-slate-200">{formatBRL(financeResult.totalPaid)}</span>
                <p className="text-[9px] text-slate-500">Soma das {financingTermMonths} prestações</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-bold">Total Pago em Juros</span>
                <span className="text-base font-extrabold font-mono text-rose-450 text-rose-400">{formatBRL(financeResult.totalInterest)}</span>
                <p className="text-[9px] text-slate-500">Custo financeiro cobrado pelo banco</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl text-xs flex gap-3 border ${
            darkMode ? "bg-slate-950 border-slate-800/80 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-600"
          }`}>
            <div className="text-indigo-400 font-bold text-lg select-none">💡</div>
            <div>
              <span className={`font-bold block ${darkMode ? "text-white" : "text-slate-800"}`}>Dica de Compra Realista:</span>
              Antes de assinar o financiamento, calcule a taxa m² com o avaliador ao lado para garantir que o preço do imóvel não está superfaturado para a respectiva região.
            </div>
          </div>
        </div>

      </div>

      {/* AMORTIZATION SCHEDULE ACCORDION */}
      {showSchedule && (
        <div className={`mt-4 border-t pt-4 animate-fade-in font-sans ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
          <div className="flex justify-between items-center mb-3">
            <h3 className={`text-xs font-bold uppercase tracking-wider ${darkMode ? "text-slate-300" : "text-slate-700"}`}>Planilha PRICE de Amortização (Primeiras 12 e Últimas 6 parcelas)</h3>
            <span className="text-[10px] text-slate-400">Total de parcelas calculadas: {scheduleData.length}</span>
          </div>

          <div className={`overflow-x-auto rounded-xl border ${darkMode ? "border-slate-800/80" : "border-slate-150"}`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`font-semibold font-mono border-b ${
                  darkMode ? "bg-slate-950 text-slate-300 border-slate-850" : "bg-slate-55 bg-slate-50 border-slate-150 text-slate-600"
                }`}>
                  <th className="p-2.5 text-center">Nº Parcela</th>
                  <th className="p-2.5">Prestação Total (BRL)</th>
                  <th className="p-2.5">Juros Pagos (BRL)</th>
                  <th className="p-2.5">Amortização Principal (BRL)</th>
                  <th className="p-2.5">Saldo Devedor Restante</th>
                </tr>
              </thead>
              <tbody className={`font-mono divide-y ${darkMode ? "divide-slate-800 text-slate-300" : "divide-slate-100 text-slate-700"}`}>
                {/* Mostra primeiras 12 */}
                {scheduleData.slice(0, 12).map((row) => (
                  <tr key={row.month} className={darkMode ? "hover:bg-slate-950/40" : "hover:bg-slate-50/50"}>
                    <td className="p-2 text-center text-slate-400 font-bold">{row.month}</td>
                    <td className="p-2">{formatBRL(row.payment)}</td>
                    <td className="p-2 text-red-400">{formatBRL(row.interest)}</td>
                    <td className="p-2 text-emerald-450 text-emerald-400">{formatBRL(row.amortization)}</td>
                    <td className="p-2 font-semibold text-slate-400">{formatBRL(row.outstandingBalance)}</td>
                  </tr>
                ))}

                {/* Linha pontilhada divisória se houver mais parcelas */}
                {scheduleData.length > 18 && (
                  <tr>
                    <td colSpan={5} className={`p-2.5 text-center font-bold text-[10px] tracking-widest ${
                      darkMode ? "bg-slate-950/40 text-slate-500 border-b border-slate-850" : "bg-slate-50 text-slate-400 border-b border-slate-150"
                    }`}>
                      ................... CORTE TEMPORAL DAS PARCELAS INTERMEDIÁRIAS ...................
                    </td>
                  </tr>
                )}

                {/* Mostra últimas 6 */}
                {scheduleData.length > 12 && scheduleData.slice(-6).map((row) => (
                  <tr key={row.month} className={darkMode ? "bg-indigo-950/20 hover:bg-slate-950/40" : "hover:bg-slate-55/50 bg-indigo-50/10"}>
                    <td className="p-2 text-center text-slate-400 font-bold">{row.month}</td>
                    <td className="p-2">{formatBRL(row.payment)}</td>
                    <td className="p-2 text-red-400">{formatBRL(row.interest)}</td>
                    <td className="p-2 text-emerald-400">{formatBRL(row.amortization)}</td>
                    <td className="p-2 font-semibold text-slate-400">{formatBRL(row.outstandingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
