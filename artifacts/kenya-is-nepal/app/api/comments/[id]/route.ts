import { NextResponse } from 'next/server';
import { jsonError, validUuid, logAdminAction } from '@/lib/api';
import { getSupabaseAdminClient, requireAdmin } from '@/lib/supabase/server';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireAdmin();
  if (!user) return jsonError('Admin authentication required', 401);
  if (!validUuid(id)) return jsonError('Invalid comment id');
  const body = await request.json().catch(() => ({}));
  const client = getSupabaseAdminClient();
  const { data, error } = await client.from('comments').update({ is_approved: Boolean(body.is_approved) }).eq('id', id).select('*').single();
  if (error) return jsonError(error.message, 500);
  await logAdminAction(client, user.email || 'unknown', 'comment.moderate', `${id} approved=${data.is_approved}`);
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireAdmin();
  if (!user) return jsonError('Admin authentication required', 401);
  if (!validUuid(id)) return jsonError('Invalid comment id');
  const client = getSupabaseAdminClient();
  const { error } = await client.from('comments').delete().eq('id', id);
  if (error) return jsonError(error.message, 500);
  await logAdminAction(client, user.email || 'unknown', 'comment.delete', `${id} deleted`);
  return new NextResponse(null, { status: 204 });
}