"use client";

import { useState } from "react";
import Link from "next/link";
import { useLeadProfile } from "@/src/lib/lead-context";
import { LeadSummaryCard } from "@/src/components/lead-summary-card";
import { Toast, type ToastState } from "@/src/components/toast";

const inputCls =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-700";

// ─── NudgeRenderer ─────────────────────────────────────────────────────────────
function NudgeRenderer({ text }: { text: string }) {
  return (
    <div className="space-y-0.5 text-sm text-gray-800 leading-relaxed font-mono">
      {text.split("\n").map((line, i) => {
        const isSectionHeader = /^\d+\.\s+[A-Z\s]+:/.test(line);
        if (line.trim() === "") return <div key={i} className="h-2" />;
        return (
          <p key={i} className={isSectionHeader ? "font-bold text-gray-900 mt-3 first:mt-0" : "pl-1"}>
            {line}
          </p>
        );
      })}
    </div>
  );
}

export default function PreCallPage() {
  const { profile } = useLeadProfile();

  const [nudge, setNudge] = useState<string | null>(null);
  const [nudgeLoading, setNudgeLoading] = useState(false);
  const [nudgeError, setNudgeError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableNudge, setEditableNudge] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const handleGenerate = async () => {
    setNudgeLoading(true);
    setNudgeError(null);
    setIsEditing(false);
    setEditableNudge("");
    try {
      const { name, role, company, yoe, intent, linkedinContext } = profile;
      const res = await fetch("/api/nudge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, role, company, yoe, intent, linkedinContext }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `API error ${res.status}`);
      }
      const json = await res.json();
      setNudge(json.nudge);
    } catch (e) {
      setNudgeError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setNudgeLoading(false);
    }
  };

  const handleSend = async () => {
    if (!nudge) return;
    const to = profile.recipientPhone.trim();
    if (!to) {
      setToast({ message: "Add a recipient WhatsApp number on the lead profile page.", type: "error" });
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: nudge, to }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Send error ${res.status}`);
      }
      setToast({ message: "Brief sent to BDA on WhatsApp!", type: "success" });
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Failed to send", type: "error" });
    } finally {
      setSending(false);
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

        {/* Main card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">Pre-Call Brief</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Generated brief is sent to the BDA on WhatsApp before they dial.
            </p>
          </div>

          {nudgeError && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {nudgeError}
            </p>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={nudgeLoading}
            className="mb-6 rounded-lg bg-indigo-700 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {nudgeLoading ? "Generating…" : "Generate Pre-Call Brief"}
          </button>

          {/* Brief preview */}
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 min-h-24">
            {nudgeLoading ? (
              <p className="text-sm italic text-gray-400 animate-pulse">Generating brief via Claude…</p>
            ) : nudge ? (
              <>
                {isEditing ? (
                  <>
                    <textarea
                      className="w-full rounded-lg border border-green-300 bg-white px-3 py-2 text-sm text-gray-900 font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-green-500"
                      rows={20}
                      value={editableNudge}
                      onChange={(e) => setEditableNudge(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-gray-400">{editableNudge.length} chars</p>
                  </>
                ) : (
                  <NudgeRenderer text={nudge} />
                )}

                <div className="mt-4 flex flex-wrap gap-2 border-t border-green-200 pt-4">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => { setNudge(editableNudge); setIsEditing(false); }}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => { setEditableNudge(nudge); setIsEditing(true); }}
                        className="rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={handleSend}
                        disabled={sending}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {sending ? "Sending…" : "Send to BDA on WhatsApp"}
                      </button>
                    </>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm italic text-gray-400">
                Brief will appear here after you click Generate Pre-Call Brief.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
