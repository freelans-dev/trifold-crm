export interface CollectionField {
  key: string
  label: string
  type: "text" | "number" | "boolean" | "select"
  required: boolean
  options?: string[]
}

export const MANDATORY_FIELDS: CollectionField[] = [
  { key: "name", label: "Nome", type: "text", required: true },
  { key: "phone", label: "Telefone", type: "text", required: true },
  { key: "property_interest", label: "Empreendimento de interesse", type: "select", required: true, options: ["vind", "yarden", "both", "unknown"] },
]

export const OPTIONAL_FIELDS: CollectionField[] = [
  { key: "email", label: "Email", type: "text", required: false },
  { key: "preferred_bedrooms", label: "Quartos desejados", type: "number", required: false },
  { key: "preferred_floor", label: "Preferência de andar", type: "select", required: false, options: ["alto", "baixo", "indiferente"] },
  { key: "preferred_view", label: "Vista preferida", type: "text", required: false },
  { key: "preferred_garage_count", label: "Vagas de garagem", type: "number", required: false },
  { key: "has_down_payment", label: "Tem entrada disponível", type: "boolean", required: false },
  { key: "how_found", label: "Como conheceu a Trifold", type: "text", required: false },
  { key: "visit_availability", label: "Disponibilidade para visita", type: "text", required: false },
  { key: "family_size", label: "Composição familiar", type: "text", required: false },
  { key: "budget_range", label: "Faixa de investimento", type: "text", required: false },
  { key: "timeline", label: "Prazo para decisão", type: "text", required: false },
]

export const ALL_FIELDS = [...MANDATORY_FIELDS, ...OPTIONAL_FIELDS]
