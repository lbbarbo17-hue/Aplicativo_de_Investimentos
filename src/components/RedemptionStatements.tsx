import React from "react";
import { RedemptionRecord } from "../types";
import { FileDown, Calendar, Receipt, Landmark } from "lucide-react";

interface RedemptionStatementsProps {
  records: RedemptionRecord[];
  darkMode?: boolean;
}

export default function RedemptionStatements({
  records,
  darkMode = true
}: RedemptionStatementsProps) {
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(val);
  };

  const totalNetRedeemed = records.reduce((sum, r) => sum + r.netAmount, 0);
  const totalTaxPaid = records.reduce((sum, r) => sum + r.taxAmount, 0);

  return (
    <div className={`rounded-2xl p-6 border flex flex-col gap-5 transition-colors duration-200 ${
      darkMode ? "bg-slate-900 border-slate-800 text-slate-100 shadow-md" : "bg-white border-slate-100 text-slate-800"
    }`}>
      <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4 ${
        darkMode ? "border-slate-800" : "border-indigo-50"
      }`}>
        <div>
          <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>Extrato de Resgates do Período</h2>
          <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>Histórico de saques realizados e retenções fiscais de Imposto de Renda.</p>
        </div>
        <span className={`text-[10px] uppercase font-mono font-bold px-3 py-1 rounded-full border ${
          darkMode ? "bg-emerald-950/40 border-emerald-900/40 text-emerald-300" : "bg-emerald-50 text-emerald-700 border-emerald-100"
        }`}>
          Total Creditado: {formatBRL(totalNetRedeemed)}
        </span>
      </div>

      {records.length === 0 ? (
        <div className={`text-center py-12 px-4 border-2 border-dashed rounded-2xl ${
          darkMode ? "border-slate-800 bg-slate-950/30 text-slate-400" : "border-slate-200 bg-white"
        }`}>
          <Receipt className="w-10 h-10 text-slate-405 text-slate-400 mx-auto mb-3" />
          <h3 className={`text-sm font-bold ${darkMode ? "text-slate-300" : "text-slate-705"}`}>Nenhum resgate efetuado</h3>
          <p className="text-xs text-slate-455 max-w-sm mx-auto mt-1">
            Realize simulações e clique em "Resgatar" na aba de investimentos ativos para gerar o seu extrato do período.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 font-sans">
          
          {/* Quick Summary box */}
          <div className={`grid grid-cols-2 md:grid-cols-2 gap-4 p-4 rounded-xl border ${
            darkMode ? "bg-slate-950/40 border-slate-800/80 text-white" : "bg-slate-50 border-slate-150 text-slate-800"
          }`}>
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-semibold">Total Bruto Solicitado</span>
              <p className={`text-base font-bold font-mono mt-0.5 ${darkMode ? "text-slate-200" : "text-slate-800"}`}>
                {formatBRL(totalNetRedeemed + totalTaxPaid)}
              </p>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 uppercase font-semibold">Imposto Retido na Fonte (IR)</span>
              <p className="text-base font-bold font-mono text-red-400 mt-0.5">
                {formatBRL(totalTaxPaid)}
              </p>
            </div>
          </div>

          {/* Chronological Table of Statements */}
          <div className={`overflow-x-auto rounded-xl border ${darkMode ? "border-slate-800/80" : "border-slate-150"}`}>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`font-mono font-semibold border-b ${
                  darkMode ? "bg-slate-950 text-slate-300 border-slate-850" : "bg-slate-50 text-slate-600 border-slate-150"
                }`}>
                  <th className="p-3">Data e Hora</th>
                  <th className="p-3">Origem (Investimento)</th>
                  <th className="p-3 text-right">Valor Bruto (BRL)</th>
                  <th className="p-3 text-right">IR Retido (BRL)</th>
                  <th className="p-3 text-right text-emerald-400 font-bold">Crédito Líquido (BRL)</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-mono ${
                darkMode ? "divide-slate-800 text-slate-300" : "divide-slate-100 text-slate-700"
              }`}>
                {records.map((rec) => (
                  <tr key={rec.id} className={darkMode ? "hover:bg-slate-950/40" : "hover:bg-slate-50/40"}>
                    {/* Date Formatting */}
                    <td className="p-3 text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        {new Date(rec.date).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        })}
                      </span>
                    </td>
                    
                    {/* Investment Origin Type tag */}
                    <td className="p-3">
                      <span className={`inline-block font-sans font-semibold px-2 py-0.5 rounded text-[10px] ${
                        darkMode ? "bg-slate-800 text-slate-205 text-slate-200" : "bg-slate-100 text-slate-700"
                      }`}>
                        {rec.investmentType}
                      </span>
                    </td>

                    {/* Numeric breakdown */}
                    <td className="p-3 text-right">{formatBRL(rec.requestedAmount)}</td>
                    <td className="p-3 text-right text-red-400 font-bold">{rec.taxAmount > 0 ? `-${formatBRL(rec.taxAmount)}` : "Isento"}</td>
                    <td className={`p-3 text-right font-semibold ${darkMode ? "text-emerald-400" : "text-emerald-600"}`}>{formatBRL(rec.netAmount)}</td>
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
