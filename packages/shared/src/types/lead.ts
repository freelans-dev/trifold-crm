export interface Lead {
  id: string
  name: string | null
  phone: string
  email: string | null
  channel: "whatsapp" | "telegram"
  status: string
  property_interest: string | null
  created_at: string
  updated_at: string
}
