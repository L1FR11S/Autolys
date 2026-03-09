-- ===== stock_prices tabell =====
create table if not exists public.stock_prices (
  id          uuid primary key default gen_random_uuid(),
  ticker      text not null,          -- t.ex. "ABIG.ST"
  date        date not null,
  open_price  numeric,
  high_price  numeric,
  low_price   numeric,
  close_price numeric not null,
  volume      bigint,
  updated_at  timestamptz default now(),

  unique (ticker, date)
);

-- Index för snabb hämtning per ticker + datum
create index if not exists idx_stock_prices_ticker_date
  on public.stock_prices (ticker, date desc);

-- RLS: publik läsning, ingen skrivning från klienten
alter table public.stock_prices enable row level security;

create policy "Public read stock prices"
  on public.stock_prices for select
  using (true);

-- ===== Lägg till yahoo_ticker på companies =====
alter table public.companies
  add column if not exists yahoo_ticker text;

comment on column public.companies.yahoo_ticker is
  'Yahoo Finance ticker, t.ex. ABIG.ST. Null = kursgraf saknas.';
