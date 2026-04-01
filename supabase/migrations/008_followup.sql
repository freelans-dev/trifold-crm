-- 008_followup.sql
-- Follow-up rules and log tables for automated lead follow-up system

-- ============================================
-- FOLLOW-UP RULES
-- ============================================
CREATE TABLE follow_up_rules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stage_id uuid NOT NULL REFERENCES kanban_stages(id) ON DELETE CASCADE,
  alert_days integer NOT NULL DEFAULT 1,
  nicole_takeover_days integer NOT NULL DEFAULT 2,
  message_template text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, stage_id)
);

-- ============================================
-- FOLLOW-UP LOG
-- ============================================
CREATE TABLE follow_up_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  rule_id uuid REFERENCES follow_up_rules(id),
  type varchar(20) NOT NULL, -- 'alert_broker', 'nicole_sent'
  status varchar(20) NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'cancelled', 'completed'
  scheduled_at timestamptz,
  sent_at timestamptz,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_followup_rules_org ON follow_up_rules(org_id);
CREATE INDEX idx_followup_log_lead ON follow_up_log(lead_id);
CREATE INDEX idx_followup_log_status ON follow_up_log(status);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE follow_up_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "followup_rules_select" ON follow_up_rules FOR SELECT USING (org_id = public.user_org_id());
CREATE POLICY "followup_rules_manage" ON follow_up_rules FOR ALL USING (org_id = public.user_org_id() AND public.is_admin_or_supervisor());
CREATE POLICY "followup_log_select" ON follow_up_log FOR SELECT USING (org_id = public.user_org_id());
CREATE POLICY "followup_log_manage" ON follow_up_log FOR ALL USING (org_id = public.user_org_id());

-- ============================================
-- TRIGGER
-- ============================================
CREATE TRIGGER set_updated_at BEFORE UPDATE ON follow_up_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
