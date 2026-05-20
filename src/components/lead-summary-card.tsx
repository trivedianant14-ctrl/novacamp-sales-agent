import Link from "next/link";
import type { LeadProfile } from "@/src/lib/lead-context";

export function LeadSummaryCard({ profile }: { profile: LeadProfile }) {
  const meta = [profile.role, profile.company].filter(Boolean).join(" · ");

  return (
    <div className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="font-semibold text-gray-900 truncate">{profile.name || <span className="text-gray-400 font-normal">No name entered</span>}</p>
        {meta && <p className="text-sm text-gray-500 truncate">{meta}{profile.yoe ? ` · ${profile.yoe} YoE` : ""}</p>}
        {profile.intent && <p className="mt-0.5 text-sm text-gray-600 truncate">Goal: {profile.intent}</p>}
      </div>
      <Link
        href="/dashboard"
        className="shrink-0 text-xs font-medium text-indigo-700 hover:underline"
      >
        Edit
      </Link>
    </div>
  );
}
