import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { extractJSON } from "@/src/lib/parse-json";
import type { ExtractedQuestion } from "@/src/lib/types";
export type { ExtractedQuestion };

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are analyzing a sales call transcript between an advisor at NovaCamp and a prospective lead. Extract every open question or concern the lead raised that was NOT adequately answered during the call.

For each question, return:
- question: The lead's actual question/concern in their own words
- category: One of: "pricing_roi", "curriculum_depth", "placement_outcomes", "program_fit", "logistics", "credibility"
- urgency: "high" (they pushed back or repeated it), "medium" (asked once), "low" (mentioned in passing)
- bda_response_quality: "unanswered" (BDA deflected or said "I'll get back"), "weak" (BDA gave a vague answer), "partial" (some info but incomplete)

Return ONLY valid JSON. No markdown formatting, no code fences, no preamble text.`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { transcript } = body;

    if (!transcript || typeof transcript !== "string" || transcript.trim().length === 0) {
      return NextResponse.json({ error: "transcript is required" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Call Transcript:\n${transcript}` }],
    });

    const raw = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    let questions: ExtractedQuestion[];
    try {
      questions = extractJSON(raw) as ExtractedQuestion[];
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to parse Claude response";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ questions, usage: message.usage });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/extract]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
