import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import InvestmentSimulator from "./components/InvestmentSimulator";
import FinancingSimulator from "./components/FinancingSimulator";
import RealEstateEvaluator from "./components/RealEstateEvaluator";
import ActiveInvestments from "./components/ActiveInvestments";
import RedemptionStatements from "./components/RedemptionStatements";
import { ActiveInvestment, RedemptionRecord, InvestmentType } from "./types";
import { simulateInvestment, getTaxRate } from "./utils/financeUtils";
import { TrendingUp, Landmark, Calculator, Receipt, Wallet, RefreshCw } from "lucide-react";

// Local storage prefix
const STORAGE_PREFIX = "investify_sim_v1_";

export default function App() {
  // --- Persistent States ---
  const [availableBalance, setAvailableBalance] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + "balance");
    return saved !== null ? Number(saved) : 500000; // starts with R$ 500.000,00 available
  });

  const [activeInvestments, setActiveInvestments] = useState<ActiveInvestment[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + "investments");
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error("Erro ao carregar investimentos", err);
      }
    }
    
    // Default initial mock active investment for immediate testing of redemptions
    const defaultInitialAmount = 80000;
    const defaultMonthlyCont = 1500;
    const defaultRate = 10.40; // 10.40% CDB rate
    const defaultMonths = 14; // simulated elapsed time
    
    const steps = simulateInvestment(
      defaultInitialAmount,
      defaultMonthlyCont,
      defaultRate,
      defaultMonths,
      InvestmentType.CDB
    );
    const finalStep = steps[steps.length - 1];

    return [
      {
        id: "mock-cdb-initial",
        type: InvestmentType.CDB,
        initialAmount: defaultInitialAmount,
        monthlyContribution: defaultMonthlyCont,
        interestRate: defaultRate,
        startDate: new Date(Date.now() - 14 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        monthsPassed: defaultMonths,
        totalInvested: finalStep.investedAccumulated,
        currentBalance: finalStep.grossBalance,
        totalInterest: finalStep.interestAccumulated,
        estimatedTax: finalStep.estimatedTax,
        netBalance: finalStep.netBalance,
        termMonths: 48
      }
    ];
  });

  const [redemptionRecords, setRedemptionRecords] = useState<RedemptionRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + "records");
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error("Erro ao carregar extratos", err);
      }
    }

    // Default initial mock redemption
    return [
      {
        id: "mock-record-1",
        investmentType: InvestmentType.TESOURO_SELIC,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        requestedAmount: 15000,
        taxAmount: 512.50,
        netAmount: 14487.50,
        notes: "Resgate parcial antecipado para entrada de compra."
      }
    ];
  });

  // Active Tab Selector: 'investments' | 'financing' | 'realestate'
  const [activeTab, setActiveTab] = useState<"investments" | "financing" | "realestate">("investments");

  // Secondary sub-view inside the investments tab for organizing simulated items
  const [investmentSubView, setInvestmentSubView] = useState<"simulator" | "my_portfolio" | "statements">("simulator");

  // Dark Mode state (defaults to true for immersive dark theme)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + "dark_mode");
    return saved !== null ? saved === "true" : true;
  });

  // Keep localStorage updated upon state modifications
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + "balance", availableBalance.toString());
  }, [availableBalance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + "investments", JSON.stringify(activeInvestments));
  }, [activeInvestments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + "records", JSON.stringify(redemptionRecords));
  }, [redemptionRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + "dark_mode", darkMode.toString());
  }, [darkMode]);

  // Aggregate asset calculations for top headers
  const totalInvestedAmount = activeInvestments.reduce((sum, inv) => sum + inv.totalInvested, 0);
  const activePortfolioValue = activeInvestments.reduce((sum, inv) => sum + inv.netBalance, 0);
  const totalEarningsInJuros = activeInvestments.reduce((sum, inv) => sum + inv.totalInterest, 0);

  // --- Handlers ---

  /**
   * Clears simulation variables to factory-reset conditions
   */
  const handleResetData = () => {
    if (window.confirm("Deseja realmente resetar a simulação para os valores padrões de fábrica?")) {
      localStorage.removeItem(STORAGE_PREFIX + "balance");
      localStorage.removeItem(STORAGE_PREFIX + "investments");
      localStorage.removeItem(STORAGE_PREFIX + "records");
      window.location.reload();
    }
  };

  /**
   * Adds a new active simulated investment
   */
  const handleAddActiveInvestment = (newInv: {
    type: InvestmentType;
    initialAmount: number;
    monthlyContribution: number;
    interestRate: number;
    termMonths: number;
  }) => {
    // Deduct initial capital simulated from user's live balance
    setAvailableBalance(prev => prev - newInv.initialAmount);

    // Run initial steps simulation to resolve current state at Month 0
    const initialSteps = simulateInvestment(
      newInv.initialAmount,
      newInv.monthlyContribution,
      newInv.interestRate,
      0,
      newInv.type
    );
    const zeroStep = initialSteps[0];

    const modelObj: ActiveInvestment = {
      id: "inv_" + Math.random().toString(36).substr(2, 9),
      type: newInv.type,
      initialAmount: newInv.initialAmount,
      monthlyContribution: newInv.monthlyContribution,
      interestRate: newInv.interestRate,
      startDate: new Date().toISOString(),
      monthsPassed: 0,
      totalInvested: zeroStep.investedAccumulated,
      currentBalance: zeroStep.grossBalance,
      totalInterest: zeroStep.interestAccumulated,
      estimatedTax: zeroStep.estimatedTax,
      netBalance: zeroStep.netBalance,
      termMonths: newInv.termMonths
    };

    setActiveInvestments(prev => [modelObj, ...prev]);
    // Switch to active investments subview automatically for perfect user review
    setInvestmentSubView("my_portfolio");
  };

  /**
   * Accelerates virtual elapsed time to trigger compound interest calculations on live targets
   */
  const handleAdvanceMonths = (id: string, monthsToAdd: number) => {
    setActiveInvestments(prev => {
      return prev.map(inv => {
        if (inv.id !== id) return inv;

        const nextMonths = inv.monthsPassed + monthsToAdd;
        
        // Re-simulate timeline with new months context to sync interest and tax progression
        const steps = simulateInvestment(
          inv.initialAmount,
          inv.monthlyContribution,
          inv.interestRate,
          nextMonths,
          inv.type
        );
        const targetStep = steps[steps.length - 1];

        return {
          ...inv,
          monthsPassed: nextMonths,
          totalInvested: targetStep.investedAccumulated,
          currentBalance: targetStep.grossBalance,
          totalInterest: targetStep.interestAccumulated,
          estimatedTax: targetStep.estimatedTax,
          netBalance: targetStep.netBalance
        };
      });
    });
  };

  /**
   * Redeem simulated cash, paying the proportional calculated tax and crediting the user balance
   */
  const handleRedeem = (
    id: string,
    bruteAmountToRedeem: number,
    taxAmount: number,
    netAmount: number
  ) => {
    // 1. Credit the user's available balance in the wallet
    setAvailableBalance(prev => prev + netAmount);

    // 2. Register redemption on the statements chronological ledger (extrato)
    const matchedInvestment = activeInvestments.find(inv => inv.id === id);
    if (!matchedInvestment) return;

    const record: RedemptionRecord = {
      id: "rec_" + Math.random().toString(36).substr(2, 9),
      investmentType: matchedInvestment.type,
      date: new Date().toISOString(),
      requestedAmount: bruteAmountToRedeem,
      taxAmount: taxAmount,
      netAmount: netAmount,
      notes: bruteAmountToRedeem >= matchedInvestment.currentBalance 
        ? "Resgate total do investimento." 
        : "Resgate parcial efetuado."
    };

    setRedemptionRecords(prev => [record, ...prev]);

    // 3. Subtract from the specific active investment balance
    setActiveInvestments(prev => {
      return prev.map(inv => {
        if (inv.id !== id) return inv;

        const remainingGross = inv.currentBalance - bruteAmountToRedeem;
        if (remainingGross < 5.0) {
          // If balance is negligible or fully redeemed, we delete it
          return null;
        }

        // Proportional interest adjustment
        const interestRatio = inv.currentBalance > 0 ? inv.totalInterest / inv.currentBalance : 0;
        const remainingInterest = remainingGross * interestRatio;
        
        // Proportional invested principal calculation remaining
        const remainingInvested = remainingGross - remainingInterest;

        // Recalculate taxes
        const taxRate = getTaxRate(inv.monthsPassed, inv.type);
        const remainingTax = remainingInterest * taxRate;
        const remainingNet = remainingGross - remainingTax;

        return {
          ...inv,
          currentBalance: Number(remainingGross.toFixed(2)),
          totalInvested: Number(remainingInvested.toFixed(2)),
          totalInterest: Number(remainingInterest.toFixed(2)),
          estimatedTax: Number(remainingTax.toFixed(2)),
          netBalance: Number(remainingNet.toFixed(2))
        };
      }).filter((inv): inv is ActiveInvestment => inv !== null);
    });
  };

  return (
    <div id="app-root-container" className={`min-h-screen py-6 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200 ${
      darkMode ? "bg-slate-950 text-slate-150" : "bg-slate-50 text-slate-800"
    }`}>
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        
        {/* UPPER KPI STATS METRICS & BRANDING BAR */}
        <Header
          availableBalance={availableBalance}
          totalInvested={totalInvestedAmount}
          activePortfolioValue={activePortfolioValue}
          totalEarnings={totalEarningsInJuros}
          onResetData={handleResetData}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(prev => !prev)}
        />

        {/* CORE INTERACTIVE WORKSPACE SELECTION TABS */}
        <div id="main-navigation-tabs" className={`p-1.5 rounded-2xl shadow-sm border flex flex-wrap gap-2 transition-colors duration-200 ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"
        }`}>
          
          <button
            onClick={() => setActiveTab("investments")}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-xs font-bold transition duration-150 ${
              activeTab === "investments"
                ? "bg-indigo-600 text-white shadow-md active:scale-98"
                : darkMode
                  ? "text-slate-350 hover:bg-slate-800 hover:text-slate-100"
                  : "text-slate-600 hover:bg-slate-100/80"
            }`}
          >
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Investimentos</span>
          </button>

          <button
            onClick={() => setActiveTab("financing")}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-xs font-bold transition duration-150 ${
              activeTab === "financing"
                ? "bg-indigo-600 text-white shadow-md active:scale-98"
                : darkMode
                  ? "text-slate-350 hover:bg-slate-800 hover:text-slate-100"
                  : "text-slate-600 hover:bg-slate-100/80"
            }`}
          >
            <Landmark className="w-4 h-4 text-indigo-400" />
            <span>Financiamentos (Valor Presente)</span>
          </button>

          <button
            onClick={() => setActiveTab("realestate")}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-xs font-bold transition duration-150 ${
              activeTab === "realestate"
                ? "bg-indigo-600 text-white shadow-md active:scale-98"
                : darkMode
                  ? "text-slate-350 hover:bg-slate-800 hover:text-slate-100"
                  : "text-slate-600 hover:bg-slate-100/80"
            }`}
          >
            <Calculator className="w-4 h-4 text-indigo-400" />
            <span>Avaliação de Imóvel (m²)</span>
          </button>

        </div>

        {/* WORKSPACE AREA CONTAINER */}
        <div id="workspace-viewport" className="flex flex-col gap-6">
          
          {/* TAB 1: INVESTMENTS HUB DEVELOPMENT WITH THREE SUB-VIEWS (SIMULATE, PORTFOLIO, STATEMENTS) */}
          {activeTab === "investments" && (
            <div className="flex flex-col gap-6 animate-fade-in">
              
              {/* Investments Secondary Nav */}
              <div className={`flex border-b transition-colors duration-200 ${
                darkMode ? "border-slate-800" : "border-slate-200"
              }`}>
                <button
                  onClick={() => setInvestmentSubView("simulator")}
                  className={`py-3.5 px-5 text-xs font-bold border-b-2 -mb-px transition ${
                    investmentSubView === "simulator"
                      ? "border-indigo-550 border-indigo-600 text-indigo-500"
                      : darkMode
                        ? "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Simular Investimento Futuro
                  </span>
                </button>

                <button
                  onClick={() => setInvestmentSubView("my_portfolio")}
                  className={`py-3.5 px-5 text-xs font-bold border-b-2 -mb-px transition ${
                    investmentSubView === "my_portfolio"
                      ? "border-indigo-600 text-indigo-500"
                      : darkMode
                        ? "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Wallet className="w-3.5 h-3.5" />
                    Meus Investimentos ({activeInvestments.length})
                  </span>
                </button>

                <button
                  onClick={() => setInvestmentSubView("statements")}
                  className={`py-3.5 px-5 text-xs font-bold border-b-2 -mb-px transition ${
                    investmentSubView === "statements"
                      ? "border-indigo-600 text-indigo-500"
                      : darkMode
                        ? "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800"
                        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5" />
                    Extrato de Resgates ({redemptionRecords.length})
                  </span>
                </button>
              </div>

              {/* Subview Render Routing */}
              {investmentSubView === "simulator" && (
                <InvestmentSimulator
                  availableBalance={availableBalance}
                  onAddActiveInvestment={handleAddActiveInvestment}
                  darkMode={darkMode}
                />
              )}

              {investmentSubView === "my_portfolio" && (
                <ActiveInvestments
                  investments={activeInvestments}
                  onAdvanceMonths={handleAdvanceMonths}
                  onRedeem={handleRedeem}
                  darkMode={darkMode}
                />
              )}

              {investmentSubView === "statements" && (
                <RedemptionStatements
                  records={redemptionRecords}
                  darkMode={darkMode}
                />
              )}

            </div>
          )}

          {/* TAB 2: MORTGAGE FINANCING AMORTIZATION PORTAL */}
          {activeTab === "financing" && (
            <div className="animate-fade-in shadow-sm">
              <FinancingSimulator darkMode={darkMode} />
            </div>
          )}

          {/* TAB 3: m2 REAL ESTATE GEOGRAPHICAL VALUATOR AND ESTIMATION BOX */}
          {activeTab === "realestate" && (
            <div className="animate-fade-in shadow-sm">
              <RealEstateEvaluator darkMode={darkMode} />
            </div>
          )}

        </div>

      </div>

      {/* FOOTER */}
      <footer className={`max-w-6xl mx-auto text-center mt-12 text-[11px] font-mono py-6 border-t transition-colors duration-200 ${
        darkMode ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-400"
      }`}>
        Desenvolvido para fins de simulação financeira imobiliária. Taxas e fórmulas em conformidade com as regras brasileiras vigentes.
      </footer>
    </div>
  );
}
