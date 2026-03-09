// Supabase Edge Function: fetch-stock-prices
// Körs dagligen kl 22:00 CET (21:00 UTC) via Supabase Cron
// Hämtar stängningskurs från Yahoo Finance för alla bolag med yahoo_ticker

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 68 bolag med Yahoo Finance-tickrar (NGM Nordic SME)
const TICKERS = [
    "ABIG.ST", "ADVT.ST", "AFRI.ST", "ARBO-A.ST", "ATANA.ST", "AVSALT.ST",
    "BLUE.ST", "BRIX.ST", "CARDEO.ST", "COEGIN.ST", "CRET.ST", "CRWN.ST",
    "DIAH.ST", "DIV-B.ST", "ECC-B.ST", "EMART.ST", "ENRAD.ST", "BAT.ST",
    "F2M.ST", "FRNT-B.ST", "THRILL.ST", "GARPCO-B.ST", "GTG.ST", "BTCX.ST",
    "GMERC-B.ST", "H100.ST", "HMPLY.ST", "HYCO.ST", "INFRA.ST", "JDT.ST",
    "GATE.ST", "KOBR-B.ST", "KVIX.ST", "LATF-B.ST", "LEVBIO.ST", "LAIR.ST",
    "LINKAB.ST", "LOHILO.ST", "LUMITO.ST", "MAHVIE.ST", "MCLR.ST", "MEGR.ST",
    "NXAR.ST", "NGS.ST", "NIUTEC.ST", "NODE.ST", "NORDIG.ST", "CAPS.ST",
    "NOSIUM-B.ST", "NOWO.ST", "PIXEL.ST", "PIXFAM.ST", "POLYMER.ST", "PHYR-B.ST",
    "PRLD.ST", "QBRICK.ST", "RMDX.ST", "RLOS-B.ST", "REAL.ST", "RLVNC.ST",
    "RENT.ST", "SLG-B.ST", "SARS.ST", "SDS.ST", "SEHED-B.ST", "STVA-B.ST",
    "SBG.ST", "SENS.ST", "TCC-A.ST", "THINC.ST", "TPGR.ST", "TRML.ST",
    "TRNSF.ST", "TIRO.ST", "TRIONA.ST",
];

const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

async function fetchTicker(ticker: string) {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1y`;
    const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return null;

    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return null;

    const timestamps: number[] = result.timestamp ?? [];
    const quotes = result.indicators?.quote?.[0];
    if (!quotes) return null;

    const rows = timestamps
        .map((t: number, i: number) => ({
            ticker,
            date: new Date(t * 1000).toISOString().slice(0, 10),
            open_price: quotes.open?.[i] ?? null,
            high_price: quotes.high?.[i] ?? null,
            low_price: quotes.low?.[i] ?? null,
            close_price: quotes.close?.[i],
            volume: quotes.volume?.[i] ?? null,
            updated_at: new Date().toISOString(),
        }))
        .filter((r) => r.close_price != null);

    return rows;
}

Deno.serve(async (_req) => {
    let inserted = 0;
    let errors = 0;

    for (const ticker of TICKERS) {
        try {
            const rows = await fetchTicker(ticker);
            if (!rows || rows.length === 0) {
                console.warn(`No data for ${ticker}`);
                errors++;
                continue;
            }

            const { error } = await supabase
                .from("stock_prices")
                .upsert(rows, { onConflict: "ticker,date" });

            if (error) {
                console.error(`DB error for ${ticker}:`, error.message);
                errors++;
            } else {
                inserted += rows.length;
                console.log(`✓ ${ticker}: ${rows.length} rows`);
            }
        } catch (err) {
            console.error(`Fetch error for ${ticker}:`, err);
            errors++;
        }

        // Liten paus för att inte hammra Yahoo Finance
        await new Promise((r) => setTimeout(r, 300));
    }

    return new Response(
        JSON.stringify({ inserted, errors, tickers: TICKERS.length }),
        { headers: { "Content-Type": "application/json" } }
    );
});
