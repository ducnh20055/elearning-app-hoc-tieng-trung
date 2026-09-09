create table if not exists public.profiles (
    id uuid references auth.users(id) primary key,
    full_name text,
    chinese_level text,
    motivations text[],
    interests text[],
    onboarding_completed boolean default false, 
    is_prenium boolean default false,
    prenium_expires_at timestamp with time zone, 
    updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "User can read own profile" on public.profiles
    for select using (auth.uid() = id);

create policy "User can insert own profile" on public.profiles
    for insert with check (auth.uid() = id);

create policy "User can update own profile" on public.profiles
    for UPDATE using (auth.uid() = id)
    with check (auth.uid() = id);

revoke update on table public.profiles from authenticated;
revoke insert on table public.profiles from authenticated;

grant select on table public.profiles to authenticated;

grant insert (
    id,
    full_name,
    chinese_level,
    motivations,
    interests,
    onboarding_completed,   
    updated_at
) on table public.profiles to authenticated;

grant update (
    id,
    full_name,
    chinese_level,
    motivations,
    interests,
    onboarding_completed,   
    updated_at
) on table public.profiles to authenticated;