-- 003_whatsapp_config.sql
-- Configuracao WhatsApp Cloud API + Coexistence Mode

CREATE TABLE whatsapp_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  waba_id varchar(100),
  phone_number_id varchar(100),
  access_token text,
  verify_token varchar(255),
  webhook_url text,
  coexistence_enabled boolean NOT NULL DEFAULT true,
  status varchar(20) NOT NULL DEFAULT 'inactive', -- 'active', 'inactive', 'error'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_whatsapp_config_org ON whatsapp_config(org_id);

CREATE TRIGGER set_updated_at BEFORE UPDATE ON whatsapp_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();
