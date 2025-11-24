-- Function to check and award achievements automatically
create or replace function public.check_and_award_achievements(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_achievement record;
  v_user_stats record;
  v_merchant_count integer;
begin
  -- Get user stats
  select * into v_user_stats
  from public.user_stats
  where user_id = p_user_id;

  if not found then
    return;
  end if;

  -- Get merchant count for this user
  select count(*) into v_merchant_count
  from public.merchants
  where owner_id = p_user_id;

  -- Check each achievement
  for v_achievement in
    select *
    from public.achievements
  loop
    -- Check if user already has this achievement
    if not exists (
      select 1
      from public.user_achievements
      where user_id = p_user_id
        and achievement_id = v_achievement.id
    ) then
      -- Check if user meets the requirement
      case v_achievement.requirement_type
        when 'comments' then
          if v_user_stats.total_comments >= v_achievement.requirement_count then
            insert into public.user_achievements (user_id, achievement_id)
            values (p_user_id, v_achievement.id);
          end if;
        when 'likes_received' then
          if v_user_stats.total_likes_received >= v_achievement.requirement_count then
            insert into public.user_achievements (user_id, achievement_id)
            values (p_user_id, v_achievement.id);
          end if;
        when 'merchants_registered' then
          if v_merchant_count >= v_achievement.requirement_count then
            insert into public.user_achievements (user_id, achievement_id)
            values (p_user_id, v_achievement.id);
          end if;
      end case;
    end if;
  end loop;
end;
$$;

-- Trigger to check achievements after comment insert
create or replace function public.check_achievements_after_comment()
returns trigger
language plpgsql
security definer
as $$
begin
  perform check_and_award_achievements(new.user_id);
  return new;
end;
$$;

drop trigger if exists check_achievements_after_comment on public.comments;
create trigger check_achievements_after_comment
  after insert on public.comments
  for each row
  execute function public.check_achievements_after_comment();

-- Trigger to check achievements after like insert
create or replace function public.check_achievements_after_like()
returns trigger
language plpgsql
security definer
as $$
declare
  v_comment_author_id uuid;
begin
  -- Get the author of the comment
  select user_id into v_comment_author_id
  from public.comments
  where id = new.comment_id;

  if v_comment_author_id is not null then
    perform check_and_award_achievements(v_comment_author_id);
  end if;

  return new;
end;
$$;

drop trigger if exists check_achievements_after_like on public.comment_likes;
create trigger check_achievements_after_like
  after insert on public.comment_likes
  for each row
  execute function public.check_achievements_after_like();

-- Trigger to check achievements after merchant insert
create or replace function public.check_achievements_after_merchant()
returns trigger
language plpgsql
security definer
as $$
begin
  perform check_and_award_achievements(new.owner_id);
  return new;
end;
$$;

drop trigger if exists check_achievements_after_merchant on public.merchants;
create trigger check_achievements_after_merchant
  after insert on public.merchants
  for each row
  execute function public.check_achievements_after_merchant();
