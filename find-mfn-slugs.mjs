// MFN-slug finder v2: enbart slug-generering + direkt URL-verifiering
// Ingen search-API (den var buggig). Testar istället genererade slugs direkt.
// Kör med: node find-mfn-slugs.mjs

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    "https://pwfznjcdrauvjyhjncew.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3ZnpuamNkcmF1dmp5aGpuY2V3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjk5NDA3MSwiZXhwIjoyMDg4NTcwMDcxfQ.2Y-MasloUkJSd9CelIBYWbN3dT5Ds74Gayc9rqp3z2Q"
);

/** Städa namn till slug-form */
function nameToSlug(name) {
    return name
        .toLowerCase()
        .replace(/å/g, "a").replace(/ä/g, "a").replace(/ö/g, "o")
        .replace(/[^a-z0-9 -]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

/** Generera slug-kandidater från bolagsnamnet */
function slugCandidates(name) {
    const full = nameToSlug(name);

    // Ta bort vanliga suffix
    const withoutSuffix = nameToSlug(
        name.replace(/\b(ab|asa|inc|ltd|plc|holding|group|invest)\b/gi, "").trim()
    );

    // Bara första ordet
    const firstWord = nameToSlug(name.split(" ")[0]);

    return [...new Set([
        full,
        withoutSuffix,
        full + "-ab",
        withoutSuffix + "-ab",
        firstWord,
        firstWord + "-ab",
    ])].filter(s => s.length >= 3);
}

/** Testa om ett MFN-slug returnerar faktiska pressmeddelanden */
async function testSlug(slug) {
    try {
        const url = `https://mfn.se/all/a/${slug}.json?limit=2`;
        const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
            signal: AbortSignal.timeout(6000),
        });
        if (!res.ok) return false;
        const data = await res.json();
        return Array.isArray(data?.items) && data.items.length > 0;
    } catch {
        return false;
    }
}

async function main() {
    console.log("=== MFN-slug Finder v2 (verifiering utan search-API) ===\n");

    // Hämta bolag som saknar korrekt MFN-slug
    const { data: companies } = await supabase
        .from("companies")
        .select("id, name, ticker, rss_feed_url")
        .order("name");

    const found = [], notFound = [], skipped = [];

    for (const c of companies) {
        const url = c.rss_feed_url ?? "";
        const isNgm = url.includes("ngm.se") || url.includes("symbol=");
        const isEmpty = !url;
        const mightBeSlug = url && !url.includes(".") && !url.includes("/");

        // Redan en giltig MFN-slug? Verifiera och hoppa över
        if (mightBeSlug) {
            const ok = await testSlug(url);
            if (ok) {
                process.stdout.write(`✓ SKIP  ${c.name.padEnd(38)} → ${url}\n`);
                skipped.push(c.name);
                continue;
            }
        }

        // Behöver söka slug
        if (!isNgm && !isEmpty && !mightBeSlug) {
            // Okänt format – testa ändå kandidater
        }

        process.stdout.write(`? SÖK   ${c.name.padEnd(38)}`);

        const candidates = slugCandidates(c.name);
        let match = null;

        for (const candidate of candidates) {
            const ok = await testSlug(candidate);
            await new Promise(r => setTimeout(r, 200));
            if (ok) { match = candidate; break; }
        }

        if (match) {
            console.log(`→ ${match}`);
            found.push({ id: c.id, name: c.name, slug: match });
            await supabase.from("companies").update({ rss_feed_url: match }).eq("id", c.id);
        } else {
            console.log(`✗ EJ HITTAT`);
            notFound.push({ name: c.name, ticker: c.ticker });
        }

        await new Promise(r => setTimeout(r, 100));
    }

    console.log("\n=== SUMMERING ===");
    console.log(`✅ Hittade + uppdaterade: ${found.length}`);
    console.log(`✓  Redan korrekta:        ${skipped.length}`);
    console.log(`✗  Ej hittade:            ${notFound.length}`);

    if (notFound.length) {
        console.log("\nBolag EJ hittade på MFN (behöver manuell MFN-slug):");
        notFound.forEach(c => console.log(`  - ${c.name.padEnd(38)} (${c.ticker})`));
    }
}

main().catch(console.error);
