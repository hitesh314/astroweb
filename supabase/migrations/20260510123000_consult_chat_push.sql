-- Dedupe first-time consult chat opens (dashboard chat bootstrap) — one row per customer.
create table public.client_consult_chat_first_visit (
  user_id uuid primary key references public.users (id) on delete cascade,
  first_seen_at timestamptz not null default now ()
);

alter table public.client_consult_chat_first_visit enable row level security;

-- Admin device Web Push subscriptions (server-written only via service_role).
create table public.admin_web_push_subscriptions (
  id uuid primary key default gen_random_uuid (),
  admin_user_id uuid not null references public.users (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  updated_at timestamptz not null default now (),
  unique (endpoint)
);

create index admin_web_push_subscriptions_admin_idx
  on public.admin_web_push_subscriptions (admin_user_id);

alter table public.admin_web_push_subscriptions enable row level security;
