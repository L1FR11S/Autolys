// Test: generera bolagsbeskrivning för BlueLake Mineral med Claude AI
// Kör med: node /tmp/test-description-bluelake.mjs

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";

const SUPABASE_URL = "https://pwfznjcdrauvjyhjncew.supabase.co";
const SUPABASE_KEY = "your-supabase-key-here";
const ANTHROPIC_KEY = "your-anthropic-key-here";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const claude = new Anthropic({ apiKey: ANTHROPIC_KEY });

async function scrapeText(url) {
    try {
        console.log(`  Hämtar ${url}...`);
        const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; Autolys/1.0)" },
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();

        // Rensa bort HTML-taggar och extrahera text
        const text = html
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/\s{3,}/g, "\n\n")
            .trim()
            .slice(0, 8000); // Max 8k tecken till Claude

        return text;
    } catch (err) {
        console.warn(`  Kunde inte hämta ${url}: ${err.message}`);
        return null;
    }
}

async function generateDescription(company, websiteText) {
    const prompt = `Du är en finansiell analytiker som skriver korta, faktabaserade bolagsbeskrivningar för en investeringsplattform riktad till svenska privatinvesterare.

Bolag: ${company.name}
Ticker: ${company.ticker}
Sektor: ${company.sector}
Marknadsplats: ${company.market_list}
${websiteText ? `\nBolagets hemsida (utdrag):\n${websiteText}` : "\n(Ingen hemsidesinformation tillgänglig – använd allmän branschkunskap om bolaget.)"}

Skriv en bolagsbeskrivning på svenska. Den ska:
- Vara 3–4 meningar (ca 100–150 ord)
- Förklara vad bolaget gör och vilken bransch det verkar i
- Nämna var bolaget är verksamt (geografi)
- Vara neutral och faktabaserad (inte säljande)
- Skrivas i tredje person ("Bolaget..." / "[Bolagsnamn]...")
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
    console.log("=== BlueLake Mineral – Testbeskrivning ===\n");

    // 1. Hämta bolaget från Supabase
    const { data: company, error } = await supabase
        .from("companies")
        .select("id, name, ticker, sector, market_list, website_url, description")
        .ilike("name", "%bluelake%")
        .single();

    if (error || !company) {
        console.error("Hittade inte BlueLake Mineral:", error?.message);
        process.exit(1);
    }

    console.log(`Hittade: ${company.name} (${company.ticker})`);
    console.log(`Hemsida: ${company.website_url || "(saknas)"}`);
    console.log(`Nuvarande beskrivning: ${company.description || "(tom)"}\n`);

    // 2. Scrapar hemsidan om URL finns
    let websiteText = null;
    if (company.website_url) {
        websiteText = await scrapeText(company.website_url);
        // Prova även /om eller /about om lite text
        if (!websiteText || websiteText.length < 200) {
            const aboutUrl = company.website_url.replace(/\/$/, "") + "/om-oss";
            const aboutText = await scrapeText(aboutUrl);
            if (aboutText && aboutText.length > (websiteText?.length ?? 0)) {
                websiteText = aboutText;
            }
        }
    }

    // 3. Generera beskrivning med Claude
    console.log("Genererar beskrivning med Claude...");
    const description = await generateDescription(company, websiteText);

    if (!description) {
        console.error("Claude returnerade inget svar.");
        process.exit(1);
    }

    console.log("\n--- GENERERAD BESKRIVNING ---");
    console.log(description);
    console.log("----------------------------\n");

    // 4. Uppdatera Supabase
    const { error: updateErr } = await supabase
        .from("companies")
        .update({ description })
        .eq("id", company.id);

    if (updateErr) {
        console.error("Fel vid uppdatering:", updateErr.message);
    } else {
        console.log("✅ Beskrivning sparad i Supabase!");
    }
}

main().catch(console.error);
