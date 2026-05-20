"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useLeadProfile } from "@/src/lib/lead-context";
import { LeadSummaryCard } from "@/src/components/lead-summary-card";
import { PdfEmbed } from "@/src/components/pdf-embed";
import { Toast, type ToastState } from "@/src/components/toast";
import type { ExtractedQuestion, GeneratedPdf, PdfSection } from "@/src/lib/types";

const inputCls =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-700";

// ─── Badge helpers ─────────────────────────────────────────────────────────────
const PERSONA_LABELS: Record<string, string> = {
  SKEPTICAL_SWITCHER: "Skeptical Switcher",
  SENIOR_VALIDATOR: "Senior Validator",
  ANXIOUS_ASPIRER: "Anxious Aspirer",
};
const URGENCY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-gray-100 text-gray-600",
};
const QUALITY_COLORS: Record<string, string> = {
  unanswered: "bg-red-50 text-red-600",
  weak: "bg-orange-50 text-orange-600",
  partial: "bg-yellow-50 text-yellow-600",
};

// ─── QuestionsPreview ──────────────────────────────────────────────────────────
function QuestionsPreview({ questions }: { questions: ExtractedQuestion[] }) {
  if (!Array.isArray(questions) || questions.length === 0) return null;
  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <p className="mb-3 text-xs font-semibold text-amber-700">
        {questions.length} open question{questions.length !== 1 ? "s" : ""} extracted from transcript
      </p>
      <ul className="space-y-2">
        {questions.map((q, i) => (
          <li key={i} className="flex flex-col gap-1">
            <p className="text-sm text-gray-800">{q.question}</p>
            <div className="flex flex-wrap gap-1.5">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${URGENCY_COLORS[q.urgency]}`}>
                {q.urgency}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${QUALITY_COLORS[q.bda_response_quality]}`}>
                {q.bda_response_quality}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                {q.category.replace(/_/g, " ")}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── PdfPreview ────────────────────────────────────────────────────────────────
function PdfPreview({ pdf }: { pdf: GeneratedPdf }) {
  return (
    <div className="w-full space-y-5 text-sm text-gray-800">
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-semibold text-indigo-700">
          {PERSONA_LABELS[pdf.persona] ?? pdf.persona}
        </span>
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900">{pdf.headline}</h3>
        <p className="mt-1 leading-relaxed text-gray-600">{pdf.greeting}</p>
      </div>
      {pdf.sections.map((section, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
          <h4 className="font-semibold text-gray-900">{section.title}</h4>
          <p className="leading-relaxed text-gray-700 whitespace-pre-line">{section.content}</p>
          {section.evidence.length > 0 && (
            <ul className="list-disc space-y-1 pl-4 text-gray-600">
              {section.evidence.map((e, j) => <li key={j}>{e}</li>)}
            </ul>
          )}
          {section.source_note && (
            <p className="text-xs italic text-gray-400">Source: {section.source_note}</p>
          )}
        </div>
      ))}
      <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 space-y-2">
        <p className="font-semibold text-indigo-900">{pdf.cta.headline}</p>
        <p className="text-indigo-800">{pdf.cta.body}</p>
        <p className="text-xs italic text-indigo-600">{pdf.cta.test_framing}</p>
      </div>
      <div className="rounded-lg border border-green-200 bg-green-50 p-3">
        <p className="mb-1 text-xs font-semibold text-green-700">WhatsApp covering message (advisor only)</p>
        <p className="leading-relaxed text-green-900">{pdf.whatsapp_message}</p>
      </div>
    </div>
  );
}

// ─── EditablePdfForm ───────────────────────────────────────────────────────────
function EditablePdfForm({ value, onChange }: { value: GeneratedPdf; onChange: (updated: GeneratedPdf) => void }) {
  const updateSection = (i: number, patch: Partial<PdfSection>) => {
    const sections = value.sections.map((s, idx) => (idx === i ? { ...s, ...patch } : s));
    onChange({ ...value, sections });
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="space-y-3">
        <div>
          <label className="block font-medium text-gray-700">Headline</label>
          <input className={inputCls} value={value.headline} onChange={(e) => onChange({ ...value, headline: e.target.value })} />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Greeting</label>
          <textarea className={inputCls} rows={2} value={value.greeting} onChange={(e) => onChange({ ...value, greeting: e.target.value })} />
        </div>
      </div>

      {value.sections.map((section, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Section {i + 1}</p>
          <div>
            <label className="block font-medium text-gray-700">Title</label>
            <input className={inputCls} value={section.title} onChange={(e) => updateSection(i, { title: e.target.value })} />
          </div>
          <div>
            <label className="block font-medium text-gray-700">Content</label>
            <textarea className={inputCls} rows={5} value={section.content} onChange={(e) => updateSection(i, { content: e.target.value })} />
          </div>
          <div>
            <label className="block font-medium text-gray-700">
              Evidence bullets <span className="font-normal text-gray-400">(one per line)</span>
            </label>
            <textarea
              className={inputCls}
              rows={3}
              value={section.evidence.join("\n")}
              onChange={(e) => updateSection(i, { evidence: e.target.value.split("\n").filter((l) => l.trim() !== "") })}
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700">Source note</label>
            <input className={inputCls} value={section.source_note} onChange={(e) => updateSection(i, { source_note: e.target.value })} />
          </div>
        </div>
      ))}

      <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">Call to Action</p>
        <div>
          <label className="block font-medium text-gray-700">CTA Headline</label>
          <input className={inputCls} value={value.cta.headline} onChange={(e) => onChange({ ...value, cta: { ...value.cta, headline: e.target.value } })} />
        </div>
        <div>
          <label className="block font-medium text-gray-700">CTA Body</label>
          <textarea className={inputCls} rows={2} value={value.cta.body} onChange={(e) => onChange({ ...value, cta: { ...value.cta, body: e.target.value } })} />
        </div>
        <div>
          <label className="block font-medium text-gray-700">Test framing</label>
          <textarea className={inputCls} rows={2} value={value.cta.test_framing} onChange={(e) => onChange({ ...value, cta: { ...value.cta, test_framing: e.target.value } })} />
        </div>
      </div>

      <div className="rounded-lg border border-green-100 bg-green-50 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-green-600">
          WhatsApp covering message (advisor only — not in PDF)
        </p>
        <textarea
          className={inputCls}
          rows={3}
          value={value.whatsapp_message}
          onChange={(e) => onChange({ ...value, whatsapp_message: e.target.value })}
        />
      </div>
    </div>
  );
}

// ─── PostCallPage ──────────────────────────────────────────────────────────────
export default function PostCallPage() {
  const { profile } = useLeadProfile();

  const [transcript, setTranscript] = useState("");
  const audioRef = useRef<HTMLInputElement>(null);

  const [questions, setQuestions] = useState<ExtractedQuestion[]>([]);
  const [pdf, setPdf] = useState<GeneratedPdf | null>(null);
  const [pdfId, setPdfId] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfStatus, setPdfStatus] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editablePdf, setEditablePdf] = useState<GeneratedPdf | null>(null);

  const [toast, setToast] = useState<ToastState | null>(null);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
  }, [pdfUrl]);

  const renderAndSetUrl = async (pdfData: GeneratedPdf): Promise<string | null> => {
    if (pdfUrl) { URL.revokeObjectURL(pdfUrl); setPdfUrl(null); }
    const res = await fetch("/api/render-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pdf: pdfData }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? `Render error ${res.status}`);
    }
    const id = res.headers.get("X-PDF-Id");
    const blob = await res.blob();
    setPdfUrl(URL.createObjectURL(blob));
    return id;
  };

  const handleGenerate = async () => {
    setPdfLoading(true);
    setPdfError(null);
    setQuestions([]);
    setPdf(null);
    setPdfId(null);
    setIsEditing(false);
    setEditablePdf(null);
    if (pdfUrl) { URL.revokeObjectURL(pdfUrl); setPdfUrl(null); }

    try {
      const { name, role, company, yoe, intent, linkedinContext } = profile;
      let finalTranscript = transcript.trim();
      const audioFile = audioRef.current?.files?.[0] ?? null;

      if (!finalTranscript && !audioFile) {
        throw new Error("Please paste a transcript or upload an audio file.");
      }

      if (!finalTranscript && audioFile) {
        setPdfStatus("Transcribing audio…");
        const fd = new FormData();
        fd.append("audio", audioFile);
        const transcribeRes = await fetch("/api/transcribe", { method: "POST", body: fd });
        if (!transcribeRes.ok) {
          const err = await transcribeRes.json().catch(() => ({}));
          throw new Error(err.error ?? `Transcription error ${transcribeRes.status}`);
        }
        const { transcript: transcribed } = await transcribeRes.json() as { transcript: string };
        finalTranscript = transcribed;
        setTranscript(transcribed);
      }

      setPdfStatus("Extracting open questions from transcript…");
      const extractRes = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: finalTranscript }),
      });
      if (!extractRes.ok) {
        const err = await extractRes.json().catch(() => ({}));
        throw new Error(err.error ?? `Extract API error ${extractRes.status}`);
      }
      const extractData = await extractRes.json();
      const extracted: ExtractedQuestion[] = Array.isArray(extractData) ? extractData : (extractData.questions ?? []);
      setQuestions(extracted);

      setPdfStatus("Generating personalised PDF content…");
      const generateRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, company, yoe, intent, linkedinContext, questions: extracted }),
      });
      if (!generateRes.ok) {
        const err = await generateRes.json().catch(() => ({}));
        throw new Error(err.error ?? `Generate API error ${generateRes.status}`);
      }
      const { pdf: generated } = await generateRes.json() as { pdf: GeneratedPdf };
      setPdf(generated);

      setPdfStatus("Rendering PDF…");
      const id = await renderAndSetUrl(generated);
      setPdfId(id);
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setPdfLoading(false);
      setPdfStatus(null);
    }
  };

  const handleSend = async () => {
    if (!pdf || !pdfId) return;
    const to = profile.recipientPhone.trim();
    if (!to) {
      setToast({ message: "Add a recipient WhatsApp number on the lead profile page.", type: "error" });
      return;
    }
    setSending(true);
    try {
      const pdfPublicUrl = `${window.location.origin}/api/pdf/${pdfId}`;
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: pdf.whatsapp_message, to, pdfUrl: pdfPublicUrl }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Send error ${res.status}`);
      }
      setToast({ message: "PDF sent to lead on WhatsApp!", type: "success" });
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Failed to send", type: "error" });
    } finally {
      setSending(false);
    }
  };

  const handleSaveAndRerender = async () => {
    if (!editablePdf) return;
    setPdfLoading(true);
    setPdfError(null);
    setPdfStatus("Re-rendering PDF…");
    try {
      const id = await renderAndSetUrl(editablePdf);
      setPdfId(id);
      setPdf(editablePdf);
      setIsEditing(false);
      setEditablePdf(null);
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : "Failed to re-render");
    } finally {
      setPdfLoading(false);
      setPdfStatus(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-indigo-700 px-8 py-7">
        <h1 className="text-2xl font-bold text-white tracking-tight">NovaCamp Sales Agent</h1>
        <p className="mt-1 text-sm text-indigo-200">
          AI-powered pre-call prep and post-call follow-up for consultative sales teams
        </p>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-8 space-y-6">
        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-1 text-sm text-indigo-700 hover:underline">
          ← Back to Lead Profile
        </Link>

        {/* Lead summary */}
        <LeadSummaryCard profile={profile} />

        {/* Transcript + generate */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Post-Call Follow-up</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Generates a personalised PDF sent to the lead on WhatsApp after the call.
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Call Transcript</label>
              <textarea
                rows={6}
                className={inputCls}
                placeholder="Paste transcript here…"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Audio Upload{" "}
                <span className="font-normal text-gray-400">(optional — transcribed if no transcript is pasted)</span>
              </label>
              <input
                ref={audioRef}
                type="file"
                accept="audio/*"
                className="mt-1 block text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
              />
            </div>
          </div>

          {pdfError && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {pdfError}
            </p>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={pdfLoading}
            className="rounded-lg bg-indigo-700 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {pdfLoading ? (pdfStatus ?? "Working…") : "Generate PDF"}
          </button>
        </div>

        {/* PDF output */}
        {(pdfLoading || pdf) && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {pdfLoading ? (
              <p className="text-sm italic text-gray-400 animate-pulse">{pdfStatus ?? "Working…"}</p>
            ) : pdf ? (
              <>
                <QuestionsPreview questions={questions} />

                {isEditing && editablePdf ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-700">Editing PDF content</p>
                      <span className="text-xs text-gray-400">Changes re-render the PDF on save</span>
                    </div>
                    <EditablePdfForm value={editablePdf} onChange={setEditablePdf} />
                    <div className="flex gap-3 border-t border-gray-200 pt-4">
                      <button
                        type="button"
                        onClick={handleSaveAndRerender}
                        className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
                      >
                        Save &amp; Re-render PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => { setIsEditing(false); setEditablePdf(null); }}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <PdfPreview pdf={pdf} />

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      {pdfUrl ? (
                        <a
                          href={pdfUrl}
                          download="novacamp-roadmap.pdf"
                          className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-800"
                        >
                          Download PDF
                        </a>
                      ) : (
                        <span className="rounded-lg bg-indigo-200 px-4 py-2 text-sm font-medium text-indigo-400 cursor-wait">
                          Rendering PDF…
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={sending || !pdfId}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {sending ? "Sending…" : "Approve & Send"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setEditablePdf(JSON.parse(JSON.stringify(pdf))); setIsEditing(true); }}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => { setPdf(null); setPdfId(null); setPdfUrl(null); setQuestions([]); }}
                        className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
                      >
                        Skip
                      </button>
                    </div>

                    {pdfUrl && (
                      <div className="mt-6">
                        <p className="mb-2 text-xs font-medium text-gray-500">PDF Preview</p>
                        <PdfEmbed url={pdfUrl} />
                      </div>
                    )}
                  </>
                )}
              </>
            ) : null}
          </div>
        )}
      </div>
    </main>
  );
}
