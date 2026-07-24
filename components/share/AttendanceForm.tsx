"use client";

import { useEffect, useState } from "react";
import { Check, X, HelpCircle, Loader2, type LucideIcon } from "lucide-react";
import AttendanceStatusBadge from "@/components/manual-plans/AttendanceStatusBadge";
import IdentitySelectionNotice from "@/components/share/IdentitySelectionNotice";
import { useToasts, ToastStack } from "@/components/ui/RealtimeToast";
import type { AttendanceStatus, ManualPlanMember } from "@/lib/manual-plans/types";

const OPTIONS: { value: AttendanceStatus; label: string; icon: LucideIcon; activeClass: string }[] = [
  { value: "attending", label: "参加する", icon: Check, activeClass: "bg-emerald-50 border-emerald-400 text-emerald-600" },
  { value: "declined", label: "不参加", icon: X, activeClass: "bg-washoku-red-soft border-washoku-red-soft text-washoku-red" },
  { value: "maybe", label: "未定", icon: HelpCircle, activeClass: "bg-orange-50 border-orange-400 text-orange-600" },
];

function storageKey(shareToken: string) {
  return `kanjii_attendance_member_${shareToken}`;
}

// Namespaced by both shareToken and memberId — switching to "someone else"
// via clearSelection() must never let their attendance update reuse a
// different member's cached secret.
function guestSecretKey(shareToken: string, memberId: string) {
  return `kanjii_guest_secret_${shareToken}_${memberId}`;
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
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | null>(null);
  const [isEditing, setIsEditing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toasts, pushToast } = useToasts();

  useEffect(() => {
    const stored = sessionStorage.getItem(storageKey(shareToken));
    if (stored && members.some((m) => m.id === stored)) {
      setSelectedId(stored);
      if (!sessionStorage.getItem(guestSecretKey(shareToken, stored))) {
        void ensureGuestSecret(stored);
      }
    }
    // Only needs to run once on mount to restore a prior selection —
    // re-running on every `members` update (e.g. right after this same
    // effect sets state) would be redundant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareToken]);

  const selectedMember = members.find((m) => m.id === selectedId) ?? null;

  // Enters edit mode fresh whenever a (new or restored) identity is picked —
  // a first-time member starts on the picker, a returning member who already
  // answered starts on the "決定済み" summary instead. Deliberately keyed
  // only on selectedId (not attendance_status) so this doesn't re-fire and
  // kick the form back into edit mode right after confirmSelection's own
  // successful save updates `members`.
  useEffect(() => {
    if (!selectedMember) return;
    const alreadyAnswered = selectedMember.attendance_status !== "pending";
    setIsEditing(!alreadyAnswered);
    setSelectedStatus(alreadyAnswered ? selectedMember.attendance_status : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Claims this member's guest_secret via /identify if we don't already
  // have one cached. First claim wins server-side — see
  // app/api/share/plan/[token]/identify/route.ts. On conflict, bounces back
  // to the name-picker rather than leaving the guest stuck on a member they
  // can't actually control.
  async function ensureGuestSecret(memberId: string): Promise<boolean> {
    if (sessionStorage.getItem(guestSecretKey(shareToken, memberId))) return true;

    try {
      const res = await fetch(`/api/share/plan/${shareToken}/identify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_id: memberId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "登録に失敗しました。");
      sessionStorage.setItem(guestSecretKey(shareToken, memberId), data.guest_secret);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました。");
      setSelectedId(null);
      sessionStorage.removeItem(storageKey(shareToken));
      return false;
    }
  }

  async function selectMember(id: string) {
    setError(null);
    const ok = await ensureGuestSecret(id);
    if (!ok) return;
    setSelectedId(id);
    sessionStorage.setItem(storageKey(shareToken), id);
  }

  function clearSelection() {
    setSelectedId(null);
    sessionStorage.removeItem(storageKey(shareToken));
    setError(null);
  }

  function startEditing() {
    if (!selectedMember) return;
    setIsEditing(true);
    setSelectedStatus(selectedMember.attendance_status === "pending" ? null : selectedMember.attendance_status);
    setError(null);
  }

  async function updateAttendance(status: AttendanceStatus): Promise<boolean> {
    if (!selectedMember) return false;
    const guestSecret = sessionStorage.getItem(guestSecretKey(shareToken, selectedMember.id));
    if (!guestSecret) {
      setError("認証に失敗しました。お名前を選び直してください。");
      clearSelection();
      return false;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/share/plan/${shareToken}/attendance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: selectedMember.id,
          attendance_status: status,
          guest_secret: guestSecret,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 403) {
          sessionStorage.removeItem(guestSecretKey(shareToken, selectedMember.id));
          clearSelection();
        }
        throw new Error(data.error ?? "更新に失敗しました。");
      }
      setMembers((prev) =>
        prev.map((m) => (m.id === selectedMember.id ? { ...m, attendance_status: status } : m))
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました。");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function confirmSelection() {
    if (!selectedStatus) return;
    const ok = await updateAttendance(selectedStatus);
    if (ok) {
      setIsEditing(false);
      pushToast("回答を保存しました");
    }
  }

  if (members.length === 0) return null;

  return (
    <div className="rounded-lg border border-washoku-brass-soft bg-washoku-paper text-washoku-ink p-6">
      {selectedMember ? (
        <>
          <p className="text-sm text-washoku-ink-muted">こんにちは、{selectedMember.name}さん</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="font-serif text-lg font-semibold">出欠を教えてください</p>
            <AttendanceStatusBadge status={selectedMember.attendance_status} />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = isEditing
                ? selectedStatus === opt.value
                : selectedMember.attendance_status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => isEditing && setSelectedStatus(opt.value)}
                  disabled={saving || !isEditing}
                  className={`flex flex-col items-center gap-1 rounded-lg px-2 py-3 text-xs font-semibold border transition-colors disabled:opacity-60 ${
                    active ? opt.activeClass : "border-washoku-brass-soft text-washoku-ink-muted hover:border-washoku-brass"
                  }`}
                >
                  {saving && active ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
                  {opt.label}
                </button>
              );
            })}
          </div>

          {error && <p className="text-xs text-washoku-red mt-2 text-center">{error}</p>}

          {isEditing ? (
            <button
              type="button"
              onClick={confirmSelection}
              disabled={!selectedStatus || saving}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold text-washoku-ink shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background:
                  "linear-gradient(135deg, var(--washoku-brass-bright) 0%, var(--washoku-brass) 100%)",
              }}
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? "保存中..." : "この内容で決定する"}
            </button>
          ) : (
            <>
              <p className="mt-4 flex items-center gap-1.5 text-sm text-emerald-600">
                <Check size={16} />
                回答を保存しました
              </p>
              <button type="button" onClick={startEditing} className="mt-2 text-sm text-washoku-brass underline">
                編集する
              </button>
            </>
          )}

          <button
            type="button"
            onClick={clearSelection}
            className="mt-4 text-sm text-washoku-ink-muted underline"
          >
            別の人として回答する
          </button>
        </>
      ) : (
        <>
          <IdentitySelectionNotice />
          <p className="text-sm text-washoku-ink-muted">あなたのお名前を選んでください</p>
          <div className="mt-3 grid gap-2">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => selectMember(m.id)}
                className="flex items-center justify-between gap-2 rounded-lg border border-washoku-brass-soft px-4 py-2.5 text-sm text-left hover:border-washoku-brass hover:bg-washoku-brass-soft transition-colors"
              >
                {m.name}
                <AttendanceStatusBadge status={m.attendance_status} />
              </button>
            ))}
          </div>
        </>
      )}

      <ToastStack toasts={toasts} />
    </div>
  );
}
