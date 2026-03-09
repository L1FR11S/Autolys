import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CRON_SECRET = process.env.CRON_SECRET;

// Map agent_type → Edge Function URL
const AGENT_FUNCTIONS: Record<string, string> = {
    press_release: `${SUPABASE_URL}/functions/v1/press-release-agent`,
    trigger: `${SUPABASE_URL}/functions/v1/trigger-agent`,
    kpi: `${SUPABASE_URL}/functions/v1/kpi-agent`,
};

/**
 * POST /api/agents
 * Kör en eller flera agents på ett pressmeddelande.
 *
 * Body: { press_release_id: string, agents?: string[] }
 *   agents: lista av agent-typer att köra, default = alla tre
 *
 * Headers: Authorization: Bearer <CRON_SECRET>
 */
export async function POST(request: NextRequest) {
    // Auth
    if (CRON_SECRET) {
        const auth = request.headers.get("authorization");
        if (auth !== `Bearer ${CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
    }

    const body = await request.json();
    const { press_release_id, agents = ["press_release", "trigger", "kpi"] } = body;

    if (!press_release_id) {
        return NextResponse.json({ error: "Missing press_release_id" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const results: Record<string, unknown> = {};

    // Kör valda agents sekventiellt (press_release-agenten bör köras först)
    const orderedAgents = ["press_release", "trigger", "kpi"].filter(a => agents.includes(a));

    for (const agentType of orderedAgents) {
        const fnUrl = AGENT_FUNCTIONS[agentType];
        if (!fnUrl) continue;

        // Skapa job i kön
        const { data: job } = await supabase
            .from("agent_jobs")
            .insert({
                agent_type: agentType,
                status: "pending",
                payload: { press_release_id },
            })
            .select("id")
            .single();

        try {
            // Anropa Edge Function
            const res = await fetch(fnUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${SERVICE_KEY}`,
                },
                body: JSON.stringify({ press_release_id, job_id: job?.id }),
            });

            const data = await res.json();
            results[agentType] = { success: res.ok, ...data };
        } catch (err) {
            results[agentType] = { success: false, error: String(err) };
            if (job?.id) {
                await supabase.from("agent_jobs").update({
                    status: "failed",
                    error: String(err),
                    updated_at: new Date().toISOString(),
                }).eq("id", job.id);
            }
        }
    }

    return NextResponse.json({ press_release_id, results });
}

/**
 * GET /api/agents – status-översikt
 */
export async function GET() {
    const supabase = createAdminClient();
    const { data: stats } = await supabase
        .from("agent_jobs")
        .select("agent_type, status")
        .order("created_at", { ascending: false })
        .limit(100);

    const summary = (stats ?? []).reduce<Record<string, Record<string, number>>>((acc, row) => {
        if (!acc[row.agent_type]) acc[row.agent_type] = {};
        acc[row.agent_type][row.status] = (acc[row.agent_type][row.status] ?? 0) + 1;
        return acc;
    }, {});

    return NextResponse.json({
        status: "ok",
        agents: Object.keys(AGENT_FUNCTIONS),
        recent_jobs: summary,
    });
}
