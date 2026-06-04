-- Payouts table
create table if not exists payouts (
  id uuid default gen_random_uuid() primary key,
  partner_id uuid references partners(id) on delete cascade,
  partner_name text,
  amount numeric default 0,
  period_label text,
  period_start date,
  period_end date,
  reference text,
  notes text,
  paid_by text default 'admin',
  created_at timestamp with time zone default now()
);

alter table payouts enable row level security;
create policy "Allow all" on payouts for all using (true) with check (true);

-- Signatures table (for legal record of onboarding sign-off)
create table if not exists signatures (
  id uuid default gen_random_uuid() primary key,
  partner_id uuid references partners(id) on delete cascade,
  partner_name text,
  legal_name text,
  signed_at timestamp with time zone default now(),
  policy_version text default 'v1.0',
  exhibit_a boolean default false,
  exhibit_b boolean default false,
  operating_rules boolean default false,
  non_compete boolean default false,
  ip_address text,
  user_agent text
);

alter table signatures enable row level security;
create policy "Allow all" on signatures for all using (true) with check (true);

-- Announcements table
create table if not exists announcements (
  id uuid default gen_random_uuid() primary key,
  title text,
  body text,
  type text default 'info',
  active boolean default true,
  created_at timestamp with time zone default now()
);

alter table announcements enable row level security;
create policy "Allow all" on announcements for all using (true) with check (true);

-- Audit log table
create table if not exists audit_log (
  id uuid default gen_random_uuid() primary key,
  action text,
  entity text,
  entity_id text,
  details text,
  performed_by text default 'admin',
  created_at timestamp with time zone default now()
);

alter table audit_log enable row level security;
create policy "Allow all" on audit_log for all using (true) with check (true);
