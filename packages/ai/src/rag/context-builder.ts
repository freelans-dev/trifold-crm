import type { KnowledgeResult } from "./search"

/**
 * Build a context string from RAG search results for injection
 * into the system prompt.
 *
 * Returns an empty string if no results are provided, so the system
 * prompt can gracefully omit the RAG section.
 */
export function buildContextFromRAG(results: KnowledgeResult[]): string {
  if (!results || results.length === 0) {
    return ""
  }

  const sections = results.map((result, index) => {
    const similarity = Math.round(result.similarity * 100)
    return [
      `[${index + 1}] ${result.title} (${similarity}% relevance)`,
      result.content,
    ].join("\n")
  })

  return [
    "=== KNOWLEDGE BASE CONTEXT ===",
    "Use the following information to answer the customer's questions accurately.",
    "If the information below does not cover the question, say you will check and get back to them.",
    "",
    ...sections,
    "",
    "=== END KNOWLEDGE BASE CONTEXT ===",
  ].join("\n")
}
