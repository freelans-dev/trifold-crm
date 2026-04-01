-- 001_base_schema.sql
-- Tabelas base do Trifold CRM (adaptadas do agente-linda)
-- Extensoes, enums, e entidades core

-- ============================================
-- EXTENSOES
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE qualification_status AS ENUM (
  'not_started',
  'in_progress',
  'qualified',
  'not_qualified',
  'lost'
);

CREATE TYPE lead_source AS ENUM (
  'whatsapp_organic',
  'whatsapp_click_to_ad',
  'meta_ads',
  'website',
  'referral',
  'walk_in',
  'telegram',
  'other'
);

CREATE TYPE stage_type AS ENUM (
  'novo',
  'qualificado',
  'agendado',
  'visitou',
  'proposta',
  'fechado',
  'perdido'
);

CREATE TYPE interest_level AS ENUM (
  'cold',
  'warm',
  'hot'
);

CREATE TYPE user_role AS ENUM (
  'admin',
  'supervisor',
  'broker'
);

-- ============================================
-- ORGANIZATIONS
-- ============================================
CREATE TABLE organizations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(255) NOT NULL,
  slug varchar(255) NOT NULL UNIQUE,
  logo_url text,
  settings jsonb DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- USERS
-- ============================================
CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  auth_id uuid UNIQUE,
  email varchar(255) NOT NULL,
  name varchar(255) NOT NULL,
  phone varchar(50),
  role user_role NOT NULL DEFAULT 'broker',
  avatar_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- KANBAN STAGES
-- ============================================
CREATE TABLE kanban_stages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name varchar(100) NOT NULL,
  slug varchar(100) NOT NULL,
  type stage_type NOT NULL,
  position integer NOT NULL DEFAULT 0,
  color varchar(20),
  is_default boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, slug)
);

-- ============================================
-- LEADS
-- ============================================
CREATE TABLE leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name varchar(255),
  phone varchar(50) NOT NULL,
  email varchar(255),
  channel varchar(20) NOT NULL DEFAULT 'whatsapp',
  stage_id uuid REFERENCES kanban_stages(id),
  -- Campos imobiliarios
  property_interest_id uuid, -- FK adicionada na migration 002
  has_down_payment boolean,
  preferred_bedrooms integer,
  preferred_floor varchar(50),
  preferred_view varchar(100),
  preferred_garage_count integer,
  qualification_status qualification_status NOT NULL DEFAULT 'not_started',
  qualification_score integer,
  interest_level interest_level,
  source lead_source,
  utm_source varchar(255),
  utm_medium varchar(255),
  utm_campaign varchar(255),
  utm_content varchar(255),
  utm_term varchar(255),
  assigned_broker_id uuid REFERENCES users(id),
  ai_summary text,
  visit_scheduled_at timestamptz,
  lost_reason text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_leads_org_id ON leads(org_id);
CREATE INDEX idx_leads_phone ON leads(phone);
CREATE INDEX idx_leads_assigned_broker ON leads(assigned_broker_id);
CREATE INDEX idx_leads_stage ON leads(stage_id);
CREATE INDEX idx_leads_qualification ON leads(qualification_status);

-- ============================================
-- CONVERSATIONS
-- ============================================
CREATE TABLE conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  channel varchar(20) NOT NULL DEFAULT 'whatsapp',
  status varchar(20) NOT NULL DEFAULT 'active',
  is_ai_active boolean NOT NULL DEFAULT true,
  handoff_at timestamptz,
  handoff_reason text,
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_conversations_lead ON conversations(lead_id);
CREATE INDEX idx_conversations_org ON conversations(org_id);

-- ============================================
-- MESSAGES
-- ============================================
CREATE TABLE messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role varchar(20) NOT NULL, -- 'user', 'assistant', 'system', 'broker'
  content text NOT NULL,
  media_url text,
  media_type varchar(50),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ============================================
-- CONVERSATION STATE
-- ============================================
CREATE TABLE conversation_state (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE UNIQUE,
  current_property_id uuid, -- FK adicionada na migration 002
  qualification_step varchar(50),
  collected_data jsonb DEFAULT '{}',
  materials_sent jsonb DEFAULT '[]',
  visit_proposed boolean NOT NULL DEFAULT false,
  context jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- AGENT CONFIG
-- ============================================
CREATE TABLE agent_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  personality_prompt text,
  greeting_message text,
  out_of_hours_message text,
  business_hours jsonb DEFAULT '{}',
  handoff_criteria jsonb DEFAULT '{}',
  guardrails jsonb DEFAULT '[]',
  model_primary varchar(100) DEFAULT 'claude-sonnet-4-5-20250514',
  model_secondary varchar(100) DEFAULT 'claude-haiku-4-5-20251001',
  temperature decimal(3,2) DEFAULT 0.7,
  max_tokens integer DEFAULT 1024,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- AGENT PROMPTS
-- ============================================
CREATE TABLE agent_prompts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  slug varchar(255) NOT NULL,
  content text NOT NULL,
  type varchar(50) NOT NULL DEFAULT 'system', -- 'system', 'qualification', 'guardrail', 'handoff'
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, slug)
);

-- ============================================
-- KNOWLEDGE BASE (RAG)
-- ============================================
CREATE TABLE knowledge_base (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title varchar(500) NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  source varchar(100),
  source_id uuid,
  metadata jsonb DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_knowledge_base_org ON knowledge_base(org_id);

-- ============================================
-- ACTIVITIES (AUDIT LOG)
-- ============================================
CREATE TABLE activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  type varchar(100) NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_activities_lead ON activities(lead_id);
CREATE INDEX idx_activities_org ON activities(org_id);
CREATE INDEX idx_activities_type ON activities(type);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON kanban_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON conversation_state FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON agent_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON agent_prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON knowledge_base FOR EACH ROW EXECUTE FUNCTION update_updated_at();
