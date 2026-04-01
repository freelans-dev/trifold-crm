import type { SupabaseClient } from "@supabase/supabase-js"
import { generateEmbedding } from "./embeddings"

export interface KnowledgeResult {
  id: string
  title: string
  content: string
  similarity: number
}

/**
 * Search the knowledge base using vector similarity.
 *
 * Generates an embedding for the query, then calls the match_knowledge
 * Postgres RPC function to find the most relevant documents.
 */
export async function searchKnowledge(
  supabase: SupabaseClient,
  query: string,
  orgId: string,
  propertyId?: string,
  limit: number = 5
): Promise<KnowledgeResult[]> {
  const embedding = await generateEmbedding(query)

  const { data, error } = await supabase.rpc("match_knowledge", {
    query_embedding: embedding,
    match_org_id: orgId,
    match_property_id: propertyId ?? null,
    match_threshold: 0.7,
    match_count: limit,
  })

  if (error) {
    console.error("Error searching knowledge base:", error)
    return []
  }

  return (data ?? []) as KnowledgeResult[]
}
