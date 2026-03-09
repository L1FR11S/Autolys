import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase";

function getClient(): Anthropic {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    console.log(`[summarize] Using API key: ${apiKey.slice(0, 15)}...`);
    return new Anthropic({ apiKey });
}

const SYSTEM_PROMPT = `Du är en expert-analytiker på IR-kommunikation för nordiska börsnoterade bolag. Din uppgift är att hjälpa retail-investerare förstå pressmeddelanden snabbt.

Du svarar ALLTID i JSON-format med exakt denna struktur:
{
  "summary": "En tydlig sammanfattning på 2-4 meningar som fångar det viktigaste för en investerare.",
  "key_takeaways": ["Punkt 1", "Punkt 2", "Punkt 3"],
  "sentiment_score": 0.7
}

Regler:
- summary: Skriv på svenska. Fokusera på det som är relevant för investerare (finansiella siffror, strategiska beslut, risker/möjligheter).
- key_takeaways: 2-4 konkreta punkter. Inkludera nyckeltal om de finns (t.ex. omsättning, tillväxt, marginal).
- sentiment_score: Ett tal mellan 0 och 1 där:
  - 0.0-0.3 = Negativt (vinstvarning, förlust, nedskrivning)
  - 0.3-0.5 = Försiktigt/Neutralt (blandade signaler, osäkerhet)
  - 0.5-0.7 = Neutralt/Positivt (stabil utveckling)
  - 0.7-1.0 = Positivt (stark tillväxt, överträffade förväntningar)

Svara BARA med JSON, ingen annan text.`;

interface SummaryResult {
    summary: string;
    key_takeaways: string[];
    sentiment_score: number;
}

/**
 * Generate AI summary for a single press release using Claude.
 */
export async function summarizePressRelease(title: string, content: string): Promise<SummaryResult> {
    const client = getClient();
    const truncatedContent = content.slice(0, 4000);

    const message = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [
            {
                role: "user",
                content: `Analysera detta pressmeddelande:\n\nTITEL: ${title}\n\nINNEHÅLL:\n${truncatedContent}`,
            },
        ],
    });

    // Extract text from response
    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text in Claude response");
    }

    // Parse JSON response — strip markdown code blocks if present
    let jsonText = textBlock.text.trim();
    if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }
    const parsed = JSON.parse(jsonText) as SummaryResult;

    // Validate
    if (!parsed.summary || !Array.isArray(parsed.key_takeaways) || typeof parsed.sentiment_score !== "number") {
        throw new Error("Invalid summary format from Claude");
    }

    return parsed;
}

/**
 * Summarize all press releases that don't have an AI summary yet.
 * Processes in batches to respect rate limits.
 */
export async function summarizeUnsummarized(limit = 10): Promise<{ processed: number; errors: number }> {
    const supabase = createAdminClient();

    // Get press releases without summaries
    const { data: releases, error } = await supabase
        .from("press_releases")
        .select("id, title, content")
        .is("ai_summary", null)
        .not("content", "is", null)
        .order("published_at", { ascending: false })
        .limit(limit);

    if (error || !releases) {
        console.error("[summarize] Failed to fetch releases:", error?.message);
        return { processed: 0, errors: 0 };
    }

    if (releases.length === 0) {
        console.log("[summarize] No unsummarized releases found");
        return { processed: 0, errors: 0 };
    }

    console.log(`[summarize] Processing ${releases.length} press releases...`);

    let processed = 0;
    let errors = 0;

    for (const release of releases) {
        try {
            const result = await summarizePressRelease(release.title, release.content || "");

            const { error: updateError } = await supabase
                .from("press_releases")
                .update({
                    ai_summary: result.summary,
                    key_takeaways: result.key_takeaways,
                    sentiment_score: result.sentiment_score,
                })
                .eq("id", release.id);

            if (updateError) {
                console.error(`[summarize] Update error for ${release.id}:`, updateError.message);
                errors++;
            } else {
                console.log(`[summarize] ✓ ${release.title.slice(0, 60)}...`);
                processed++;
            }

            // Rate limit: wait 500ms between calls
            await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (err) {
            console.error(`[summarize] Error for "${release.title}":`, err);
            errors++;
        }
    }

    console.log(`[summarize] Done. Processed: ${processed}, Errors: ${errors}`);
    return { processed, errors };
}
