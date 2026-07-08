import type { ReactNode } from "react";
import LegalHeader from "@/components/legal/LegalHeader";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-primary">
      <LegalHeader />
      {children}
    </div>
  );
}
