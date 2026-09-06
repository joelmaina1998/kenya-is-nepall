import { NextResponse } from 'next/server';
import { cleanText, jsonError, logAdminAction } from '@/lib/api';
import { getSupabaseAdminClient, requireAdmin } from '@/lib/supabase/server';

const acceptedTypes = new Set(['gallery', 'document', 'receipt']);

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get('type');
  const client = getSupabaseAdminClient();
  let query = client.from('uploads').select('*').order('created_at', { ascending: false }).limit(200);
  if (type && acceptedTypes.has(type)) query = query.eq('type', type);
  const { data, error } = await query;
  if (error) return jsonError(error.message, 500);
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const { user } = await requireAdmin();
  if (!user) return jsonError('Admin authentication required', 401);
  const form = await request.formData();
  const file = form.get('file');
  const type = cleanText(form.get('type'), 20);
  const description = cleanText(form.get('description'), 400);
  if (!(file instanceof File) || file.size === 0) return jsonError('Choose a file to upload.');
  if (!acceptedTypes.has(type)) return jsonError('Upload type must be gallery, document, or receipt.');
  if (file.size > 10 * 1024 * 1024) return jsonError('Files must be 10 MB or smaller.');
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-140);
  const path = `${type}/${crypto.randomUUID()}-${safeName}`;
  const client = getSupabaseAdminClient();
  const upload = await client.storage.from('kenyaisnepal').upload(path, await file.arrayBuffer(), {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (upload.error) return jsonError(upload.error.message, 500);
  const publicUrl = client.storage.from('kenyaisnepal').getPublicUrl(path).data.publicUrl;
  const { data, error } = await client.from('uploads').insert({
    type,
    file_url: publicUrl,
    file_name: file.name,
    description: description || null,
    uploaded_by: user.email || null,
  }).select('*').single();
  if (error) {
    await client.storage.from('kenyaisnepal').remove([path]);
    return jsonError(error.message, 500);
  }
  await logAdminAction(client, user.email || 'unknown', 'upload.create', `${type}: ${file.name}`);
  return NextResponse.json(data, { status: 201 });
}