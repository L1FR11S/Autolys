// geography-agent: Analyserar geografisk exponering för ett bolag
// Triggas med { company_id }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.39.0";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const claude = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });

Deno.serve(async (req: Request) => {
    const { company_id } = await req.json();
    if (!company_id) return new Response(JSON.stringify({ error: "Missing company_id" }), { status: 400 });

    // Hämta bolag + senaste pressmeddelanden
    const { data: company } = await supabase
        .from("companies")
        .select("id, name, sector, description")
        .eq("id", company_id)
        .single();

    if (!company) return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });

    const { data: prs } = await supabase
        .from("press_releases")
        .select("title, content")
        .eq("company_id", company_id)
        .order("published_at", { ascending: false })
        .limit(5);

    const context = [
        company.description ?? "",
        ...(prs ?? []).map(p => p.title + "\n" + (p.content ?? "")).slice(0, 3)
    ].join("\n\n").slice(0, 6000);

    try {
        const msg = await claude.messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 800,
            messages: [{
                role: "user",
                content: `Analysera den geografiska exponeringen för ${company.name} (${company.sector ?? "okänd sektor"}).

KONTEXT OM BOLAGET:
${context}

Svara EXAKT i detta JSON-format utan annan text:
{
  "geographic_exposure": [
    {
      "country": "Sverige",
      "level": "high",
      "segments": "Privat- och företagskunder; B2B-försäljning",
      "risks": "Konjunktursvängningar, konkurrens från internationella aktörer"
    }
  ]
}

Regler:
- Inkludera bara länder/regioner där bolaget är aktivt
- level: "high" | "med" | "low" baserat på andel av omsättning/verksamhet
- segments: kort beskrivning av kundtyper/segment i det landet
- risks: primära risker eller katalysatorer för det marknadsområdet
- Max 6 geografier
- Om inte tillräcklig info: returnera { "geographic_exposure": [] }
- Svara ENBART med JSON`
            }]
        });

        const raw = msg.content[0].type === "text" ? msg.content[0].text : "";
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON");
        const parsed = JSON.parse(jsonMatch[0]);

        await supabase.from("companies").update({ geographic_exposure: parsed.geographic_exposure ?? [] }).eq("id", company_id);
        return new Response(JSON.stringify({ success: true, ...parsed }), { headers: { "Content-Type": "application/json" } });
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
    }
});
