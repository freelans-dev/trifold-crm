import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

export function buildUpdatePayload(
  body: Record<string, unknown>,
  allowedFields: string[]
): { fields: Record<string, unknown>; error?: NextResponse } {
  const fields: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      fields[field] =
        typeof body[field] === 'string'
          ? (body[field] as string).trim() || null
          : body[field];
    }
  }

  if (Object.keys(fields).length === 0) {
    return {
      fields: {},
      error: NextResponse.json({ error: 'No fields to update' }, { status: 400 }),
    };
  }

  return { fields };
}

export async function softDelete(
  supabase: SupabaseClient,
  tableName: string,
  id: string,
  orgId: string
): Promise<{ data?: unknown; error?: NextResponse }> {
  const { data, error } = await supabase
    .from(tableName)
    .update({ is_active: false })
    .eq('id', id)
    .eq('org_id', orgId)
    .eq('is_active', true)
    .select()
    .single();

  if (error || !data) {
    return { error: NextResponse.json({ error: 'Not found' }, { status: 404 }) };
  }

  return { data };
}
