import { createServerClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Copy .env.example to .env.local and fill it in.`);
  return value;
}

function supabaseUrl() {
  const value = env('NEXT_PUBLIC_SUPABASE_URL');
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new Error();
    return value;
  } catch {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL must be the full project URL, for example https://your-project-ref.supabase.co');
  }
}

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl(), env('NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server components cannot always mutate cookies. Middleware refreshes sessions.
        }
      },
    },
  });
}

export function getSupabaseAdminClient(): SupabaseClient {
  return createClient(supabaseUrl(), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function requireAdmin() {
  const supabase = await getSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const allowedEmail = process.env.ADMIN_EMAIL || 'admin@kenyaisnepal.org';
  if (!user || user.email !== allowedEmail && user.app_metadata?.role !== 'admin' && user.user_metadata?.role !== 'admin') {
    return { supabase, user: null };
  }
  return { supabase, user };
}