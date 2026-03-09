// Test: generera bolagsbeskrivning via RSS-flöde (pressmeddelanden)
// Kör med: node test-description-rss.mjs

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const SUPABASE_URL = "https://pwfznjcdrauvjyhjncew.supabase.co";
const SUPABASE_KEY = "your-supabase-key-here";
const ANTHROPIC_KEY = "your-anthropic-key-here";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const claude = new Anthropic({ apiKey: ANTHROPIC_KEY });

/** Hämta och parsa RSS-flöde – returnerar text från senaste 5 pressmeddelanden */
async function fetchRssText(rssUrl) {
    try {
        console.log(`  Hämtar RSS: ${rssUrl}`);
        const res = await fetch(rssUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; Autolys/1.0)" },
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const xml = await res.text();

        // Extrahera <item>-block
        const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 5);
        if (items.length === 0) return null;

        const texts = items.map((m) => {
            const content = m[1];
            const title = (content.match(/<title[^>]*>([\s\S]*?)<\/title>/) || [])[1] ?? "";
            const desc = (content.match(/<description[^>]*>([\s\S]*?)<\/description>/) || [])[1] ?? "";
            // Rensa CDATA och HTML
            const clean = (s) => s
                .replace(/<!\[CDATA\[|\]\]>/g, "")
                .replace(/<[^>]+>/g, " ")
                .replace(/\s{2,}/g, " ")
                .trim();
            return `• ${clean(title)}\n  ${clean(desc).slice(0, 400)}`;
        });

        return texts.join("\n\n").slice(0, 6000);
    } catch (err) {
        console.warn(`  RSS-fel: ${err.message}`);
        return null;
    }
}

async function generateDescription(company, rssText) {
    const contextSection = rssText
        ? `Bolaget har nyligen kommunicerat följande via pressmeddelanden:\n\n${rssText}`
        : "(Inga pressmeddelanden tillgängliga – basera på allmän branschkunskap.)";

    const prompt = `Du är en finansiell analytiker som skriver korta, faktabaserade bolagsbeskrivningar för en investeringsplattform riktad till svenska privatinvesterare.

Bolag: ${company.name}
Ticker: ${company.ticker}
Sektor: ${company.sector}
Marknadsplats: ${company.market_list}

${contextSection}

Skriv en bolagsbeskrivning på svenska. Den ska:
- Vara 3–4 meningar (ca 100–150 ord)
- Förklara VAD bolaget gör, vilken bransch och geografi
- Baseras på faktisk information från pressmeddelandena ovan
- Vara neutral och faktabaserad (inte säljande)
- Skrivas i tredje person
- INTE innehålla råd om att köpa/sälja aktier

Svara ENBART med beskrivningstexten, inga rubriker eller förklaringar.`;

    const msg = await claude.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
    });

    return msg.content[0].type === "text" ? msg.content[0].text.trim() : null;
}

async function main() {
    // Hämta ett bolag med rss_feed_url och utan description (exkl BlueLake som vi redan testat)
    const { data: companies } = await supabase
        .from("companies")
        .select("id, name, ticker, sector, market_list, rss_feed_url, description")
        .not("rss_feed_url", "is", null)
        .or("description.is.null,description.eq.")
        .not("ticker", "eq", "BLUE")
        .limit(1)
        .single();

    const company = companies;

    if (!company) {
        console.error("Hittade inget bolag med rss_feed_url och utan description.");
        process.exit(1);
    }

    console.log(`\n=== ${company.name} (${company.ticker}) – RSS-test ===\n`);
    console.log(`RSS: ${company.rss_feed_url}`);
    console.log(`Nuvarande beskrivning: ${company.description || "(tom)"}\n`);

    // Hämta pressmeddelanden
    const rssText = await fetchRssText(company.rss_feed_url);
    if (rssText) {
        console.log("--- RSS-innehåll (utdrag) ---");
        console.log(rssText.slice(0, 500) + "...\n");
    } else {
        console.log("Inget RSS-innehåll, faller tillbaka på träningsdata.\n");
    }

    // Generera beskrivning
    console.log("Genererar beskrivning med Claude...");
    const description = await generateDescription(company, rssText);

    if (!description) {
        console.error("Claude returnerade inget svar.");
        process.exit(1);
    }

    console.log("\n--- GENERERAD BESKRIVNING ---");
    console.log(description);
    console.log("----------------------------\n");

    // Spara i Supabase
    const { error } = await supabase
        .from("companies")
        .update({ description })
        .eq("id", company.id);

    if (error) {
        console.error("Fel vid uppdatering:", error.message);
    } else {
        console.log(`✅ Sparad för ${company.name} i Supabase!`);
    }
}

main().catch(console.error);
