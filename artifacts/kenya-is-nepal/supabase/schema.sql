create extension if not exists pgcrypto;

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  donor_name text,
  phone text,
  amount integer not null check (amount > 0),
  mpesa_code text not null unique check (mpesa_code ~ '^[A-Za-z0-9]{10}$'),
  country text,
  is_anonymous boolean not null default false,
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.prayers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  country text not null,
  message text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  message text not null,
  reply_to uuid references public.comments(id) on delete set null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('gallery', 'document', 'receipt')),
  file_url text not null,
  file_name text not null,
  description text,
  uploaded_by text,
  created_at timestamptz not null default now()
);

create table if not exists public.config (
  id integer primary key default 1 check (id = 1),
  paybill text not null default '',
  account text not null default '',
  paybill_name text not null default '',
  changa_link text not null default '',
  paypal_link text not null default '',
  goal_amount integer not null default 2500000 check (goal_amount >= 0),
  contact_name text not null default '',
  contact_phone text not null default '',
  contact_email text not null default '',
  home_statement text not null default 'On 26th August 2026, a glacier broke in Tibet. Ice and mud washed away villages in Rasuwa and Nuwakot. Over 1,000 dead, 3,900+ missing including 590 foreigners from 39 nations. We are youth from Kipsaraman, West Pokot Border. We believe in Ubuntu and Vasudhaiva Kutumbakam. Two Civilizations, One Family: Race of Blood and Race of Light.'
);

create table if not exists public.updates (
  id uuid primary key default gen_random_uuid(),
  date_label text not null,
  title text not null,
  body text not null,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  action text not null,
  details text,
  created_at timestamptz not null default now()
);

insert into public.config (id) values (1) on conflict (id) do nothing;

create index if not exists donations_verified_created_idx on public.donations (is_verified, created_at desc);
create index if not exists prayers_approved_created_idx on public.prayers (is_approved, created_at desc);
create index if not exists comments_approved_created_idx on public.comments (is_approved, created_at desc);
create index if not exists uploads_type_created_idx on public.uploads (type, created_at desc);
create index if not exists updates_created_idx on public.updates (created_at desc);

alter table public.donations enable row level security;
alter table public.prayers enable row level security;
alter table public.comments enable row level security;
alter table public.uploads enable row level security;
alter table public.config enable row level security;
alter table public.updates enable row level security;
alter table public.admin_logs enable row level security;

drop policy if exists "public can read verified donations" on public.donations;
create policy "public can read verified donations" on public.donations for select using (is_verified = true);
drop policy if exists "public can submit unverified donations" on public.donations;
create policy "public can submit unverified donations" on public.donations for insert with check (is_verified = false);

drop policy if exists "public can read approved prayers" on public.prayers;
create policy "public can read approved prayers" on public.prayers for select using (is_approved = true);
drop policy if exists "public can submit prayers" on public.prayers;
create policy "public can submit prayers" on public.prayers for insert with check (is_approved = false);

drop policy if exists "public can read approved comments" on public.comments;
create policy "public can read approved comments" on public.comments for select using (is_approved = true);
drop policy if exists "public can submit comments" on public.comments;
create policy "public can submit comments" on public.comments for insert with check (is_approved = false);

drop policy if exists "public can read uploads" on public.uploads;
create policy "public can read uploads" on public.uploads for select using (true);

drop policy if exists "public can read config" on public.config;
create policy "public can read config" on public.config for select using (true);

drop policy if exists "public can read updates" on public.updates;
create policy "public can read updates" on public.updates for select using (true);

drop policy if exists "admins can write donations" on public.donations;
create policy "admins can write donations" on public.donations for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "admins can write prayers" on public.prayers;
create policy "admins can write prayers" on public.prayers for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admins can delete prayers" on public.prayers;
create policy "admins can delete prayers" on public.prayers for delete using (auth.role() = 'authenticated');
drop policy if exists "admins can write comments" on public.comments;
create policy "admins can write comments" on public.comments for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "admins can delete comments" on public.comments;
create policy "admins can delete comments" on public.comments for delete using (auth.role() = 'authenticated');
drop policy if exists "admins can write uploads" on public.uploads;
create policy "admins can write uploads" on public.uploads for insert with check (auth.role() = 'authenticated');
drop policy if exists "admins can delete uploads" on public.uploads;
create policy "admins can delete uploads" on public.uploads for delete using (auth.role() = 'authenticated');
drop policy if exists "admins can write config" on public.config;
create policy "admins can write config" on public.config for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "admins can write updates" on public.updates;
create policy "admins can write updates" on public.updates for insert with check (auth.role() = 'authenticated');
drop policy if exists "admins can update updates" on public.updates;
create policy "admins can update updates" on public.updates for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
drop policy if exists "admins can delete updates" on public.updates;
create policy "admins can delete updates" on public.updates for delete using (auth.role() = 'authenticated');
drop policy if exists "admins can read logs" on public.admin_logs;
create policy "admins can read logs" on public.admin_logs for select using (auth.role() = 'authenticated');
drop policy if exists "admins can write logs" on public.admin_logs;
create policy "admins can write logs" on public.admin_logs for insert with check (auth.role() = 'authenticated');

insert into storage.buckets (id, name, public)
values ('kenyaisnepal', 'kenyaisnepal', true)
on conflict (id) do update set public = true;

drop policy if exists "public can view site files" on storage.objects;
create policy "public can view site files" on storage.objects for select using (bucket_id = 'kenyaisnepal');
drop policy if exists "admins can upload site files" on storage.objects;
create policy "admins can upload site files" on storage.objects for insert with check (bucket_id = 'kenyaisnepal' and auth.role() = 'authenticated');
drop policy if exists "admins can delete site files" on storage.objects;
create policy "admins can delete site files" on storage.objects for delete using (bucket_id = 'kenyaisnepal' and auth.role() = 'authenticated');