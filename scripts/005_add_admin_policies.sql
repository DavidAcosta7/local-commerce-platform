-- Add admin-specific RLS policies

-- Allow admins to view all comments
create policy "admin_select_all_comments"
  on public.comments for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Allow admins to update all comments
create policy "admin_update_all_comments"
  on public.comments for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Allow admins to delete all comments
create policy "admin_delete_all_comments"
  on public.comments for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Allow admins to view all merchants
create policy "admin_select_all_merchants"
  on public.merchants for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

-- Allow admins to update all merchants
create policy "admin_update_all_merchants"
  on public.merchants for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );
