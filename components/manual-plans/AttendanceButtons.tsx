"use client";

import { useState } from "react";
import { Check, X, HelpCircle, type LucideIcon } from "lucide-react";

type Choice = "attending" | "declined" | "maybe";

const OPTIONS: { value: Choice; label: string; icon: LucideIcon }[] = [
  { value: "attending", label: "参加する", icon: Check },
  { value: "declined", label: "参加しない", icon: X },
  { value: "maybe", label: "未定", icon: HelpCircle },
];

// UI-only for now — no DB write. Attendance persistence for anonymous
// share-page visitors is a Phase B/C concern (would need its own
// unauthenticated-write RLS policy, deliberately out of scope here).
export default function AttendanceButtons() {
  const [choice, setChoice] = useState<Choice | null>(null);

  return (
    <div>
      <p className="text-xs text-ink-secondary mb-2 text-center">出欠を選択してください</p>
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const active = choice === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setChoice(opt.value)}
              className={`flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-xs font-semibold border transition-colors ${
                active
                  ? "bg-gold-gradient border-transparent text-white"
                  : "border-gold/15 text-ink-secondary hover:border-gold/30"
              }`}
            >
              <Icon size={16} />
              {opt.label}
            </button>
          );
        })}
      </div>
      {choice && (
        <p className="text-xs text-sage text-center mt-2">
          回答ありがとうございます！(この画面のみに反映されます)
        </p>
      )}
    </div>
  );
}
