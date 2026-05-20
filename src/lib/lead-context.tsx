"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type LeadProfile = {
  name: string;
  role: string;
  company: string;
  yoe: string;
  intent: string;
  linkedinContext: string;
  recipientPhone: string;
};

const empty: LeadProfile = {
  name: "",
  role: "",
  company: "",
  yoe: "",
  intent: "",
  linkedinContext: "",
  recipientPhone: "",
};

type LeadCtxType = {
  profile: LeadProfile;
  setProfile: (p: LeadProfile) => void;
};

const LeadCtx = createContext<LeadCtxType>({ profile: empty, setProfile: () => {} });

const STORAGE_KEY = "nc-lead-profile";

export function LeadProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<LeadProfile>(empty);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setProfileState(JSON.parse(stored));
    } catch {}
  }, []);

  const setProfile = (p: LeadProfile) => {
    setProfileState(p);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    } catch {}
  };

  return <LeadCtx.Provider value={{ profile, setProfile }}>{children}</LeadCtx.Provider>;
}

export function useLeadProfile() {
  return useContext(LeadCtx);
}
