# NovaCamp Sales Agent

## What you built

An AI agent built for consultative sales teams that targets the two highest-leverage drop-off points in the sales funnel: the 10 seconds before an advisor dials (where generic openings kill pickup rates) and the gap between a good call and the next step (where trust hasn't been built yet to convert). Both outputs are delivered on WhatsApp.

NovaCamp is a fictional edtech company used here as a reference implementation. The tool is designed to be configurable — swap the knowledge base (`src/lib/novacamp-kb.json`), update the system prompts in the API routes, and the entire pipeline adapts to any consultative sales context: edtech, SaaS, financial services, or otherwise.

**How this works in production:** A lead fills out a form. The form data hits a webhook, the agent auto-generates a persona-classified pre-call brief, and the advisor's team lead gets notified. The TL assigns an advisor, reviews the brief, edits if needed, and sends it to the advisor's WhatsApp. After the call, the recording flows through Whisper for transcription, the agent extracts unanswered questions, generates a personalized PDF grounded in real program data, and the TL or advisor reviews it before it reaches the lead. Nothing lead-facing fires without human approval.

**What this prototype does:** The advisor manually enters the lead profile, pastes a transcript or uploads audio, and reviews all outputs before sending. The AI pipeline is identical to production: persona classification, structured brief generation with confidence tags (FACT / INFERRED / MISSING), question extraction from transcript/audio, and PDF generation grounded in the knowledge base. The manual input is a scoping decision for a prototype build, not a design choice. The webhook + CRM integration is the obvious next step.

Three persona archetypes (Skeptical Switcher, Senior Validator, Anxious Aspirer) are provided as classification anchors, but the classifier reasons over the actual profile and will create new labels when a lead doesn't fit the predefined types. The PDFs differ in tone, content framing, and visual template per persona. The brief uses honest confidence tagging so the advisor knows what is fact, what is inferred, and what is missing before they dial.

Stack: Next.js 16, Claude Sonnet 4.6, OpenAI Whisper, React-PDF, Twilio WhatsApp Sandbox, Vercel.

## One failure

The PDF generation leaks system-prompt instructions into lead-facing content. Internal coaching text like "Frame it as a calibration exercise" appeared inside the rendered PDF instead of staying advisor-only. Root cause: the LLM mixes lead-facing copy and its own reasoning in the same JSON field. Fix applied: stricter output schema separating the two (`cta.body` for lead-facing, `cta.test_framing` for advisor-only), plus post-processing to strip leaked instructions before rendering.

## Scale plan

At 100K leads/month, two things break first. LLM cost: each lead triggers 2-3 Claude calls at ~$0.03 each, totaling $6-9K/month. Fix with Anthropic's Batch API (50% cheaper) for non-urgent PDFs, cache persona classifications so the model doesn't re-reason from scratch, and pre-chunk KB retrieval per program to shrink prompts. Twilio rate limits: sandbox caps at ~1 msg/sec. Fix with Twilio Business API, pre-approved templates, concurrent send queues, and retry with backoff. PDF rendering is stateless and CPU-bound, scales horizontally on serverless without changes.
