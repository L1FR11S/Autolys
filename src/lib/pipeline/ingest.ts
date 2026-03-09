import { createAdminClient } from "@/lib/supabase";
import type { MfnFeedResponse, MfnItem } from "./mfn-types";

const MFN_BASE = "https://mfn.se/all/a";

/**
 * Fetch press releases from MFN JSON API for a specific company.
 */
export async function fetchMfnFeed(mfnSlug: string, limit = 20): Promise<MfnFeedResponse> {
    const url = `${MFN_BASE}/${mfnSlug}.json?limit=${limit}`;
    const res = await fetch(url, { next: { revalidate: 0 } });
    if (!res.ok) throw new Error(`MFN fetch failed for ${mfnSlug}: ${res.status}`);
    return res.json();
}

/**
 * Determine press release category from MFN tags.
 */
function classifyCategory(tags?: string[]): string {
    if (!tags || !Array.isArray(tags)) return "Pressmeddelande";
    if (tags.includes("sub:report") || tags.includes("sub:report:interim") || tags.includes("sub:report:annual")) return "Rapport";
    if (tags.includes(":regulatory")) return "Regulatorisk";
    return "Pressmeddelande";
}

/**
 * Ingest press releases from MFN for a single company.
 * Returns the count of newly inserted press releases.
 */
export async function ingestCompany(companyId: string, mfnSlug: string, limit = 20): Promise<number> {
    const supabase = createAdminClient();

    // 1. Fetch from MFN
    const feed = await fetchMfnFeed(mfnSlug, limit);
    if (!feed.items || feed.items.length === 0) return 0;

    // 2. Get existing source_urls to avoid duplicates
    const mfnUrls = feed.items.map((item) => item.url);
    const { data: existing } = await supabase
        .from("press_releases")
        .select("source_url")
        .eq("company_id", companyId)
        .in("source_url", mfnUrls);

    const existingUrls = new Set((existing ?? []).map((e: { source_url: string }) => e.source_url));

    // 3. Filter to new items only
    const newItems = feed.items.filter((item) => !existingUrls.has(item.url));
    if (newItems.length === 0) return 0;

    // 4. Map to press_releases format
    const rows = newItems.map((item: MfnItem) => ({
        company_id: companyId,
        title: item.content.title,
        content: item.content.text.slice(0, 5000), // Limit content size
        source_url: item.url,
        published_at: item.content.publish_date,
        category: classifyCategory(item.properties.tags),
        ai_summary: null,        // Will be filled by Claude later
        key_takeaways: null,
        sentiment_score: null,
    }));

    // 5. Insert
    const { data: inserted, error } = await supabase
        .from("press_releases")
        .insert(rows)
        .select("id");

    if (error) {
        console.error(`[ingest] Error inserting for ${mfnSlug}:`, error.message);
        return 0;
    }

    console.log(`[ingest] ${mfnSlug}: inserted ${rows.length} new press releases`);

    // 6. Köa AI-agents för varje ny pressrelease (fire-and-forget – vänta inte)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const cronSecret = process.env.CRON_SECRET;
    for (const pr of (inserted ?? [])) {
        // Fire-and-forget: starta agents men vänta inte på svar
        fetch(`${appUrl}/api/agents`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {}),
            },
            body: JSON.stringify({
                press_release_id: pr.id,
                agents: ["press_release", "trigger", "kpi"],
            }),
        }).then(() => {
            console.log(`[ingest] Queued agents for press_release ${pr.id}`);
        }).catch((err) => {
            console.warn(`[ingest] Failed to queue agents for ${pr.id}:`, err);
        });
    }

    return rows.length;
}

/**
 * Ingest press releases for ALL companies that have an rss_feed_url (MFN slug).
 * Returns total count of new press releases.
 */
export async function ingestAllCompanies(): Promise<{ total: number; details: Record<string, number> }> {
    const supabase = createAdminClient();

    // Get all companies with MFN slugs
    const { data: companies, error } = await supabase
        .from("companies")
        .select("id, name, slug, rss_feed_url")
        .not("rss_feed_url", "is", null);

    if (error || !companies) {
        console.error("[ingest] Failed to fetch companies:", error?.message);
        return { total: 0, details: {} };
    }

    console.log(`[ingest] Starting ingestion for ${companies.length} companies...`);

    const details: Record<string, number> = {};
    let total = 0;

    for (const company of companies) {
        try {
            const mfnSlug = company.rss_feed_url!;
            const count = await ingestCompany(company.id, mfnSlug);
            details[company.name] = count;
            total += count;
        } catch (err) {
            console.error(`[ingest] Error for ${company.name}:`, err);
            details[company.name] = -1; // Error marker
        }
    }

    console.log(`[ingest] Done. Total new: ${total}`);
    return { total, details };
}
