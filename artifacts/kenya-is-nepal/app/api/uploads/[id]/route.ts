import { NextResponse } from 'next/server';
import { jsonError, validUuid, logAdminAction } from '@/lib/api';
import { getSupabaseAdminClient, requireAdmin } from '@/lib/supabase/server';

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireAdmin();
  if (!user) return jsonError('Admin authentication required', 401);
  if (!validUuid(id)) return jsonError('Invalid upload id');
  const client = getSupabaseAdminClient();
  const { data: upload } = await client.from('uploads').select('file_url,file_name').eq('id', id).maybeSingle();
  const { error } = await client.from('uploads').delete().eq('id', id);
  if (error) return jsonError(error.message, 500);
  if (upload?.file_url) {
    const marker = '/storage/v1/object/public/kenyaisnepal/';
    const path = upload.file_url.split(marker)[1];
    if (path) await client.storage.from('kenyaisnepal').remove([decodeURIComponent(path)]);
  }
  await logAdminAction(client, user.email || 'unknown', 'upload.delete', `${id} deleted`);
  return new NextResponse(null, { status: 204 });
}