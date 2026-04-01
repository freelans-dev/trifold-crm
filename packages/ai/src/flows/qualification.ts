/**
 * Lead qualification flow.
 * Calculates qualification scores, determines next steps,
 * and extracts collected data from AI responses.
 */

const SCORE_WEIGHTS: Record<string, number> = {
  name: 10,
  property_interest: 15,
  bedrooms: 10,
  floor: 10,
  view: 10,
  garages: 5,
  has_down_payment: 15,
  source: 5,
  visit_availability: 20,
}

const QUALIFICATION_STEPS = [
  "name",
  "property_interest",
  "bedrooms",
  "floor",
  "view",
  "garages",
  "has_down_payment",
  "source",
  "visit_availability",
] as const

/**
 * Calculates a qualification score (0-100) based on collected data.
 * Each field contributes its weight when present and non-empty.
 */
export function calculateQualificationScore(
  collectedData: Record<string, unknown>
): number {
  let score = 0

  for (const [field, weight] of Object.entries(SCORE_WEIGHTS)) {
    const value = collectedData[field]
    if (value !== undefined && value !== null && value !== "") {
      score += weight
    }
  }

  return Math.min(score, 100)
}

/**
 * Returns the next qualification step that hasn't been collected yet.
 * Steps follow a natural conversation flow order.
 */
export function getNextQualificationStep(
  collectedData: Record<string, unknown>
): string {
  for (const step of QUALIFICATION_STEPS) {
    const value = collectedData[step]
    if (value === undefined || value === null || value === "") {
      return step
    }
  }

  return "complete"
}

/**
 * Extracts newly collected data from an AI response and merges it with current data.
 * Looks for structured patterns in the response that indicate data collection.
 */
export function extractCollectedData(
  aiResponse: string,
  currentData: Record<string, unknown>
): Record<string, unknown> {
  const updated = { ...currentData }
  const lower = aiResponse.toLowerCase()

  // Extract name mentions - look for patterns like "Prazer, [Name]" or "Olá, [Name]"
  if (!updated.name) {
    const namePatterns = [
      /(?:prazer|olá|ola|obrigad[ao]),?\s+([A-Za-zÀ-ÿ][a-zà-ÿ]+(?:\s+[A-Za-zÀ-ÿ][a-zà-ÿ]+)*)/i,
      /(?:certo|entendi),?\s+([A-Za-zÀ-ÿ][a-zà-ÿ]+(?:\s+[A-Za-zÀ-ÿ][a-zà-ÿ]+)*)/i,
      /(?:meu nome [eé]|me chamo|sou (?:o |a )?)\s*([A-Za-zÀ-ÿ][a-zà-ÿ]+(?:\s+[A-Za-zÀ-ÿ][a-zà-ÿ]+)*)/i,
    ]
    for (const pattern of namePatterns) {
      const match = aiResponse.match(pattern)
      if (match?.[1]) {
        const extractedName = match[1].trim()
        // Never save the bot's own name as lead name
        if (extractedName.toLowerCase() !== "nicole") {
          updated.name = extractedName
          break
        }
      }
    }
  }

  // Extract property interest
  if (!updated.property_interest) {
    if (lower.includes("vind")) {
      updated.property_interest = "vind"
    } else if (lower.includes("yarden")) {
      updated.property_interest = "yarden"
    }
  }

  // Extract bedroom preferences
  if (!updated.bedrooms) {
    const bedroomMatch = aiResponse.match(/(\d+)\s*(?:quarto|dormitório|suite|suíte)/i)
    if (bedroomMatch?.[1]) {
      updated.bedrooms = parseInt(bedroomMatch[1], 10)
    }
  }

  // Extract floor preference
  if (!updated.floor) {
    if (lower.includes("andar alto") || lower.includes("andares altos")) {
      updated.floor = "alto"
    } else if (lower.includes("andar baixo") || lower.includes("andares baixos")) {
      updated.floor = "baixo"
    } else if (lower.includes("andar médio") || lower.includes("andar medio")) {
      updated.floor = "medio"
    }
  }

  // Extract view preference
  if (!updated.view) {
    if (lower.includes("vista frontal") || lower.includes("vista de frente") || lower.includes("frente")) {
      updated.view = "frente"
    } else if (lower.includes("vista fundos") || lower.includes("vista de fundos") || lower.includes("fundos")) {
      updated.view = "fundos"
    }
  }

  // Extract garage preference
  if (!updated.garages) {
    const garageMatch = aiResponse.match(/(\d+)\s*(?:vaga|garagem)/i)
    if (garageMatch?.[1]) {
      updated.garages = parseInt(garageMatch[1], 10)
    }
  }

  // Extract down payment info
  if (updated.has_down_payment === undefined) {
    if (lower.includes("entrada disponível") || lower.includes("entrada disponivel") || lower.includes("tem entrada") || lower.includes("valor de entrada")) {
      updated.has_down_payment = true
    } else if (lower.includes("sem entrada") || lower.includes("não tem entrada") || lower.includes("nao tem entrada")) {
      updated.has_down_payment = false
    }
  }

  // Extract source
  if (!updated.source) {
    const sourceKeywords: Record<string, string> = {
      instagram: "instagram",
      facebook: "facebook",
      google: "google",
      indicação: "indicacao",
      indicacao: "indicacao",
      "passou na frente": "passou_na_frente",
      placa: "placa",
      "stand de vendas": "stand",
    }
    for (const [keyword, value] of Object.entries(sourceKeywords)) {
      if (lower.includes(keyword)) {
        updated.source = value
        break
      }
    }
  }

  // Extract visit availability
  if (!updated.visit_availability) {
    const visitPatterns = [
      /(?:visita|conhecer|ver)\s+(?:no|na|neste|nesta)?\s*(?:sábado|sabado|domingo|segunda|terça|terca|quarta|quinta|sexta)/i,
      /(?:disponível|disponivel|posso|quero)\s+(?:visitar|ir|conhecer)/i,
    ]
    for (const pattern of visitPatterns) {
      if (pattern.test(aiResponse)) {
        updated.visit_availability = true
        break
      }
    }
  }

  return updated
}
