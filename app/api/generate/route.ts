import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import novacampKb from "@/src/lib/novacamp-kb.json";
import { extractJSON } from "@/src/lib/parse-json";
import type { GeneratedPdf, PdfSection } from "@/src/lib/types";
export type { GeneratedPdf, PdfSection };

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are creating a personalized post-call document for a prospective NovaCamp lead. This document will be sent as a PDF on WhatsApp after their call with an advisor. Its job is to build enough trust that the lead takes the next step.

You have:
- The lead's profile
- Their open questions from the call
- NovaCamp's knowledge base (real facts only)

First, classify the lead's persona. Common archetypes include:
- SKEPTICAL_SWITCHER: Credentialed, ROI-focused, compares alternatives. Tone: peer-to-peer, data-forward, no fluff. Show them numbers.
- SENIOR_VALIDATOR: Experienced, wants non-trivial value, hates generic. Tone: technical depth, instructor credibility, no hand-holding.
- ANXIOUS_ASPIRER: Financial fear, family pressure, imposter risk. Tone: warm, reassuring, step-by-step. Payment math, alumni stories from similar backgrounds.
- CAREER_ACCELERATOR: Already performing well, wants an edge or lateral move. Tone: peer-level, ambitious, outcome-focused.
- LOST_EXPLORER: Browsing, no clear intent, needs discovery. Tone: open-ended, low-pressure, exploratory.

But these are examples, not a fixed list. If the lead doesn't fit any of these cleanly, create a new label that captures their actual situation. The persona drives the tone and framing — accuracy matters more than fitting a predefined box. Use ALL_CAPS_WITH_UNDERSCORES for the persona field value.

Then generate the PDF content as JSON with this structure:
{
  "persona": "SKEPTICAL_SWITCHER" | "SENIOR_VALIDATOR" | "ANXIOUS_ASPIRER",
  "headline": "A one-line personalized headline for the document",
  "greeting": "A 2-line personalized opening that references something specific from their call",
  "sections": [
    {
      "title": "Section title addressing their specific question",
      "content": "2-4 paragraphs answering their question with real NovaCamp facts from the KB. Be specific. No generic marketing.",
      "evidence": ["Bullet point evidence items - alumni data, curriculum modules, outcomes"],
      "source_note": "Where this data comes from"
    }
  ],
  "cta": {
    "headline": "Personalized call-to-action headline",
    "body": "1-2 lines nudging them toward the next step, framed for their persona",
    "test_framing": "How to frame the next step for this persona — advisor-facing note only, not shown in PDF"
  },
  "whatsapp_message": "A short 2-3 line WhatsApp covering message to send with the PDF. Personalized, not generic."
}

Rules:
- Every claim must come from the NovaCamp KB provided. If a claim is not in the KB, say 'our team can share specifics on this' instead of fabricating.
- Each section must address a SPECIFIC question the lead asked, not generic program info.
- The document tone must match the persona.
- Keep total content to 2-3 pages worth when rendered.
- The 'cta.headline' and 'cta.body' fields are shown DIRECTLY to the lead inside the PDF. They must contain ONLY text addressed to the lead — no coaching instructions, no framing advice, no advisor-facing notes. Write them as if the lead is the only reader.
- The 'test_framing' field is the ONLY place for advisor-facing framing advice. It will NOT appear in the PDF — it is stripped before rendering. Do not duplicate this content in cta.headline or cta.body.
- The 'whatsapp_message' field is sent as a separate covering message on WhatsApp. It is NOT rendered in the PDF. Do not embed it in any section content, evidence bullet, or cta field.
- Do not put internal instructions, framing notes, or meta-commentary anywhere in the JSON except 'test_framing'.

Return ONLY valid JSON. No markdown formatting, no code fences, no preamble text.`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { name, role, company, yoe, intent, linkedinContext, questions } = body;

    const userContent = `Lead Profile:
- Name: ${name || "Not provided"}
- Current Role: ${role || "Not provided"}
- Company: ${company || "Not provided"}
- Years of Experience: ${yoe ?? "Not provided"}
- Intent / Goal: ${intent || "Not provided"}
- LinkedIn Context: ${linkedinContext || "Not provided"}

Open Questions from Call:
${JSON.stringify(questions ?? [], null, 2)}

NovaCamp Knowledge Base:
${JSON.stringify(novacampKb, null, 2)}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userContent }],
    });

    const raw = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    let pdf: GeneratedPdf;
    try {
      pdf = extractJSON(raw) as GeneratedPdf;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to parse Claude response";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ pdf, usage: message.usage });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/generate]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
