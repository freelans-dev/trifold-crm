-- Add last_enriched_at to conversations for cron deduplication
-- Used by /api/cron/enrich-leads to skip already-processed conversations
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS last_enriched_at timestamptz;
