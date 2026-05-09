-- App-level admin flag (Stream consult channels include every user with is_admin or legacy role admin).

alter table public.users
add column if not exists is_admin boolean not null default false;

update public.users
set is_admin = true
where role = 'admin';

create index if not exists users_is_admin_idx on public.users (is_admin)
where is_admin;

create or replace function public.is_admin()
returns boolean language sql stable security definer
set search_path = public as $$
  select coalesce(
    (
      select (u.is_admin = true or u.role = 'admin')
      from public.users u
      where u.id = auth.uid()
    ),
    false
  );
$$;
