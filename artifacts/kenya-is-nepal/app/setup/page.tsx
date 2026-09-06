import SetupClient from './setup-client';

export default function SetupPage() {
  return (
    <SetupClient
      supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bdgdvukotgrytactwses.supabase.co'}
      anonConfigured={Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)}
      serviceConfigured={Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)}
    />
  );
}