# BDA Agent

## What you built

An AI agent that targets the two highest-leverage drop-off points in Scaler's sales funnel: the 10 seconds before a BDA dials (where generic openings kill pickup rates) and the gap between a good call and the entrance test (where trust hasn't been built yet to convert). Both outputs are delivered on WhatsApp.

**How this works in production:** A lead fills out a form on Scaler's site. The form data hits a webhook, the agent auto-generates a persona-classified pre-call brief, and the BDA's team lead gets notified. The TL assigns a BDA, reviews the brief, edits if needed, and sends it to the BDA's WhatsApp. After the call, the recording flows through Whisper for transcription, the agent extracts unanswered questions, generates a personalized PDF grounded in real Scaler data, and the TL or BDA reviews it before it reaches the lead. Nothing lead-facing fires without human approval.

**What this prototype does:** The BDA manually enters the lead profile, pastes a transcript or uploads audio, and reviews all outputs before sending. The AI pipeline is identical to production: persona classification, structured nudge generation with confidence tags (FACT / INFERRED / MISSING), question extraction from transcript/audio, and PDF generation grounded in a curated knowledge base scraped from scaler.com. The manual input is a scoping decision for a 5-hour build, not a design choice. The webhook + CRM integration is the obvious next step.

Three persona archetypes (Skeptical Switcher, Senior Validator, Anxious Aspirer) are provided as classification anchors, but the classifier reasons over the actual profile and will create new labels when a lead doesn't fit the predefined types. The PDFs differ in tone, content framing, and visual template per persona. The nudge uses honest confidence tagging so the BDA knows what is fact, what is inferred, and what is missing before they dial.

Stack: Next.js 16, Claude Sonnet 4.6, OpenAI Whisper, React-PDF, Twilio WhatsApp Sandbox, Vercel.

## One failure

The PDF generation leaks system-prompt instructions into lead-facing content. Internal coaching text like "Frame it as a calibration exercise" appeared inside the rendered PDF instead of staying BDA-only. Root cause: the LLM mixes lead-facing copy and its own reasoning in the same JSON field. Fix applied: stricter output schema separating the two, plus post-processing to strip leaked instructions.

## Scale plan

At 100K leads/month, two things break first. LLM cost: each lead triggers 2-3 Claude calls at ~$0.03 each, totaling $6-9K/month. Fix with Anthropic's Batch API (50% cheaper) for non-urgent PDFs, cache persona classifications so the model doesn't re-reason from scratch, and pre-chunk KB retrieval per program to shrink prompts. Twilio rate limits: sandbox caps at ~1 msg/sec. Fix with Twilio Business API, pre-approved templates, concurrent send queues, and retry with backoff. PDF rendering is stateless and CPU-bound, scales horizontally on serverless without changes.
