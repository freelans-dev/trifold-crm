-- 004_rls_policies.sql
-- Row Level Security para todas as tabelas
-- Isolamento por org_id + controle por role (admin, supervisor, broker)

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Retorna o org_id do usuario autenticado
CREATE OR REPLACE FUNCTION public.user_org_id()
RETURNS uuid AS $$
  SELECT org_id FROM public.users WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Retorna o role do usuario autenticado
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Retorna o user id (public.users.id) do usuario autenticado
CREATE OR REPLACE FUNCTION public.public_user_id()
RETURNS uuid AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Retorna o broker_id do usuario autenticado (NULL se nao for broker)
CREATE OR REPLACE FUNCTION public.user_broker_id()
RETURNS uuid AS $$
  SELECT b.id FROM public.brokers b
  JOIN public.users u ON u.id = b.user_id
  WHERE u.auth_id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Verifica se usuario e admin ou supervisor
CREATE OR REPLACE FUNCTION public.is_admin_or_supervisor()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid()
    AND role IN ('admin', 'supervisor')
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE typologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE broker_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_property_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_config ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ORGANIZATIONS
-- ============================================
CREATE POLICY "org_select_own" ON organizations
  FOR SELECT USING (id = public.user_org_id());

CREATE POLICY "org_update_admin" ON organizations
  FOR UPDATE USING (id = public.user_org_id() AND public.is_admin_or_supervisor());

-- ============================================
-- USERS
-- ============================================
CREATE POLICY "users_select_own_org" ON users
  FOR SELECT USING (org_id = public.user_org_id());

CREATE POLICY "users_insert_admin" ON users
  FOR INSERT WITH CHECK (org_id = public.user_org_id() AND public.user_role() = 'admin');

CREATE POLICY "users_update_admin" ON users
  FOR UPDATE USING (org_id = public.user_org_id() AND public.user_role() = 'admin');

-- ============================================
-- KANBAN STAGES
-- ============================================
CREATE POLICY "stages_select_own_org" ON kanban_stages
  FOR SELECT USING (org_id = public.user_org_id());

CREATE POLICY "stages_manage_admin" ON kanban_stages
  FOR ALL USING (org_id = public.user_org_id() AND public.is_admin_or_supervisor());

-- ============================================
-- LEADS
-- ============================================
-- Admin/Supervisor: todos os leads da org
-- Broker: apenas leads atribuidos a ele
CREATE POLICY "leads_select" ON leads
  FOR SELECT USING (
    org_id = public.user_org_id()
    AND (
      public.is_admin_or_supervisor()
      OR assigned_broker_id = (SELECT user_id FROM brokers WHERE id = public.user_broker_id())
      OR assigned_broker_id IS NULL
    )
  );

CREATE POLICY "leads_insert" ON leads
  FOR INSERT WITH CHECK (org_id = public.user_org_id());

CREATE POLICY "leads_update" ON leads
  FOR UPDATE USING (
    org_id = public.user_org_id()
    AND (
      public.is_admin_or_supervisor()
      OR assigned_broker_id = (SELECT user_id FROM brokers WHERE id = public.user_broker_id())
    )
  );

-- ============================================
-- CONVERSATIONS
-- ============================================
CREATE POLICY "conversations_select" ON conversations
  FOR SELECT USING (
    org_id = public.user_org_id()
    AND (
      public.is_admin_or_supervisor()
      OR EXISTS (
        SELECT 1 FROM leads l
        WHERE l.id = conversations.lead_id
        AND l.assigned_broker_id = (SELECT user_id FROM brokers WHERE id = public.user_broker_id())
      )
    )
  );

CREATE POLICY "conversations_insert" ON conversations
  FOR INSERT WITH CHECK (org_id = public.user_org_id());

CREATE POLICY "conversations_update" ON conversations
  FOR UPDATE USING (org_id = public.user_org_id());

-- ============================================
-- MESSAGES
-- ============================================
CREATE POLICY "messages_select" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND c.org_id = public.user_org_id()
      AND (
        public.is_admin_or_supervisor()
        OR EXISTS (
          SELECT 1 FROM leads l
          WHERE l.id = c.lead_id
          AND l.assigned_broker_id = (SELECT user_id FROM brokers WHERE id = public.user_broker_id())
        )
      )
    )
  );

CREATE POLICY "messages_insert" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND c.org_id = public.user_org_id()
    )
  );

-- ============================================
-- CONVERSATION STATE
-- ============================================
CREATE POLICY "conv_state_select" ON conversation_state
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_state.conversation_id
      AND c.org_id = public.user_org_id()
    )
  );

CREATE POLICY "conv_state_manage" ON conversation_state
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_state.conversation_id
      AND c.org_id = public.user_org_id()
    )
  );

-- ============================================
-- AGENT CONFIG
-- ============================================
CREATE POLICY "agent_config_select" ON agent_config
  FOR SELECT USING (org_id = public.user_org_id());

CREATE POLICY "agent_config_manage" ON agent_config
  FOR ALL USING (org_id = public.user_org_id() AND public.is_admin_or_supervisor());

-- ============================================
-- AGENT PROMPTS
-- ============================================
CREATE POLICY "agent_prompts_select" ON agent_prompts
  FOR SELECT USING (org_id = public.user_org_id());

CREATE POLICY "agent_prompts_manage" ON agent_prompts
  FOR ALL USING (org_id = public.user_org_id() AND public.is_admin_or_supervisor());

-- ============================================
-- KNOWLEDGE BASE
-- ============================================
CREATE POLICY "kb_select" ON knowledge_base
  FOR SELECT USING (org_id = public.user_org_id());

CREATE POLICY "kb_manage" ON knowledge_base
  FOR ALL USING (org_id = public.user_org_id() AND public.is_admin_or_supervisor());

-- ============================================
-- ACTIVITIES
-- ============================================
CREATE POLICY "activities_select" ON activities
  FOR SELECT USING (org_id = public.user_org_id());

CREATE POLICY "activities_insert" ON activities
  FOR INSERT WITH CHECK (org_id = public.user_org_id());

-- ============================================
-- PROPERTIES
-- ============================================
-- Todos da org podem ler; apenas admin/supervisor pode escrever
CREATE POLICY "properties_select" ON properties
  FOR SELECT USING (org_id = public.user_org_id());

CREATE POLICY "properties_manage" ON properties
  FOR ALL USING (org_id = public.user_org_id() AND public.is_admin_or_supervisor());

-- ============================================
-- TYPOLOGIES
-- ============================================
CREATE POLICY "typologies_select" ON typologies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = typologies.property_id
      AND p.org_id = public.user_org_id()
    )
  );

CREATE POLICY "typologies_manage" ON typologies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = typologies.property_id
      AND p.org_id = public.user_org_id()
    )
    AND public.is_admin_or_supervisor()
  );

-- ============================================
-- UNITS
-- ============================================
CREATE POLICY "units_select" ON units
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = units.property_id
      AND p.org_id = public.user_org_id()
    )
  );

CREATE POLICY "units_manage" ON units
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = units.property_id
      AND p.org_id = public.user_org_id()
    )
    AND public.is_admin_or_supervisor()
  );

-- ============================================
-- PROPERTY MEDIA
-- ============================================
CREATE POLICY "media_select" ON property_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_media.property_id
      AND p.org_id = public.user_org_id()
    )
  );

CREATE POLICY "media_manage" ON property_media
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE p.id = property_media.property_id
      AND p.org_id = public.user_org_id()
    )
    AND public.is_admin_or_supervisor()
  );

-- ============================================
-- BROKERS
-- ============================================
CREATE POLICY "brokers_select" ON brokers
  FOR SELECT USING (org_id = public.user_org_id());

CREATE POLICY "brokers_manage" ON brokers
  FOR ALL USING (org_id = public.user_org_id() AND public.user_role() = 'admin');

-- ============================================
-- BROKER ASSIGNMENTS
-- ============================================
CREATE POLICY "broker_assign_select" ON broker_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM brokers b
      WHERE b.id = broker_assignments.broker_id
      AND b.org_id = public.user_org_id()
    )
  );

CREATE POLICY "broker_assign_manage" ON broker_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM brokers b
      WHERE b.id = broker_assignments.broker_id
      AND b.org_id = public.user_org_id()
    )
    AND public.is_admin_or_supervisor()
  );

-- ============================================
-- LEAD PROPERTY INTEREST
-- ============================================
CREATE POLICY "lead_interest_select" ON lead_property_interest
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = lead_property_interest.lead_id
      AND l.org_id = public.user_org_id()
    )
  );

CREATE POLICY "lead_interest_manage" ON lead_property_interest
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = lead_property_interest.lead_id
      AND l.org_id = public.user_org_id()
    )
  );

-- ============================================
-- VISIT FEEDBACK
-- ============================================
CREATE POLICY "visit_feedback_select" ON visit_feedback
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = visit_feedback.lead_id
      AND l.org_id = public.user_org_id()
    )
  );

CREATE POLICY "visit_feedback_manage" ON visit_feedback
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM leads l
      WHERE l.id = visit_feedback.lead_id
      AND l.org_id = public.user_org_id()
    )
  );

-- ============================================
-- WHATSAPP CONFIG
-- ============================================
CREATE POLICY "whatsapp_config_select" ON whatsapp_config
  FOR SELECT USING (org_id = public.user_org_id());

CREATE POLICY "whatsapp_config_manage" ON whatsapp_config
  FOR ALL USING (org_id = public.user_org_id() AND public.user_role() = 'admin');

-- ============================================
-- SERVICE ROLE BYPASS
-- ============================================
-- O service_role key bypassa RLS automaticamente no Supabase.
-- Isso permite que as Edge Functions (IA, webhooks) acessem
-- todas as tabelas sem restricao.
