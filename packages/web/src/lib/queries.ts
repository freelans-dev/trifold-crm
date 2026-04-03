export const LEAD_FULL_SELECT = `
  *,
  stage:kanban_stages(id, name, slug, type, color),
  property_interest:properties!property_interest_id(id, name, slug),
  broker:users!assigned_broker_id(id, name, email, avatar_url)
`;
