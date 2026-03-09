/* ===== Seed data for Autolys MVP ===== */
import { Company, PressRelease } from "@/types";
import { ngmCompanies } from "./ngm_companies";

export const seedCompanies: Company[] = [
    {
        id: "c1",
        name: "Plejd",
        slug: "plejd",
        ticker: "PLEJD",
        sector: "Teknik",
        market_list: "First North",
        description:
            "Plejd utvecklar produkter och tjänster för smart belysningsstyrning. Bolaget erbjuder trådlösa dimmrar, LED-drivrutiner och en molnbaserad plattform för styrning och övervakning.",
        logo_url: null,
        website_url: "https://www.plejd.com",
        rss_feed_url: null,
        is_fairvalue_customer: true,
        created_at: "2025-01-01T00:00:00Z",
    },
    {
        id: "c2",
        name: "HomeMaid",
        slug: "homemaid",
        ticker: "HOME B",
        sector: "Tjänster",
        market_list: "First North",
        description:
            "HomeMaid erbjuder hushållsnära tjänster som städning, fönsterputsning och trädgårdsskötsel. Bolaget verkar genom dotterbolagen HomeMaid och Betjänten.",
        logo_url: null,
        website_url: "https://www.homemaid.se",
        rss_feed_url: null,
        is_fairvalue_customer: true,
        created_at: "2025-01-01T00:00:00Z",
    },
    {
        id: "c3",
        name: "EQL Pharma",
        slug: "eql-pharma",
        ticker: "EQL",
        sector: "Hälsovård",
        market_list: "First North",
        description:
            "EQL Pharma utvecklar och säljer generiska specialläkemedel i Norden. Bolaget fokuserar på nischprodukter med begränsad konkurrens.",
        logo_url: null,
        website_url: "https://www.eqlpharma.com",
        rss_feed_url: null,
        is_fairvalue_customer: true,
        created_at: "2025-01-01T00:00:00Z",
    },
    {
        id: "c4",
        name: "Hexatronic",
        slug: "hexatronic",
        ticker: "HTRO",
        sector: "Teknik",
        market_list: "Mid Cap",
        description:
            "Hexatronic Group utvecklar och levererar produkter och lösningar för fiber- och telekommunikationsnätverk. Bolaget är en global aktör inom fiberinfrastruktur.",
        logo_url: null,
        website_url: "https://www.hexatronic.com",
        rss_feed_url: null,
        is_fairvalue_customer: false,
        created_at: "2025-01-01T00:00:00Z",
    },
    {
        id: "c5",
        name: "Fortnox",
        slug: "fortnox",
        ticker: "FNOX",
        sector: "Teknik",
        market_list: "Large Cap",
        description:
            "Fortnox erbjuder molnbaserade ekonomi- och administrativa program för små och medelstora företag. Plattformen inkluderar bokföring, fakturering och lönehantering.",
        logo_url: null,
        website_url: "https://www.fortnox.se",
        rss_feed_url: null,
        is_fairvalue_customer: false,
        created_at: "2025-01-01T00:00:00Z",
    },
    {
        id: "c6",
        name: "Surgical Science",
        slug: "surgical-science",
        ticker: "SUS",
        sector: "Hälsovård",
        market_list: "Mid Cap",
        description:
            "Surgical Science utvecklar och säljer simulatorsystem för medicinsk träning. Bolagets produkter används av sjukhus och utbildningsinstitutioner världen över.",
        logo_url: null,
        website_url: "https://www.surgicalscience.com",
        rss_feed_url: null,
        is_fairvalue_customer: false,
        created_at: "2025-01-01T00:00:00Z",
    },
    {
        id: "c7",
        name: "MIPS",
        slug: "mips",
        ticker: "MIPS",
        sector: "Industri",
        market_list: "Mid Cap",
        description:
            "MIPS utvecklar och säljer ett hjälmbaserat skyddssystem som minskar rotationsrörelser vid sneda slag. Teknologin licenseras till hjälmtillverkare globalt.",
        logo_url: null,
        website_url: "https://www.mipsprotection.com",
        rss_feed_url: null,
        is_fairvalue_customer: false,
        created_at: "2025-01-01T00:00:00Z",
    },
    {
        id: "c8",
        name: "Embrace Change",
        slug: "embrace-change",
        ticker: "EMBC",
        sector: "Teknik",
        market_list: "First North",
        description:
            "Embrace Change är en digital transformationsbyrå som hjälper organisationer att driva förändring genom teknik och data.",
        logo_url: null,
        website_url: null,
        rss_feed_url: null,
        is_fairvalue_customer: true,
        created_at: "2025-01-01T00:00:00Z",
    },
];

export const allCompanies: Company[] = [...seedCompanies, ...ngmCompanies];

export const seedPressReleases: PressRelease[] = [
    {
        id: "pr1",
        company_id: "c1",
        title: "Plejd AB: Bokslutskommuniké 2025",
        content:
            "Plejd redovisar en omsättningstillväxt på 28% under Q4 2025, drivet av stark efterfrågan på smarta belysningslösningar i Norden. EBITDA-marginalen uppgick till 22%, en förbättring med 3 procentenheter jämfört med samma period föregående år. Under kvartalet lanserades den nya Plejd Gateway 2.0 som förbättrar anslutningsstabiliteten.",
        source_url: "https://example.com/plejd-q4-2025",
        published_at: "2026-02-15T08:00:00Z",
        category: "Rapport",
        ai_summary:
            "Plejd rapporterar 28% omsättningstillväxt i Q4 2025 med förbättrad EBITDA-marginal på 22%. Den nya Plejd Gateway 2.0 har lanserats med förbättrad anslutningsstabilitet. Bolaget visar stark momentum i den nordiska marknaden för smarta belysningslösningar.",
        key_takeaways: [
            "28% omsättningstillväxt i Q4 2025",
            "EBITDA-marginal förbättrad till 22% (+3pp YoY)",
            "Lansering av Plejd Gateway 2.0",
            "Stark efterfrågan i Norden",
        ],
        sentiment_score: 0.75,
        created_at: "2026-02-15T08:05:00Z",
    },
    {
        id: "pr2",
        company_id: "c1",
        title: "Plejd tecknar avtal med stor nordisk fastighetsaktör",
        content:
            "Plejd har tecknat ett ramavtal med en av Nordens största fastighetsbolag för implementering av smarta belysningslösningar i deras fastighetsportfölj. Avtalet har ett uppskattat värde om 15–20 MSEK över tre år.",
        source_url: "https://example.com/plejd-avtal",
        published_at: "2026-03-01T07:30:00Z",
        category: "Ordernyhet",
        ai_summary:
            "Plejd har säkrat ett treårigt ramavtal med en stor nordisk fastighetsaktör värt 15–20 MSEK. Avtalet bekräftar Plejds starka position inom kommersiell smart belysning och markerar en viktig expansion från privatmarknaden till kommersiella fastigheter.",
        key_takeaways: [
            "Ramavtal värt 15–20 MSEK över tre år",
            "Med en av Nordens största fastighetsbolag",
            "Expansion till kommersiella fastigheter",
        ],
        sentiment_score: 0.82,
        created_at: "2026-03-01T07:35:00Z",
    },
    {
        id: "pr3",
        company_id: "c2",
        title: "HomeMaid: Delårsrapport Q4 2025",
        content:
            "HomeMaid redovisar en omsättning om 182 MSEK under Q4 2025, en ökning med 12% jämfört med samma period föregående år. Rörelsemarginalen uppgick till 8,5%. Bolaget har under kvartalet expanderat till två nya orter i Mellansverige.",
        source_url: "https://example.com/homemaid-q4-2025",
        published_at: "2026-02-20T08:00:00Z",
        category: "Rapport",
        ai_summary:
            "HomeMaid visar stabil tillväxt med 12% omsättningsökning till 182 MSEK i Q4 2025. Rörelsemarginalen var 8,5% och bolaget fortsätter sin geografiska expansion med två nya orter i Mellansverige. Efterfrågan på hushållsnära tjänster förblir stark.",
        key_takeaways: [
            "12% omsättningstillväxt till 182 MSEK",
            "Rörelsemarginal 8,5%",
            "Expansion till två nya orter i Mellansverige",
        ],
        sentiment_score: 0.45,
        created_at: "2026-02-20T08:05:00Z",
    },
    {
        id: "pr4",
        company_id: "c3",
        title: "EQL Pharma erhåller marknadsgodkännande för ny produkt",
        content:
            "EQL Pharma har fått marknadsgodkännande från Läkemedelsverket för en generisk version av ett välkänt specialläkemedel. Produkten förväntas lanseras under Q2 2026 och bedöms kunna bidra med 8–12 MSEK i årlig omsättning.",
        source_url: "https://example.com/eql-godkannande",
        published_at: "2026-03-05T07:00:00Z",
        category: "Regulatoriskt",
        ai_summary:
            "EQL Pharma har erhållit marknadsgodkännande för en ny generisk specialprodukt. Lansering planeras till Q2 2026 med uppskattat årligt omsättningsbidrag på 8–12 MSEK. Godkännandet stärker bolagets produktportfölj och bekräftar strategin att fokusera på nischade generika.",
        key_takeaways: [
            "Marknadsgodkännande från Läkemedelsverket",
            "Planerad lansering Q2 2026",
            "Bedömt omsättningsbidrag: 8–12 MSEK årligen",
            "Stärker strategi inom nischade generika",
        ],
        sentiment_score: 0.68,
        created_at: "2026-03-05T07:05:00Z",
    },
    {
        id: "pr5",
        company_id: "c5",
        title: "Fortnox: Året som gått — Årsredovisning 2025",
        content:
            "Fortnox redovisar rekordintäkter om 2,4 miljarder SEK för helåret 2025, en tillväxt på 25%. Antalet kunder passerade 550 000 under året. EBIT-marginalen stärktes till 38%. Bolaget flaggar dock för ökad konkurrens inom AI-drivna redovisningstjänster.",
        source_url: "https://example.com/fortnox-ar-2025",
        published_at: "2026-02-05T07:00:00Z",
        category: "Rapport",
        ai_summary:
            "Fortnox levererar rekordår med 2,4 miljarder SEK i intäkter (+25%) och 550 000+ kunder. EBIT-marginalen steg till 38%. VD nämner dock ökad konkurrens från AI-drivna redovisningstjänster som en framtida utmaning att hantera.",
        key_takeaways: [
            "Rekordintäkter: 2,4 miljarder SEK (+25%)",
            "550 000+ kunder",
            "EBIT-marginal 38%",
            "VD flaggar för ökad AI-konkurrens",
        ],
        sentiment_score: 0.55,
        created_at: "2026-02-05T07:05:00Z",
    },
    {
        id: "pr6",
        company_id: "c4",
        title: "Hexatronic: Stor order från amerikansk operatör",
        content:
            "Hexatronic har mottagit en order värd 120 MSEK från en ledande amerikansk telekomoperatör avseende fiberoptisk kablage. Leverans planeras under H1 2026.",
        source_url: "https://example.com/hexatronic-order",
        published_at: "2026-03-07T13:00:00Z",
        category: "Ordernyhet",
        ai_summary:
            "Hexatronic säkrar en stor order på 120 MSEK från en amerikansk telekomoperatör. Ordern avser fiberoptisk kablage med leverans under första halvåret 2026. Ett ytterligare bevis på Hexatronics starka position på den amerikanska marknaden.",
        key_takeaways: [
            "Order värd 120 MSEK",
            "Från ledande amerikansk telekomoperatör",
            "Leverans H1 2026",
        ],
        sentiment_score: 0.8,
        created_at: "2026-03-07T13:05:00Z",
    },
    {
        id: "pr7",
        company_id: "c7",
        title: "MIPS genomför framgångsrikt licensavtal med ny partner",
        content:
            "MIPS har tecknat ett nytt licensavtal med en global hjälmtillverkare inom cykelsegmentet. Avtalet innebär att MIPS-teknologin kommer att integreras i partnerens premiumsortiment från 2026.",
        source_url: "https://example.com/mips-licensavtal",
        published_at: "2026-02-28T09:00:00Z",
        category: "Partnerskap",
        ai_summary:
            "MIPS tecknar nytt licensavtal med en global hjälmtillverkare inom cykel. Partnerns premiumsortiment kommer integrera MIPS-teknologin från 2026. Avtalet expanderar MIPS närvaro inom cykelsegmentet och stärker den globala tillväxtstrategin.",
        key_takeaways: [
            "Nytt licensavtal med global hjälmtillverkare",
            "Integration i premiumsortiment 2026",
            "Expansion inom cykelsegmentet",
        ],
        sentiment_score: 0.65,
        created_at: "2026-02-28T09:05:00Z",
    },
];
