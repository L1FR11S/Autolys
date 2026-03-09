import { NextResponse } from "next/server";
import { ingestAllCompanies, ingestCompany } from "@/lib/pipeline/ingest";
import { createAdminClient } from "@/lib/supabase";

/**
 * POST /api/ingest
 * Trigger press release ingestion from MFN.
 *
 * Query params:
 *   ?slug=plejd   — ingest a single company by its slug
 *   (no params)   — ingest all companies
 *
 * Headers:
 *   Authorization: Bearer <CRON_SECRET>
 */
export async function POST(request: Request) {
    // Auth check
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
        const auth = request.headers.get("authorization");
        if (auth !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    try {
        if (slug) {
            // Ingest single company
            const supabase = createAdminClient();
            const { data: company } = await supabase
                .from("companies")
                .select("id, name, rss_feed_url")
                .eq("slug", slug)
                .single();

            if (!company) {
                return NextResponse.json({ error: `Company '${slug}' not found` }, { status: 404 });
            }
            if (!company.rss_feed_url) {
                return NextResponse.json({ error: `Company '${slug}' has no MFN slug configured` }, { status: 400 });
            }

            const count = await ingestCompany(company.id, company.rss_feed_url);
            return NextResponse.json({
                success: true,
                company: company.name,
                newPressReleases: count,
            });
        }

        // Ingest all
        const result = await ingestAllCompanies();
        return NextResponse.json({
            success: true,
            totalNewPressReleases: result.total,
            details: result.details,
        });
    } catch (err) {
        console.error("[api/ingest] Error:", err);
        return NextResponse.json({ error: "Ingestion failed", message: String(err) }, { status: 500 });
    }
}

/**
 * GET /api/ingest — health check
 */
export async function GET() {
    return NextResponse.json({ status: "ok", endpoint: "POST /api/ingest" });
}
