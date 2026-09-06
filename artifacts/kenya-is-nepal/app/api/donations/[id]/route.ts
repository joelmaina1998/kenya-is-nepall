import { NextResponse } from 'next/server';
import { jsonError, validUuid, logAdminAction } from '@/lib/api';
import { getSupabaseAdminClient, requireAdmin } from '@/lib/supabase/server';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireAdmin();
  if (!user) return jsonError('Admin authentication required', 401);
  if (!validUuid(id)) return jsonError('Invalid donation id');
  const client = getSupabaseAdminClient();
  const { error } = await client.from('donations').delete().eq('id', id);
  if (error) return jsonError(error.message, 500);
  await logAdminAction(client, user.email || 'unknown', 'donation.delete', `Donation ${id} deleted`);
  return new NextResponse(null, { status: 204 });
}