"use client";

import { useEffect, useState } from "react";
import { Check, X, HelpCircle, Loader2, type LucideIcon } from "lucide-react";
import AttendanceStatusBadge from "@/components/manual-plans/AttendanceStatusBadge";
import type { AttendanceStatus, ManualPlanMember } from "@/lib/manual-plans/types";

const OPTIONS: { value: AttendanceStatus; label: string; icon: LucideIcon; activeClass: string }[] = [
  { value: "attending", label: "参加する", icon: Check, activeClass: "bg-emerald-50 border-emerald-400 text-emerald-600" },
  { value: "declined", label: "不参加", icon: X, activeClass: "bg-gray-100 border-gray-400 text-gray-600" },
  { value: "maybe", label: "未定", icon: HelpCircle, activeClass: "bg-orange-50 border-orange-400 text-orange-600" },
];

function storageKey(shareToken: string) {
  return `kanjii_attendance_member_${shareToken}`;
}

// Kept as sessionStorage (not localStorage) since attendees may be on a
// shared/public device — the selected identity shouldn't persist beyond
// the browser tab's lifetime.
export default function AttendanceForm({
  shareToken,
  members: initialMembers,
}: {
  shareToken: string;
  members: ManualPlanMember[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(storageKey(shareToken));
    if (stored && members.some((m) => m.id === stored)) {
      setSelectedId(stored);
    }
    // Only needs to run once on mount to restore a prior selection —
    // re-running on every `members` update (e.g. right after this same
    // effect sets state) would be redundant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareToken]);

  const selectedMember = members.find((m) => m.id === selectedId) ?? null;

  function selectMember(id: string) {
    setSelectedId(id);
    sessionStorage.setItem(storageKey(shareToken), id);
    setError(null);
  }

  function clearSelection() {
    setSelectedId(null);
    sessionStorage.removeItem(storageKey(shareToken));
    setError(null);
  }

  async function updateAttendance(status: AttendanceStatus) {
    if (!selectedMember) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/share/plan/${shareToken}/attendance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: selectedMember.id, attendance_status: status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "更新に失敗しました。");
      }
      setMembers((prev) =>
        prev.map((m) => (m.id === selectedMember.id ? { ...m, attendance_status: status } : m))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  if (members.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gold/20 bg-white p-6">
      {selectedMember ? (
        <>
          <p className="text-sm text-ink/60">こんにちは、{selectedMember.name}さん</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-lg font-semibold text-ink">出欠を教えてください</p>
            <AttendanceStatusBadge status={selectedMember.attendance_status} />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = selectedMember.attendance_status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateAttendance(opt.value)}
                  disabled={saving}
                  className={`flex flex-col items-center gap-1 rounded-xl px-2 py-3 text-xs font-semibold border transition-colors disabled:opacity-60 ${
                    active ? opt.activeClass : "border-gold/15 text-ink-secondary hover:border-gold/30"
                  }`}
                >
                  {saving && active ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
                  {opt.label}
                </button>
              );
            })}
          </div>

          {error && <p className="text-xs text-vermilion mt-2 text-center">{error}</p>}

          <button
            type="button"
            onClick={clearSelection}
            className="mt-4 text-sm text-ink/50 underline"
          >
            別の人として回答する
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-ink/70">あなたのお名前を選んでください</p>
          <div className="mt-3 grid gap-2">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => selectMember(m.id)}
                className="flex items-center justify-between gap-2 rounded-xl border border-gold/15 px-4 py-2.5 text-sm text-ink text-left hover:border-gold/30 hover:bg-gold/5 transition-colors"
              >
                {m.name}
                <AttendanceStatusBadge status={m.attendance_status} />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
