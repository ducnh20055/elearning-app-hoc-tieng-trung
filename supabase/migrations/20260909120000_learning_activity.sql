create table if not exists public.learning_activity_events (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  lesson_id text,
  question_id integer,
  scenario_id text,
  is_correct boolean,
  duration_seconds integer,
  occurred_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists learning_activity_events_user_date_idx
  on public.learning_activity_events (user_id, occurred_at desc);

alter table public.learning_activity_events enable row level security;

create policy "Users can read own learning activity"
  on public.learning_activity_events for select
  using (auth.uid() = user_id);

create policy "Users can insert own learning activity"
  on public.learning_activity_events for insert
  with check (auth.uid() = user_id);

create table if not exists public.review_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  content_key text not null,
  lesson_id text not null,
  question_id integer not null,
  next_review_at timestamptz not null,
  interval_days integer not null default 1,
  ease_factor numeric not null default 2.5,
  repetition_count integer not null default 0,
  lapse_count integer not null default 0,
  last_result boolean not null,
  last_attempt_at timestamptz not null,
  primary key (user_id, content_key)
);

alter table public.review_items enable row level security;

create policy "Users can manage own review items"
  on public.review_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id text not null,
  completion_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.lesson_progress enable row level security;

create policy "Users can manage own lesson progress"
  on public.lesson_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);