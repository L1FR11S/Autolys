#!/usr/bin/env node
// Seed-skript: Matar in alla NGM Nordic SME-bolag i Supabase
// Kör med: node scripts/seed-ngm-companies.mjs

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const base = "https://www.ngm.se/marknaden/vardepapper?symbol=";
const d = new Date().toISOString();
const mk = "Nordic SME";

const companies = [
    { id: "ngm-36grp", name: "36 Group", slug: "36-group", ticker: "36GRP", sector: "Teknik", ngm_url: base + "36GRP" },
    { id: "ngm-abig", name: "Abelco Investment Group", slug: "abelco-investment-group", ticker: "ABIG", sector: "Finans", ngm_url: base + "ABIG" },
    { id: "ngm-advt", name: "Adverty", slug: "adverty", ticker: "ADVT", sector: "Teknik", ngm_url: base + "ADVT" },
    { id: "ngm-afri", name: "Africa Resources", slug: "africa-resources", ticker: "AFRI", sector: "Råvaror", ngm_url: base + "AFRI" },
    { id: "ngm-arbo", name: "Arbona", slug: "arbona", ticker: "ARBO A", sector: "Finans", ngm_url: base + "ARBO%20A" },
    { id: "ngm-argo", name: "Argo Defence Group", slug: "argo-defence-group", ticker: "ARGO", sector: "Industri", ngm_url: base + "ARGO" },
    { id: "ngm-atana", name: "Attana", slug: "attana", ticker: "ATANA", sector: "Hälsovård", ngm_url: base + "ATANA" },
    { id: "ngm-avsalt", name: "Avsalt Group", slug: "avsalt-group", ticker: "AVSALT", sector: "Industri", ngm_url: base + "AVSALT" },
    { id: "ngm-blue", name: "BlueLake Mineral", slug: "bluelake-mineral", ticker: "BLUE", sector: "Råvaror", ngm_url: base + "BLUE" },
    { id: "ngm-ship", name: "BlueYield", slug: "blueyield", ticker: "SHIP", sector: "Finans", ngm_url: base + "SHIP" },
    { id: "ngm-brix", name: "Briox", slug: "briox", ticker: "BRIX", sector: "Teknik", ngm_url: base + "BRIX" },
    { id: "ngm-buddy", name: "BuddyPro Group", slug: "buddypro-group", ticker: "BUDDY B", sector: "Teknik", ngm_url: base + "BUDDY%20B" },
    { id: "ngm-bess", name: "Byhmgard", slug: "byhmgard", ticker: "BESS", sector: "Fastigheter", ngm_url: base + "BESS" },
    { id: "ngm-cardeo", name: "Cardeon", slug: "cardeon", ticker: "CARDEO", sector: "Hälsovård", ngm_url: base + "CARDEO" },
    { id: "ngm-coegin", name: "Coegin Pharma", slug: "coegin-pharma", ticker: "COEGIN", sector: "Hälsovård", ngm_url: base + "COEGIN" },
    { id: "ngm-cret", name: "Creturner Group", slug: "creturner-group", ticker: "CRET", sector: "Teknik", ngm_url: base + "CRET" },
    { id: "ngm-crwn", name: "Crown Energy", slug: "crown-energy", ticker: "CRWN", sector: "Energi", ngm_url: base + "CRWN" },
    { id: "ngm-crust", name: "Crustal Resources", slug: "crustal-resources", ticker: "CRUST B", sector: "Råvaror", ngm_url: base + "CRUST%20B" },
    { id: "ngm-diah", name: "Diadrom Holding", slug: "diadrom-holding", ticker: "DIAH", sector: "Teknik", ngm_url: base + "DIAH" },
    { id: "ngm-div", name: "Dividend Sweden", slug: "dividend-sweden", ticker: "DIV B", sector: "Finans", ngm_url: base + "DIV%20B" },
    { id: "ngm-ecc", name: "Ecoclime Group", slug: "ecoclime-group", ticker: "ECC B", sector: "Industri", ngm_url: base + "ECC%20B" },
    { id: "ngm-ecomb", name: "ECOMB", slug: "ecomb", ticker: "ECOMB", sector: "Energi", ngm_url: base + "ECOMB" },
    { id: "ngm-emart", name: "EmbeddedArt Group", slug: "embeddedart-group", ticker: "EMART", sector: "Teknik", ngm_url: base + "EMART" },
    { id: "ngm-enrad", name: "Enrad", slug: "enrad", ticker: "ENRAD", sector: "Energi", ngm_url: base + "ENRAD" },
    { id: "ngm-bat", name: "Eurobattery Minerals", slug: "eurobattery-minerals", ticker: "BAT", sector: "Råvaror", ngm_url: base + "BAT" },
    { id: "ngm-f2m", name: "Free2Move Holding", slug: "free2move-holding", ticker: "F2M", sector: "Teknik", ngm_url: base + "F2M" },
    { id: "ngm-frnt", name: "Front Ventures", slug: "front-ventures", ticker: "FRNT B", sector: "Finans", ngm_url: base + "FRNT%20B" },
    { id: "ngm-frwa", name: "Frontwalker", slug: "frontwalker", ticker: "FRWA B", sector: "Teknik", ngm_url: base + "FRWA%20B" },
    { id: "ngm-thrill", name: "Gamethrill", slug: "gamethrill", ticker: "THRILL", sector: "Teknik", ngm_url: base + "THRILL" },
    { id: "ngm-garpco", name: "Garpco", slug: "garpco", ticker: "GARPCO B", sector: "Industri", ngm_url: base + "GARPCO%20B" },
    { id: "ngm-gtg", name: "Gold Town Games", slug: "gold-town-games", ticker: "GTG", sector: "Teknik", ngm_url: base + "GTG" },
    { id: "ngm-btcx", name: "Goobit Group", slug: "goobit-group", ticker: "BTCX", sector: "Finans", ngm_url: base + "BTCX" },
    { id: "ngm-gmerc", name: "GreenMerc", slug: "greenmerc", ticker: "GMERC B", sector: "Industri", ngm_url: base + "GMERC%20B" },
    { id: "ngm-h100", name: "H100 Group", slug: "h100-group", ticker: "H100", sector: "Industri", ngm_url: base + "H100" },
    { id: "ngm-hmply", name: "Hemply Balance Holding", slug: "hemply-balance-holding", ticker: "HMPLY", sector: "Hälsovård", ngm_url: base + "HMPLY" },
    { id: "ngm-holdfl", name: "Holdflight", slug: "holdflight", ticker: "HOLDFL", sector: "Industri", ngm_url: base + "HOLDFL" },
    { id: "ngm-hyco", name: "Hybricon", slug: "hybricon", ticker: "HYCO", sector: "Industri", ngm_url: base + "HYCO" },
    { id: "ngm-imho", name: "IMHO Intermedia House", slug: "imho-intermedia-house", ticker: "IMHO B", sector: "Tjänster", ngm_url: base + "IMHO%20B" },
    { id: "ngm-infra", name: "Infracom", slug: "infracom", ticker: "INFRA", sector: "Teknik", ngm_url: base + "INFRA" },
    { id: "ngm-jdt", name: "JonDeTech Sensors", slug: "jondetech-sensors", ticker: "JDT", sector: "Teknik", ngm_url: base + "JDT" },
    { id: "ngm-gate", name: "Jumpgate", slug: "jumpgate", ticker: "GATE", sector: "Teknik", ngm_url: base + "GATE" },
    { id: "ngm-kobr", name: "Kopparbergs", slug: "kopparbergs", ticker: "KOBR B", sector: "Konsument", ngm_url: base + "KOBR%20B" },
    { id: "ngm-kvix", name: "Kvix", slug: "kvix", ticker: "KVIX", sector: "Teknik", ngm_url: base + "KVIX" },
    { id: "ngm-latf", name: "Latvian Forest Company", slug: "latvian-forest-company", ticker: "LATF B", sector: "Råvaror", ngm_url: base + "LATF%20B" },
    { id: "ngm-levbio", name: "Level Bio", slug: "level-bio", ticker: "LEVBIO", sector: "Hälsovård", ngm_url: base + "LEVBIO" },
    { id: "ngm-lair", name: "LightAir", slug: "lightair", ticker: "LAIR", sector: "Hälsovård", ngm_url: base + "LAIR" },
    { id: "ngm-linkab", name: "Link Prop Investment", slug: "link-prop-investment", ticker: "LINKAB", sector: "Fastigheter", ngm_url: base + "LINKAB" },
    { id: "ngm-lohilo", name: "Lohilo Foods", slug: "lohilo-foods", ticker: "LOHILO", sector: "Konsument", ngm_url: base + "LOHILO" },
    { id: "ngm-lumito", name: "Lumito", slug: "lumito", ticker: "LUMITO", sector: "Hälsovård", ngm_url: base + "LUMITO" },
    { id: "ngm-mahvie", name: "Mahvie Minerals", slug: "mahvie-minerals", ticker: "MAHVIE", sector: "Råvaror", ngm_url: base + "MAHVIE" },
    { id: "ngm-mclr", name: "Medclair", slug: "medclair", ticker: "MCLR", sector: "Hälsovård", ngm_url: base + "MCLR" },
    { id: "ngm-megr", name: "Mediacle Group", slug: "mediacle-group", ticker: "MEGR", sector: "Tjänster", ngm_url: base + "MEGR" },
    { id: "ngm-nxar", name: "Nexar Group", slug: "nexar-group", ticker: "NXAR", sector: "Teknik", ngm_url: base + "NXAR" },
    { id: "ngm-ngs", name: "NGS Group", slug: "ngs-group", ticker: "NGS", sector: "Tjänster", ngm_url: base + "NGS" },
    { id: "ngm-niutec", name: "Niutech Group", slug: "niutech-group", ticker: "NIUTEC", sector: "Energi", ngm_url: base + "NIUTEC" },
    { id: "ngm-node", name: "Nodebis Applications", slug: "nodebis-applications", ticker: "NODE", sector: "Teknik", ngm_url: base + "NODE" },
    { id: "ngm-nordig", name: "Nord Insuretech Group", slug: "nord-insuretech-group", ticker: "NORDIG", sector: "Finans", ngm_url: base + "NORDIG" },
    { id: "ngm-caps", name: "Northern CapSek Ventures", slug: "northern-capsek-ventures", ticker: "CAPS", sector: "Finans", ngm_url: base + "CAPS" },
    { id: "ngm-nosium", name: "NOSIUM", slug: "nosium", ticker: "NOSIUM B", sector: "Industri", ngm_url: base + "NOSIUM%20B" },
    { id: "ngm-nowo", name: "Nowonomics", slug: "nowonomics", ticker: "NOWO", sector: "Teknik", ngm_url: base + "NOWO" },
    { id: "ngm-pixel", name: "PixelFox", slug: "pixelfox", ticker: "PIXEL", sector: "Teknik", ngm_url: base + "PIXEL" },
    { id: "ngm-pixfam", name: "Pixfam", slug: "pixfam", ticker: "PIXFAM", sector: "Teknik", ngm_url: base + "PIXFAM" },
    { id: "ngm-polymer", name: "Polymer Factory", slug: "polymer-factory", ticker: "POLYMER", sector: "Industri", ngm_url: base + "POLYMER" },
    { id: "ngm-phyr", name: "Preservia Hyresfastigheter", slug: "preservia-hyresfastigheter", ticker: "PHYR B", sector: "Fastigheter", ngm_url: base + "PHYR%20B" },
    { id: "ngm-prld", name: "Prolight Diagnostics", slug: "prolight-diagnostics", ticker: "PRLD", sector: "Hälsovård", ngm_url: base + "PRLD" },
    { id: "ngm-qbrick", name: "Qbrick", slug: "qbrick", ticker: "QBRICK", sector: "Teknik", ngm_url: base + "QBRICK" },
    { id: "ngm-rmdx", name: "Railway Metrics and Dynamics", slug: "railway-metrics-and-dynamics", ticker: "RMDX", sector: "Industri", ngm_url: base + "RMDX" },
    { id: "ngm-rlos", name: "RanLOS", slug: "ranlos", ticker: "RLOS B", sector: "Teknik", ngm_url: base + "RLOS%20B" },
    { id: "ngm-real", name: "Real Fastigheter", slug: "real-fastigheter", ticker: "REAL", sector: "Fastigheter", ngm_url: base + "REAL" },
    { id: "ngm-rlvnc", name: "Relevance Communication Nordic", slug: "relevance-communication", ticker: "RLVNC", sector: "Tjänster", ngm_url: base + "RLVNC" },
    { id: "ngm-rent", name: "Rentunder Holding", slug: "rentunder-holding", ticker: "RENT", sector: "Fastigheter", ngm_url: base + "RENT" },
    { id: "ngm-slg", name: "Safe Lane Gaming", slug: "safe-lane-gaming", ticker: "SLG B", sector: "Teknik", ngm_url: base + "SLG%20B" },
    { id: "ngm-state", name: "Safestate Group", slug: "safestate-group", ticker: "STATE", sector: "Industri", ngm_url: base + "STATE" },
    { id: "ngm-sars", name: "SARSYS", slug: "sarsys", ticker: "SARS", sector: "Teknik", ngm_url: base + "SARS" },
    { id: "ngm-sds", name: "Seamless Distribution Systems", slug: "seamless-distribution", ticker: "SDS", sector: "Teknik", ngm_url: base + "SDS" },
    { id: "ngm-sehed", name: "SEHED Byggmästargruppen", slug: "sehed-byggmastargruppen", ticker: "SEHED B", sector: "Industri", ngm_url: base + "SEHED%20B" },
    { id: "ngm-stva", name: "Star Vault", slug: "star-vault", ticker: "STVA B", sector: "Teknik", ngm_url: base + "STVA%20B" },
    { id: "ngm-sbg", name: "StoneBeach Group", slug: "stonebeach-group", ticker: "SBG", sector: "Finans", ngm_url: base + "SBG" },
    { id: "ngm-sens", name: "Sustainable Energy Solutions", slug: "sustainable-energy-solutions", ticker: "SENS", sector: "Energi", ngm_url: base + "SENS" },
    { id: "ngm-synexo", name: "Synexo Group", slug: "synexo-group", ticker: "SYNEXO", sector: "Industri", ngm_url: base + "SYNEXO" },
    { id: "ngm-tcc", name: "TCECUR Sweden", slug: "tcecur-sweden", ticker: "TCC A", sector: "Teknik", ngm_url: base + "TCC%20A" },
    { id: "ngm-thinc", name: "Thinc", slug: "thinc", ticker: "THINC", sector: "Teknik", ngm_url: base + "THINC" },
    { id: "ngm-tpgr", name: "Time People Group", slug: "time-people-group", ticker: "TPGR", sector: "Tjänster", ngm_url: base + "TPGR" },
    { id: "ngm-trml", name: "Trainimal", slug: "trainimal", ticker: "TRML", sector: "Teknik", ngm_url: base + "TRML" },
    { id: "ngm-trnsf", name: "Transfer Group", slug: "transfer-group", ticker: "TRNSF", sector: "Teknik", ngm_url: base + "TRNSF" },
    { id: "ngm-tiro", name: "Transiro Holding", slug: "transiro-holding", ticker: "TIRO", sector: "Teknik", ngm_url: base + "TIRO" },
    { id: "ngm-triona", name: "Triona", slug: "triona", ticker: "TRIONA", sector: "Teknik", ngm_url: base + "TRIONA" },
    { id: "ngm-valuno", name: "Valuno Group", slug: "valuno-group", ticker: "VALUNO", sector: "Finans", ngm_url: base + "VALUNO" },
    { id: "ngm-wondr", name: "Wonderboo Holding", slug: "wonderboo-holding", ticker: "WONDR", sector: "Teknik", ngm_url: base + "WONDR" },
].map(c => ({
    name: c.name,
    slug: c.slug,
    ticker: c.ticker,
    sector: c.sector,
    market_list: mk,
    description: "",
    logo_url: null,
    website_url: null,
    rss_feed_url: c.ngm_url,
    is_fairvalue_customer: false,
    created_at: d,
    updated_at: d,
}));

async function main() {
    console.log(`🌱 Seeder NGM Nordic SME – ${companies.length} bolag`);

    const { error } = await supabase
        .from("companies")
        .upsert(companies, { onConflict: "slug", ignoreDuplicates: true });

    if (error) {
        console.error("❌ Fel:", error.message);
        process.exit(1);
    }

    console.log(`✅ Klart! ${companies.length} bolag seedade i Supabase.`);
}

main();
