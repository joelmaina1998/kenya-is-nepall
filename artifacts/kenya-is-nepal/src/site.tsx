'use client';

import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowRight, Camera, Check, ChevronRight, Download, Heart, Landmark,
  LockKeyhole, Mail, MapPin, Menu, Phone, Send, ShieldCheck, Trash2, Upload, X,
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

type Config = {
  id: number; paybill: string; account: string; paybill_name: string; changa_link: string;
  paypal_link: string; goal_amount: number; contact_name: string; contact_phone: string;
  contact_email: string; home_statement: string;
};
type Stats = { total_raised_verified: number; total_donations: number; total_prayers: number; goal: number; balance: number; progress: number };
type Prayer = { id: string; name: string; country: string; message: string; is_approved: boolean; created_at: string };
type Comment = { id: string; name: string; message: string; reply_to: string | null; is_approved: boolean; created_at: string };
type Donation = { id: string; donor_name: string | null; phone: string | null; amount: number; mpesa_code: string; country: string | null; is_anonymous: boolean; is_verified: boolean; created_at: string };
type UploadRecord = { id: string; type: 'gallery' | 'document' | 'receipt'; file_url: string; file_name: string; description: string | null; uploaded_by: string | null; created_at: string };
type Update = { id: string; date_label: string; title: string; body: string; source: string | null; created_at: string };

const DEFAULT_CONFIG: Config = {
  id: 1, paybill: '', account: '', paybill_name: '', changa_link: '', paypal_link: '',
  goal_amount: 2500000, contact_name: '', contact_phone: '', contact_email: '',
  home_statement: 'On 26th August 2026, a glacier broke in Tibet. Ice and mud washed away villages in Rasuwa and Nuwakot. Over 1,000 dead, 3,900+ missing including 590 foreigners from 39 nations. We are youth from Kipsaraman, West Pokot Border. We believe in Ubuntu and Vasudhaiva Kutumbakam. Two Civilizations, One Family: Race of Blood and Race of Light.',
};
const EMPTY_STATS: Stats = { total_raised_verified: 0, total_donations: 0, total_prayers: 0, goal: 2500000, balance: 2500000, progress: 0 };
const navItems = [['/', 'Home'], ['/story', 'Our story'], ['/updates', 'Field updates'], ['/gallery', 'Gallery'], ['/transparency', 'Transparency'], ['/community', 'Community']];
const pinnedPrayer = 'Enkai of the high sky, Asis of the Pokot sun, Ngai of the mountain, Pashupatinath of the Himalayas, Manakamana who grants wishes, Sagarmatha of the snows, Hear us. Hold Nepal. Bring the missing home. Ase. Tashi Delek.';
const staticTimeline = [
  ['26 AUG 2026', 'The glacier break', 'A glacier collapse in Tibet sends ice and mud into the Bhote Koshi River and communities in Rasuwa and Nuwakot.'],
  ['27 AUG 2026', 'The count becomes a chorus', 'Reports gather: more than 1,000 dead, 3,900+ missing, including 590 foreigners from 39 nations.'],
  ['28 AUG 2026', 'Kipsaraman answers', 'The East African Youth Solidarity Initiative opens a public pledge from the West Pokot Border.'],
  ['EVERY FRIDAY', 'The books open', 'Receipts, letters, statements, and handover notes are added to the transparency desk.'],
];

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: 'no-store', headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'The field desk could not complete that request.');
  return payload as T;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}
function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 }).format(amount);
}
function friendlyError(error: unknown) { return error instanceof Error ? error.message : 'Something went wrong. Please try again.'; }

function Seal() {
  return <div className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full border-[3px] border-dashed border-[hsl(var(--primary))] text-center text-[9px] leading-[1.1] text-[hsl(var(--primary))]" aria-label="East African Youth Solidarity seal">
    <div className="absolute inset-[5px] rounded-full border border-[hsl(var(--primary)/.65)]" />
    <span className="mono tracking-[.12em]">EAYS<br /><strong className="text-[13px]">EA</strong><br />NEPAL 2026</span>
  </div>;
}
function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return <header className="relative z-30 bg-[hsl(var(--background)/.94)] backdrop-blur-sm">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-4 lg:px-10">
      <Link href="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}><Seal /><span><span className="display block text-lg leading-none">kenya is nepal</span><span className="mono text-[9px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">a living digital pledge</span></span></Link>
      <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">{navItems.map(([href, label]) => <Link key={href} href={href} className={`mono text-[10px] uppercase tracking-[.12em] transition-colors hover:text-[hsl(var(--primary))] ${pathname === href ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}>{label}</Link>)}</nav>
      <button type="button" className="md:hidden" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X size={22} /> : <Menu size={22} />}</button>
    </div>
    {open && <nav className="absolute left-0 right-0 top-full bg-[hsl(var(--background))] px-5 pb-5 shadow-md md:hidden" aria-label="Mobile navigation">{navItems.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="block border-b border-[hsl(var(--foreground)/.13)] py-3 mono text-[11px] uppercase tracking-[.13em]">{label}</Link>)}</nav>}
  </header>;
}
function Footer() {
  return <footer className="mt-20 bg-[hsl(var(--secondary))] px-5 py-10 text-[hsl(var(--secondary-foreground))] lg:px-10">
    <div className="mx-auto grid max-w-7xl gap-9 md:grid-cols-[1.5fr_1fr_1fr]">
      <div><div className="display text-2xl">The world is one family.</div><p className="mono mt-3 max-w-md text-xs leading-6 opacity-75">A living digital pledge from Kipsaraman to Nepal. Kept by young people, shared by everyone.</p></div>
      <div><div className="eyebrow mb-3 opacity-65">Navigate</div>{navItems.slice(1, 5).map(([href, label]) => <Link key={href} href={href} className="block py-1 text-sm hover:text-[hsl(var(--accent))]">{label}</Link>)}</div>
      <div><div className="eyebrow mb-3 opacity-65">Field office</div><p className="mono text-xs leading-6">Kipsaraman, West Pokot Border<br />Kenya / Nepal partnership<br /><Link href="/community" className="underline underline-offset-4">Contact the founder</Link></p></div>
    </div>
    <div className="mx-auto mt-10 max-w-7xl border-t border-[hsl(var(--secondary-foreground)/.25)] pt-5 mono text-[10px] leading-6 opacity-75">वसुधैव कुटुम्बकम् - संसार एउटै परिवार हो<br />© 2026 EAST AFRICAN YOUTH SOLIDARITY - KATHMANDU - WEST POKOT PARTNERSHIP<br />May we God Grace our Adherence and Supplication. Amina.</div>
  </footer>;
}
function Layout({ children }: { children: ReactNode }) { return <div className="paper min-h-[100dvh]"><Header />{children}<Footer /></div>; }
function SectionHead({ kicker, title, intro }: { kicker: string; title: string; intro?: string }) {
  return <div className="mb-10 max-w-3xl"><div className="eyebrow mb-4 text-[hsl(var(--primary))]">{kicker}</div><h1 className="display text-4xl leading-[1.12] md:text-6xl">{title}</h1>{intro && <p className="mono mt-5 max-w-2xl text-sm leading-7 text-[hsl(var(--muted-foreground))]">{intro}</p>}</div>;
}
function LoadingLine() { return <div className="mono animate-pulse text-xs text-[hsl(var(--muted-foreground))]">Reading the field desk…</div>; }
function ErrorLine({ message }: { message: string }) { return <p className="mono text-xs text-[hsl(var(--primary))]" role="alert">{message}</p>; }

function usePublicData() {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [stats, setStats] = useState<Stats>(EMPTY_STATS);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      api<Config>('/api/config'), api<Stats>('/api/stats'), api<Prayer[]>('/api/prayers'),
      api<Comment[]>('/api/comments'), api<UploadRecord[]>('/api/uploads'), api<Update[]>('/api/updates'),
    ]);
    const [configResult, statsResult, prayersResult, commentsResult, uploadsResult, updatesResult] = results;
    if (configResult.status === 'fulfilled') setConfig((current) => ({ ...current, ...configResult.value }));
    if (statsResult.status === 'fulfilled') setStats(statsResult.value);
    if (prayersResult.status === 'fulfilled') setPrayers(prayersResult.value);
    if (commentsResult.status === 'fulfilled') setComments(commentsResult.value);
    if (uploadsResult.status === 'fulfilled') setUploads(uploadsResult.value);
    if (updatesResult.status === 'fulfilled') setUpdates(updatesResult.value);
    const failed = results.find((result) => result.status === 'rejected');
    if (failed?.status === 'rejected') setError(friendlyError(failed.reason));
    setLoading(false);
  };
  useEffect(() => { void refresh(); }, []);
  return { config, stats, prayers, comments, uploads, updates, loading, error, refresh };
}

function MPSADialog({ config, onClose }: { config: Config; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--foreground)/.65)] p-5" role="dialog" aria-modal="true" onClick={onClose}>
    <div className="w-full max-w-lg bg-[hsl(var(--background))] p-7 shadow-2xl" onClick={(event) => event.stopPropagation()}>
      <div className="flex items-start justify-between gap-5"><div><div className="eyebrow text-[hsl(var(--primary))]">Donation desk / M-Pesa</div><h2 className="display mt-2 text-3xl">Send help directly.</h2></div><button type="button" onClick={onClose} aria-label="Close donation instructions"><X size={20} /></button></div>
      <p className="mono mt-5 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Use only the current details below. Empty lines are waiting for the field administrator — never guess a payment identifier.</p>
      <div className="mt-6 space-y-4 bg-[hsl(var(--muted)/.55)] p-5 mono text-xs">
        <div><span className="text-[hsl(var(--muted-foreground))]">Paybill</span><strong className="ml-4">{config.paybill || 'To be filled by admin'}</strong></div>
        <div><span className="text-[hsl(var(--muted-foreground))]">Account</span><strong className="ml-4">{config.account || 'To be filled by admin'}</strong></div>
        <div><span className="text-[hsl(var(--muted-foreground))]">Name</span><strong className="ml-4">{config.paybill_name || 'To be filled by admin'}</strong></div>
      </div>
      <div className="mt-6 flex justify-end"><button type="button" className="ink-button" onClick={onClose}>I have the details <Check size={15} /></button></div>
    </div>
  </div>;
}
function DonationPanel({ config, stats }: { config: Config; stats: Stats }) {
  const [dialog, setDialog] = useState(false);
  const [sent, setSent] = useState('');
  const [error, setError] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSent(''); setError('');
    const form = new FormData(event.currentTarget);
    try {
      await api('/api/donations', { method: 'POST', body: JSON.stringify({ donor_name: form.get('donor_name'), phone: form.get('phone'), amount: Number(form.get('amount')), mpesa_code: form.get('mpesa_code'), country: form.get('country'), is_anonymous: form.get('is_anonymous') === 'on' }) });
      event.currentTarget.reset(); setSent('Donation received. It will appear after verification.');
    } catch (submissionError) { setError(friendlyError(submissionError)); }
  };
  return <section className="relative overflow-hidden bg-[hsl(var(--primary))] px-6 py-8 text-[hsl(var(--primary-foreground))] md:px-9">
    <div className="relative"><div className="eyebrow opacity-75">Give / 90% goes to Nepal Red Cross</div><h2 className="display mt-3 text-3xl leading-tight">Food. Shelter.<br />Medicine. Rescue.</h2><p className="mono mt-4 max-w-sm text-xs leading-6 opacity-80">Your gift travels from this noticeboard to families rebuilding after the flood. Every Friday, we show the receipts.</p>
      <div className="mt-6 grid grid-cols-2 gap-4 border-y border-[hsl(var(--primary-foreground)/.25)] py-4 mono text-[10px] uppercase tracking-[.1em]"><div><span className="block opacity-65">Verified so far</span><strong className="mt-1 block text-lg">{formatMoney(stats.total_raised_verified)}</strong></div><div><span className="block opacity-65">Goal</span><strong className="mt-1 block text-lg">{formatMoney(stats.goal)}</strong></div></div>
      <form onSubmit={submit} className="mt-7 grid gap-x-5 gap-y-4 md:grid-cols-2">
        <input className="field border-[hsl(var(--primary-foreground)/.45)] placeholder:text-[hsl(var(--primary-foreground)/.65)]" name="donor_name" placeholder="Name (optional)" aria-label="Donor name" />
        <input className="field border-[hsl(var(--primary-foreground)/.45)] placeholder:text-[hsl(var(--primary-foreground)/.65)]" name="phone" placeholder="Phone (optional)" aria-label="Phone" />
        <input className="field border-[hsl(var(--primary-foreground)/.45)] placeholder:text-[hsl(var(--primary-foreground)/.65)]" name="amount" type="number" min="1" placeholder="Amount (KES)" required aria-label="Donation amount" />
        <input className="field border-[hsl(var(--primary-foreground)/.45)] placeholder:text-[hsl(var(--primary-foreground)/.65)]" name="mpesa_code" pattern="[A-Za-z0-9]{10}" maxLength={10} placeholder="M-Pesa code / 10 characters" required aria-label="M-Pesa code" />
        <input className="field border-[hsl(var(--primary-foreground)/.45)] placeholder:text-[hsl(var(--primary-foreground)/.65)]" name="country" placeholder="Country" aria-label="Country" />
        <label className="mono flex items-center gap-2 text-[11px]"><input type="checkbox" name="is_anonymous" /> Keep my name private</label>
        <button className="ink-button bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] md:col-span-2" type="submit">Submit donation <Send size={14} /></button>
      </form>
      {sent && <p className="mono mt-4 text-xs" role="status">{sent}</p>}{error && <p className="mono mt-4 text-xs" role="alert">{error}</p>}
      <div className="mt-6 flex flex-wrap gap-4"><button type="button" className="ghost-button border-[hsl(var(--primary-foreground)/.5)] text-[hsl(var(--primary-foreground))]" onClick={() => setDialog(true)}>View M-Pesa details <ArrowRight size={15} /></button><Link href="/community" className="ghost-button border-[hsl(var(--primary-foreground)/.5)] text-[hsl(var(--primary-foreground))]">Offer a prayer <Heart size={14} /></Link></div>
    </div>{dialog && <MPSADialog config={config} onClose={() => setDialog(false)} />}
  </section>;
}
function PrayerForm({ onComplete }: { onComplete?: () => void }) {
  const [message, setMessage] = useState(''); const [error, setError] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setMessage(''); setError(''); const form = new FormData(event.currentTarget);
    try { await api('/api/prayers', { method: 'POST', body: JSON.stringify({ name: form.get('name'), country: form.get('country'), message: form.get('message') }) }); event.currentTarget.reset(); setMessage('Your prayer will appear after admin approval.'); onComplete?.(); } catch (submissionError) { setError(friendlyError(submissionError)); }
  };
  return <form onSubmit={submit} className="space-y-5"><input className="field" name="name" placeholder="Your name or assembly" required aria-label="Name" /><input className="field" name="country" placeholder="Where are you writing from?" required aria-label="Country" /><textarea className="field min-h-28 resize-y" name="message" placeholder="Your prayer…" required aria-label="Prayer" /><button className="ink-button" type="submit">Place prayer <Send size={14} /></button>{message && <p className="mono text-xs" role="status">{message}</p>}{error && <ErrorLine message={error} />}</form>;
}
function Counter({ stats }: { stats: Stats }) {
  return <div className="grid grid-cols-3 divide-x divide-[hsl(var(--foreground)/.2)] py-7"><div className="pr-4"><div className="display text-3xl md:text-4xl">1,003+</div><div className="eyebrow mt-2 text-[hsl(var(--muted-foreground))]">lives lost</div></div><div className="px-4"><div className="display text-3xl md:text-4xl">{formatMoney(stats.total_prayers)}</div><div className="eyebrow mt-2 text-[hsl(var(--muted-foreground))]">prayers held</div></div><div className="pl-4"><div className="display text-3xl md:text-4xl">{formatMoney(stats.total_raised_verified)}</div><div className="eyebrow mt-2 text-[hsl(var(--muted-foreground))]">KES verified</div></div></div>;
}

function Home({ config, stats, prayers, loading }: { config: Config; stats: Stats; prayers: Prayer[]; loading: boolean }) {
  const prayer = prayers[0];
  return <Layout><main>
    <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 pt-12 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-10 lg:pb-24 lg:pt-20"><div className="rise-in"><div className="eyebrow text-[hsl(var(--primary))]">Dispatch 001 / 26 August 2026 / Kipsaraman</div><h1 className="display mt-6 max-w-4xl text-[clamp(3.1rem,8vw,7.8rem)] leading-[.98]">VASUDHAIVA<br /><span className="text-[hsl(var(--primary))]">KUTUMBAKAM</span></h1><p className="mt-6 max-w-2xl font-serif text-xl leading-8 md:text-2xl">THE WORLD IS ONE FAMILY</p><p className="mono mt-5 max-w-xl text-[11px] uppercase leading-6 tracking-[.12em] text-[hsl(var(--muted-foreground))]">FROM KIPSARAMAN, WEST POKOT BORDER - EAST AFRICAN YOUTH STAND WITH NEPAL</p><div className="mt-8 flex flex-wrap gap-5"><Link href="/community" className="ink-button red-button">Stand with us <ArrowRight size={16} /></Link><Link href="/story" className="ghost-button">Read the story <ChevronRight size={16} /></Link></div></div><div className="relative rise-in delay-2"><SolidarityArt /><div className="absolute bottom-3 left-4 max-w-[190px] bg-[hsl(var(--background)/.86)] p-3 backdrop-blur-sm"><div className="eyebrow text-[hsl(var(--secondary))]">A field note</div><p className="mono mt-2 text-[10px] leading-5">Two horizons. One family. This is our promise in public.</p></div></div></section>
    <div className="mx-auto max-w-7xl px-5 lg:px-10"><div className="rule" /><div className="grid gap-10 py-12 lg:grid-cols-[1fr_1.15fr]"><div><div className="eyebrow text-[hsl(var(--primary))]">The statement / read aloud</div><p className="display mt-5 text-2xl leading-[1.45] md:text-3xl">{config.home_statement}</p></div><div className="lg:pl-12"><div className="mono text-xs uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]">The shared mantra</div><p className="mt-4 font-serif text-2xl">वसुधैव कुटुम्बकम् - संसार एउटै परिवार हो</p><p className="mt-4 text-xl italic text-[hsl(var(--secondary))]">“UBUNTU - I am because we are.”</p><Counter stats={stats} /></div></div><div className="rule" /></div>
    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-10"><DonationPanel config={config} stats={stats} /><div className="bg-[hsl(var(--card))] px-6 py-7"><div className="eyebrow text-[hsl(var(--secondary))]">Offer a prayer</div><h2 className="display mt-3 text-3xl">A few honest lines are enough.</h2><div className="mt-6"><PrayerForm /></div></div></section>
    <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-16 lg:grid-cols-[1.1fr_.9fr] lg:px-10"><div><div className="eyebrow text-[hsl(var(--primary))]">A place to leave something kind</div><h2 className="display mt-4 text-4xl md:text-5xl">Prayer is a form of arrival.</h2><p className="mono mt-5 max-w-lg text-sm leading-7 text-[hsl(var(--muted-foreground))]">The wall is open to names, notes and quiet promises from every shore. Every submission is reviewed before it becomes public.</p><Link href="/community" className="ghost-button mt-7">Enter the prayer wall <ArrowRight size={15} /></Link></div><div className="bg-[hsl(var(--card))] px-6 py-7"><div className="flex items-center justify-between"><div className="eyebrow text-[hsl(var(--secondary))]">Latest approved prayer</div><Heart size={17} className="text-[hsl(var(--primary))]" /></div>{loading ? <div className="mt-5"><LoadingLine /></div> : prayer ? <><p className="mt-5 font-serif text-lg leading-8">{prayer.message}</p><div className="mono mt-6 text-[10px] uppercase tracking-[.12em] text-[hsl(var(--muted-foreground))]">{prayer.name} / {prayer.country}</div></> : <p className="mono mt-5 text-xs text-[hsl(var(--muted-foreground))]">No prayers yet, be first.</p>}</div></section>
    <section className="bg-[hsl(var(--secondary))] px-5 py-14 text-[hsl(var(--secondary-foreground))] lg:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-end"><div><div className="eyebrow opacity-70">One practical promise</div><h2 className="display mt-3 text-4xl">Every Friday, we open the books.</h2></div><Link href="/transparency" className="ghost-button border-[hsl(var(--secondary-foreground)/.45)] text-[hsl(var(--secondary-foreground))]">See the paper trail <ArrowRight size={15} /></Link></div></section>
  </main></Layout>;
}
function SolidarityArt() { return <svg viewBox="0 0 600 520" className="h-auto w-full" role="img" aria-label="Abstract drawing of two hands reaching across mountain lines"><path d="M22 399C110 355 170 365 248 324c61-32 91-120 161-160 53-31 105-25 169-72" fill="none" stroke="currentColor" strokeWidth="2" opacity=".4" /><path d="M22 432c113-36 166-9 246-52 69-37 83-107 144-152 61-45 119-20 165-68" fill="none" stroke="hsl(var(--secondary))" strokeWidth="5" /><path d="M40 453c109-38 178-9 259-46 64-30 102-101 162-126 48-21 83-11 119-28" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" /><path d="M113 285c27 7 57 25 82 40 18 11 35 23 51 24 22 1 39-22 31-40-9-20-36-30-54-44l-38-29c-7-6-16-11-23-9-12 3-11 18-4 28 9 13 26 21 40 28" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" /><path d="M487 267c-26 5-52 18-73 31-20 12-42 29-59 28-20-1-32-23-23-39 9-16 31-25 46-35l46-31c8-5 16-9 22-4 10 8 2 21-8 29l-35 27" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" /><circle cx="300" cy="72" r="46" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="2 8" /><path d="M300 46v52M274 72h52" stroke="hsl(var(--primary))" strokeWidth="2" /><text x="300" y="150" fill="currentColor" textAnchor="middle" fontFamily="DM Mono" fontSize="12" letterSpacing="2">TWO PLACES / ONE FAMILY</text></svg>; }

function Story() { return <Layout><main className="mx-auto max-w-7xl px-5 py-14 lg:px-10 lg:py-24"><SectionHead kicker="Our story / a bridge in public" title="A human being is never an island." intro="The distance between West Pokot and Nepal is real. So is the thread that crosses it." /><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div className="lg:sticky lg:top-10 lg:self-start"><Seal /><p className="mono mt-6 max-w-xs text-xs leading-6 text-[hsl(var(--muted-foreground))]">Recorded in Kipsaraman. Shared with Kathmandu. Carried by young people who refuse to call compassion a small thing.</p></div><div className="space-y-14"><article><div className="eyebrow text-[hsl(var(--primary))]">01 / Ubuntu</div><h2 className="display mt-3 text-4xl md:text-5xl">I am because we are.</h2><p className="mt-5 max-w-2xl text-lg leading-8">Ubuntu is not a slogan placed on a poster. It is a way of noticing the person beside you before you finish counting your own needs. When floods tear through another home, the circle of “we” gets wider.</p></article><div className="thin-rule" /><article><div className="eyebrow text-[hsl(var(--primary))]">02 / Vasudhaiva Kutumbakam</div><h2 className="display mt-3 text-4xl md:text-5xl">संसार एउटै परिवार हो</h2><p className="mt-5 max-w-2xl text-lg leading-8">The old Sanskrit thought says the world is one family. In Nepal, in Kenya, in every place where water has taken too much, this is a working instruction: feed the family, shelter the family, find the missing family.</p></article><div className="thin-rule" /><article><div className="eyebrow text-[hsl(var(--primary))]">03 / The human-computer race</div><h2 className="display mt-3 text-4xl md:text-5xl">We run faster when the heart leads.</h2><p className="mt-5 max-w-2xl text-lg leading-8">There is a race between human beings and computers. Computers can count the dead, map the water and route a vehicle. Only people can decide that a stranger belongs in the circle. Our tools serve that decision.</p><div className="mt-8 grid gap-5 sm:grid-cols-2"><div className="bg-[hsl(var(--secondary))] p-6 text-[hsl(var(--secondary-foreground))]"><div className="mono text-xs">THE MACHINE</div><p className="mt-3 text-sm leading-6 opacity-80">Signal. Speed. A map that finds the road when the road is gone.</p></div><div className="bg-[hsl(var(--primary))] p-6 text-[hsl(var(--primary-foreground))]"><div className="mono text-xs">THE HUMAN</div><p className="mt-3 text-sm leading-6 opacity-80">Dignity. Memory. The hand that will not leave another hand behind.</p></div></div></article></div></div></main></Layout>; }

function UpdatesPage({ updates }: { updates: Update[] }) {
  return <Layout><main className="mx-auto max-w-7xl px-5 py-14 lg:px-10 lg:py-24"><SectionHead kicker="Field updates / timeline" title="The record is part of the rescue." intro="A clear sequence of what happened, what we learned, and what happens next. Source notes are attached as the field desk receives them." /><div className="grid gap-12 lg:grid-cols-[1.25fr_.75fr]"><div className="space-y-0">{[...updates.map((update) => [update.date_label, update.title, update.body, update.source] as const), ...staticTimeline.map((item) => [...item, 'EAYS field desk'] as const)].map(([date, title, body, source], index) => <article className="grid grid-cols-[110px_1fr] gap-5 py-8 first:pt-0 md:grid-cols-[170px_1fr] md:gap-10" key={`${date}-${title}-${index}`}><div className="eyebrow pt-1 text-[hsl(var(--primary))]">{date}</div><div className="relative"><div className="absolute -left-[26px] top-1 h-3 w-3 rounded-full bg-[hsl(var(--primary))] md:-left-[41px]" /><h2 className="display text-2xl md:text-3xl">{title}</h2><p className="mt-3 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{body}</p><div className="mono mt-4 text-[10px] uppercase tracking-[.1em] text-[hsl(var(--secondary))]">Source note / {source || 'verified dispatch'}</div></div></article>)}</div><aside className="h-fit bg-[hsl(var(--card))] p-7"><div className="eyebrow text-[hsl(var(--secondary))]">Admin-ready area</div><h2 className="display mt-4 text-3xl">The next dispatch belongs here.</h2><p className="mono mt-4 text-xs leading-6 text-[hsl(var(--muted-foreground))]">Verified field notes can be added by the administrator without rebuilding the site.</p><Link href="/admin" className="ink-button mt-7">Open editor <LockKeyhole size={14} /></Link></aside></div></main></Layout>;
}

function PlaceholderArt({ kind = 'flood' }: { kind?: string }) { const fill = kind === 'hands' ? 'hsl(var(--primary))' : kind === 'ledger' ? 'hsl(var(--secondary))' : 'hsl(var(--accent))'; return <svg viewBox="0 0 600 420" className="h-full w-full" aria-hidden="true"><rect width="600" height="420" fill={fill} /><path d="M0 310c100-80 170-30 250-92 100-79 151-35 220-88 46-35 80-35 130-58v348H0Z" fill="hsl(var(--foreground)/.18)" /><path d="M0 350c107-52 181-10 278-55 110-52 160-14 322-90" fill="none" stroke="hsl(var(--background)/.75)" strokeWidth="3" /><circle cx="490" cy="100" r="50" fill="none" stroke="hsl(var(--background)/.6)" strokeWidth="2" strokeDasharray="5 9" /><text x="300" y="205" textAnchor="middle" fill="hsl(var(--background)/.82)" fontFamily="DM Mono" fontSize="16" letterSpacing="4">IMAGE TO FOLLOW</text><text x="300" y="232" textAnchor="middle" fill="hsl(var(--background)/.65)" fontFamily="DM Mono" fontSize="10" letterSpacing="2">FIELD ARCHIVE / 2026</text></svg>; }
function Gallery({ uploads }: { uploads: UploadRecord[] }) {
  const [active, setActive] = useState<UploadRecord | null>(null);
  const placeholders = ['flood', 'hands', 'ledger'];
  return <Layout><main className="mx-auto max-w-7xl px-5 py-14 lg:px-10 lg:py-24"><SectionHead kicker="Gallery / built with care" title="Leave room for the real photograph." intro="Approved images from the field appear here as soon as the administrator uploads them." />{uploads.length === 0 && <div className="mono mb-8 bg-[hsl(var(--card))] p-5 text-xs">No photos yet. The gallery is ready for the first field upload.</div>}<div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">{uploads.map((item, index) => <button type="button" key={item.id} className="group text-left" onClick={() => setActive(item)}><div className="aspect-[4/3] overflow-hidden bg-[hsl(var(--muted))]"><img src={item.file_url} alt={item.description || item.file_name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[.985]" /></div><div className="mt-4"><h2 className="display text-xl">{item.file_name}</h2><p className="mono mt-1 text-[10px] uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]">{item.description || `Field archive / ${index + 1}`}</p></div></button>)}{uploads.length === 0 && placeholders.map((kind, index) => <div key={kind} className={`group text-left ${index === 1 ? 'lg:mt-12' : ''}`}><div className="aspect-[4/3] overflow-hidden bg-[hsl(var(--muted))]"><PlaceholderArt kind={kind} /></div><div className="mt-4"><h2 className="display text-xl">Add your photos here</h2><p className="mono mt-1 text-[10px] uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]">Field archive placeholder</p></div></div>)}</div></main>{active && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(var(--foreground)/.85)] p-5" onClick={() => setActive(null)} role="dialog" aria-label="Gallery image viewer"><div className="w-full max-w-3xl" onClick={(event) => event.stopPropagation()}><img src={active.file_url} alt={active.description || active.file_name} className="max-h-[75vh] w-full object-contain" /><div className="flex justify-between bg-[hsl(var(--background))] p-4"><div><div className="display text-xl">{active.file_name}</div><div className="mono text-[10px] text-[hsl(var(--muted-foreground))]">{active.description}</div></div><button type="button" onClick={() => setActive(null)} aria-label="Close gallery viewer"><X size={20} /></button></div></div></div>}</Layout>;
}

function Transparency({ stats, uploads }: { stats: Stats; uploads: UploadRecord[] }) {
  const documents = uploads.filter((upload) => upload.type !== 'gallery');
  return <Layout><main className="mx-auto max-w-7xl px-5 py-14 lg:px-10 lg:py-24"><SectionHead kicker="Transparency / the Friday desk" title="Trust is a document you can read." intro="The archive below is the public shelf for letters, campaign evidence, statements, and receipts. Empty shelves are honest shelves." /><div className="grid gap-8 lg:grid-cols-[1fr_.72fr]"><div><div className="mb-10 bg-[hsl(var(--card))] p-7"><div className="flex items-end justify-between gap-5"><div><div className="eyebrow text-[hsl(var(--primary))]">Verified progress</div><div className="display mt-3 text-4xl">KES {formatMoney(stats.total_raised_verified)}</div></div><div className="mono text-right text-[10px]">{stats.progress}% of KES {formatMoney(stats.goal)}</div></div><div className="mt-6 h-2 bg-[hsl(var(--muted))]"><div className="h-full bg-[hsl(var(--primary))]" style={{ width: `${stats.progress}%` }} /></div></div>{documents.length === 0 ? <p className="mono bg-[hsl(var(--card))] p-6 text-xs">No documents yet. Verified receipts and letters will appear here.</p> : documents.map((item) => <a key={item.id} href={item.file_url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-5 border-b border-[hsl(var(--foreground)/.14)] py-6"><div className="flex gap-4"><ShieldCheck size={20} className="mt-1 shrink-0 text-[hsl(var(--primary))]" /><div><h2 className="display text-2xl">{item.file_name}</h2><p className="mono mt-2 text-xs text-[hsl(var(--muted-foreground))]">{item.description || item.type}</p></div></div><Download size={16} /></a>)}</div><aside className="bg-[hsl(var(--secondary))] p-7 text-[hsl(var(--secondary-foreground))]"><Landmark size={20} /><h2 className="display mt-5 text-3xl">The 90 / 10 promise</h2><p className="mt-4 text-sm leading-7 opacity-80">90% of gifts are intended for Nepal Red Cross response work. 10% keeps the local act of organising, documenting, and communicating alive. The ledger will name every exception.</p><div className="mt-10 thin-rule bg-[hsl(var(--secondary-foreground)/.3)]" /><p className="mono mt-4 text-[10px] uppercase leading-5 tracking-[.12em] opacity-70">Next public reading<br />Friday / field desk update</p></aside></div></main></Layout>;
}

function Community({ config, prayers, comments }: { config: Config; prayers: Prayer[]; comments: Comment[] }) {
  const [tab, setTab] = useState<'prayers' | 'chat'>('prayers');
  const [commentStatus, setCommentStatus] = useState('');
  const [error, setError] = useState('');
  const submitComment = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setCommentStatus(''); setError(''); const form = new FormData(event.currentTarget); try { await api('/api/comments', { method: 'POST', body: JSON.stringify({ name: form.get('name'), message: form.get('message') }) }); event.currentTarget.reset(); setCommentStatus('Your comment will appear after admin approval.'); } catch (submissionError) { setError(friendlyError(submissionError)); } };
  return <Layout><main className="mx-auto max-w-7xl px-5 py-14 lg:px-10 lg:py-24"><SectionHead kicker="Community / open to everyone" title="Bring your whole heart." intro="Leave a prayer, a witness, a question, or just your name. This is a moderated wall with a global horizon." /><div className="grid gap-12 lg:grid-cols-[.78fr_1.22fr]"><div><div className="bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))]"><div className="eyebrow opacity-75">Write a prayer</div><h2 className="display mt-3 text-3xl">A few honest lines are enough.</h2><div className="mt-7"><PrayerForm /></div></div><div className="mt-9"><div className="eyebrow text-[hsl(var(--primary))]">Founder contact</div><h2 className="display mt-3 text-2xl">{config.contact_name || 'To be filled by admin'}</h2><p className="mono mt-3 text-xs leading-6 text-[hsl(var(--muted-foreground))]">For partnership, media, documents, or a hand that needs finding.</p><div className="mt-5 space-y-2 mono text-xs">{config.contact_email ? <a href={`mailto:${config.contact_email}`} className="flex items-center gap-2 hover:text-[hsl(var(--primary))]"><Mail size={14} /> {config.contact_email}</a> : <span className="flex items-center gap-2 text-[hsl(var(--muted-foreground))]"><Mail size={14} /> To be filled by admin</span>}{config.contact_phone && <span className="flex items-center gap-2"><Phone size={14} /> {config.contact_phone}</span>}<span className="flex items-center gap-2"><MapPin size={14} /> Kipsaraman, West Pokot Border</span></div></div></div><div><div className="flex gap-6 border-b border-[hsl(var(--foreground)/.18)]"><button type="button" className={`eyebrow pb-4 ${tab === 'prayers' ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`} onClick={() => setTab('prayers')}>Prayers wall</button><button type="button" className={`eyebrow pb-4 ${tab === 'chat' ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`} onClick={() => setTab('chat')}>Community chat</button></div>{tab === 'prayers' ? <div className="mt-7 space-y-7">{prayers.length === 0 ? <p className="mono text-xs text-[hsl(var(--muted-foreground))]">No prayers yet, be first.</p> : prayers.map((prayer) => <article key={prayer.id} className="bg-[hsl(var(--card))] p-6"><div className="flex justify-between gap-4"><div className="mono text-[10px] uppercase tracking-[.12em] text-[hsl(var(--primary))]">Approved prayer / {prayer.country}</div><div className="mono text-[10px] text-[hsl(var(--muted-foreground))]">{formatDate(prayer.created_at)}</div></div><p className="mt-4 font-serif leading-7">{prayer.message}</p><div className="mono mt-4 text-xs text-[hsl(var(--muted-foreground))]">— {prayer.name}</div></article>)}</div> : <div className="mt-7"><div className="space-y-4">{comments.length === 0 ? <p className="mono text-xs text-[hsl(var(--muted-foreground))]">No comments yet, be first.</p> : comments.map((comment) => <div key={comment.id} className="flex gap-4"><div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--accent))]" /><p className="text-sm leading-6"><strong>{comment.name}</strong><br />{comment.message} <span className="mono text-[10px] text-[hsl(var(--muted-foreground))]">{formatDate(comment.created_at)}</span></p></div>)}</div><form onSubmit={submitComment} className="mt-7 grid gap-4 sm:grid-cols-[.45fr_1fr_auto]"><input className="field" name="name" placeholder="Name" required aria-label="Comment name" /><input className="field" name="message" placeholder="Leave a short note" required aria-label="Comment text" /><button className="ink-button" type="submit">Post <Send size={14} /></button>{commentStatus && <p className="mono text-xs sm:col-span-3" role="status">{commentStatus}</p>}{error && <div className="sm:col-span-3"><ErrorLine message={error} /></div>}</form></div>}</div></div></main></Layout>;
}

function AdminConsole() {
  const [session, setSession] = useState<boolean | null>(null);
  const [email, setEmail] = useState('admin@kenyaisnepal.org');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [uploads, setUploads] = useState<UploadRecord[]>([]);
  const [logs, setLogs] = useState<{ id: string; admin_email: string; action: string; details: string; created_at: string }[]>([]);
  const [status, setStatus] = useState('');
  const [uploadType, setUploadType] = useState('gallery');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [supabase, setSupabase] = useState<ReturnType<typeof getSupabaseBrowserClient> | null>(null);
  const loadAdmin = async () => {
    try {
      const [nextConfig, nextDonations, nextPrayers, nextComments, nextUploads, nextLogs] = await Promise.all([
        api<Config>('/api/config'), api<Donation[]>('/api/donations?admin=1'), api<Prayer[]>('/api/prayers?admin=1'),
        api<Comment[]>('/api/comments?admin=1'), api<UploadRecord[]>('/api/uploads'), api<typeof logs>('/api/admin/logs'),
      ]);
      setConfig(nextConfig); setDonations(nextDonations); setPrayers(nextPrayers); setComments(nextComments); setUploads(nextUploads); setLogs(nextLogs);
    } catch (error) { setAuthError(friendlyError(error)); }
  };
  useEffect(() => {
    try {
      const client = getSupabaseBrowserClient();
      setSupabase(client);
      void client.auth.getUser().then(({ data }) => setSession(Boolean(data.user)));
      const { data: listener } = client.auth.onAuthStateChange((_event, nextSession) => setSession(Boolean(nextSession)));
      return () => listener.subscription.unsubscribe();
    } catch (error) {
      setAuthError(friendlyError(error));
      setSession(false);
      return undefined;
    }
  }, []);
  useEffect(() => { if (session) void loadAdmin(); }, [session]);
  const login = async (event: FormEvent) => { event.preventDefault(); setAuthError(''); if (!supabase) return setAuthError('Supabase is not configured. Check the secure environment variables.'); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setAuthError(error.message); };
  const saveConfig = async (event: FormEvent) => { event.preventDefault(); setStatus(''); try { await api('/api/config', { method: 'PUT', body: JSON.stringify(config) }); setStatus('Settings saved to Supabase.'); } catch (error) { setAuthError(friendlyError(error)); } };
  const moderate = async (kind: 'prayers' | 'comments', id: string, is_approved: boolean) => { const response = await api<Prayer | Comment>(`/api/${kind}/${id}`, { method: 'PATCH', body: JSON.stringify({ is_approved }) }); if (kind === 'prayers') setPrayers((items) => items.map((item) => item.id === id ? response as Prayer : item)); else setComments((items) => items.map((item) => item.id === id ? response as Comment : item)); };
  const remove = async (kind: 'prayers' | 'comments' | 'donations' | 'uploads', id: string) => { await api(`/api/${kind}/${id}`, { method: 'DELETE' }); if (kind === 'prayers') setPrayers((items) => items.filter((item) => item.id !== id)); if (kind === 'comments') setComments((items) => items.filter((item) => item.id !== id)); if (kind === 'donations') setDonations((items) => items.filter((item) => item.id !== id)); if (kind === 'uploads') setUploads((items) => items.filter((item) => item.id !== id)); };
  const verifyDonation = async (id: string, is_verified: boolean) => { const response = await api<Donation>(`/api/donations/${id}/verify`, { method: 'PATCH', body: JSON.stringify({ is_verified }) }); setDonations((items) => items.map((item) => item.id === id ? response : item)); };
  const upload = async (event: FormEvent) => { event.preventDefault(); if (!uploadFile) return; const form = new FormData(); form.set('file', uploadFile); form.set('type', uploadType); const response = await fetch('/api/uploads', { method: 'POST', body: form }); if (!response.ok) { const payload = await response.json().catch(() => ({})); setAuthError(payload.error || 'Upload failed.'); return; } setUploadFile(null); setStatus('Upload stored in Supabase Storage.'); await loadAdmin(); };
  const downloadCsv = () => { const rows = [['donor_name', 'phone', 'amount', 'mpesa_code', 'country', 'is_verified', 'created_at'], ...donations.map((item) => [item.is_anonymous ? 'Anonymous' : item.donor_name || '', item.phone || '', String(item.amount), item.mpesa_code, item.country || '', String(item.is_verified), item.created_at])]; const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n'); const anchor = document.createElement('a'); anchor.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); anchor.download = 'kenya-is-nepal-donations.csv'; anchor.click(); };
  if (session === null) return <Layout><main className="mx-auto flex min-h-[65vh] max-w-md items-center px-5 py-16"><LoadingLine /></main></Layout>;
  if (!session) return <Layout><main className="mx-auto flex min-h-[65vh] max-w-md flex-col justify-center px-5 py-16"><LockKeyhole className="text-[hsl(var(--primary))]" size={28} /><div className="eyebrow mt-5 text-[hsl(var(--primary))]">Private field desk</div><h1 className="display mt-3 text-5xl">Admin access.</h1><p className="mono mt-5 text-xs leading-6 text-[hsl(var(--muted-foreground))]">Sign in with the Supabase Auth account created for the field desk.</p><form onSubmit={login} className="mt-8 space-y-4"><input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Admin email" required /><input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" required /><button className="ink-button mt-3" type="submit">Sign in <ArrowRight size={15} /></button>{authError && <ErrorLine message={authError} />}</form></main></Layout>;
  return <Layout><main className="mx-auto max-w-7xl px-5 py-14 lg:px-10 lg:py-20"><div className="flex flex-col justify-between gap-5 border-b border-[hsl(var(--foreground)/.2)] pb-7 md:flex-row md:items-end"><div><div className="eyebrow text-[hsl(var(--primary))]">Supabase / authenticated desk</div><h1 className="display mt-3 text-5xl">Field desk.</h1></div><div className="flex flex-wrap gap-3"><button className="ghost-button" onClick={downloadCsv}><Download size={14} /> Export CSV</button><button className="ghost-button" onClick={() => void supabase?.auth.signOut()}>Sign out</button><button className="ink-button" type="submit" form="config-form"><Check size={14} /> Save settings</button></div></div>{status && <p className="mono mt-5 text-xs" role="status">{status}</p>}{authError && <div className="mt-5"><ErrorLine message={authError} /></div>}<div className="mt-10 grid gap-12 lg:grid-cols-[1.1fr_.9fr]"><form id="config-form" onSubmit={saveConfig}><div className="eyebrow text-[hsl(var(--secondary))]">Public settings</div><label className="mt-5 block text-sm">Home statement<textarea value={config.home_statement} onChange={(event) => setConfig({ ...config, home_statement: event.target.value })} className="field mt-2 min-h-40 resize-y" /></label><div className="mt-10 grid gap-x-8 gap-y-5 sm:grid-cols-2">{(['paybill', 'account', 'paybill_name', 'changa_link', 'paypal_link', 'goal_amount', 'contact_name', 'contact_phone', 'contact_email'] as const).map((key) => <label key={key} className="text-sm capitalize">{key.replaceAll('_', ' ')}<input className="field mt-2" type={key === 'goal_amount' ? 'number' : 'text'} value={config[key]} onChange={(event) => setConfig({ ...config, [key]: key === 'goal_amount' ? Number(event.target.value) : event.target.value })} placeholder="To be filled by admin" /></label>)}</div></form><section><div className="eyebrow text-[hsl(var(--secondary))]">Upload to storage</div><form onSubmit={upload} className="mt-5 space-y-4"><select className="field" value={uploadType} onChange={(event) => setUploadType(event.target.value)}><option value="gallery">Gallery photo</option><option value="document">Transparency document</option><option value="receipt">Receipt</option></select><input className="field" type="file" onChange={(event) => setUploadFile(event.target.files?.[0] || null)} required /><button className="ink-button" type="submit"><Upload size={14} /> Upload</button></form><div className="mt-10"><div className="eyebrow text-[hsl(var(--secondary))]">Uploads</div><div className="mt-4 space-y-3">{uploads.length === 0 ? <p className="mono text-xs text-[hsl(var(--muted-foreground))]">No uploads yet.</p> : uploads.slice(0, 8).map((item) => <div key={item.id} className="flex items-center justify-between gap-3 text-sm"><span>{item.file_name}</span><button type="button" onClick={() => void remove('uploads', item.id)} aria-label={`Delete ${item.file_name}`}><Trash2 size={15} className="text-[hsl(var(--primary))]" /></button></div>)}</div></div></section></div><section className="mt-14"><div className="eyebrow text-[hsl(var(--secondary))]">Donations / verify before publication</div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="mono text-[10px] uppercase tracking-[.1em] text-[hsl(var(--muted-foreground))]"><tr><th className="py-3">Donor</th><th>Amount</th><th>M-Pesa</th><th>Status</th><th /></tr></thead><tbody>{donations.length === 0 ? <tr><td colSpan={5} className="py-6 mono text-xs">No donations yet, be first.</td></tr> : donations.map((item) => <tr key={item.id} className="border-t border-[hsl(var(--foreground)/.14)]"><td className="py-4">{item.is_anonymous ? 'Anonymous' : item.donor_name || 'Unnamed'}<span className="mono ml-2 text-[10px] text-[hsl(var(--muted-foreground))]">{item.country}</span></td><td>KES {formatMoney(item.amount)}</td><td className="mono text-xs">{item.mpesa_code}</td><td>{item.is_verified ? 'Verified' : 'Waiting'}</td><td className="flex gap-3 py-4">{!item.is_verified && <button type="button" className="ghost-button" onClick={() => void verifyDonation(item.id, true)}>Verify</button>}<button type="button" onClick={() => void remove('donations', item.id)} aria-label="Delete donation"><Trash2 size={15} /></button></td></tr>)}</tbody></table></div></section><div className="mt-14 grid gap-12 lg:grid-cols-2"><ModerationTable title="Prayers" items={prayers} kind="prayers" onModerate={moderate} onRemove={remove} /><ModerationTable title="Comments" items={comments} kind="comments" onModerate={moderate} onRemove={remove} /></div><section className="mt-14"><div className="eyebrow text-[hsl(var(--secondary))]">Admin logs</div><div className="mt-4 space-y-2">{logs.length === 0 ? <p className="mono text-xs">No admin actions yet.</p> : logs.slice(0, 12).map((log) => <div key={log.id} className="flex flex-wrap gap-3 border-b border-[hsl(var(--foreground)/.12)] py-3 mono text-[10px]"><span>{formatDate(log.created_at)}</span><strong>{log.action}</strong><span>{log.details}</span></div>)}</div></section></main></Layout>;
}
function ModerationTable({ title, items, kind, onModerate, onRemove }: { title: string; items: Array<Prayer | Comment>; kind: 'prayers' | 'comments'; onModerate: (kind: 'prayers' | 'comments', id: string, approved: boolean) => Promise<void>; onRemove: (kind: 'prayers' | 'comments' | 'donations' | 'uploads', id: string) => Promise<void> }) {
  return <section><div className="eyebrow text-[hsl(var(--secondary))]">{title} moderation</div><div className="mt-4 divide-y divide-[hsl(var(--foreground)/.15)]">{items.length === 0 && <p className="mono py-5 text-xs text-[hsl(var(--muted-foreground))]">Nothing waiting here.</p>}{items.map((item) => <div key={item.id} className="flex items-start justify-between gap-4 py-4"><p className="text-sm leading-6"><strong>{item.name}</strong><br />{'message' in item ? item.message : ''}<br /><span className="mono text-[10px]">{item.is_approved ? 'Approved' : 'Waiting for approval'}</span></p><div className="flex shrink-0 gap-3">{!item.is_approved && <button type="button" className="ghost-button" onClick={() => void onModerate(kind, item.id, true)}>Approve</button>}<button type="button" onClick={() => void onRemove(kind, item.id)} aria-label={`Delete ${title}`}><Trash2 size={16} className="text-[hsl(var(--primary))]" /></button></div></div>)}</div></section>;
}

export default function SiteApp({ page }: { page: 'home' | 'story' | 'updates' | 'gallery' | 'transparency' | 'community' | 'admin' }) {
  const data = usePublicData();
  if (page === 'admin') return <AdminConsole />;
  if (page === 'story') return <Story />;
  if (page === 'updates') return <UpdatesPage updates={data.updates} />;
  if (page === 'gallery') return <Gallery uploads={data.uploads} />;
  if (page === 'transparency') return <Transparency stats={data.stats} uploads={data.uploads} />;
  if (page === 'community') return <Community config={data.config} prayers={data.prayers} comments={data.comments} />;
  return <Home config={data.config} stats={data.stats} prayers={data.prayers} loading={data.loading} />;
}