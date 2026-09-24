-- Run this in the Supabase SQL editor once, after the Prisma schema is pushed.
--
-- Why it is not a Prisma migration: it puts a trigger on `auth.users`, which
-- belongs to Supabase's own schema. Prisma manages the public schema and has
-- no way to express this, so it lives here and is applied by hand. It is the
-- one piece of SQL outside Prisma's control, and it is deliberate.
--
-- What it does: when Supabase Auth creates a user, a matching Member row is
-- created from the metadata the sign-up form sent. Without it an account can
-- exist with no membership record behind it, and the executive review queue
-- would have nothing to review.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public."Member" (id, email, "fullName", department, level, status, "createdAt", "updatedAt")
  values (
    new.id::text,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    (new.raw_user_meta_data ->> 'department')::public."Department",
    (new.raw_user_meta_data ->> 'level')::int,
    'PENDING',
    now(),
    now()
  )
  on conflict (email) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row-level security. A member reads and edits their own row and nothing else;
-- everything wider goes through a service-role call on the server, where the
-- permission check is explicit. UI filtering is a courtesy, this is the control
-- (dev plan section 5).
alter table public."Member" enable row level security;

drop policy if exists "members read own row" on public."Member";
create policy "members read own row"
  on public."Member" for select
  using (auth.uid()::text = id);

drop policy if exists "members update own row" on public."Member";
create policy "members update own row"
  on public."Member" for update
  using (auth.uid()::text = id)
  with check (auth.uid()::text = id);
