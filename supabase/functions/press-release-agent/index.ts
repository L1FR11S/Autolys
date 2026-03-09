// press-release-agent v2: TAKEAWAYS + DATAPUNKTER + SENTIMENT + RELEVANCE
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.39.0";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const claude = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });

Deno.serve(async (req: Request) => {
    const { press_release_id, job_id } = await req.json();
    if (!press_release_id) return new Response(JSON.stringify({ error: "Missing press_release_id" }), { status: 400 });

    if (job_id) await supabase.from("agent_jobs").update({ status: "running", updated_at: new Date().toISOString() }).eq("id", job_id);

    const { data: pr } = await supabase
        .from("press_releases")
        .select("id, title, content, category, companies(name, sector)")
        .eq("id", press_release_id)
        .single();

    if (!pr) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

    const companyName = (pr.companies as any)?.name ?? "Okänt bolag";
    const sector = (pr.companies as any)?.sector ?? "";
    const text = [pr.title, pr.content].filter(Boolean).join("\n\n").slice(0, 8000);

    try {
        const msg = await claude.messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 1200,
            messages: [{
                role: "user",
                content: `Du är en finansiell analytiker. Analysera detta pressmeddelande från ${companyName} (${sector}).

PRESSMEDDELANDE:
${text}

Svara EXAKT i detta JSON-format utan annan text:
{
  "ai_summary": "2-3 meningar neutral sammanfattning på svenska",
  "takeaways": [
    { "text": "Viktig slutsats 1 på svenska", "type": "positiv" },
    { "text": "Viktig slutsats 2 på svenska", "type": "neutral" }
  ],
  "datapunkter": [
    { "label": "Omsättning Q4 2025", "value": "124 MSEK" },
    { "label": "Tillväxt YoY", "value": "+12%" }
  ],
  "key_takeaways": ["punkt 1", "punkt 2", "punkt 3"],
  "sentiment_score": 0.6,
  "relevance": "hög"
}

Regler:
- takeaways: 2-4 st, type = "positiv"|"negativ"|"neutral"
- datapunkter: bara OM det finns konkreta siffror/fakta i texten (max 6), annars tom lista
- relevance: "hög" (M&A, stora kontrakt, rapport), "medel" (normal), "låg" (rutin)
- sentiment_score: -1.0 till +1.0
- Svara ENBART med JSON`
            }]
        });

        const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON");
        const parsed = JSON.parse(jsonMatch[0]);

        await supabase.from("press_releases").update({
            ai_summary: parsed.ai_summary ?? null,
            takeaways: parsed.takeaways ?? [],
            datapunkter: parsed.datapunkter ?? [],
            key_takeaways: parsed.key_takeaways ?? null,
            sentiment_score: parsed.sentiment_score ?? null,
            relevance: parsed.relevance ?? "medel",
            processed_at: new Date().toISOString(),
            analyzed_at: new Date().toISOString(),
        }).eq("id", press_release_id);

        if (job_id) await supabase.from("agent_jobs").update({ status: "done", result: parsed, updated_at: new Date().toISOString() }).eq("id", job_id);
        return new Response(JSON.stringify({ success: true, ...parsed }), { headers: { "Content-Type": "application/json" } });
    } catch (err) {
        const errMsg = String(err);
        if (job_id) await supabase.from("agent_jobs").update({ status: "failed", error: errMsg, updated_at: new Date().toISOString() }).eq("id", job_id);
        return new Response(JSON.stringify({ error: errMsg }), { status: 500 });
    }
});
