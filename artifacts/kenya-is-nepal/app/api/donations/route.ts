import { NextResponse } from 'next/server';
import { cleanText, jsonError, logAdminAction } from '@/lib/api';
import { isRateLimited, requestKey } from '@/lib/rate-limit';
import { getSupabaseAdminClient, requireAdmin } from '@/lib/supabase/server';

const mpesaPattern = /^[A-Za-z0-9]{10}$/;

export async function GET(request: Request) {
  const isAdmin = new URL(request.url).searchParams.get('admin') === '1';
  if (isAdmin) {
    const { user } = await requireAdmin();
    if (!user) return jsonError('Admin authentication required', 401);
  }
  const client = getSupabaseAdminClient();
  let query = client.from('donations').select('*').order('created_at', { ascending: false }).limit(200);
  if (!isAdmin) query = query.eq('is_verified', true);
  const { data, error } = await query;
  if (error) return jsonError(error.message, 500);
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  if (isRateLimited(`donation:${requestKey(request)}`)) return jsonError('Too many submissions. Please wait a minute and try again.', 429);
  const body = await request.json().catch(() => null);
  if (!body || Number(body.amount) <= 0) return jsonError('Enter a donation amount greater than zero.');
  const mpesaCode = cleanText(body.mpesa_code, 20).toUpperCase();
  if (!mpesaPattern.test(mpesaCode)) return jsonError('M-Pesa code must be exactly 10 letters or numbers.');
  const client = getSupabaseAdminClient();
  const { data, error } = await client.from('donations').insert({
    donor_name: cleanText(body.donor_name, 120) || null,
    phone: cleanText(body.phone, 40) || null,
    amount: Math.round(Number(body.amount)),
    mpesa_code: mpesaCode,
    country: cleanText(body.country, 80) || null,
    is_anonymous: Boolean(body.is_anonymous),
    is_verified: false,
  }).select('id,created_at').single();
  if (error) {
    if (error.code === '23505') return jsonError('That M-Pesa code has already been submitted.', 409);
    return jsonError(error.message, 500);
  }
  return NextResponse.json({ ...data, message: 'Donation received. It will appear after admin verification.' }, { status: 201 });
}