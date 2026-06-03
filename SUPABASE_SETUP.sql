create table partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  legal_name text,
  agency text,
  email text unique not null,
  password text not null,
  vertical text,
  start_date date,
  monthly_spend numeric default 0,
  annual_aum numeric default 0,
  day30_aum numeric default 0,
  day60_aum numeric default 0,
  day90_aum numeric default 0,
  non_compete_days integer default 90,
  trailing_option text default 'A',
  status text default 'Pending Setup',
  onboarded boolean default false,
  created_at timestamptz default now()
);

create table pipeline (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partners(id) on delete cascade,
  partner_name text,
  type text not null,
  name text not null,
  contact_name text,
  email text,
  monthly_spend numeric default 0,
  notes text,
  stage text default 'Lead',
  created_at timestamptz default now()
);

create table resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text default 'pdf',
  category text default 'training',
  description text,
  url text,
  created_at timestamptz default now()
);

create table tickets (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references partners(id) on delete cascade,
  partner_name text,
  type text,
  subject text not null,
  details text,
  status text default 'Open',
  created_at timestamptz default now()
);

alter table partners enable row level security;
alter table pipeline enable row level security;
alter table resources enable row level security;
alter table tickets enable row level security;

create policy "allow all" on partners for all using (true) with check (true);
create policy "allow all" on pipeline for all using (true) with check (true);
create policy "allow all" on resources for all using (true) with check (true);
create policy "allow all" on tickets for all using (true) with check (true);
