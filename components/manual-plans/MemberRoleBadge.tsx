import { Crown } from "lucide-react";
import type { MemberRole } from "@/lib/manual-plans/types";

// Participants get no badge ("通常表示") — only organizers are called out,
// since that's the status worth drawing attention to in a member list.
export default function MemberRoleBadge({ role }: { role: MemberRole }) {
  if (role !== "organizer") return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full text-[11px] font-bold px-2.5 py-1 border border-gold/30 bg-gold/10 text-gold shrink-0">
      <Crown size={12} />
      幹事
    </span>
  );
}
