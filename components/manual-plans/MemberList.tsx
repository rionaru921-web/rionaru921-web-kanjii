"use client";

import { useEffect, useState } from "react";
import { Users as UsersIcon } from "lucide-react";
import AttendanceStatusBadge from "@/components/manual-plans/AttendanceStatusBadge";
import MemberRoleBadge from "@/components/manual-plans/MemberRoleBadge";
import MemberGuestSecretReset from "@/components/manual-plans/MemberGuestSecretReset";
import { useToasts, ToastStack } from "@/components/ui/RealtimeToast";
import { createClient } from "@/lib/supabase/client";
import { ATTENDANCE_LABELS } from "@/lib/manual-plans/format";
import type { AttendanceStatus, MemberRole } from "@/lib/manual-plans/types";

export interface MemberListItem {
  id: string;
  name: string;
  role: MemberRole;
  attendance_status: AttendanceStatus;
  hasGuestSecret: boolean;
}

// Client Component so it can hold a live Supabase Realtime subscription —
// the RSC parent (app/manual-plans/[id]/page.tsx) only ever fetches once per
// request. Only ever receives the sanitized member shape below, never the
// raw row with guest_secret (see page.tsx's mapping before this is rendered).
export default function MemberList({
  planId,
  members: initialMembers,
}: {
  planId: string;
  members: MemberListItem[];
}) {
  const [members, setMembers] = useState(initialMembers);
  const { toasts, pushToast } = useToasts();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`plan-members-${planId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "manual_plan_members",
          // RLS ("Plan owner can view members") still applies to Realtime,
          // so this filter is a narrowing convenience, not the security
          // boundary — another organizer's plan can never leak here.
          filter: `plan_id=eq.${planId}`,
        },
        (payload) => {
          const updated = payload.new as { id: string; name: string; attendance_status: AttendanceStatus };
          setMembers((prev) =>
            prev.map((m) => (m.id === updated.id ? { ...m, attendance_status: updated.attendance_status } : m))
          );
          pushToast(`${updated.name}さんが${ATTENDANCE_LABELS[updated.attendance_status]}を選択しました`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [planId, pushToast]);

  const organizers = members.filter((m) => m.role === "organizer");
  const attendanceCounts = members.reduce(
    (acc, m) => {
      acc[m.attendance_status] += 1;
      return acc;
    },
    { attending: 0, declined: 0, maybe: 0, pending: 0 } as Record<AttendanceStatus, number>
  );

  return (
    <section className="rounded-3xl bg-surface-tertiary shadow-warm p-6">
      <div className="flex items-center gap-2 mb-1.5">
        <UsersIcon className="text-gold" size={18} />
        <p className="text-xs text-ink-muted">メンバー ({members.length}人)</p>
      </div>
      {organizers.length > 0 && (
        <p className="text-xs text-ink-muted mb-1.5">
          👑 幹事({organizers.length}人): {organizers.map((m) => m.name).join("、")}
        </p>
      )}
      {members.length > 0 && (
        <p className="text-xs text-ink-muted mb-4">
          参加{attendanceCounts.attending}人 / 不参加{attendanceCounts.declined}人 / 未定
          {attendanceCounts.maybe}人 / 未回答{attendanceCounts.pending}人
        </p>
      )}
      {members.length === 0 ? (
        <p className="text-sm text-ink-secondary">まだメンバーが登録されていません</p>
      ) : (
        <div className="flex flex-col gap-3">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between gap-3 border-b border-gold/10 pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <MemberRoleBadge role={m.role} />
                <p className="text-sm font-medium text-ink truncate">{m.name}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <AttendanceStatusBadge status={m.attendance_status} />
                {m.hasGuestSecret && <MemberGuestSecretReset planId={planId} memberId={m.id} />}
              </div>
            </div>
          ))}
        </div>
      )}

      <ToastStack toasts={toasts} />
    </section>
  );
}
