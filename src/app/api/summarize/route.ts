import { NextResponse } from "next/server";
import { summarizeUnsummarized } from "@/lib/pipeline/summarize";

/**
 * POST /api/summarize
 * Generate AI summaries for unsummarized press releases.
 *
 * Query params:
 *   ?limit=10   — max number of releases to process (default: 10)
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
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    try {
        const result = await summarizeUnsummarized(limit);
        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (err) {
        console.error("[api/summarize] Error:", err);
        return NextResponse.json({ error: "Summarization failed", message: String(err) }, { status: 500 });
    }
}

/**
 * GET /api/summarize — health check
 */
export async function GET() {
    return NextResponse.json({ status: "ok", endpoint: "POST /api/summarize?limit=10" });
}
