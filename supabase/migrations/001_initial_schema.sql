-- MicroGuard — Initial Database Schema
-- Run: supabase db push

-- ─── Extensions ───────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── Enums ────────────────────────────────────────────────────────────────────
create type risk_profile as enum ('conservative', 'moderate', 'aggressive');
create type asset_type as enum ('etf', 'bond', 'crypto', 'stock');
create type investment_status as enum ('active', 'sold', 'pending');
create type offer_type as enum ('investment', 'educational', 'alert');
create type notification_type as enum ('alert', 'offer', 'update', 'system');

-- ─── Helper: auto-update updated_at ───────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── profiles ─────────────────────────────────────────────────────────────────
create table profiles (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null unique references auth.users(id) on delete cascade,
  full_name           text,
  risk_profile        risk_profile,
  investment_goal     text,
  max_investment_usd  numeric(10,2) not null default 500.00,
  onboarding_complete boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index profiles_user_id_idx on profiles(user_id);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── portfolios ───────────────────────────────────────────────────────────────
create table portfolios (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null default 'Mi Cartera',
  total_invested  numeric(10,2) not null default 0,
  current_value   numeric(10,2) not null default 0,
  return_pct      numeric(8,4) not null default 0,
  created_at      timestamptz not null default now()
);

create index portfolios_user_id_idx on portfolios(user_id);

-- Auto-create portfolio when profile is created
create or replace function handle_new_profile()
returns trigger language plpgsql security definer as $$
begin
  insert into public.portfolios (user_id, name)
  values (new.user_id, 'Mi Cartera Principal');
  return new;
end;
$$;

create trigger on_profile_created
  after insert on profiles
  for each row execute function handle_new_profile();

-- ─── investments ──────────────────────────────────────────────────────────────
create table investments (
  id              uuid primary key default uuid_generate_v4(),
  portfolio_id    uuid not null references portfolios(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  asset_symbol    text not null,
  asset_name      text not null,
  asset_type      asset_type not null,
  amount_usd      numeric(10,2) not null check (amount_usd > 0 and amount_usd <= 500),
  shares          numeric(18,8) not null default 0,
  entry_price     numeric(10,4) not null,
  current_price   numeric(10,4) not null,
  return_pct      numeric(8,4) not null default 0,
  status          investment_status not null default 'active',
  created_at      timestamptz not null default now()
);

create index investments_user_id_idx on investments(user_id);
create index investments_portfolio_id_idx on investments(portfolio_id);
create index investments_status_idx on investments(status);
create index investments_created_at_idx on investments(created_at desc);

-- ─── recommendations ──────────────────────────────────────────────────────────
create table recommendations (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  asset_symbol     text not null,
  asset_name       text not null,
  confidence_score smallint not null check (confidence_score >= 0 and confidence_score <= 100),
  reasoning        text not null,
  suggested_amount numeric(10,2) not null,
  risk_level       risk_profile not null,
  expected_return_pct numeric(6,2),
  expires_at       timestamptz not null,
  acted_on         boolean not null default false,
  created_at       timestamptz not null default now()
);

create index recommendations_user_id_idx on recommendations(user_id);
create index recommendations_expires_at_idx on recommendations(expires_at);
create index recommendations_acted_on_idx on recommendations(acted_on);

-- ─── campaigns ────────────────────────────────────────────────────────────────
create table campaigns (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  description     text not null,
  offer_type      offer_type not null default 'investment',
  asset_symbol    text,
  min_investment  numeric(10,2),
  max_return_pct  numeric(6,2),
  target_profiles risk_profile[] default array['conservative','moderate','aggressive']::risk_profile[],
  expires_at      timestamptz,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create index campaigns_is_active_idx on campaigns(is_active);
create index campaigns_expires_at_idx on campaigns(expires_at);

-- Track which users received which campaigns (prevent spam)
create table campaign_deliveries (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  channel     text not null check (channel in ('email', 'push', 'in_app')),
  sent_at     timestamptz not null default now(),
  unique(user_id, campaign_id, channel)
);

create index campaign_deliveries_user_campaign_idx on campaign_deliveries(user_id, campaign_id);

-- ─── push_subscriptions ───────────────────────────────────────────────────────
create table push_subscriptions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  endpoint    text not null unique,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now()
);

create index push_subscriptions_user_id_idx on push_subscriptions(user_id);

-- ─── notifications ────────────────────────────────────────────────────────────
create table notifications (
  id      uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title   text not null,
  body    text not null,
  type    notification_type not null default 'system',
  read    boolean not null default false,
  sent_at timestamptz not null default now()
);

create index notifications_user_id_idx on notifications(user_id);
create index notifications_read_idx on notifications(read);
create index notifications_sent_at_idx on notifications(sent_at desc);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table profiles           enable row level security;
alter table portfolios         enable row level security;
alter table investments        enable row level security;
alter table recommendations    enable row level security;
alter table campaigns          enable row level security;
alter table campaign_deliveries enable row level security;
alter table push_subscriptions enable row level security;
alter table notifications      enable row level security;

-- profiles: own data only
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = user_id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = user_id);

-- portfolios: own data only
create policy "Users can view own portfolios"
  on portfolios for select using (auth.uid() = user_id);
create policy "Users can update own portfolios"
  on portfolios for update using (auth.uid() = user_id);

-- investments: own data only
create policy "Users can view own investments"
  on investments for select using (auth.uid() = user_id);
create policy "Users can insert own investments"
  on investments for insert with check (auth.uid() = user_id);
create policy "Users can update own investments"
  on investments for update using (auth.uid() = user_id);

-- recommendations: own data only
create policy "Users can view own recommendations"
  on recommendations for select using (auth.uid() = user_id);

-- campaigns: all authenticated users can read active campaigns
create policy "Authenticated users can view active campaigns"
  on campaigns for select using (auth.role() = 'authenticated' and is_active = true);

-- campaign_deliveries: own records only
create policy "Users can view own campaign deliveries"
  on campaign_deliveries for select using (auth.uid() = user_id);

-- push_subscriptions: own data only
create policy "Users can manage own push subscriptions"
  on push_subscriptions for all using (auth.uid() = user_id);

-- notifications: own data only
create policy "Users can view own notifications"
  on notifications for select using (auth.uid() = user_id);
create policy "Users can mark own notifications read"
  on notifications for update using (auth.uid() = user_id);
