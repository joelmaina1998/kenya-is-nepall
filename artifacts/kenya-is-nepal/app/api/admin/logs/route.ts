import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api';
import { getSupabaseAdminClient, requireAdmin } from '@/lib/supabase/server';

export async function GET() {
  const { user } = await requireAdmin();
  if (!user) return jsonError('Admin authentication required', 401);
  const { data, error } = await getSupabaseAdminClient().from('admin_logs').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) return jsonError(error.message, 500);
  return NextResponse.json(data || []);
}