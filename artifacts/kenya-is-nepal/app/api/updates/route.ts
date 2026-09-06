import { NextResponse } from 'next/server';
import { cleanText, jsonError, logAdminAction } from '@/lib/api';
import { getSupabaseAdminClient, requireAdmin } from '@/lib/supabase/server';

export async function GET() {
  const { data, error } = await getSupabaseAdminClient().from('updates').select('*').order('created_at', { ascending: false }).limit(100);
  if (error) return jsonError(error.message, 500);
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const { user } = await requireAdmin();
  if (!user) return jsonError('Admin authentication required', 401);
  const body = await request.json().catch(() => null);
  const dateLabel = cleanText(body?.date_label, 80);
  const title = cleanText(body?.title, 160);
  const bodyText = cleanText(body?.body, 1600);
  const source = cleanText(body?.source, 300);
  if (!dateLabel || !title || !bodyText) return jsonError('Date, title, and update text are required.');
  const client = getSupabaseAdminClient();
  const { data, error } = await client.from('updates').insert({ date_label: dateLabel, title, body: bodyText, source: source || null }).select('*').single();
  if (error) return jsonError(error.message, 500);
  await logAdminAction(client, user.email || 'unknown', 'update.create', title);
  return NextResponse.json(data, { status: 201 });
}