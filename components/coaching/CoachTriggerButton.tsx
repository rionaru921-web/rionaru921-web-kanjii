"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { CoachDialog } from "./CoachDialog";
import type { PlanType } from "@/lib/coaching/planContext";

// Only rendered by the caller when the plan is completed and the user isn't
// a guest (coaching API rejects anonymous users outright — see
// app/api/coaching/session/route.ts). hasSession is fetched server-side by
// the detail page so the button label doesn't flash between renders.
export function CoachTriggerButton({
  planType,
  planId,
  hasSession,
}: {
  planType: PlanType;
  planId: string;
  hasSession: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold-gradient py-2.5 text-sm font-semibold text-white shadow-gold transition-opacity hover:opacity-90"
      >
        <GraduationCap size={16} />
        {hasSession ? "振り返りを見る" : "AIコーチと振り返る"}
      </button>
      <CoachDialog
        planType={planType}
        planId={planId}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
