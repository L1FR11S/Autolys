-- ===== Agent Jobs Queue =====
create table if not exists public.agent_jobs (
  id          uuid primary key default gen_random_uuid(),
  agent_type  text not null check (agent_type in ('press_release', 'trigger', 'kpi')),
  status      text not null default 'pending' check (status in ('pending','running','done','failed')),
  payload     jsonb not null default '{}',
  result      jsonb,
  error       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index if not exists idx_agent_jobs_status_type on public.agent_jobs (status, agent_type);

alter table public.agent_jobs enable row level security;
-- Ingen publik access – jobs körs server-side med service_role

-- ===== Utöka press_releases =====
alter table public.press_releases
  add column if not exists triggers      jsonb,
  add column if not exists kpis          jsonb,
  add column if not exists processed_at  timestamptz;

comment on column public.press_releases.triggers is
  'Array av investerings-triggers: [{ type, description, confidence }]';
comment on column public.press_releases.kpis is
  'Array av extraherade nyckeltal: [{ name, value, unit, period }]';
