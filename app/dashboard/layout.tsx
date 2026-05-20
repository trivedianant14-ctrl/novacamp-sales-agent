import { LeadProvider } from "@/src/lib/lead-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <LeadProvider>{children}</LeadProvider>;
}
