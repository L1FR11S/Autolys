// management-agent: Extraherar ledningscitat från pressmeddelanden
// Triggas med { company_id }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.39.0";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const claude = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });

Deno.serve(async (req: Request) => {
    const { company_id } = await req.json();
    if (!company_id) return new Response(JSON.stringify({ error: "Missing company_id" }), { status: 400 });

    const { data: company } = await supabase.from("companies").select("name").eq("id", company_id).single();
    const { data: prs } = await supabase
        .from("press_releases")
        .select("id, title, content, source_url, published_at")
        .eq("company_id", company_id)
        .order("published_at", { ascending: false })
        .limit(10);

    if (!prs?.length) return new Response(JSON.stringify({ success: true, management_comments: [] }));

    const prText = prs.map(p => `---\n${p.title}\n${p.content ?? ""}`).join("\n").slice(0, 8000);

    try {
        const msg = await claude.messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 800,
            messages: [{
                role: "user",
                content: `Extrahera direktcitat från ledningen (VD, CFO, ordförande etc.) i dessa pressmeddelanden från ${company?.name ?? "bolaget"}.

PRESSMEDDELANDEN:
${prText}

Svara EXAKT i detta JSON-format utan annan text:
{
  "management_comments": [
    {
      "quote": "Exakt citat från ledningen",
      "person": "Förnamn Efternamn",
      "title": "VD",
      "context": "Kort kontext om varför citatet är relevant"
    }
  ]
}

Regler:
- Bara RIKTIGA citat (med citationstecken eller tydlig attribuering i källtexten)
- Max 5 citat, helst de mest substansiella/strategiska
- Om inga citat hittas: returnera { "management_comments": [] }
- Svara ENBART med JSON`
            }]
        });

        const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON");
        const parsed = JSON.parse(jsonMatch[0]);

        await supabase.from("companies").update({ management_comments: parsed.management_comments ?? [] }).eq("id", company_id);
        return new Response(JSON.stringify({ success: true, ...parsed }), { headers: { "Content-Type": "application/json" } });
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
    }
});
