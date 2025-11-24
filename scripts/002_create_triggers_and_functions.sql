-- Function to automatically create profile when user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    coalesce(new.raw_user_meta_data ->> 'role', 'customer')
  )
  on conflict (id) do nothing;

  -- Initialize user stats
  insert into public.user_stats (user_id, total_points, total_comments, total_likes_received)
  values (new.id, 0, 0, 0)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Trigger for new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Function to update merchant updated_at timestamp
create or replace function public.update_merchant_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for merchant updates
drop trigger if exists update_merchant_timestamp on public.merchants;
create trigger update_merchant_timestamp
  before update on public.merchants
  for each row
  execute function public.update_merchant_timestamp();

-- Function to update comment updated_at timestamp
create or replace function public.update_comment_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for comment updates
drop trigger if exists update_comment_timestamp on public.comments;
create trigger update_comment_timestamp
  before update on public.comments
  for each row
  execute function public.update_comment_timestamp();

-- Function to update user stats when comment is created
create or replace function public.update_stats_on_comment()
returns trigger
language plpgsql
security definer
as $$
begin
  -- Update commenter's stats
  update public.user_stats
  set total_comments = total_comments + 1,
      total_points = total_points + 10,
      updated_at = now()
  where user_id = new.user_id;

  return new;
end;
$$;

-- Trigger for new comments
drop trigger if exists update_stats_on_comment on public.comments;
create trigger update_stats_on_comment
  after insert on public.comments
  for each row
  execute function public.update_stats_on_comment();

-- Function to update stats when like is created
create or replace function public.update_stats_on_like()
returns trigger
language plpgsql
security definer
as $$
declare
  comment_author_id uuid;
begin
  -- Get the author of the comment
  select user_id into comment_author_id
  from public.comments
  where id = new.comment_id;

  -- Update the comment author's stats
  update public.user_stats
  set total_likes_received = total_likes_received + 1,
      total_points = total_points + 5,
      updated_at = now()
  where user_id = comment_author_id;

  return new;
end;
$$;

-- Trigger for new likes
drop trigger if exists update_stats_on_like on public.comment_likes;
create trigger update_stats_on_like
  after insert on public.comment_likes
  for each row
  execute function public.update_stats_on_like();

-- Function to remove stats when like is deleted
create or replace function public.remove_stats_on_like_delete()
returns trigger
language plpgsql
security definer
as $$
declare
  comment_author_id uuid;
begin
  -- Get the author of the comment
  select user_id into comment_author_id
  from public.comments
  where id = old.comment_id;

  -- Update the comment author's stats
  update public.user_stats
  set total_likes_received = greatest(total_likes_received - 1, 0),
      total_points = greatest(total_points - 5, 0),
      updated_at = now()
  where user_id = comment_author_id;

  return old;
end;
$$;

-- Trigger for deleted likes
drop trigger if exists remove_stats_on_like_delete on public.comment_likes;
create trigger remove_stats_on_like_delete
  after delete on public.comment_likes
  for each row
  execute function public.remove_stats_on_like_delete();
