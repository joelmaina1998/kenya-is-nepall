import { NextResponse } from 'next/server';
import { jsonError, validUuid, logAdminAction } from '@/lib/api';
import { getSupabaseAdminClient, requireAdmin } from '@/lib/supabase/server';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireAdmin();
  if (!user) return jsonError('Admin authentication required', 401);
  if (!validUuid(id)) return jsonError('Invalid donation id');
  const body = await request.json().catch(() => ({}));
  const client = getSupabaseAdminClient();
  const { data, error } = await client.from('donations').update({ is_verified: Boolean(body.is_verified ?? true) }).eq('id', id).select('*').single();
  if (error) return jsonError(error.message, error.code === 'PGRST116' ? 404 : 500);
  await logAdminAction(client, user.email || 'unknown', 'donation.verify', `Donation ${id} marked ${data.is_verified ? 'verified' : 'unverified'}`);
  return NextResponse.json(data);
}