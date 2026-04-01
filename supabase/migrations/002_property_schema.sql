-- 002_property_schema.sql
-- Entidades imobiliarias: empreendimentos, tipologias, unidades, corretores

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE property_status AS ENUM (
  'planning',
  'launching',
  'selling',
  'delivered',
  'sold_out'
);

CREATE TYPE unit_status AS ENUM (
  'available',
  'reserved',
  'sold',
  'unavailable'
);

CREATE TYPE broker_type AS ENUM (
  'internal',
  'external',
  'partner'
);

CREATE TYPE media_type AS ENUM (
  'photo',
  'render',
  'floor_plan',
  'humanized_plan',
  'video',
  'document',
  'other'
);

-- ============================================
-- PROPERTIES (EMPREENDIMENTOS)
-- ============================================
CREATE TABLE properties (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  slug varchar(255) NOT NULL UNIQUE,
  status property_status NOT NULL DEFAULT 'launching',
  address text NOT NULL,
  neighborhood varchar(255),
  city varchar(255) NOT NULL,
  state varchar(2) NOT NULL,
  lat decimal,
  lng decimal,
  google_maps_url text,
  concept text,
  description text,
  differentials jsonb DEFAULT '[]',
  amenities jsonb DEFAULT '[]',
  delivery_date date,
  total_units integer,
  total_floors integer,
  units_per_floor integer,
  type_floors integer,
  basement_floors integer,
  leisure_floors integer,
  faq jsonb DEFAULT '[]',
  restrictions jsonb DEFAULT '[]',
  commercial_rules jsonb DEFAULT '{}',
  video_tour_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_properties_org ON properties(org_id);
CREATE INDEX idx_properties_status ON properties(status);

-- ============================================
-- TYPOLOGIES (TIPOLOGIAS)
-- ============================================
CREATE TABLE typologies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  private_area_m2 decimal(8,2),
  total_area_m2 decimal(8,2),
  bedrooms integer,
  suites integer,
  bathrooms integer,
  has_balcony boolean DEFAULT false,
  balcony_bbq boolean DEFAULT false,
  floor_plan_url text,
  humanized_plan_url text,
  differentials jsonb DEFAULT '[]',
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_typologies_property ON typologies(property_id);

-- ============================================
-- UNITS (UNIDADES)
-- ============================================
CREATE TABLE units (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  typology_id uuid REFERENCES typologies(id),
  identifier varchar(50) NOT NULL,
  floor integer NOT NULL,
  position varchar(50),
  view_direction varchar(100),
  garage_count integer NOT NULL DEFAULT 1,
  garage_type varchar(50),
  garage_area_m2 decimal(8,2),
  private_area_m2 decimal(8,2),
  status unit_status NOT NULL DEFAULT 'available',
  price decimal(12,2),
  price_per_m2 decimal(10,2),
  notes text,
  reserved_by_lead_id uuid REFERENCES leads(id),
  reserved_at timestamptz,
  sold_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_units_property ON units(property_id);
CREATE INDEX idx_units_typology ON units(typology_id);
CREATE INDEX idx_units_status ON units(status);

-- ============================================
-- PROPERTY MEDIA
-- ============================================
CREATE TABLE property_media (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  typology_id uuid REFERENCES typologies(id),
  type media_type NOT NULL DEFAULT 'photo',
  url text NOT NULL,
  title varchar(255),
  description text,
  position integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_property_media_property ON property_media(property_id);

-- ============================================
-- BROKERS (CORRETORES)
-- ============================================
CREATE TABLE brokers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  creci varchar(50),
  type broker_type NOT NULL DEFAULT 'internal',
  specialties jsonb DEFAULT '[]',
  max_leads integer DEFAULT 50,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_brokers_org ON brokers(org_id);

-- ============================================
-- BROKER ASSIGNMENTS
-- ============================================
CREATE TABLE broker_assignments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  broker_id uuid NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(broker_id, property_id)
);

-- ============================================
-- LEAD PROPERTY INTEREST
-- ============================================
CREATE TABLE lead_property_interest (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  interest_level interest_level DEFAULT 'warm',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(lead_id, property_id)
);

-- ============================================
-- VISIT FEEDBACK
-- ============================================
CREATE TABLE visit_feedback (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  broker_id uuid REFERENCES brokers(id),
  visited_at timestamptz NOT NULL,
  feedback text,
  interest_after interest_level,
  next_steps text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================
-- ADD FK TO LEADS (property_interest_id)
-- ============================================
ALTER TABLE leads
  ADD CONSTRAINT fk_leads_property_interest
  FOREIGN KEY (property_interest_id) REFERENCES properties(id);

-- ============================================
-- ADD FK TO CONVERSATION_STATE (current_property_id)
-- ============================================
ALTER TABLE conversation_state
  ADD CONSTRAINT fk_conversation_state_property
  FOREIGN KEY (current_property_id) REFERENCES properties(id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================
CREATE TRIGGER set_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON typologies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON units FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON brokers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON visit_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at();
