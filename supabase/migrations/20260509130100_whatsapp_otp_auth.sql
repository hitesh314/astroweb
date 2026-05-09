-- Custom WhatsApp OTP challenges (stored for verification; accessed only via service_role from app server).
create table public.whatsapp_otp_challenges (
  id uuid primary key default gen_random_uuid (),
  phone_e164 text not null,
  salt text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  attempts smallint not null default 0,
  created_at timestamptz not null default now ()
);

create index whatsapp_otp_challenges_phone_created_idx
  on public.whatsapp_otp_challenges (phone_e164, created_at desc);

alter table public.whatsapp_otp_challenges enable row level security;

-- Maps E.164 phone → auth user id (avoids scanning auth users; reconciles first-time sign-in).
create table public.phone_auth_links (
  phone_e164 text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now (),
  updated_at timestamptz not null default now ()
);

create index phone_auth_links_user_id_idx on public.phone_auth_links (user_id);

create or replace function public.handle_updated_at_phone_auth_links ()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger phone_auth_links_updated_at
before update on public.phone_auth_links
for each row execute function public.handle_updated_at_phone_auth_links ();

alter table public.phone_auth_links enable row level security;
