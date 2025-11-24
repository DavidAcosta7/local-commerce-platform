-- Create admin_actions table for audit trail
create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  action_type text not null check (action_type in ('approve_comment', 'reject_comment', 'verify_merchant', 'delete_user', 'update_user_role', 'delete_merchant', 'delete_comment')),
  target_id uuid not null,
  target_type text not null check (target_type in ('comment', 'merchant', 'user')),
  details jsonb,
  created_at timestamp with time zone default now()
);

alter table public.admin_actions enable row level security;

-- Admin actions policies: only admins can view
create policy "admin_actions_select_admins"
  on public.admin_actions for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "admin_actions_insert_admins"
  on public.admin_actions for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
    and auth.uid() = admin_id
  );

-- Update profiles policies to allow admins to manage users
create policy "profiles_update_admins"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "profiles_delete_admins"
  on public.profiles for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Create function to create default admin user
create or replace function create_default_admin()
returns void
language plpgsql
security definer
as $$
declare
  admin_user_id uuid;
begin
  -- Check if admin user already exists
  select id into admin_user_id
  from auth.users
  where email = 'admin@plataforma.com';
  
  if admin_user_id is null then
    -- Insert into auth.users (this should be done through Supabase Auth API in production)
    -- For now, we'll create a profile placeholder
    -- The actual user creation should be done through Supabase Dashboard or Auth API
    raise notice 'Please create admin user through Supabase Dashboard with email: admin@plataforma.com';
  end if;
end;
$$;

-- Create indexes for better performance
create index if not exists idx_admin_actions_admin_id on public.admin_actions(admin_id);
create index if not exists idx_admin_actions_created_at on public.admin_actions(created_at desc);
create index if not exists idx_admin_actions_target_id on public.admin_actions(target_id);
