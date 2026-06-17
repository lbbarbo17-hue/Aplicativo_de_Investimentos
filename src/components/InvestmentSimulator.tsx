import React, { useState, useMemo } from "react";
import { InvestmentType } from "../types";
import { simulateInvestment, getTaxRate } from "../utils/financeUtils";
import { TrendingUp, HelpCircle, Flame, PlusCircle, CheckCircle2, BookOpen, ChevronDown, ChevronUp, AlertCircle, Sparkles } from "lucide-react";

interface InvestmentSimulatorProps {
  availableBalance: number;
  onAddActiveInvestment: (investment: {
    type: InvestmentType;
    initialAmount: number;
    monthlyContribution: number;
    interestRate: number;
    termMonths: number;
  }) => void;
  darkMode?: boolean;
}

// Default interest expectations (annual %)
const PRESET_RATES: Record<InvestmentType, number> = {
  [InvestmentType.POUPANCA]: 6.17, // ~6.17% aa fixed
  [InvestmentType.CDB]: 10.40,     // ~10.40% aa
  [InvestmentType.TESOURO_SELIC]: 10.50, // ~10.50% aa
  [InvestmentType.LCI_LCA]: 9.36   // Isento, ~90% do CDI
};

export default function InvestmentSimulator({
  availableBalance,
  onAddActiveInvestment,
  darkMode = true
}: InvestmentSimulatorProps) {
  // Simulator State
  const [initialAmount, setInitialAmount] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [termMonths, setTermMonths] = useState<number>(36);
  const [selectedType, setSelectedType] = useState<InvestmentType>(InvestmentType.CDB);
  const [customRateEnabled, setCustomRateEnabled] = useState<boolean>(false);
  const [customRate, setCustomRate] = useState<number>(10.5);
  
  // Interactive Support Guide expanded
  const [showGuide, setShowGuide] = useState<boolean>(true);

  // Tooltip interactive state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Success indicator message when creating investment
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Effective interest rate used
  const activeRate = customRateEnabled ? customRate : PRESET_RATES[selectedType];

  // Calculate simulated timeline
  const timeline = useMemo(() => {
    return simulateInvestment(
      initialAmount,
      monthlyContribution,
      activeRate,
      termMonths,
      selectedType
    );
  }, [initialAmount, monthlyContribution, activeRate, termMonths, selectedType]);

  const latestStep = timeline[timeline.length - 1];

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  // Pre-configured rate definitions
  const currentPresetRate = PRESET_RATES[selectedType];

  const handleCreateInvestment = () => {
    if (initialAmount > availableBalance) {
      alert(`Você não possui saldo disponível suficiente (${formatBRL(availableBalance)}) para iniciar este investimento. Por favor, reinicie os dados ou digite um valor inicial compatível.`);
      return;
    }

    onAddActiveInvestment({
      type: selectedType,
      initialAmount,
      monthlyContribution,
      interestRate: activeRate,
      termMonths
    });

    setSuccessMessage(`Simulação de investimento em "${selectedType}" gerada com sucesso e adicionada aos seus ativos!`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // SVG dimensions for progression chart
  const svgWidth = 500;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 20;

  // Compute SVG Points
  const chartPoints = useMemo(() => {
    if (timeline.length === 0) return { grossPoints: "", investedPoints: "", netPoints: "" };
    
    const maxVal = Math.max(...timeline.map(s => s.grossBalance)) || 1;
    const minVal = 0;
    const count = timeline.length;

    const pointsGross: string[] = [];
    const pointsInvested: string[] = [];
    const pointsNet: string[] = [];

    timeline.forEach((step, idx) => {
      const x = paddingX + (idx / (count - 1)) * (svgWidth - paddingX * 2);
      const yGross = svgHeight - paddingY - ((step.grossBalance - minVal) / (maxVal - minVal)) * (svgHeight - paddingY * 2);
      const yInvested = svgHeight - paddingY - ((step.investedAccumulated - minVal) / (maxVal - minVal)) * (svgHeight - paddingY * 2);
      const yNet = svgHeight - paddingY - ((step.netBalance - minVal) / (maxVal - minVal)) * (svgHeight - paddingY * 2);

      pointsGross.push(`${x},${yGross}`);
      pointsInvested.push(`${x},${yInvested}`);
      pointsNet.push(`${x},${yNet}`);
    });

    return {
      grossPoints: pointsGross.join(" "),
      investedPoints: pointsInvested.join(" "),
      netPoints: pointsNet.join(" ")
    };
  }, [timeline]);

  // Determine current hovered step data if any
  const hoveredStep = hoverIndex !== null && timeline[hoverIndex] ? timeline[hoverIndex] : null;

  return (
    <div className={`rounded-2xl p-6 border transition-colors duration-200 ${
      darkMode ? "bg-slate-900 border-slate-800 text-slate-100 shadow-md" : "bg-white border-slate-100 text-slate-800"
    }`}>
      <div className={`flex items-center justify-between border-b pb-4 mb-4 gap-2 ${
        darkMode ? "border-slate-800" : "border-indigo-50"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${
            darkMode ? "bg-indigo-950 text-indigo-400" : "bg-indigo-50 text-indigo-600"
          }`}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>
              Cálculo de Investimento (Valor Futuro)
            </h2>
            <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Compare CDB, Tesouro Direto, Poupança e LCI/LCA com regras reais de tributação do Brasil.
            </p>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className={`flex items-center gap-2 text-xs px-4 py-3 rounded-xl border transition animate-fade-in mb-4 ${
          darkMode ? "bg-emerald-950/40 border-emerald-900/50 text-emerald-300" : "bg-emerald-50 text-emerald-800 border-emerald-100"
        }`}>
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* QUICK BRAZILIAN FIXED-INCOME GUIDE */}
      <div className={`p-4 rounded-xl border mb-6 transition-colors duration-200 ${
        darkMode ? "bg-slate-950/50 border-slate-800 text-slate-300" : "bg-indigo-50/30 border-indigo-100 text-slate-700"
      }`}>
        <button 
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex justify-between items-center text-xs font-bold font-sans uppercase tracking-wider"
        >
          <span className="flex items-center gap-2 text-indigo-400">
            <BookOpen className="w-4.5 h-4.5" />
            Guia Rápido dos Tipos de Investimento e Tributação (Clique para {showGuide ? "esconder" : "expandir"})
          </span>
          {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showGuide && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 text-xs font-sans divide-y md:divide-y-0 md:divide-x divide-slate-800/20 md:border-t md:border-slate-800/10 md:pt-4">
            {/* Column 1: Asset categories */}
            <div className="flex flex-col gap-3 pr-2">
              <h4 className={`text-xs font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                💰 Entendendo as alternativas:
              </h4>
              <ul className="flex flex-col gap-2.5 text-[11px] leading-relaxed">
                <li>
                  <strong className={darkMode ? "text-slate-200" : "text-slate-800"}>Poupança:</strong> É isenta de imposto, mas é a que pior rende. Atualmente perde para a inflação, o que faz seu poder de compra diminuir ao longo do tempo.
                </li>
                <li>
                  <strong className={darkMode ? "text-slate-200" : "text-slate-800"}>CDB (Crédito de Banco):</strong> É como emprestar dinheiro para um banco em troca de juros. Altamente seguro e costuma render mais que a poupança. Tem IR de tabela regressiva.
                </li>
                <li>
                  <strong className={darkMode ? "text-slate-200" : "text-slate-800"}>Tesouro Selic:</strong> O mais seguro do Brasil. Você empresta recursos para o governo federal. Rende a taxa Selic diária e permite resgate sem perdas. Tem IR regressivo.
                </li>
                <li>
                  <strong className={darkMode ? "text-slate-200" : "text-slate-800"}>LCI / LCA:</strong> Títulos focados no setor de Habitação e Agronegócio. Como incentivo do governo, são <span className="text-emerald-450 text-emerald-400 font-semibold uppercase">isentos de Imposto de Renda</span> para pessoas físicas!
                </li>
              </ul>
            </div>

            {/* Column 2: Tax system and regression patterns */}
            <div className="flex flex-col gap-3 pl-0 md:pl-4 pt-3 md:pt-0">
              <h4 className={`text-xs font-bold ${darkMode ? "text-white" : "text-slate-900"}`}>
                📊 A Regra Regressiva do Imposto de Renda (IR):
              </h4>
              <p className="text-[11px] leading-relaxed">
                No <strong>CDB</strong> e no <strong>Tesouro Selic</strong>, o leão do imposto cobra uma fatia sobre os seus lucros. Mas há uma grande vantagem: quanto mais tempo seu dinheiro passar guardado, menos imposto você paga ao sacar:
              </p>
              <div className={`grid grid-cols-2 gap-2 mt-1 text-[10px] p-2 rounded-lg font-mono ${
                darkMode ? "bg-slate-950 border-slate-850" : "bg-slate-50 border-slate-250"
              }`}>
                <div>📅 Até 6 meses: <span className="text-rose-450 text-rose-400 font-bold">22,5%</span></div>
                <div>📅 1 a 2 anos: <span className="text-indigo-400 font-bold">17,5%</span></div>
                <div>📅 6 a 12 meses: <span className="text-orange-400 font-bold">20,0%</span></div>
                <div>📅 Acima de 2 anos: <span className="text-emerald-400 font-bold">15,0%</span></div>
              </div>
              <p className="text-[10px] text-slate-400 flex items-start gap-1 mt-1 leading-normal">
                <AlertCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>Simule prazos maiores como <strong>24 ou 36 meses</strong> para desfrutar da menor alíquota de impostos (15.0%) e valorizar ao máximo seu patrimônio líquido!</span>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* INPUT PANEL: Column Span 5 */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Tipo de Investimento */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}>
              Tipo de Rendimento
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(InvestmentType).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3.5 py-3 text-left rounded-xl text-xs font-medium border transition ${
                    selectedType === type
                      ? darkMode 
                        ? "bg-indigo-950/40 border-indigo-500 text-indigo-300 shadow-sm"
                        : "bg-indigo-50/50 border-indigo-300 text-indigo-700 shadow-2xs"
                      : darkMode 
                        ? "bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                        : "bg-slate-50/50 border-slate-200/60 text-slate-650 text-slate-600 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="font-bold block">{type}</div>
                  <span className={`text-[10px] block mt-0.5 font-sans ${
                    darkMode ? "text-slate-500" : "text-slate-450"
                  }`}>
                    {PRESET_RATES[type].toFixed(2)}% a.a. {type === InvestmentType.LCI_LCA || type === InvestmentType.POUPANCA ? " (Isento)" : " (c/ IR)"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Valor Inicial */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}>
                Valor Inicial
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-2.5 text-xs font-mono ${
                  darkMode ? "text-slate-500" : "text-slate-400"
                }`}>R$</span>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(Number(e.target.value) || 0)}
                  className={`w-full pl-9 pr-3 py-2 text-sm font-mono rounded-xl border outline-none transition ${
                    darkMode 
                      ? "bg-slate-950 border-slate-800 text-white focus:border-indigo-500" 
                      : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-400"
                  }`}
                />
              </div>
            </div>

            {/* Aporte Mensal */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}>
                Aporte Mensal
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-2.5 text-xs font-mono ${
                  darkMode ? "text-slate-500" : "text-slate-400"
                }`}>R$</span>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value) || 0)}
                  className={`w-full pl-9 pr-3 py-2 text-sm font-mono rounded-xl border outline-none transition ${
                    darkMode 
                      ? "bg-slate-950 border-slate-800 text-white focus:border-indigo-500" 
                      : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-400"
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Prazo em Meses */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}>
                Prazo (Meses)
              </label>
              <input
                type="number"
                min="1"
                max="480"
                value={termMonths}
                onChange={(e) => setTermMonths(Number(e.target.value) || 12)}
                className={`w-full px-3 py-2 text-sm font-mono rounded-xl border outline-none transition ${
                  darkMode 
                    ? "bg-slate-950 border-slate-800 text-white focus:border-indigo-500" 
                    : "bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-indigo-400"
                }`}
              />
              <span className={`text-[10px] mt-1 block font-semibold ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}>
                = {(termMonths / 12).toFixed(1)} Anos
              </span>
            </div>

            {/* Custom Interactive Rates Toggle */}
            <div>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                darkMode ? "text-slate-400" : "text-slate-500"
              }`}>
                Rentabilidade
              </label>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="checkbox-custom-rate"
                    checked={customRateEnabled}
                    onChange={(e) => setCustomRateEnabled(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="checkbox-custom-rate" className="text-xs text-slate-400 select-none cursor-pointer">
                    Editar taxa manual?
                  </label>
                </div>
                {customRateEnabled ? (
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="100"
                      value={customRate}
                      onChange={(e) => setCustomRate(Number(e.target.value) || 1)}
                      className={`w-full px-3 py-1 text-xs font-mono rounded-lg border focus:outline-none ${
                        darkMode 
                          ? "bg-slate-950 border-slate-800 text-white" 
                          : "bg-indigo-50/40 border-indigo-200 text-indigo-705"
                      }`}
                    />
                    <span className="absolute right-3 top-1.5 text-xs text-indigo-400">% a.a.</span>
                  </div>
                ) : (
                  <span className={`text-xs font-mono font-semibold block mt-1 py-1 ${
                    darkMode ? "text-indigo-400" : "text-indigo-600"
                  }`}>
                    {currentPresetRate.toFixed(2)}% a.a.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className={`mt-4 pt-4 border-t ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
            <button
              onClick={handleCreateInvestment}
              className="w-full bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs py-3.5 px-4 rounded-xl shadow-xs transition duration-150 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4.5 h-4.5 text-indigo-200" />
              Aplicar e Salvar em Investimentos Ativos
            </button>
            <span className="text-[10px] text-center block text-slate-400 mt-1.5">
              Guarde seu capital no portfólio para testar a operação de <strong>Resgatar Capital</strong> abaixo.
            </span>
          </div>

        </div>

        {/* RESULTS PANEL & CHART: Column Span 7 */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className={`p-5 rounded-2xl border ${
            darkMode ? "bg-slate-950 border-slate-800/80" : "bg-slate-50 border-slate-100"
          }`}>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${
              darkMode ? "text-slate-405 text-slate-450" : "text-slate-500"
            }`}>Resultado da Operação ao Final do Ciclo</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Valor Aplicado</span>
                <p className={`text-sm font-bold font-mono mt-0.5 ${
                  darkMode ? "text-slate-300" : "text-slate-700"
                }`}>
                  {formatBRL(latestStep.investedAccumulated)}
                </p>
                <p className="text-[9px] text-slate-400">Total acumulado</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Juros Brutos</span>
                <p className={`text-sm font-bold font-mono text-indigo-400 mt-0.5`}>
                  +{formatBRL(latestStep.interestAccumulated)}
                </p>
                <p className="text-[9px] text-slate-400">Rentabilidade juros</p>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Imposto (IR)</span>
                <p className="text-sm font-bold font-mono text-red-400 mt-0.5">
                  -{formatBRL(latestStep.estimatedTax)}
                </p>
                <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-semibold font-sans ${
                  darkMode ? "bg-red-950 text-red-300" : "bg-red-50 text-red-650"
                }`}>
                  {(getTaxRate(termMonths, selectedType) * 100).toFixed(1)}%
                </span>
              </div>

              <div>
                <span className="text-[10px] text-indigo-400 uppercase font-bold">Valor Líquido</span>
                <p className={`text-base font-extrabold font-mono mt-0.5 ${
                  darkMode ? "text-emerald-400" : "text-emerald-600"
                }`}>
                  {formatBRL(latestStep.netBalance)}
                </p>
                <p className="text-[9px] text-slate-400">Saldo pós imposto</p>
              </div>
            </div>
          </div>

          {/* SVG Progression Chart */}
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-1.5">
              <span className={`text-xs font-bold ${darkMode ? "text-slate-300" : "text-slate-600"}`}>Evolução Patrimonial Simulado</span>
              <span className="text-[10px] text-slate-400 font-sans hidden sm:inline">Passe o cursor sobre o gráfico para detalhes</span>
            </div>
            
            <div className={`p-4 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center border ${
              darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-900 border-slate-950"
            }`}>
              <svg 
                className="w-full max-w-full cursor-crosshair"
                height={svgHeight}
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                onMouseLeave={() => setHoverIndex(null)}
              >
                <defs>
                  <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0"/>
                  </linearGradient>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke={darkMode ? "#1e293b" : "#475569"} strokeDasharray="3,3" />
                <line x1={paddingX} y1={svgHeight/2} x2={svgWidth - paddingX} y2={svgHeight/2} stroke={darkMode ? "#1e293b" : "#475569"} strokeDasharray="3,3" />
                <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke={darkMode ? "#1e293b" : "#475569"} />

                {/* Shaded Area Gross */}
                {chartPoints.grossPoints && (
                  <polygon
                    points={`${paddingX},${svgHeight - paddingY} ${chartPoints.grossPoints} ${svgWidth - paddingX},${svgHeight - paddingY}`}
                    fill="url(#grossGrad)"
                  />
                )}

                {/* Line Invested (dotted) */}
                {chartPoints.investedPoints && (
                  <polyline
                    fill="none"
                    stroke="#475569"
                    strokeWidth="1.5"
                    strokeDasharray="4,4"
                    points={chartPoints.investedPoints}
                  />
                )}

                {/* Line Gross */}
                {chartPoints.grossPoints && (
                  <polyline
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="2"
                    points={chartPoints.grossPoints}
                  />
                )}

                {/* Line Net */}
                {chartPoints.netPoints && (
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    points={chartPoints.netPoints}
                  />
                )}

                {/* Timeline Interactive Hover Triggers */}
                {timeline.map((step, idx) => {
                  const x = paddingX + (idx / (timeline.length - 1)) * (svgWidth - paddingX * 2);
                  return (
                    <g key={idx}>
                      <rect
                        x={x - (svgWidth - paddingX * 2) / (timeline.length * 2)}
                        y={0}
                        width={(svgWidth - paddingX * 2) / timeline.length}
                        height={svgHeight}
                        fill="transparent"
                        onMouseEnter={() => setHoverIndex(idx)}
                      />
                      {hoverIndex === idx && (
                        <>
                          <line
                            x1={x}
                            y1={paddingY}
                            x2={x}
                            y2={svgHeight - paddingY}
                            stroke="#6366f1"
                            strokeWidth="1"
                            strokeDasharray="2,2"
                          />
                          <circle
                            cx={x}
                            cy={svgHeight - paddingY - ((step.grossBalance - 0) / (Math.max(...timeline.map(s => s.grossBalance)) || 1)) * (svgHeight - paddingY * 2)}
                            r="4"
                            fill="#4f46e5"
                          />
                          <circle
                            cx={x}
                            cy={svgHeight - paddingY - ((step.netBalance - 0) / (Math.max(...timeline.map(s => s.grossBalance)) || 1)) * (svgHeight - paddingY * 2)}
                            r="4"
                            fill="#10b981"
                          />
                        </>
                      )}
                    </g>
                  );
                })}

                {/* Labels */}
                <text x={paddingX} y={svgHeight - 4} fill="#64748b" className="text-[9px] font-mono" textAnchor="start">Mês 0</text>
                <text x={svgWidth - paddingX} y={svgHeight - 4} fill="#64748b" className="text-[9px] font-mono" textAnchor="end">Mês {termMonths}</text>
              </svg>

              {/* Real-time details relative overlay based on mouse position */}
              {hoveredStep ? (
                <div className="absolute top-2 right-4 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white shadow-lg flex flex-col gap-1 z-15 text-[10px] font-mono min-w-[170px]">
                  <div className="font-bold border-b border-slate-800 pb-1 mb-1 text-indigo-400 font-sans text-xs">
                    Mês {hoveredStep.month} do Planejamento
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Depositado:</span>
                    <span className="font-semibold text-slate-200">{formatBRL(hoveredStep.investedAccumulated)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Juros Acumulados:</span>
                    <span className="font-semibold text-amber-400">+{formatBRL(hoveredStep.interestAccumulated)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">IR Estimado:</span>
                    <span className="font-semibold text-red-400">-{formatBRL(hoveredStep.estimatedTax)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1 mt-1 font-bold">
                    <span className="text-emerald-400 font-sans">Líquido Final:</span>
                    <span className="text-emerald-400 font-sans">{formatBRL(hoveredStep.netBalance)}</span>
                  </div>
                </div>
              ) : (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center justify-center gap-4 text-[10px] text-slate-400 font-mono">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-0.5 bg-slate-600 block"></span>
                    <span>Guardado</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-0.5 bg-indigo-500 block"></span>
                    <span>Bruto</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-0.5 bg-emerald-500 block"></span>
                    <span>Líquido</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
