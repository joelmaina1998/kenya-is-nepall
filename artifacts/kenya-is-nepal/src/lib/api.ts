import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_HOME_STATEMENT = 'On 26th August 2026, a glacier broke in Tibet. Ice and mud washed away villages in Rasuwa and Nuwakot. Over 1,000 dead, 3,900+ missing including 590 foreigners from 39 nations. We are youth from Kipsaraman, West Pokot Border. We believe in Ubuntu and Vasudhaiva Kutumbakam. Two Civilizations, One Family: Race of Blood and Race of Light.';

export const emptyConfig = {
  id: 1,
  paybill: '',
  account: '',
  paybill_name: 'KENYAISNEPAL',
  changa_link: '',
  paypal_link: '',
  goal_amount: 2500000,
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  home_statement: DEFAULT_HOME_STATEMENT,
};

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function cleanText(value: unknown, max = 1000) {
  return String(value ?? '').replace(/[<>]/g, '').trim().slice(0, max);
}

export function validUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function logAdminAction(admin: SupabaseClient, email: string, action: string, details = '') {
  await admin.from('admin_logs').insert({ admin_email: email, action, details: cleanText(details, 2000) });
}