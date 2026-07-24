"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={className || "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-ink-secondary hover:bg-white/5 hover:text-vermilion-text transition-colors"}
    >
      <LogOut size={18} />
      ログアウト
    </button>
  );
}
