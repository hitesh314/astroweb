-- Safe re-apply if 20260509180000_google_auth_links was never run on this database.
create table if not exists public.google_auth_links (
  google_sub text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now ()
);

create index if not exists google_auth_links_user_id_idx on public.google_auth_links (user_id);

create or replace function public.handle_updated_at_google_auth_links ()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists google_auth_links_updated_at on public.google_auth_links;

create trigger google_auth_links_updated_at
before update on public.google_auth_links
for each row execute function public.handle_updated_at_google_auth_links ();

alter table public.google_auth_links enable row level security;
