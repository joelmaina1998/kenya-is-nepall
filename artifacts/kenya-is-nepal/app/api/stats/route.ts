import { NextResponse } from 'next/server';
import { jsonError } from '@/lib/api';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const fallback = {
    total_raised_verified: 0,
    total_donations: 0,
    total_prayers: 0,
    goal: 2500000,
    balance: 2500000,
    progress: 0,
  };
  try {
    const client = getSupabaseAdminClient();
    const [{ data: donations, error: donationError }, { count: prayerCount, error: prayerError }, { data: config, error: configError }] = await Promise.all([
      client.from('donations').select('amount').eq('is_verified', true),
      client.from('prayers').select('id', { count: 'exact', head: true }).eq('is_approved', true),
      client.from('config').select('goal_amount').eq('id', 1).maybeSingle(),
    ]);
    if (donationError || prayerError || configError) return NextResponse.json(fallback);
    const totalRaised = (donations || []).reduce((sum, donation) => sum + Number(donation.amount || 0), 0);
    const goal = Number(config?.goal_amount || 2500000);
    return NextResponse.json({
      total_raised_verified: totalRaised,
      total_donations: donations?.length || 0,
      total_prayers: prayerCount || 0,
      goal,
      balance: Math.max(goal - totalRaised, 0),
      progress: goal ? Math.min(Math.round((totalRaised / goal) * 100), 100) : 0,
    });
  } catch {
    return NextResponse.json(fallback);
  }
}