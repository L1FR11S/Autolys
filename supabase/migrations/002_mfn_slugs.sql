-- 002: Set MFN slugs for RSS feed ingestion
-- Run this in your Supabase SQL editor

-- Update existing companies with their MFN slugs
UPDATE companies SET rss_feed_url = 'plejd' WHERE slug = 'plejd';
UPDATE companies SET rss_feed_url = 'homemaid' WHERE slug = 'homemaid';
UPDATE companies SET rss_feed_url = 'eql-pharma' WHERE slug = 'eql-pharma';
UPDATE companies SET rss_feed_url = 'fortnox' WHERE slug = 'fortnox';
UPDATE companies SET rss_feed_url = 'hexatronic' WHERE slug = 'hexatronic';
UPDATE companies SET rss_feed_url = 'mips' WHERE slug = 'mips';
UPDATE companies SET rss_feed_url = 'sdiptech' WHERE slug = 'sdiptech';
UPDATE companies SET rss_feed_url = 'swedencare' WHERE slug = 'swedencare';

-- Add more companies (20+ to hit MVP target)
INSERT INTO companies (name, slug, ticker, sector, market_list, description, rss_feed_url, is_fairvalue_customer) VALUES
  ('OptiCept Technologies', 'opticept-technologies', 'OPTI', 'Industri', 'First North', 'OptiCept Technologies utvecklar och säljer industriella processystem som använder pulserande elektriska fält och vakuuminfusion.', 'opticept-technologies', false),
  ('Xano Industri', 'xano-industri', 'XANO', 'Industri', 'Small Cap', 'Xano Industri är en teknikorienterad verkstadskoncern med tre affärsenheter.', 'xano-industri', false),
  ('Lagercrantz Group', 'lagercrantz', 'LAGR B', 'Industri', 'Large Cap', 'Lagercrantz Group är en teknikhandelskoncern som erbjuder nischade lösningar inom elektronik, kommunikation och mekanik.', 'lagercrantz-group', false),
  ('Indutrade', 'indutrade', 'INDU', 'Industri', 'Large Cap', 'Indutrade marknadsför och säljer komponenter, system och tjänster med högt tekniskt innehåll inom utvalda nischer.', 'indutrade', false),
  ('Alfa Laval', 'alfa-laval', 'ALFA', 'Industri', 'Large Cap', 'Alfa Laval är en världsledande leverantör av specialiserade produkter och lösningar för värmeöverföring, separation och flödeshantering.', 'alfa-laval', false),
  ('Munters Group', 'munters', 'MNTS', 'Industri', 'Mid Cap', 'Munters är en global ledare inom energieffektiv och hållbar klimatlösningar.', 'munters-group', false),
  ('Nederman Holding', 'nederman', 'NMAN', 'Industri', 'Mid Cap', 'Nederman är en global ledare inom industriell luftfiltrering och resurssmart teknologi.', 'nederman-holding', false),
  ('SciBase Holding', 'scibase', 'SCIB', 'Hälsovård', 'First North', 'SciBase utvecklar och säljer ett medicintekniskt instrument för icke-invasiv diagnos av hudcancer.', 'scibase-holding', false),
  ('Hansa Biopharma', 'hansa-biopharma', 'HNSA', 'Hälsovård', 'Mid Cap', 'Hansa Biopharma är ett banbrytande biofarmaföretag som utvecklar immundämpande enzymer.', 'hansa-biopharma', false),
  ('Gränges', 'granges', 'GRNG', 'Material', 'Mid Cap', 'Gränges är en ledande global leverantör av valsade aluminiumprodukter.', 'granges', false),
  ('Embracer Group', 'embracer', 'EMBRAC B', 'Teknik', 'Large Cap', 'Embracer Group är en global koncern av entreprenörsledda verksamheter inom PC, konsol och mobilspel.', 'embracer-group', false),
  ('Vitrolife', 'vitrolife', 'VITR', 'Hälsovård', 'Large Cap', 'Vitrolife utvecklar, producerar och marknadsför produkter för fertilitetsbehandling.', 'vitrolife', false)
ON CONFLICT (slug) DO UPDATE SET rss_feed_url = EXCLUDED.rss_feed_url;
