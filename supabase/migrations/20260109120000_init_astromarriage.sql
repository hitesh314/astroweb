-- AstroMarriage — apply this on a **new** Supabase project (Dashboard → SQL → New query)
-- Keeps schemas isolated from unrelated apps (e.g. NRIRoute).

-- ---------------------------------------------------------------------------
-- public.users profile (mirror of auth.users)
-- ---------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index users_role_idx on public.users (role);

create or replace function public.handle_updated_at_users()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger users_updated_at
before update on public.users
for each row execute function public.handle_updated_at_users ();

create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.users (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    'user'
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user ();

-- ---------------------------------------------------------------------------
-- App tables (match generated TypeScript `Database.public.Tables`)
-- ---------------------------------------------------------------------------
create table public.ai_chat_history (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.users (id) on delete cascade,
  title text,
  messages_json jsonb not null default '[]'::jsonb,
  prompt_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now ()
);

create index ai_chat_history_user_id_created_at_idx
  on public.ai_chat_history (user_id, created_at desc);

create table public.ai_prompt_versions (
  id uuid primary key default gen_random_uuid (),
  slug text not null,
  version integer not null,
  prompt_text text not null,
  metadata jsonb not null default '{}'::jsonb,
  updated_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now (),
  unique (slug, version)
);

create table public.astrology_reports (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.users (id) on delete cascade,
  kundli_id uuid,
  ai_summary text,
  love_marriage_score numeric,
  arranged_marriage_score numeric,
  hybrid_score numeric,
  confidence_score numeric,
  full_report_json jsonb not null default '{}'::jsonb,
  prediction_meta jsonb not null default '{}'::jsonb,
  prompt_version text,
  created_at timestamptz not null default now ()
);

create index astrology_reports_user_id_created_at_idx
  on public.astrology_reports (user_id, created_at desc);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid (),
  slug text not null unique,
  title text not null,
  content_md text not null default '',
  excerpt text,
  cover_image_url text,
  author_id uuid references public.users (id) on delete set null,
  published boolean not null default false,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now ()
);

create trigger blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.handle_updated_at_users ();

create table public.compatibility_checks (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.users (id) on delete cascade,
  person_one_kundli text not null,
  person_two_kundli text not null,
  compatibility_score numeric,
  analysis text,
  created_at timestamptz not null default now ()
);

create index compatibility_checks_user_id_idx on public.compatibility_checks (user_id);

create table public.consultations (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.users (id) on delete cascade,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now ()
);

create table public.kundli_data (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.users (id) on delete cascade,
  raw_chart_json jsonb not null default '{}'::jsonb,
  birth_date date,
  birth_time time,
  birth_city text,
  latitude numeric,
  longitude numeric,
  timezone text,
  created_at timestamptz not null default now ()
);

create index kundli_data_user_id_idx on public.kundli_data (user_id);

create table public.predictions (
  id uuid primary key default gen_random_uuid (),
  country text not null,
  input jsonb not null,
  result jsonb not null,
  score numeric,
  max_score numeric,
  benchmark numeric,
  band text,
  summary text,
  engine text,
  created_at timestamptz not null default now ()
);

create index predictions_country_created_at_idx
  on public.predictions (country, created_at desc);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid (),
  user_id uuid not null references public.users (id) on delete cascade,
  plan_key text,
  provider text,
  status text not null default 'active',
  stripe_customer_id text,
  current_period_end timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now ()
);

create trigger subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.handle_updated_at_users ();

-- ---------------------------------------------------------------------------
-- is_admin()
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select u.role = 'admin' from public.users u where u.id = auth.uid()),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;

create policy users_select_own on public.users
  for select using (auth.uid() = id);

create policy users_update_own on public.users
  for update using (auth.uid() = id);

create policy users_admin_select on public.users
  for select using (public.is_admin());

create policy users_admin_update on public.users
  for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Tables with user_id (owner policies)
-- ---------------------------------------------------------------------------
alter table public.ai_chat_history enable row level security;
create policy ai_chat_owner on public.ai_chat_history
  for all using (auth.uid () = user_id) with check (auth.uid () = user_id);

alter table public.astrology_reports enable row level security;
create policy reports_owner on public.astrology_reports
  for all using (auth.uid () = user_id) with check (auth.uid () = user_id);
create policy reports_admin on public.astrology_reports
  for select using (public.is_admin ());

alter table public.compatibility_checks enable row level security;
create policy compat_owner on public.compatibility_checks
  for all using (auth.uid () = user_id) with check (auth.uid () = user_id);

alter table public.consultations enable row level security;
create policy consultations_owner on public.consultations
  for all using (auth.uid () = user_id) with check (auth.uid () = user_id);

alter table public.kundli_data enable row level security;
create policy kundli_owner on public.kundli_data
  for all using (auth.uid () = user_id) with check (auth.uid () = user_id);

alter table public.subscriptions enable row level security;
create policy subs_owner on public.subscriptions
  for all using (auth.uid () = user_id) with check (auth.uid () = user_id);

-- Blog: anon sees published rows; admins manage drafts.
alter table public.blog_posts enable row level security;

create policy blog_posts_public_read on public.blog_posts
  for select using (published = true);

create policy blog_posts_admin_all on public.blog_posts
  for all using (public.is_admin ()) with check (public.is_admin ());

-- Prompt versions — admin tooling only via dashboard or service_role
alter table public.ai_prompt_versions enable row level security;

create policy ai_prompt_versions_admin on public.ai_prompt_versions
  for all using (public.is_admin ()) with check (public.is_admin ());

-- predictions — locked for anon JWT; widen later if needed
alter table public.predictions enable row level security;

