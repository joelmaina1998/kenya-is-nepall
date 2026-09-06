import { NextResponse } from 'next/server';
import { emptyConfig, jsonError, cleanText, logAdminAction } from '@/lib/api';
import { getSupabaseAdminClient, requireAdmin } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = getSupabaseAdminClient();
    const { data, error } = await admin.from('config').select('*').eq('id', 1).maybeSingle();
    if (error) return NextResponse.json(emptyConfig);
    return NextResponse.json(data || emptyConfig);
  } catch {
    return NextResponse.json(emptyConfig);
  }
}

export async function PUT(request: Request) {
  const { user } = await requireAdmin();
  if (!user) return jsonError('Admin authentication required', 401);
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return jsonError('Invalid settings payload');
  const update = {
    paybill: cleanText(body.paybill, 100),
    account: cleanText(body.account, 100),
    paybill_name: cleanText(body.paybill_name, 200),
    changa_link: cleanText(body.changa_link, 500),
    paypal_link: cleanText(body.paypal_link, 500),
    goal_amount: Math.max(0, Number(body.goal_amount) || 0),
    contact_name: cleanText(body.contact_name, 200),
    contact_phone: cleanText(body.contact_phone, 80),
    contact_email: cleanText(body.contact_email, 200),
    home_statement: cleanText(body.home_statement, 3000),
  };
  const adminClient = getSupabaseAdminClient();
  const { data, error } = await adminClient.from('config').upsert({ id: 1, ...update }).select('*').single();
  if (error) return jsonError(error.message, 500);
  await logAdminAction(adminClient, user.email || 'unknown', 'config.update', 'Public settings updated');
  return NextResponse.json(data);
}