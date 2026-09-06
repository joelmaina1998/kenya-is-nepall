'use client';

import { useState } from 'react';
import Link from 'next/link';

type Props = {
  supabaseUrl: string;
  anonConfigured: boolean;
  serviceConfigured: boolean;
};

export default function SetupClient({ supabaseUrl, anonConfigured, serviceConfigured }: Props) {
  const [message, setMessage] = useState('');
  const [testing, setTesting] = useState(false);
  const [connection, setConnection] = useState<'idle' | 'ok' | 'error'>('idle');

  const copySql = async () => {
    setMessage('');
    const response = await fetch('/api/setup/schema', { cache: 'no-store' });
    if (!response.ok) {
      setMessage('The schema file could not be loaded.');
      return;
    }
    await navigator.clipboard.writeText(await response.text());
    setMessage('Schema SQL copied. Paste it into the Supabase SQL editor and run it.');
  };

  const testConnection = async () => {
    setTesting(true);
    setMessage('');
    try {
      const responses = await Promise.all([fetch('/api/config', { cache: 'no-store' }), fetch('/api/stats', { cache: 'no-store' })]);
      if (!responses.every((response) => response.ok)) throw new Error('One or more diagnostics failed.');
      setConnection('ok');
      setMessage('Connection checks returned successfully.');
    } catch {
      setConnection('error');
      setMessage('The connection check failed. Confirm the secure environment variables and Supabase schema.');
    } finally {
      setTesting(false);
    }
  };

  const statusClass = (ok: boolean) => ok ? 'text-emerald-700' : 'text-[hsl(var(--primary))]';

  return (
    <main className="paper min-h-[100dvh] px-5 py-12 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="eyebrow text-[hsl(var(--primary))]">Field desk / setup diagnostics</div>
        <h1 className="display mt-4 text-5xl md:text-7xl">Make the desk live.</h1>
        <p className="mono mt-5 max-w-2xl text-sm leading-7 text-[hsl(var(--muted-foreground))]">
          This page checks configuration without ever displaying a secret value. Service credentials belong in the deployment secret store.
        </p>

        <section className="mt-10 grid gap-4 border-y border-[hsl(var(--foreground)/.2)] py-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="mono text-xs uppercase tracking-[.1em]">Supabase URL</span>
            <span className="mono text-xs text-emerald-700">{supabaseUrl}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="mono text-xs uppercase tracking-[.1em]">Anon key</span>
            <strong className={`mono text-xs ${statusClass(anonConfigured)}`}>{anonConfigured ? 'Configured · value hidden' : 'Missing'}</strong>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="mono text-xs uppercase tracking-[.1em]">Service role key</span>
            <strong className={`mono text-xs ${statusClass(serviceConfigured)}`}>{serviceConfigured ? 'Configured on server · value hidden' : 'Missing'}</strong>
          </div>
        </section>

        <div className="mt-8 flex flex-wrap gap-4">
          <button className="ink-button" type="button" onClick={() => void copySql()}>Copy SQL</button>
          <button className="ghost-button" type="button" onClick={() => void testConnection()} disabled={testing}>
            {testing ? 'Testing…' : 'Test connection'}
          </button>
          {connection === 'ok' && <span className="mono self-center text-xs text-emerald-700">GREEN</span>}
          {connection === 'error' && <span className="mono self-center text-xs text-[hsl(var(--primary))]">CHECK FAILED</span>}
        </div>
        {message && <p className="mono mt-5 text-xs" role="status">{message}</p>}

        <section className="mt-12 bg-[hsl(var(--card))] p-7">
          <div className="eyebrow text-[hsl(var(--secondary))]">Supabase checklist</div>
          <ol className="mono mt-5 space-y-4 text-xs leading-6">
            <li>1. <a className="underline" href="https://supabase.com/dashboard/project/bdgdvukotgrytactwses/sql/new" target="_blank" rel="noreferrer">Open the SQL editor</a>, paste the copied schema, and run it.</li>
            <li>2. <a className="underline" href="https://supabase.com/dashboard/project/bdgdvukotgrytactwses/auth/users" target="_blank" rel="noreferrer">Open Auth users</a> and create the admin account through Supabase securely.</li>
            <li>3. <a className="underline" href="https://supabase.com/dashboard/project/bdgdvukotgrytactwses/storage/buckets" target="_blank" rel="noreferrer">Open Storage buckets</a> and create the public <code>kenyaisnepal</code> bucket.</li>
            <li>4. Run the connection test, then open <Link className="underline" href="/admin">the admin desk</Link>.</li>
          </ol>
        </section>
      </div>
    </main>
  );
}