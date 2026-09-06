import { NextResponse } from 'next/server';
import { cleanText, jsonError } from '@/lib/api';
import { isRateLimited, requestKey } from '@/lib/rate-limit';
import { getSupabaseAdminClient, requireAdmin } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const isAdmin = new URL(request.url).searchParams.get('admin') === '1';
  if (isAdmin) {
    const { user } = await requireAdmin();
    if (!user) return jsonError('Admin authentication required', 401);
  }
  const client = getSupabaseAdminClient();
  let query = client.from('prayers').select('*').order('created_at', { ascending: false }).limit(100);
  if (!isAdmin) query = query.eq('is_approved', true);
  const { data, error } = await query;
  if (error) return jsonError(error.message, 500);
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  if (isRateLimited(`prayer:${requestKey(request)}`)) return jsonError('Too many submissions. Please wait a minute and try again.', 429);
  const body = await request.json().catch(() => null);
  const name = cleanText(body?.name, 120);
  const country = cleanText(body?.country, 80);
  const message = cleanText(body?.message, 1200);
  if (!name || !country || !message) return jsonError('Name, country, and prayer are required.');
  const client = getSupabaseAdminClient();
  const { data, error } = await client.from('prayers').insert({ name, country, message, is_approved: false }).select('id,created_at').single();
  if (error) return jsonError(error.message, 500);
  return NextResponse.json({ ...data, message: 'Your prayer will appear after admin approval.' }, { status: 201 });
}