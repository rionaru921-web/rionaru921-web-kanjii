import "server-only";
import { customAlphabet } from "nanoid";
import { createClient } from "@/lib/supabase/server";
import type { HistoryType } from "@/lib/history/types";

const nanoid = customAlphabet("0123456789ABCDEFGHJKLMNPQRSTUVWXYZ", 12);

export async function createShareLink(
  historyType: HistoryType,
  historyId: string,
  userId: string,
  expiresInDays?: number
) {
  const supabase = createClient();
  const token = nanoid();
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 86_400_000).toISOString()
    : null;

  const { error } = await supabase.from("share_tokens").insert({
    token,
    history_type: historyType,
    history_id: historyId,
    user_id: userId,
    expires_at: expiresAt,
  });
  if (error) throw error;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  return { token, url: `${baseUrl}/share/${token}` };
}
