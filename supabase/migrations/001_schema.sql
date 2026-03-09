-- =============================================
-- Autolys Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. Companies
-- =============================================
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  ticker TEXT NOT NULL,
  sector TEXT NOT NULL DEFAULT 'Övrigt',
  market_list TEXT NOT NULL DEFAULT 'Okänd',
  description TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  website_url TEXT,
  rss_feed_url TEXT,
  is_fairvalue_customer BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_ticker ON companies(ticker);
CREATE INDEX IF NOT EXISTS idx_companies_sector ON companies(sector);

-- =============================================
-- 2. Press Releases
-- =============================================
CREATE TABLE IF NOT EXISTS press_releases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  source_url TEXT NOT NULL DEFAULT '',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  category TEXT,
  ai_summary TEXT,
  key_takeaways JSONB,
  sentiment_score REAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pr_company ON press_releases(company_id);
CREATE INDEX IF NOT EXISTS idx_pr_published ON press_releases(published_at DESC);

-- =============================================
-- 3. User Follows
-- =============================================
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_user ON user_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_follows_company ON user_follows(company_id);

-- =============================================
-- 4. AI Summaries
-- =============================================
CREATE TABLE IF NOT EXISTS ai_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  summary_type TEXT NOT NULL DEFAULT 'overview',
  content TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_company ON ai_summaries(company_id);

-- =============================================
-- 5. Auto-update updated_at trigger
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. Row Level Security (RLS)
-- =============================================

-- Companies: everyone can read
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Companies are viewable by everyone"
  ON companies FOR SELECT
  USING (true);

-- Press Releases: everyone can read
ALTER TABLE press_releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Press releases are viewable by everyone"
  ON press_releases FOR SELECT
  USING (true);

-- User Follows: users manage their own follows
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own follows"
  ON user_follows FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own follows"
  ON user_follows FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own follows"
  ON user_follows FOR DELETE
  USING (auth.uid() = user_id);

-- AI Summaries: everyone can read
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "AI summaries are viewable by everyone"
  ON ai_summaries FOR SELECT
  USING (true);

-- =============================================
-- 7. Seed Data
-- =============================================

INSERT INTO companies (name, slug, ticker, sector, market_list, description, is_fairvalue_customer, website_url) VALUES
  ('Plejd', 'plejd', 'PLEJD', 'Teknik', 'First North', 'Plejd utvecklar produkter och tjänster för smart belysningsstyrning. Bolaget erbjuder trådlösa dimmrar, LED-drivrutiner och en molnbaserad plattform för styrning och övervakning.', true, 'https://www.plejd.com'),
  ('HomeMaid', 'homemaid', 'HOME B', 'Tjänster', 'First North', 'HomeMaid erbjuder hushållsnära tjänster som städning, fönsterputs och trädgårdsskötsel. Bolaget erbjuder RUT-avdragsberättigade tjänster.', true, 'https://www.homemaid.se'),
  ('EQL Pharma', 'eql-pharma', 'EQL', 'Hälsovård', 'First North', 'EQL Pharma utvecklar och säljer generiska läkemedel på den nordiska marknaden. Bolaget fokuserar på nischade terapiområden.', true, 'https://www.eqlpharma.com'),
  ('Fortnox', 'fortnox', 'FNOX', 'Teknik', 'Mid Cap', 'Fortnox erbjuder molnbaserade ekonomisystem för småföretag. Plattformen inkluderar bokföring, fakturering och lönehantering.', false, 'https://www.fortnox.se'),
  ('Hexatronic', 'hexatronic', 'HTRO', 'Industri', 'Mid Cap', 'Hexatronic Group utvecklar och levererar fiberoptiska kommunikationslösningar. Bolaget är verksamt globalt med fokus på bredbandsinfrastruktur.', false, 'https://www.hexatronic.com'),
  ('MIPS', 'mips', 'MIPS', 'Teknik', 'Mid Cap', 'MIPS (Multi-directional Impact Protection System) utvecklar hjälmsäkerhetsteknologi som skyddar mot rotationsrörelser vid sneda stötar.', false, 'https://www.mipsprotection.com'),
  ('Sdiptech', 'sdiptech', 'SDIP B', 'Industri', 'Mid Cap', 'Sdiptech är en teknikkoncern som förvärvar och utvecklar nischade teknikbolag inom infrastruktur. Fokus på urbanisering och hållbarhet.', false, 'https://www.sdiptech.com'),
  ('Swedencare', 'swedencare', 'SECARE', 'Hälsovård', 'First North', 'Swedencare utvecklar och säljer premiumdjurvårdsprodukter globalt. Produktportföljen inkluderar kosttillskott och munvårdsprodukter.', false, 'https://www.swedencare.com')
ON CONFLICT (slug) DO NOTHING;

-- Insert press releases (reference companies by sub-select)
INSERT INTO press_releases (company_id, title, source_url, published_at, category, ai_summary, key_takeaways, sentiment_score) VALUES
  (
    (SELECT id FROM companies WHERE slug = 'hexatronic'),
    'Hexatronic säkrar stor order från amerikansk telekomoperatör',
    'https://hexatronic.com/press/order-2026',
    '2026-03-07 14:00:00+01',
    'Ordernyhet',
    'Hexatronic säkrar en stor order på 120 MSEK från en amerikansk telekomoperatör. Ordern avser fiberoptisk kablage med leverans under första halvåret 2026. Ett ytterligare bevis på bolagets starka position i Nordamerika.',
    '["Order värd 120 MSEK", "Leverans H1 2026", "Stärkt position i USA"]'::jsonb,
    0.7
  ),
  (
    (SELECT id FROM companies WHERE slug = 'eql-pharma'),
    'EQL Pharma erhåller marknadsgodkännande för ny generisk specialprodukt',
    'https://eqlpharma.com/press/approval-2026',
    '2026-03-05 08:00:00+01',
    'Regulatoriskt',
    'EQL Pharma har erhållit marknadsgodkännande för en ny generisk specialprodukt. Lansering planeras till Q2 2026 med uppskattat årligt omsättningsbidrag på 8–12 MSEK. Godkännandet stärker bolagets pipeline-strategi.',
    '["Marknadsgodkännande erhållet", "Lansering Q2 2026", "Bidrag 8-12 MSEK/år"]'::jsonb,
    0.6
  ),
  (
    (SELECT id FROM companies WHERE slug = 'plejd'),
    'Plejd tecknar avtal med stor nordisk fastighetsaktör',
    'https://plejd.com/press/avtal-2026',
    '2026-03-01 08:30:00+01',
    'Ordernyhet',
    'Plejd har säkrat ett treårigt ramavtal med en stor nordisk fastighetsaktör värt 15–20 MSEK. Avtalet bekräftar Plejds starka position inom kommersiell smart belysning och markerar en viktig expansion från privatmarknaden till kommersiella fastigheter.',
    '["Ramavtal värt 15–20 MSEK över tre år", "Med en av Nordens största fastighetsbolag", "Expansion till kommersiella fastigheter"]'::jsonb,
    0.8
  ),
  (
    (SELECT id FROM companies WHERE slug = 'mips'),
    'MIPS tecknar nytt licensavtal med global hjälmtillverkare',
    'https://mips.com/press/license-2026',
    '2026-02-28 10:00:00+01',
    'Partnerskap',
    'MIPS tecknar nytt licensavtal med en global hjälmtillverkare inom cykel. Partnerns premiumsortiment kommer integrera MIPS-teknologin från 2026. Avtalet expanderar MIPS närvaro inom premium-cykelsegmentet.',
    '["Nytt licensavtal med global tillverkare", "Integration i premiumsortiment", "Expansion inom cykelsegmentet"]'::jsonb,
    0.5
  ),
  (
    (SELECT id FROM companies WHERE slug = 'homemaid'),
    'HomeMaid visar stabil tillväxt i Q4 2025',
    'https://homemaid.se/press/q4-2025',
    '2026-02-20 09:00:00+01',
    'Rapport',
    'HomeMaid visar stabil tillväxt med 12% omsättningsökning till 182 MSEK i Q4 2025. Rörelsemarginalen var 8,5% och bolaget fortsätter sin geografiska expansion med två nya kontor.',
    '["12% omsättningsökning till 182 MSEK", "Rörelsemarginal 8,5%", "Två nya kontor öppnade"]'::jsonb,
    0.4
  ),
  (
    (SELECT id FROM companies WHERE slug = 'plejd'),
    'Plejd rapporterar 28% omsättningstillväxt i Q4 2025',
    'https://plejd.com/press/q4-2025',
    '2026-02-15 09:00:00+01',
    'Rapport',
    'Plejd rapporterar 28% omsättningstillväxt i Q4 2025 med förbättrad EBITDA-marginal på 22%. Den nya Plejd Gateway 2.0 har lanserats med förbättrad anslutnigsstabilitet. Bolaget ser ökad efterfrågan från kommersiella segment.',
    '["28% omsättningstillväxt", "EBITDA-marginal 22%", "Plejd Gateway 2.0 lanserad"]'::jsonb,
    0.8
  ),
  (
    (SELECT id FROM companies WHERE slug = 'fortnox'),
    'Fortnox levererar rekordår med 2,4 miljarder SEK i intäkter',
    'https://fortnox.se/press/q4-2025',
    '2026-02-05 08:00:00+01',
    'Rapport',
    'Fortnox levererar rekordår med 2,4 miljarder SEK i intäkter (+25%) och 550 000+ kunder. EBIT-marginalen steg till 38%. VD nämner dock ökad konkurrens från AI-drivna redovisningsverktyg som en framtida utmaning.',
    '["Intäkter 2,4 miljarder SEK (+25%)", "550 000+ kunder", "EBIT-marginal 38%", "Ökad konkurrens från AI-verktyg"]'::jsonb,
    0.3
  );
