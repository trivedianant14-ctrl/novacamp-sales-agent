"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useLeadProfile, type LeadProfile } from "@/src/lib/lead-context";

const inputCls =
  "mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-700";

export default function DashboardPage() {
  const router = useRouter();
  const { profile, setProfile } = useLeadProfile();
  const { register, handleSubmit, reset } = useForm<LeadProfile>({ defaultValues: profile });

  // Sync form with context when it hydrates from localStorage
  useEffect(() => {
    reset(profile);
  }, [profile, reset]);

  const saveAndNavigate = (data: LeadProfile, path: string) => {
    setProfile(data);
    router.push(path);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-indigo-700 px-8 py-7">
        <h1 className="text-2xl font-bold text-white tracking-tight">NovaCamp Sales Agent</h1>
        <p className="mt-1 text-sm text-indigo-200">
          AI-powered pre-call prep and post-call follow-up for consultative sales teams
        </p>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-gray-900">Lead Profile</h2>
          <p className="mb-6 text-sm text-gray-500">Fill in what you know, then choose a workflow below.</p>

          <form className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input {...register("name")} className={inputCls} placeholder="Ananya Sharma" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Role</label>
                <input {...register("role")} className={inputCls} placeholder="Software Engineer" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <input {...register("company")} className={inputCls} placeholder="Infosys" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
                <input
                  type="number"
                  {...register("yoe")}
                  className={inputCls}
                  placeholder="4"
                  min={0}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Intent / Goal</label>
              <input
                {...register("intent")}
                className={inputCls}
                placeholder="Transition to Data Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">LinkedIn Context</label>
              <textarea
                {...register("linkedinContext")}
                rows={4}
                className={inputCls}
                placeholder="Paste relevant LinkedIn details: degree, past companies, certifications, projects, or any other context about the lead"
              />
            </div>

            <div className="pt-1">
              <label className="block text-sm font-medium text-gray-700">
                Recipient WhatsApp Number
                <span className="ml-1 font-normal text-gray-400">(BDA for pre-call · lead for post-call)</span>
              </label>
              <input
                {...register("recipientPhone")}
                className={inputCls}
                placeholder="+91XXXXXXXXXX"
              />
              <p className="mt-1 text-xs text-gray-400">
                Must be joined to the Twilio WhatsApp sandbox. Format: +countrycode followed by number.
              </p>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleSubmit((data) => saveAndNavigate(data, "/dashboard/pre-call"))}
                className="flex-1 rounded-xl bg-indigo-700 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 transition-colors"
              >
                Pre-Call Prep →
              </button>
              <button
                type="button"
                onClick={handleSubmit((data) => saveAndNavigate(data, "/dashboard/post-call"))}
                className="flex-1 rounded-xl border-2 border-indigo-700 bg-white px-6 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-offset-2 transition-colors"
              >
                Post-Call Follow-up →
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
