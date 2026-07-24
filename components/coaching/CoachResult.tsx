"use client";

import { motion } from "framer-motion";
import { PartyPopper, Check, ArrowRight } from "lucide-react";

type Props = {
  session: {
    ai_summary?: string | null;
    ai_strengths?: string[] | null;
    ai_improvements?: string[] | null;
  };
  onClose: () => void;
};

export function CoachResult({ session, onClose }: Props) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <PartyPopper className="mx-auto text-gold" size={32} />
        <h3 className="mt-2 font-serif font-bold text-lg text-ink">振り返り完了</h3>
        <p className="mt-1 text-sm text-ink-secondary">AIコーチからのフィードバックです</p>
      </motion.div>

      {session.ai_summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-gold/15 bg-gold/5 px-4 py-3"
        >
          <p className="text-xs font-semibold text-gold mb-1">📝 総評</p>
          <p className="text-sm text-ink leading-relaxed">{session.ai_summary}</p>
        </motion.div>
      )}

      {session.ai_strengths && session.ai_strengths.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-xs font-semibold text-gold mb-2">✨ 良かった点</p>
          <ul className="space-y-2">
            {session.ai_strengths.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink">
                <Check size={16} className="text-gold shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {session.ai_improvements && session.ai_improvements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-xs font-semibold text-gold mb-2">🔧 次回の提案</p>
          <ul className="space-y-2">
            {session.ai_improvements.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-ink">
                <ArrowRight size={16} className="text-gold shrink-0 mt-0.5" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-gold-gradient py-2.5 text-sm font-semibold text-white shadow-gold transition-opacity hover:opacity-90"
        >
          閉じる
        </button>
      </motion.div>
    </div>
  );
}
