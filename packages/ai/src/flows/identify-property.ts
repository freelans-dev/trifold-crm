/**
 * Property identification flow.
 * Matches user messages against known property keywords to identify
 * which property the lead is interested in.
 */

interface Property {
  id: string
  name: string
  slug: string
}

const PROPERTY_KEYWORDS: Record<string, string[]> = {
  vind: ["vind", "67m2", "67 m2", "67m²", "67 m²"],
  yarden: [
    "yarden",
    "83m2",
    "83 m2",
    "83m²",
    "83 m²",
    "gleba itororo",
    "gleba itoroó",
    "churrasqueira",
    "rooftop",
  ],
}

/**
 * Checks a user message for property mentions and returns the matching property ID.
 *
 * @param message - The user's message text
 * @param collectedData - Current collected data (checked for existing property_interest)
 * @param properties - Available properties to match against
 * @returns The matched property ID or null if no match found
 */
export function identifyProperty(
  message: string,
  collectedData: Record<string, unknown>,
  properties: Array<Property>
): string | null {
  const normalizedMessage = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  for (const property of properties) {
    const slug = property.slug.toLowerCase()
    // Use hardcoded keywords if available, otherwise auto-generate from name and slug
    const autoKeywords = [
      slug,
      slug.replace(/-/g, " "),
      property.name.toLowerCase(),
      // Individual words from name (min 4 chars to avoid false positives)
      ...property.name.toLowerCase().split(/\s+/).filter((w) => w.length >= 4 && !["residence", "residencial", "empreendimento"].includes(w)),
    ]
    const keywords = PROPERTY_KEYWORDS[slug] ?? autoKeywords

    for (const keyword of keywords) {
      const normalizedKeyword = keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      if (normalizedMessage.includes(normalizedKeyword)) {
        return property.id
      }
    }
  }

  // Fall back to existing property interest if no new match
  if (typeof collectedData.property_interest === "string") {
    const interest = collectedData.property_interest.toLowerCase()
    for (const property of properties) {
      if (
        property.slug.toLowerCase() === interest ||
        property.name.toLowerCase() === interest
      ) {
        return property.id
      }
    }
  }

  return null
}
