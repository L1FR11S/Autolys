import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get("ticker");
    const range = searchParams.get("range") || "6mo";

    if (!ticker) {
        return NextResponse.json({ error: "Missing ticker" }, { status: 400 });
    }

    // Interval baseras på range
    const intervalMap: Record<string, string> = {
        "1mo": "1d",
        "3mo": "1d",
        "6mo": "1d",
        "1y": "1d",
    };
    const interval = intervalMap[range] || "1d";

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${interval}&range=${range}`;

    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
                "Accept": "application/json",
            },
            next: { revalidate: 3600 }, // cache 1h
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Yahoo Finance fetch failed", status: res.status }, { status: 502 });
        }

        const data = await res.json();
        const result = data?.chart?.result?.[0];

        if (!result) {
            return NextResponse.json({ error: "No data found for ticker" }, { status: 404 });
        }

        const timestamps: number[] = result.timestamp ?? [];
        const closes: number[] = result.indicators?.quote?.[0]?.close ?? [];
        const meta = result.meta;

        // Filtrera bort null-värden (stängda dagar)
        const points = timestamps
            .map((t, i) => ({ time: t * 1000, price: closes[i] }))
            .filter((p) => p.price != null);

        return NextResponse.json({
            ticker,
            currency: meta?.currency ?? "SEK",
            currentPrice: meta?.regularMarketPrice ?? null,
            previousClose: meta?.previousClose ?? null,
            points,
        });
    } catch (err) {
        console.error("Stock chart error:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
