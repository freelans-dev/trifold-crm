-- ============================================
-- APPOINTMENTS SYSTEM (Epic 9 - Sprint 6)
-- ============================================

CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
CREATE TYPE appointment_creator AS ENUM ('nicole', 'broker', 'admin');

CREATE TABLE appointments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  broker_id uuid REFERENCES users(id),
  property_id uuid REFERENCES properties(id),
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 30,
  location text NOT NULL DEFAULT 'Stand Trifold',
  status appointment_status NOT NULL DEFAULT 'scheduled',
  notes text,
  created_by appointment_creator NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_appointments_org ON appointments(org_id);
CREATE INDEX idx_appointments_broker ON appointments(broker_id);
CREATE INDEX idx_appointments_lead ON appointments(lead_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "appointments_select" ON appointments
  FOR SELECT USING (org_id = public.user_org_id());

CREATE POLICY "appointments_manage" ON appointments
  FOR ALL USING (org_id = public.user_org_id());

CREATE TRIGGER set_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
