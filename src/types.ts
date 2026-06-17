/**
 * Types and interfaces for the Financial & Real Estate Simulator app
 */

export enum InvestmentType {
  POUPANCA = "Poupança (Sem IR)",
  CDB = "CDB 100% CDI",
  TESOURO_SELIC = "Tesouro Selic",
  LCI_LCA = "LCI / LCA (Isento)"
}

export interface ActiveInvestment {
  id: string;
  type: InvestmentType;
  initialAmount: number;
  monthlyContribution: number;
  interestRate: number; // annual rate, e.g., 10.5 for 10.5%
  startDate: string; // ISO string
  monthsPassed: number; // Virtual months elapsed for simulation
  totalInvested: number;
  currentBalance: number;
  totalInterest: number;
  estimatedTax: number;
  netBalance: number;
  termMonths: number;
}

export interface RedemptionRecord {
  id: string;
  investmentType: InvestmentType;
  date: string;
  requestedAmount: number; // Bruto
  taxAmount: number; // IR pago
  netAmount: number; // Líquido resgatado
  notes?: string;
}

export type PropertyType = "casa" | "apartamento" | "kitnet";

export interface PropertyRegion {
  id: string;
  name: string;
  city: string;
  pricePerSqm: number; // reference price in BRL/m2
  description?: string;
}

export interface PropertyValueResult {
  propertyType: PropertyType;
  region: PropertyRegion;
  area: number; // in m2
  parkingSpaces: number;
  bedrooms: number;
  conditionFactor: number; // Multiplier, eg. 1.0 for used, 1.25 for brand new, etc.
  baseValue: number;
  adjustedValue: number;
  valueRangeMin: number;
  valueRangeMax: number;
}
