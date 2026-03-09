// kpi-agent: Extraherar finansiella nyckeltal från pressmeddelanden/rapporter
// Triggas av orchestratorn med { press_release_id }

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.39.0";

const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const claude = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });

Deno.serve(async (req: Request) => {
    const { press_release_id, job_id } = await req.json();
    if (!press_release_id) {
        return new Response(JSON.stringify({ error: "Missing press_release_id" }), { status: 400 });
    }

    if (job_id) {
        await supabase.from("agent_jobs").update({ status: "running", updated_at: new Date().toISOString() }).eq("id", job_id);
    }

    const { data: pr } = await supabase
        .from("press_releases")
        .select("id, title, content, category, companies(name, sector)")
        .eq("id", press_release_id)
        .single();

    if (!pr) {
        return new Response(JSON.stringify({ error: "Press release not found" }), { status: 404 });
    }

    const text = [pr.title, pr.content].filter(Boolean).join("\n\n").slice(0, 8000);
    const companyName = (pr.companies as any)?.name ?? "Okänt bolag";

    // KPI-agenten är mest användbar för rapporter
    const isReport = /rapport|kvartals|resultat|bokslut|delår|annual|report/i.test(pr.title ?? "");

    try {
        const msg = await claude.messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 800,
            messages: [{
                role: "user",
                content: `Du är en finansanalytiker. Extrahera mätbara finansiella nyckeltal från detta pressmeddelande från ${companyName}.

PRESSMEDDELANDE:
${text}

${isReport ? "OBS: Detta verkar vara en finansiell rapport – leta extra noga efter siffror." : ""}

Extrahera ALLA konkreta finansiella värden du hittar (omsättning, EBIT, kassaflöde, orderingång, kundantal, etc.).

Svara EXAKT i detta JSON-format:
{
  "kpis": [
    {
      "name": "Nettoomsättning",
      "value": 12.4,
      "unit": "MSEK",
      "period": "Q4 2025",
      "yoy_change": 15.2
    }
  ]
}

Regler:
- name: på svenska, t.ex. "Nettoomsättning", "EBIT", "Kassaflöde", "Orderingång"
- value: numeriskt värde (decimal)
- unit: "MSEK", "TSEK", "SEK", "st", "%" etc.
- period: rapportperiod om känt, annars null
- yoy_change: förändring i % jämfört med föregående period om känd, annars null
- Om inga siffror hittas: returnera { "kpis": [] }
- Svara ENBART med JSON`
            }]
        });

        const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON in response");
        const parsed = JSON.parse(jsonMatch[0]);

        await supabase.from("press_releases")
            .update({ kpis: parsed.kpis ?? [] })
            .eq("id", press_release_id);

        if (job_id) {
            await supabase.from("agent_jobs").update({
                status: "done", result: parsed, updated_at: new Date().toISOString()
            }).eq("id", job_id);
        }

        return new Response(JSON.stringify({ success: true, kpis: parsed.kpis, count: parsed.kpis?.length ?? 0 }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        const errMsg = String(err);
        if (job_id) {
            await supabase.from("agent_jobs").update({
                status: "failed", error: errMsg, updated_at: new Date().toISOString()
            }).eq("id", job_id);
        }
        return new Response(JSON.stringify({ error: errMsg }), { status: 500 });
    }
});
