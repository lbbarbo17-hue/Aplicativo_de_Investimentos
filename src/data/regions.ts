import { PropertyRegion } from "../types";

export const REF_REGIONS: PropertyRegion[] = [
  {
    id: "sp-jardins",
    name: "Jardins",
    city: "São Paulo - SP",
    pricePerSqm: 16500,
    description: "Região nobre, altamente valorizada, com excelente infraestrutura e segurança."
  },
  {
    id: "sp-centro",
    name: "Centro Histórico",
    city: "São Paulo - SP",
    pricePerSqm: 6800,
    description: "Região com prédios antigos, ideal para kitnets e estúdios compactos."
  },
  {
    id: "rj-copacabana",
    name: "Copacabana",
    city: "Rio de Janeiro - RJ",
    pricePerSqm: 13200,
    description: "Região litorânea famosa, com alta densidade urbana e forte mercado turístico."
  },
  {
    id: "rj-barra",
    name: "Barra da Tijuca",
    city: "Rio de Janeiro - RJ",
    pricePerSqm: 10500,
    description: "Excelente para condomínios fechados de casas grandes e apartamentos modernos."
  },
  {
    id: "bh-savassi",
    name: "Savassi",
    city: "Belo Horizonte - MG",
    pricePerSqm: 9800,
    description: "Bairro tradicional com dinamismo comercial, flats de alto padrão e vida cultural ativa."
  },
  {
    id: "cwb-batel",
    name: "Batel",
    city: "Curitiba - PR",
    pricePerSqm: 11500,
    description: "O metro quadrado mais cobiçado de Curitiba, com edifícios luxuosos e comércio gourmet."
  },
  {
    id: "rec-boa-viagem",
    name: "Boa Viagem",
    city: "Recife - PE",
    pricePerSqm: 8200,
    description: "Orla movimentada de Recife, com arranha-céus imponentes e boa infraestrutura comercial."
  },
  {
    id: "custom",
    name: "Outra Região/Personalizado",
    city: "Valor manual",
    pricePerSqm: 5000,
    description: "Permite que você digite os valores exatos de referência do metro quadrado."
  }
];

export const CONDITION_MODIFIERS = [
  { id: "new", label: "Novo / Pronto para morar", value: 1.2, desc: "+20% na avaliação devido ao estado impecável" },
  { id: "construction", label: "Em Obras / Lançamento", value: 0.9, desc: "-10% valor de liquidez atual até entrega" },
  { id: "used", label: "Usado e conservado", value: 1.0, desc: "Sem alterações de conservação" },
  { id: "renovation", label: "Necessita de reforma", value: 0.8, desc: "-20% para cobrir gastos urgentes com benfeitorias" },
];
