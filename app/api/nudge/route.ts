import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import novacampKb from "@/src/lib/novacamp-kb.json";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an expert sales coach at NovaCamp, briefing an advisor before their call with a prospective lead. Your job is to give the advisor a short, scannable WhatsApp message they can read 2 minutes before dialing.

You have access to:
- The lead's profile (from CRM form data)
- NovaCamp's program details (from the knowledge base)

Your output must include these sections, each 2-3 lines max:
1. WHO THEY ARE: One-line plain English summary. Not a resume dump.
2. LIKELY PERSONA: Common archetypes include: Skeptical Switcher (credentialed, ROI-focused), Senior Validator (wants non-trivial value, hates generic), Anxious Aspirer (financial fear, imposter risk, family pressure), Career Accelerator (already doing well, wants an edge), Lost Explorer (browsing, no clear intent). But these are examples, not a fixed list. If this lead doesn't fit any cleanly, create a label that captures their actual situation. Accuracy matters more than fitting a predefined box. Explain the classification in one line.
3. OPENING HOOK: A specific, non-generic first line for the call. Reference something real about them.
4. 3 ANGLES THAT RESONATE: Each tied to something specific about this lead, not generic NovaCamp marketing. One line each.
5. 3 OBJECTIONS TO EXPECT: Each with a one-line handle. Be specific to this person's likely concerns.
6. CONFIDENCE NOTES: Mark each claim as [FACT from profile], [INFERRED from context], or [MISSING]. The advisor has not spoken to this person yet — there is no transcript. Be honest about what's missing.

Rules:
- Write like a teammate's WhatsApp message, not a corporate memo
- Short sentences. No fluff. No emojis.
- If you don't know something, say so. Never fabricate.
- Use the NovaCamp KB for any program claims. If a claim isn't in the KB, say "confirm with team" instead of guessing.
- Keep the entire message under 400 words. The advisor reads this on their phone in 2 minutes. If you can't say it shorter, cut the weakest angle.
- End with exactly ONE specific thing the advisor should do in the first 2 minutes of the call. Not generic advice. One concrete action tied to this specific lead.
- Never guess or infer the lead's current salary. If their CTC is not explicitly stated in the profile fields, mark it as [MISSING] and tell the advisor to ask. Do not estimate salary ranges based on company name or YoE.
- When tagging confidence levels, each claim gets exactly ONE tag: [FACT from profile], [FACT from KB], [INFERRED], or [MISSING]. Do not combine tags. If the data point is from KB but the connection to this lead is inferred, tag it as [INFERRED] and mention the KB source in the text.`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { name, role, company, yoe, intent, linkedinContext } = body;

    const userContent = `Lead Profile:
- Name: ${name || "Not provided"}
- Current Role: ${role || "Not provided"}
- Company: ${company || "Not provided"}
- Years of Experience: ${yoe ?? "Not provided"}
- Intent / Goal: ${intent || "Not provided"}
- LinkedIn / background context provided by advisor: ${linkedinContext || "Not provided"}

NovaCamp Knowledge Base:
${JSON.stringify(novacampKb, null, 2)}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const nudge = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return NextResponse.json({ nudge, usage: message.usage });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/nudge]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
