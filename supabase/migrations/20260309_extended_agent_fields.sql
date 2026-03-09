-- ===== Utöka press_releases med fler agent-fält =====
alter table public.press_releases
  add column if not exists takeaways        jsonb,  -- AI-takeaways: [{ text, type }]
  add column if not exists datapunkter      jsonb,  -- Strukturerade datapunkter: [{ label, value }]
  add column if not exists relevance        text,   -- 'hög' | 'medel' | 'låg'
  add column if not exists analyzed_at      timestamptz;

-- ===== Utöka companies med agent-genererade fält =====
alter table public.companies
  add column if not exists geographic_exposure   jsonb,  -- [{ country, level, segments, risks }]
  add column if not exists management_comments   jsonb,  -- [{ quote, person, title, date, source_url }]
  add column if not exists similar_companies     jsonb,  -- [{ name, ticker, sector }]
  add column if not exists upcoming_reports      jsonb;  -- [{ date, type, description }]

comment on column public.companies.geographic_exposure is
  'Geografisk exponering genererad av AI: [{ country, level: high|med|low, segments, risks }]';
comment on column public.companies.management_comments is
  'Ledningscitat extraherade av AI: [{ quote, person, title, date, source_url }]';
