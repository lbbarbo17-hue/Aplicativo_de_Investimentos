import { InvestmentType } from "../types";

/**
 * Converte taxa de juros anual para mensal (juros compostos)
 */
export function annualToMonthlyRate(annualRate: number): number {
  return Math.pow(1 + annualRate / 100, 1 / 12) - 1;
}

/**
 * Obtém a alíquota de Imposto de Renda regressivo do Brasil baseado em meses
 */
export function getTaxRate(months: number, type: InvestmentType): number {
  if (type === InvestmentType.POUPANCA || type === InvestmentType.LCI_LCA) {
    return 0; // Isentos de IR
  }
  
  if (months <= 6) return 0.225; // 22.5% até 180 dias
  if (months <= 12) return 0.20;  // 20% até 360 dias
  if (months <= 24) return 0.175; // 17.5% até 720 dias
  return 0.15; // 15% acima de 720 dias
}

export interface SimulationStep {
  month: number;
  investedAccumulated: number;
  interestAccumulated: number;
  grossBalance: number;
  estimatedTax: number;
  netBalance: number;
}

/**
 * Simula a evolução do investimento mês a mês
 */
export function simulateInvestment(
  initialAmount: number,
  monthlyContribution: number,
  annualRate: number,
  termMonths: number,
  type: InvestmentType
): SimulationStep[] {
  const monthlyRate = annualToMonthlyRate(annualRate);
  const steps: SimulationStep[] = [];
  
  let currentBalance = initialAmount;
  let totalInvested = initialAmount;
  let totalInterest = 0;

  // Passo Zero
  steps.push({
    month: 0,
    investedAccumulated: totalInvested,
    interestAccumulated: 0,
    grossBalance: currentBalance,
    estimatedTax: 0,
    netBalance: currentBalance
  });

  for (let m = 1; m <= termMonths; m++) {
    const interestOfThisMonth = currentBalance * monthlyRate;
    totalInterest += interestOfThisMonth;
    currentBalance += interestOfThisMonth + monthlyContribution;
    totalInvested += monthlyContribution;

    // Imposto estimado para este período de resgate teórico
    const taxRate = getTaxRate(m, type);
    const estimatedTax = totalInterest * taxRate;
    const netBalance = currentBalance - estimatedTax;

    steps.push({
      month: m,
      investedAccumulated: Number(totalInvested.toFixed(2)),
      interestAccumulated: Number(totalInterest.toFixed(2)),
      grossBalance: Number(currentBalance.toFixed(2)),
      estimatedTax: Number(estimatedTax.toFixed(2)),
      netBalance: Number(netBalance.toFixed(2))
    });
  }

  return steps;
}

/**
 * Calcula o Valor Presente (Financiamento), ou seja, o valor de empréstimo sustentável
 * baseado na Parcela Mensal (PMT), taxa anual e meses.
 * PV = PMT * [1 - (1 + i)^-n] / i
 */
export function calculatePresentValue(
  monthlyPayment: number,
  annualRate: number,
  termMonths: number
): {
  presentValue: number;
  totalPaid: number;
  totalInterest: number;
  monthlyRate: number;
} {
  const monthlyRate = annualToMonthlyRate(annualRate);
  
  if (monthlyRate === 0) {
    const pv = monthlyPayment * termMonths;
    return {
      presentValue: pv,
      totalPaid: pv,
      totalInterest: 0,
      monthlyRate: 0
    };
  }

  // PV = PMT * (1 - (1 + i)^-n) / i
  const presentValue = monthlyPayment * (1 - Math.pow(1 + monthlyRate, -termMonths)) / monthlyRate;
  const totalPaid = monthlyPayment * termMonths;
  const totalInterest = totalPaid - presentValue;

  return {
    presentValue: Number(presentValue.toFixed(2)),
    totalPaid: Number(totalPaid.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    monthlyRate: monthlyRate
  };
}

/**
 * Gera as parcelas simuladas de um financiamento para exibição em tabela
 */
export function generateFinancingSchedule(
  presentValue: number,
  monthlyPayment: number,
  monthlyRate: number,
  termMonths: number
): Array<{
  month: number;
  payment: number;
  interest: number;
  amortization: number;
  outstandingBalance: number;
}> {
  const schedule = [];
  let outstandingBalance = presentValue;

  for (let m = 1; m <= Math.min(termMonths, 360); m++) {
    // Para simplificar, usamos amortização do sistema francês (PRICE), onde a parcela é fixa
    const interest = outstandingBalance * monthlyRate;
    let amortization = monthlyPayment - interest;
    
    if (outstandingBalance < amortization) {
      amortization = outstandingBalance;
    }
    
    outstandingBalance -= amortization;
    if (outstandingBalance < 0.01) outstandingBalance = 0;

    schedule.push({
      month: m,
      payment: Number((interest + amortization).toFixed(2)),
      interest: Number(interest.toFixed(2)),
      amortization: Number(amortization.toFixed(2)),
      outstandingBalance: Number(outstandingBalance.toFixed(2))
    });

    if (outstandingBalance === 0) break;
  }

  return schedule;
}
