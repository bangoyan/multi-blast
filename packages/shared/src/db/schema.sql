-- MultiBlast Database Schema
-- Run against Supabase PostgreSQL or local Postgres

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users (managed by Supabase Auth, this extends the profile)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Social accounts connected by users
create table public.social_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'tiktok', 'facebook', 'youtube')),
  platform_user_id text not null,
  username text not null,
  access_token text not null,
  refresh_token text,
  token_expires_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, platform, platform_user_id)
);

-- Posts (the source content before platform adaptation)
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  media_urls text[] not null default '{}',
  platforms text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'publishing', 'published', 'failed')),
  ai_adapted_content jsonb,
  hashtags jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Schedules (one per post per platform)
create table public.schedules (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'tiktok', 'facebook', 'youtube')),
  social_account_id uuid not null references public.social_accounts(id) on delete cascade,
  scheduled_at timestamptz not null,
  published_at timestamptz,
  status text not null default 'scheduled' check (status in ('scheduled', 'publishing', 'published', 'failed')),
  platform_post_id text,
  error_message text,
  created_at timestamptz not null default now()
);

-- Comment auto-reply rules
create table public.comment_rules (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  social_account_id uuid not null references public.social_accounts(id) on delete cascade,
  name text not null,
  mode text not null check (mode in ('ai_persona', 'keyword_triggered')),
  is_active boolean not null default true,
  persona_prompt text,
  persona_style text,
  keywords text[],
  reply_template text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- DM trigger rules
create table public.dm_triggers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  social_account_id uuid not null references public.social_accounts(id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  trigger_keywords text[] not null default '{}',
  dm_message_template text not null,
  affiliate_url text,
  lynk_id_url text,
  campaign_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- DM send logs
create table public.dm_logs (
  id uuid primary key default uuid_generate_v4(),
  dm_trigger_id uuid not null references public.dm_triggers(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'tiktok', 'facebook', 'youtube')),
  recipient_platform_id text not null,
  recipient_username text,
  message_sent text not null,
  url_sent text,
  sent_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('sent', 'failed', 'pending')),
  error_message text
);

-- Activity logs
create table public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_social_accounts_user on public.social_accounts(user_id);
create index idx_posts_user on public.posts(user_id);
create index idx_posts_status on public.posts(status);
create index idx_schedules_user on public.schedules(user_id);
create index idx_schedules_status_time on public.schedules(status, scheduled_at);
create index idx_comment_rules_account on public.comment_rules(social_account_id);
create index idx_dm_triggers_account on public.dm_triggers(social_account_id);
create index idx_dm_logs_trigger on public.dm_logs(dm_trigger_id);
create index idx_dm_logs_user on public.dm_logs(user_id);
create index idx_activity_logs_user on public.activity_logs(user_id, created_at desc);

-- RLS policies
alter table public.users enable row level security;
alter table public.social_accounts enable row level security;
alter table public.posts enable row level security;
alter table public.schedules enable row level security;
alter table public.comment_rules enable row level security;
alter table public.dm_triggers enable row level security;
alter table public.dm_logs enable row level security;
alter table public.activity_logs enable row level security;

-- Users can only access their own data
create policy "Users read own" on public.users for select using (auth.uid() = id);
create policy "Users update own" on public.users for update using (auth.uid() = id);

create policy "Social accounts own" on public.social_accounts for all using (auth.uid() = user_id);
create policy "Posts own" on public.posts for all using (auth.uid() = user_id);
create policy "Schedules own" on public.schedules for all using (auth.uid() = user_id);
create policy "Comment rules own" on public.comment_rules for all using (auth.uid() = user_id);
create policy "DM triggers own" on public.dm_triggers for all using (auth.uid() = user_id);
create policy "DM logs own" on public.dm_logs for all using (auth.uid() = user_id);
create policy "Activity logs own" on public.activity_logs for all using (auth.uid() = user_id);

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.users for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.social_accounts for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.posts for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.comment_rules for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.dm_triggers for each row execute function public.handle_updated_at();

-- Auto create public.users profile on auth.users signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
