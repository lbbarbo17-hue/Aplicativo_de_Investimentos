import React, { useState, useMemo } from "react";
import { PropertyType, PropertyRegion } from "../types";
import { REF_REGIONS, CONDITION_MODIFIERS } from "../data/regions";
import { Building2, Home, LayoutList, ChevronRight, Calculator, Check } from "lucide-react";

interface RealEstateEvaluatorProps {
  darkMode?: boolean;
}

export default function RealEstateEvaluator({ darkMode = true }: RealEstateEvaluatorProps) {
  // Evaluator States
  const [selectedType, setSelectedType] = useState<PropertyType>("apartamento");
  const [selectedRegionId, setSelectedRegionId] = useState<string>("sp-jardins");
  const [customSqmPrice, setCustomSqmPrice] = useState<number>(5000);
  const [propertyArea, setPropertyArea] = useState<number>(75);
  const [bedroomsCount, setBedroomsCount] = useState<number>(2);
  const [parkingSpaces, setParkingSpaces] = useState<number>(1);
  const [selectedConditionId, setSelectedConditionId] = useState<string>("used");

  // Lookup selected region
  const selectedRegion = useMemo(() => {
    return REF_REGIONS.find((r) => r.id === selectedRegionId) || REF_REGIONS[0];
  }, [selectedRegionId]);

  // Lookup condition modifier
  const currentCondition = useMemo(() => {
    return CONDITION_MODIFIERS.find((c) => c.id === selectedConditionId) || CONDITION_MODIFIERS[2];
  }, [selectedConditionId]);

  // Sqm price to use
  const sqmPriceUsed = selectedRegion.id === "custom" ? customSqmPrice : selectedRegion.pricePerSqm;

  // Perform appraisal calculation
  const evaluation = useMemo(() => {
    const baseSqmValue = sqmPriceUsed * propertyArea;
    
    // Type multipliers
    let typeMultiplier = 1.0;
    if (selectedType === "casa") typeMultiplier = 1.05; // extra value for land
    if (selectedType === "apartamento") typeMultiplier = 1.10; // extra for condo facilities, elevator
    if (selectedType === "kitnet") typeMultiplier = 0.95; // compact discounts

    // Feature premiums
    const parkingPremium = parkingSpaces * 18000; // R$ 18k per parking space
    const bedroomPremium = bedroomsCount * 12000; // R$ 12k per extra bedroom

    const subTotal = (baseSqmValue * typeMultiplier) + parkingPremium + bedroomPremium;
    
    // Condition factor multiplier
    const adjustedValue = subTotal * currentCondition.value;

    return {
      sqmValue: sqmPriceUsed,
      baseValue: baseSqmValue,
      typeMultiplier,
      adjustedValue: Math.round(adjustedValue),
      minRange: Math.round(adjustedValue * 0.92), // -8% normal fluctuation
      maxRange: Math.round(adjustedValue * 1.08)  // +8% normal fluctuation
    };
  }, [selectedType, sqmPriceUsed, propertyArea, bedroomsCount, parkingSpaces, currentCondition]);

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Safe boundaries warnings for kitnet/apartments size
  const safetyWarnings = useMemo(() => {
    const warnings: string[] = [];
    if (selectedType === "kitnet" && propertyArea > 60) {
      warnings.push("Kitnets geralmente possuem menos que 50m². Uma área de " + propertyArea + "m² é incomum para esta categoria e pode distorcer a avaliação de liquidez.");
    }
    if (selectedType === "casa" && propertyArea < 40) {
      warnings.push("Casas com menos de 40m² são muito compactas. Verifique se as dimensões estão corretas para o terreno/área útil.");
    }
    return warnings;
  }, [selectedType, propertyArea]);

  return (
    <div className={`rounded-2xl p-6 border flex flex-col gap-6 transition-colors duration-200 ${
      darkMode ? "bg-slate-900 border-slate-800 text-slate-100 shadow-md" : "bg-white border-slate-100 text-slate-800 shadow-sm"
    }`}>
      
      <div className={`flex items-center gap-3 border-b pb-4 ${darkMode ? "border-slate-800" : "border-indigo-50"}`}>
        <div className={`p-2.5 rounded-xl ${darkMode ? "bg-indigo-950/65 text-indigo-400" : "bg-indigo-50 text-indigo-650"}`}>
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h2 className={`text-lg font-bold ${darkMode ? "text-white" : "text-slate-800"}`}>Avaliação de Imóvel (m² Referencial ou Personalizado)</h2>
          <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"} font-sans`}>
            Calcule o preço justo de compra ou venda correlacionando tipo físico do imóvel, área útil e taxas de região.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INPUT PANEL: Column Span 6 */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          
          {/* Opções de Tipo: Casa, Apartamento, Kitnet */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-505 text-slate-500"}`}>
              1. Escolha o Tipo de Imóvel
            </label>
            <div className="grid grid-cols-3 gap-3">
              {/* Opção Casa */}
              <button
                onClick={() => {
                  setSelectedType("casa");
                  if (propertyArea < 40) setPropertyArea(120); // reasonable defaults
                }}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                  selectedType === "casa"
                    ? darkMode
                      ? "bg-indigo-950/60 border-indigo-500 text-indigo-300 font-bold"
                      : "bg-indigo-50/50 border-indigo-300 text-indigo-700 font-bold shadow-2xs"
                    : darkMode
                      ? "bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-400"
                      : "bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Home className="w-5 h-5 text-indigo-500" />
                <span className="text-xs">Casa</span>
              </button>
 
              {/* Opção Apartamento */}
              <button
                onClick={() => {
                  setSelectedType("apartamento");
                }}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                  selectedType === "apartamento"
                    ? darkMode
                      ? "bg-indigo-950/60 border-indigo-500 text-indigo-300 font-bold"
                      : "bg-indigo-50/50 border-indigo-300 text-indigo-700 font-bold shadow-2xs"
                    : darkMode
                      ? "bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-400"
                      : "bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Building2 className="w-5 h-5 text-indigo-500" />
                <span className="text-xs">Apartamento</span>
              </button>
 
              {/* Opção Kitnet */}
              <button
                onClick={() => {
                  setSelectedType("kitnet");
                  if (propertyArea > 60) setPropertyArea(35); // compact defaults
                }}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                  selectedType === "kitnet"
                    ? darkMode
                      ? "bg-indigo-950/60 border-indigo-500 text-indigo-300 font-bold"
                      : "bg-indigo-50/50 border-indigo-300 text-indigo-700 font-bold shadow-2xs"
                    : darkMode
                      ? "bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-400"
                      : "bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <LayoutList className="w-5 h-5 text-indigo-500" />
                <span className="text-xs">Kitnet</span>
              </button>
            </div>
          </div>            {/* Região do Imóvel para referência de valor do m² */}
          <div>
            <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${darkMode ? "text-slate-400" : "text-slate-505 text-slate-500"}`}>
              2. Região de Referência do m²
            </label>
            <select
              value={selectedRegionId}
              onChange={(e) => setSelectedRegionId(e.target.value)}
              className={`w-full px-3 py-2 text-xs rounded-xl border font-sans select ${
                darkMode 
                  ? "bg-slate-950 border-slate-800 text-white focus:border-indigo-400" 
                  : "bg-slate-50 border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-300 focus:bg-white"
              } transition`}
            >
              {REF_REGIONS.map((region) => (
                <option key={region.id} value={region.id} className={darkMode ? "bg-slate-900 text-white" : ""}>
                  {region.city} — {region.name} ({formatBRL(region.pricePerSqm)}/m²)
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">
              {selectedRegion.description}
            </p>
          </div>
 
          {/* Custom m² Input if Custom Region was selected */}
          {selectedRegionId === "custom" && (
            <div className={`p-3 rounded-xl border animate-fade-in ${
              darkMode ? "bg-indigo-950/20 border-indigo-900/40 text-indigo-300" : "bg-indigo-50/30 border-indigo-100/60"
            }`}>
              <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${darkMode ? "text-indigo-300" : "text-indigo-850"}`}>
                Digite o Valor do m² da sua região manualmente
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-mono text-indigo-400">R$</span>
                <input
                  type="number"
                  min="500"
                  max="100000"
                  step="100"
                  value={customSqmPrice}
                  onChange={(e) => setCustomSqmPrice(Number(e.target.value) || 0)}
                  className={`w-full pl-9 pr-14 py-1.5 text-xs font-mono rounded-lg border outline-none ${
                    darkMode 
                      ? "bg-slate-950 border-slate-800 text-white" 
                      : "bg-white border-indigo-200 text-indigo-800"
                  }`}
                />
                <span className="absolute right-3 top-1.5 text-[10px] text-indigo-400 font-semibold uppercase font-mono">/ m²</span>
              </div>
            </div>
          )}

          {/* Área do Imóvel Sliders & inputs */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                3. Área útil privativa
              </label>
              <span className="text-xs font-mono font-bold text-indigo-650 px-2 py-0.5 rounded bg-indigo-50">
                {propertyArea} m²
              </span>
            </div>
            <input
              type="range"
              min={selectedType === "kitnet" ? "15" : "30"}
              max={selectedType === "kitnet" ? "100" : "450"}
              step="1"
              value={propertyArea}
              onChange={(e) => setPropertyArea(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-slate-400 font-mono mt-1">
              <span>Mínimo: {selectedType === "kitnet" ? "15" : "30"} m²</span>
              <span>Construa livremente com a barra</span>
              <span>Máximo: {selectedType === "kitnet" ? "100" : "450"} m²</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Quartos */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Nº de Quartos
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={bedroomsCount}
                onChange={(e) => setBedroomsCount(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-indigo-300 focus:bg-white transition"
              />
            </div>

            {/* Vagas de Garagem */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Vagas de Garagem
              </label>
              <input
                type="number"
                min="0"
                max="8"
                value={parkingSpaces}
                onChange={(e) => setParkingSpaces(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 text-sm font-mono bg-slate-50 rounded-xl border border-slate-200 text-slate-800 outline-none focus:border-indigo-300 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Estado de Conservação Modifier */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              4. Estado de Conservação / Situação
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CONDITION_MODIFIERS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedConditionId(item.id)}
                  className={`px-3 py-2 text-left rounded-xl transition border text-xs ${
                    selectedConditionId === item.id
                      ? "bg-indigo-50/50 border-indigo-300 text-indigo-805 shadow-2xs font-semibold"
                      : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <div className="font-semibold flex items-center justify-between">
                    <span>{item.label}</span>
                    {selectedConditionId === item.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <span className="text-[10px] text-slate-405 text-slate-400 block mt-0.5 leading-tight">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RESULTS PANEL: Column Span 6 */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-6">
          
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">Laudo Estimativo do Imóvel</span>
            
            <div className="mt-4">
              <span className="text-xs text-slate-400">Preço referência calculado:</span>
              <div className="text-3xl font-extrabold font-mono text-indigo-300 mt-1">
                {formatBRL(evaluation.adjustedValue)}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Valor ponderado que leva em consideração região, tipo físico, vagas e acabamento.</p>
            </div>

            {/* Price Margins range */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <span className="text-xs text-slate-300 font-semibold block mb-2">Margem sugerida de negociação:</span>
              
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-left w-[47%]">
                  <span className="text-[9px] text-rose-400 block font-sans">Preço Mínimo Ideal</span>
                  <span className="font-bold text-slate-200">{formatBRL(evaluation.minRange)}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600" />
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-right w-[47%]">
                  <span className="text-[9px] text-emerald-400 block font-sans">Preço Máximo Teto</span>
                  <span className="font-bold text-slate-200">{formatBRL(evaluation.maxRange)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic factors breakdown */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider mb-2.5 text-[10px]">Memória de Cálculo de Avaliação</h4>
            <ul className="space-y-1.5 font-mono text-[11px] text-slate-500">
              <li className="flex justify-between">
                <span>Área Base ({propertyArea} m² × {formatBRL(evaluation.sqmValue)}):</span>
                <span className="font-semibold text-slate-700">{formatBRL(propertyArea * evaluation.sqmValue)}</span>
              </li>
              <li className="flex justify-between">
                <span>Fator Tipo ({selectedType === "apartamento" ? "Apartamento +10%" : selectedType === "casa" ? "Casa +5%" : "Kitnet -5%"}):</span>
                <span className="font-semibold text-slate-700">
                  {selectedType === "apartamento" ? "× 1.10" : selectedType === "casa" ? "× 1.05" : "× 0.95"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Vagas de Garagem ({parkingSpaces} x R$ 18.000):</span>
                <span className="font-semibold text-slate-700">+{formatBRL(parkingSpaces * 18000)}</span>
              </li>
              <li className="flex justify-between">
                <span>Adicional Dormitórios ({bedroomsCount} x R$ 12.000):</span>
                <span className="font-semibold text-slate-700">+{formatBRL(bedroomsCount * 12000)}</span>
              </li>
              <li className="flex justify-between border-t border-slate-200 pt-1.5 mt-1.5">
                <span>Fator Estado ({currentCondition.label}):</span>
                <span className="font-bold text-slate-800">× {currentCondition.value.toFixed(2)}</span>
              </li>
            </ul>
          </div>

          {safetyWarnings.length > 0 && (
            <div className="border border-amber-200 bg-amber-50 text-amber-900 rounded-xl p-3 text-xs flex flex-col gap-1">
              <span className="font-bold">⚠️ Observações de consistência física:</span>
              {safetyWarnings.map((warn, i) => (
                <p key={i} className="text-[11px] leading-relaxed text-amber-850">- {warn}</p>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
