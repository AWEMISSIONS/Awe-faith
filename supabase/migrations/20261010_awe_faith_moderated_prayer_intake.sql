-- This is the applied AWE Faith prayer schema; do not grant public table access.
create table if not exists public.awe_prayer_submissions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check(kind in ('prayer','comment')),
  parent_id uuid references public.awe_prayer_submissions(id) on delete cascade,
  name text not null default '' check(length(name)<=80),
  title text not null default '' check(length(title)<=120),
  body text not null check(length(body) between 2 and 2000),
  public_consent boolean not null default false,
  status text not null default 'pending' check(status in ('pending','approved','rejected')),
  ip_hash text not null default '',
  review_note text not null default '',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  constraint awe_prayer_submission_shape check(
     (kind='prayer' and parent_id is null) or (kind='comment' and parent_id is not null and public_consent=true)
  ),
  constraint awe_prayer_approved_consent check(status<>'approved' or public_consent=true)
);
create index if not exists awe_prayer_status_idx on public.awe_prayer_submissions(status,kind,created_at desc);
create index if not exists awe_prayer_parent_idx on public.awe_prayer_submissions(parent_id);
create index if not exists awe_prayer_throttle_idx on public.awe_prayer_submissions(ip_hash,created_at desc);
alter table public.awe_prayer_submissions enable row level security;
revoke all on table public.awe_prayer_submissions from anon, authenticated;
