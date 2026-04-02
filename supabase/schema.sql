-- =============================================
-- Lagablab Youth Camp Tally Board
-- Supabase SQL Migration
-- Run this in your Supabase SQL Editor
-- =============================================

-- Teams
create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  color text not null default '#6366f1',
  created_at timestamptz not null default now()
);

-- Members
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  name text not null,
  role text not null check (role in ('Leader', 'Assistant Leader', 'Member')),
  created_at timestamptz not null default now()
);

-- Games
create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  points_1st integer not null default 100,
  points_2nd integer not null default 70,
  points_3rd integer not null default 50,
  points_4th integer not null default 30,
  created_at timestamptz not null default now()
);

-- Game Scores
-- Each team can only have one rank per game, and each rank can only be assigned to one team per game
create table if not exists game_scores (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  rank integer not null check (rank between 1 and 4),
  created_at timestamptz not null default now(),
  unique (game_id, team_id),
  unique (game_id, rank)
);

-- Missions
create table if not exists missions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  points integer not null default 50,
  created_at timestamptz not null default now()
);

-- Mission Completions (one-time per team per mission)
create table if not exists mission_completions (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references missions(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (mission_id, team_id)
);

-- Deductions
create table if not exists deductions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  amount integer not null check (amount > 0),
  reason text not null,
  created_at timestamptz not null default now()
);

-- =============================================
-- Row Level Security (RLS)
-- Public read, anon write (internal camp tool)
-- =============================================

alter table teams enable row level security;
alter table members enable row level security;
alter table games enable row level security;
alter table game_scores enable row level security;
alter table missions enable row level security;
alter table mission_completions enable row level security;
alter table deductions enable row level security;

-- Teams
create policy "Public read teams" on teams for select using (true);
create policy "Anon insert teams" on teams for insert with check (true);
create policy "Anon update teams" on teams for update using (true);
create policy "Anon delete teams" on teams for delete using (true);

-- Members
create policy "Public read members" on members for select using (true);
create policy "Anon insert members" on members for insert with check (true);
create policy "Anon update members" on members for update using (true);
create policy "Anon delete members" on members for delete using (true);

-- Games
create policy "Public read games" on games for select using (true);
create policy "Anon insert games" on games for insert with check (true);
create policy "Anon update games" on games for update using (true);
create policy "Anon delete games" on games for delete using (true);

-- Game Scores
create policy "Public read game_scores" on game_scores for select using (true);
create policy "Anon insert game_scores" on game_scores for insert with check (true);
create policy "Anon update game_scores" on game_scores for update using (true);
create policy "Anon delete game_scores" on game_scores for delete using (true);

-- Missions
create policy "Public read missions" on missions for select using (true);
create policy "Anon insert missions" on missions for insert with check (true);
create policy "Anon update missions" on missions for update using (true);
create policy "Anon delete missions" on missions for delete using (true);

-- Mission Completions
create policy "Public read mission_completions" on mission_completions for select using (true);
create policy "Anon insert mission_completions" on mission_completions for insert with check (true);
create policy "Anon update mission_completions" on mission_completions for update using (true);
create policy "Anon delete mission_completions" on mission_completions for delete using (true);

-- Deductions
create policy "Public read deductions" on deductions for select using (true);
create policy "Anon insert deductions" on deductions for insert with check (true);
create policy "Anon update deductions" on deductions for update using (true);
create policy "Anon delete deductions" on deductions for delete using (true);

-- Team Images (for dashboard background cycling)
create table if not exists team_images (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);

alter table team_images enable row level security;
create policy "Public read team_images" on team_images for select using (true);
create policy "Anon insert team_images" on team_images for insert with check (true);
create policy "Anon delete team_images" on team_images for delete using (true);
