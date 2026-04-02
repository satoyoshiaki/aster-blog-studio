create extension if not exists pgcrypto;

create table if not exists submissions (
  id uuid primary key default gen_random_uuid(),
  source_url text not null,
  normalized_url text not null unique,
  source_domain text not null,
  title text not null,
  description text,
  tags text[] not null default '{}',
  thumbnail_url text,
  status text not null check (status in ('pending', 'approved', 'rejected')) default 'pending',
  moderation_reason text,
  submitter_ip_hash text not null,
  exchange_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  approved_at timestamptz
);

create table if not exists exchanges (
  id uuid primary key default gen_random_uuid(),
  submitted_submission_id uuid not null references submissions(id) on delete cascade,
  received_submission_id uuid references submissions(id) on delete set null,
  submitter_ip_hash text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  exchange_id uuid references exchanges(id) on delete set null,
  submission_id uuid references submissions(id) on delete set null,
  reason text not null,
  details text,
  reporter_ip_hash text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists allowed_domains (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  note text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists blocked_keywords (
  id uuid primary key default gen_random_uuid(),
  keyword text not null unique,
  note text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists admin_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists submissions_status_created_at_idx on submissions(status, created_at desc);
create index if not exists submissions_approved_at_idx on submissions(approved_at desc);
create index if not exists exchanges_created_at_idx on exchanges(created_at desc);
create index if not exists reports_created_at_idx on reports(created_at desc);
