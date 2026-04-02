-- Story 12.1: Sistema de Observabilidade
-- Tabela centralizada para eventos de sistema (erros, warnings, info)

CREATE TABLE system_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id),

  -- Classificacao
  level varchar(10) NOT NULL CHECK (level IN ('error', 'warn', 'info')),
  category varchar(50) NOT NULL CHECK (category IN ('bot', 'ai', 'webhook', 'auth', 'cron', 'system')),
  event_type varchar(100) NOT NULL,

  -- Contexto
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',

  -- Rastreabilidade
  source varchar(100),
  request_id varchar(36),

  -- Resolucao
  resolved_at timestamptz,
  resolved_by uuid REFERENCES users(id),

  created_at timestamptz DEFAULT now()
);

-- AC2: Indices para queries do dashboard
CREATE INDEX idx_system_events_level ON system_events(level, created_at DESC);
CREATE INDEX idx_system_events_category ON system_events(category, created_at DESC);
CREATE INDEX idx_system_events_created ON system_events(created_at DESC);

-- AC3: RLS — admins da org podem ler eventos da sua org
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read org events"
  ON system_events FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM users
      WHERE auth_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Service role full access"
  ON system_events FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-cleanup: eventos > 30 dias (executar via pg_cron ou cron externo)
-- DELETE FROM system_events WHERE created_at < now() - interval '30 days';
