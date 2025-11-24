-- Create profiles table for user information
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'merchant', 'admin')),
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- Profiles policies
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Create merchants table
create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  business_name text not null,
  description text,
  category text not null,
  address text,
  phone text,
  email text,
  website text,
  logo_url text,
  cover_image_url text,
  is_verified boolean default false,
  is_active boolean default true,
  qr_code text unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.merchants enable row level security;

-- Merchants policies: all can view active merchants, owners can manage their own
create policy "merchants_select_active"
  on public.merchants for select
  using (is_active = true);

create policy "merchants_insert_own"
  on public.merchants for insert
  with check (auth.uid() = owner_id);

create policy "merchants_update_own"
  on public.merchants for update
  using (auth.uid() = owner_id);

create policy "merchants_delete_own"
  on public.merchants for delete
  using (auth.uid() = owner_id);

-- Create comments table
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  is_approved boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.comments enable row level security;

-- Comments policies: all can view approved comments
create policy "comments_select_approved"
  on public.comments for select
  using (is_approved = true);

create policy "comments_insert_authenticated"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "comments_update_own"
  on public.comments for update
  using (auth.uid() = user_id);

create policy "comments_delete_own"
  on public.comments for delete
  using (auth.uid() = user_id);

-- Create likes table for comments
create table if not exists public.comment_likes (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(comment_id, user_id)
);

alter table public.comment_likes enable row level security;

-- Likes policies
create policy "likes_select_all"
  on public.comment_likes for select
  using (true);

create policy "likes_insert_authenticated"
  on public.comment_likes for insert
  with check (auth.uid() = user_id);

create policy "likes_delete_own"
  on public.comment_likes for delete
  using (auth.uid() = user_id);

-- Create achievements table for gamification
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text not null,
  points integer not null default 0,
  requirement_type text not null check (requirement_type in ('comments', 'likes_received', 'merchants_registered')),
  requirement_count integer not null,
  created_at timestamp with time zone default now()
);

alter table public.achievements enable row level security;

-- Achievements policies: all can view
create policy "achievements_select_all"
  on public.achievements for select
  using (true);

-- Create user_achievements junction table
create table if not exists public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  earned_at timestamp with time zone default now(),
  unique(user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

-- User achievements policies
create policy "user_achievements_select_all"
  on public.user_achievements for select
  using (true);

create policy "user_achievements_insert_own"
  on public.user_achievements for insert
  with check (auth.uid() = user_id);

-- Create user_stats table for tracking points
create table if not exists public.user_stats (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  total_points integer default 0,
  total_comments integer default 0,
  total_likes_received integer default 0,
  rank_position integer,
  updated_at timestamp with time zone default now()
);

alter table public.user_stats enable row level security;

-- User stats policies
create policy "user_stats_select_all"
  on public.user_stats for select
  using (true);

create policy "user_stats_update_own"
  on public.user_stats for update
  using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_merchants_owner_id on public.merchants(owner_id);
create index if not exists idx_merchants_category on public.merchants(category);
create index if not exists idx_comments_merchant_id on public.comments(merchant_id);
create index if not exists idx_comments_user_id on public.comments(user_id);
create index if not exists idx_comment_likes_comment_id on public.comment_likes(comment_id);
create index if not exists idx_comment_likes_user_id on public.comment_likes(user_id);
create index if not exists idx_user_achievements_user_id on public.user_achievements(user_id);
