// trigger-agent v2: POSITIVA och NEGATIVA triggers med konkreta tröskelvärden
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
        .select("id, title, content, companies(name, sector)")
        .eq("id", press_release_id)
        .single();

    if (!pr) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

    const companyName = (pr.companies as any)?.name ?? "Okänt bolag";
    const text = [pr.title, pr.content].filter(Boolean).join("\n\n").slice(0, 8000);

    try {
        const msg = await claude.messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 800,
            messages: [{
                role: "user",
                content: `Du är en investeringsanalytiker. Identifiera POSITIVA och NEGATIVA triggers från detta pressmeddelande från ${companyName}.

PRESSMEDDELANDE:
${text}

Tänk framåtblickande: vad innebär detta för investerare? Vilka scenarier är positiva/negativa framöver?

Svara EXAKT i detta JSON-format utan annan text:
{
  "triggers": {
    "positiva": [
      "Konkret positiv trigger med tröskelvärde om möjligt, t.ex. 'Omsättning på eller över X innebär...'",
      "En annan positiv trigger"
    ],
    "negativa": [
      "Konkret negativ trigger, t.ex. 'Om X inte uppnås riskeras...'",
      "En annan negativ trigger"
    ]
  },
  "legacy_triggers": [
    { "type": "kontrakt", "description": "kort beskrivning", "confidence": 0.85, "impact": "positiv" }
  ]
}

Regler:
- positiva: 1-4 meningar, framåtblickande, konkreta tröskelvärden om möjligt
- negativa: 1-4 meningar, konkreta risker
- Om inget är negativt: tom lista
- Om inget är positivt: tom lista
- Svara ENBART med JSON`
            }]
        });

        const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON");
        const parsed = JSON.parse(jsonMatch[0]);

        await supabase.from("press_releases").update({
            triggers: parsed.triggers ?? { positiva: [], negativa: [] },
        }).eq("id", press_release_id);

        if (job_id) await supabase.from("agent_jobs").update({ status: "done", result: parsed, updated_at: new Date().toISOString() }).eq("id", job_id);
        return new Response(JSON.stringify({ success: true, triggers: parsed.triggers }), { headers: { "Content-Type": "application/json" } });
    } catch (err) {
        const errMsg = String(err);
        if (job_id) await supabase.from("agent_jobs").update({ status: "failed", error: errMsg, updated_at: new Date().toISOString() }).eq("id", job_id);
        return new Response(JSON.stringify({ error: errMsg }), { status: 500 });
    }
});
