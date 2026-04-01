-- 007_unit_sales.sql
-- Registro de vendas de unidades

CREATE TABLE unit_sales (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  unit_id uuid NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id),
  broker_id uuid REFERENCES users(id),
  sale_price decimal(12,2) NOT NULL,
  payment_method varchar(100),
  payment_details jsonb DEFAULT '{}',
  sold_at timestamptz NOT NULL DEFAULT now(),
  notes text,
  client_name varchar(255),
  client_phone varchar(50),
  client_email varchar(255),
  client_cpf varchar(14),
  is_existing_lead boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_unit_sales_unit ON unit_sales(unit_id);
CREATE INDEX idx_unit_sales_org ON unit_sales(org_id);

ALTER TABLE unit_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sales_select" ON unit_sales
  FOR SELECT USING (org_id = public.user_org_id());

CREATE POLICY "sales_manage" ON unit_sales
  FOR ALL USING (org_id = public.user_org_id() AND public.is_admin_or_supervisor());

CREATE TRIGGER set_updated_at BEFORE UPDATE ON unit_sales FOR EACH ROW EXECUTE FUNCTION update_updated_at();
