"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, User as UserIcon, Mail } from "lucide-react";
import ProfileEditModal from "./ProfileEditModal";

interface ProfileCardProps {
  userId: string;
  email: string;
  displayName: string;
}

export default function ProfileCard({ userId, email, displayName }: ProfileCardProps) {
  const [editing, setEditing] = useState(false);

  const initial = (displayName || email).charAt(0).toUpperCase();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-surface-tertiary shadow-warm p-6 mb-8"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold-gradient text-xl font-semibold text-white">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-lg font-semibold text-ink">
                <UserIcon className="h-4 w-4 text-gold shrink-0" />
                <span className="truncate">{displayName || "ゲスト"}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-ink-secondary">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{email}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gold/20 bg-surface-tertiary px-3 py-2 text-sm font-medium text-gold transition-colors hover:bg-gold/5"
          >
            <Pencil className="h-4 w-4" />
            編集
          </button>
        </div>
      </motion.div>

      {editing && (
        <ProfileEditModal
          userId={userId}
          initialDisplayName={displayName}
          initialEmail={email}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}
