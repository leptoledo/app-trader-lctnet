
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  settings jsonb default '{"theme": "system", "default_risk_percent": 1.0}'::jsonb,
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger automatically runs on signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. ACCOUNTS (Trading Accounts: "Demo", "Real", "Challenge")
create table public.accounts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  currency text default 'USD' not null,
  initial_balance numeric default 0 not null,
  current_balance numeric default 0, -- Can be computed or updated via trigger
  is_archived boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.accounts enable row level security;

create policy "Users can CRUD own accounts" on accounts
  for all using (auth.uid() = user_id);


-- 3. TRADES (The core ledger)
create type trade_direction as enum ('LONG', 'SHORT');
create type trade_status as enum ('OPEN', 'CLOSED', 'PENDING');

create table public.trades (
  id uuid default uuid_generate_v4() primary key,
  account_id uuid references public.accounts(id) on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  
  -- Core Trade Info
  symbol text not null,
  direction trade_direction not null,
  status trade_status default 'OPEN' not null,
  
  -- Timing
  entry_date timestamp with time zone not null,
  exit_date timestamp with time zone,
  
  -- Pricing & Size
  entry_price numeric not null,
  exit_price numeric,
  stop_loss numeric,
  take_profit numeric,
  quantity numeric not null, -- Lots or contracts
  
  -- Financial Results
  commission numeric default 0,
  swap numeric default 0,
  fees numeric default 0, -- Total Commission + Swap (computed or saved)
  pnl_gross numeric,      -- Gross Profit
  pnl_net numeric,        -- Net Profit (Gross - Fees)
  
  -- Identifiers
  ticket_id text,         -- Broker's ID (Position/Ticket)
  
  -- Analytics
  r_multiple numeric,     -- Risk Multiple realized
  
  -- Meta
  setup_tags text[],      -- Array of tags e.g. ["Breakout", "EMA Cross"]
  notes text,
  images text[],          -- URLs to storage
  
  -- Social & Sharing (Fase 3/5)
  is_shared boolean default false,
  shared_at timestamp with time zone,
  share_token text unique,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. SUBSCRIPTIONS (Monetization: Fase 4)
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null default 'free',
  status text default 'active',
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription" on subscriptions
  for select using (auth.uid() = user_id);

-- Indexing for performance
create index trades_user_id_idx on public.trades(user_id);
create index trades_account_id_idx on public.trades(account_id);
create index trades_symbol_idx on public.trades(symbol);
create index trades_entry_date_idx on public.trades(entry_date);

alter table public.trades enable row level security;

create policy "Users can CRUD own trades" on trades
  for all using (auth.uid() = user_id);

-- Optional: Tags Table (If we want centralized tag management later)
create table public.tags (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  category text check (category in ('STRATEGY', 'EMOTION', 'MISTAKE')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, name, category)
);

alter table public.tags enable row level security;

create policy "Users can CRUD own tags" on tags
  for all using (auth.uid() = user_id);

-- 6. JOURNAL ENTRIES (Trader thoughts and reflections)
create table public.journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  content text not null,
  tags text[] default '{}',
  mood text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.journal_entries enable row level security;

create policy "Users can CRUD own entries" on journal_entries
  for all using (auth.uid() = user_id);

