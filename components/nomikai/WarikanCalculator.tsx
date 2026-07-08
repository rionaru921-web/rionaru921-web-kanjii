"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Trash2, Copy, Check, Users, CheckCircle2, BookmarkPlus, RotateCcw } from "lucide-react";
import ShareModal from "@/components/share/ShareModal";
import type { HistoryPayload } from "@/lib/history/types";

// @react-pdf/renderer pulls in browser-only APIs; rendering it during SSR of
// this client component crashes the page. ssr:false defers it to the client.
const PDFPreviewButton = dynamic(() => import("@/components/pdf/PDFPreviewButton"), {
  ssr: false,
});

interface Participant {
  id: string;
  name: string;
  customAmount: string;
}

interface ShopInfo {
  name: string;
  address: string;
  phone?: string;
  openHours?: string;
  mapUrl: string;
}

let idCounter = 0;
function createId() {
  idCounter += 1;
  return `participant-${idCounter}`;
}

function todayJP(): string {
  return new Date().toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

export default function WarikanCalculator({
  initialTotal = 0,
  shop = null,
}: {
  initialTotal?: number;
  shop?: ShopInfo | null;
}) {
  const [total, setTotal] = useState(initialTotal ? String(initialTotal) : "");
  const [participants, setParticipants] = useState<Participant[]>(() => [
    { id: createId(), name: "幹事", customAmount: "" },
    { id: createId(), name: "参加者2", customAmount: "" },
  ]);
  const [eventTitle, setEventTitle] = useState("");
  const [copied, setCopied] = useState(false);
  const [savedHistoryId, setSavedHistoryId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const totalNum = Number(total) || 0;

  function addParticipant() {
    setParticipants((prev) => [
      ...prev,
      { id: createId(), name: `参加者${prev.length + 1}`, customAmount: "" },
    ]);
  }

  function removeParticipant(id: string) {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }

  function updateName(id: string, name: string) {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  }

  function updateCustomAmount(id: string, customAmount: string) {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, customAmount } : p))
    );
  }

  const result = useMemo(() => {
    const customEntries = participants.filter(
      (p) => p.customAmount.trim() !== ""
    );
    const autoEntries = participants.filter(
      (p) => p.customAmount.trim() === ""
    );
    const customSum = customEntries.reduce(
      (sum, p) => sum + (Number(p.customAmount) || 0),
      0
    );
    const remaining = totalNum - customSum;
    const perPerson =
      autoEntries.length > 0
        ? Math.ceil(remaining / autoEntries.length / 100) * 100
        : 0;

    const amounts = participants.map((p) => ({
      id: p.id,
      name: p.name.trim() || "名無し",
      amount:
        p.customAmount.trim() !== ""
          ? Number(p.customAmount) || 0
          : perPerson,
      isCustom: p.customAmount.trim() !== "",
    }));

    const collected = amounts.reduce((sum, a) => sum + a.amount, 0);
    const diff = collected - totalNum;

    return { amounts, diff };
  }, [participants, totalNum]);

  const title = eventTitle.trim() || shop?.name || "飲み会";
  const date = todayJP();
  const isComplete = totalNum > 0 && result.amounts.length > 0;

  const pdfData = {
    title,
    date,
    shop: shop ?? { name: "店舗未指定", address: "", mapUrl: "" },
    participants: result.amounts.map((a) => ({ name: a.name, amount: a.amount })),
    total: totalNum,
  };

  const historyPayload: HistoryPayload = { kind: "nomikai", pdf: pdfData };

  async function handleCopy() {
    const lines = [
      "【割り勘結果】",
      `合計: ¥${totalNum.toLocaleString()}`,
      "",
      ...result.amounts.map((a) => `${a.name}: ¥${a.amount.toLocaleString()}`),
    ];
    if (result.diff !== 0) {
      lines.push(
        "",
        `(調整額: ${result.diff > 0 ? "+" : ""}¥${result.diff.toLocaleString()})`
      );
    }
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  async function handleSaveHistory() {
    if (savedHistoryId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "nomikai", title, eventDate: date, payload: historyPayload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "履歴の保存に失敗しました。");
      setSavedHistoryId(data.id);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "履歴の保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setTotal("");
    setParticipants([
      { id: createId(), name: "幹事", customAmount: "" },
      { id: createId(), name: "参加者2", customAmount: "" },
    ]);
    setEventTitle("");
    setSavedHistoryId(undefined);
    setSaveError(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <label className="block text-sm text-ink-secondary mb-2">イベント名（任意）</label>
        <input
          type="text"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          placeholder={shop?.name ? shop.name : "例: 新歓歓迎会"}
          className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted"
        />
      </div>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <label className="block text-sm text-ink-secondary mb-2">合計金額</label>
        <div className="flex items-center gap-2">
          <span className="text-lg text-ink-muted">¥</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            placeholder="0"
            className="w-full bg-transparent text-2xl font-serif font-bold text-ink outline-none placeholder:text-ink-muted"
          />
        </div>
      </div>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-1.5 text-sm text-ink-secondary">
            <Users size={16} />
            参加者 ({participants.length}人)
          </label>
          <button
            type="button"
            onClick={addParticipant}
            className="flex items-center gap-1 text-xs font-semibold text-gold hover:brightness-125"
          >
            <Plus size={14} />
            追加
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {participants.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-2">
              <input
                type="text"
                value={p.name}
                onChange={(e) => updateName(p.id, e.target.value)}
                placeholder={`参加者${idx + 1}`}
                className="flex-1 min-w-0 rounded-xl bg-surface-tertiary border border-gold/15 px-3 py-2 text-sm text-ink outline-none focus:border-gold/50"
              />
              <input
                type="number"
                inputMode="numeric"
                value={p.customAmount}
                onChange={(e) => updateCustomAmount(p.id, e.target.value)}
                placeholder="自動計算"
                className="w-24 shrink-0 rounded-xl bg-surface-tertiary border border-gold/15 px-3 py-2 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted"
              />
              <button
                type="button"
                onClick={() => removeParticipant(p.id)}
                disabled={participants.length <= 1}
                className="shrink-0 p-2 rounded-lg text-ink-muted hover:text-vermilion hover:bg-vermilion/10 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                aria-label="削除"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-gold/25 bg-surface-tertiary p-5 shadow-warm">
        <h2 className="text-sm font-semibold text-gold mb-3">計算結果</h2>
        <div className="flex flex-col gap-1">
          {result.amounts.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between text-sm py-1.5 border-b border-gold/10 last:border-0"
            >
              <span className="text-ink-secondary truncate pr-2">{a.name}</span>
              <span className="shrink-0 font-bold text-ink">
                ¥{a.amount.toLocaleString()}
                {a.isCustom && (
                  <span className="ml-1 text-xs text-ink-muted">(個別)</span>
                )}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-gold/15 flex items-center justify-between text-xs text-ink-muted">
          <span>合計金額との差額</span>
          <span
            className={
              result.diff === 0
                ? "text-ink-muted"
                : result.diff > 0
                  ? "text-gold"
                  : "text-vermilion"
            }
          >
            {result.diff > 0 ? "+" : ""}¥{result.diff.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center justify-center gap-2 rounded-full bg-gold-gradient text-white font-semibold py-3 hover:brightness-110 transition-all"
      >
        {copied ? <Check size={18} /> : <Copy size={18} />}
        {copied ? "コピーしました" : "結果をコピー"}
      </button>

      {isComplete && (
        <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm text-ink">
            <CheckCircle2 size={16} className="text-gold" />
            計算完了
            <span className="ml-auto text-ink-secondary text-xs">
              合計 ¥{totalNum.toLocaleString()} / {participants.length}名
            </span>
          </div>

          <div className="flex gap-2">
            <PDFPreviewButton
              kind="nomikai"
              data={pdfData}
              filename={`Kanjii_${title}_${new Date().toISOString().slice(0, 10)}.pdf`}
            />
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-gold-gradient text-white font-semibold text-sm py-2.5 hover:brightness-110 transition-all"
            >
              共有
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveHistory}
              disabled={saving || Boolean(savedHistoryId)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 text-ink-secondary text-xs font-semibold py-2.5 hover:border-gold/40 transition-colors disabled:opacity-60"
            >
              <BookmarkPlus size={14} />
              {savedHistoryId ? "履歴に保存済み" : saving ? "保存中..." : "履歴に保存"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 text-ink-secondary text-xs font-semibold py-2.5 hover:border-gold/40 transition-colors"
            >
              <RotateCcw size={14} />
              もう一度計算
            </button>
          </div>
          {saveError && <p className="text-[11px] text-vermilion">{saveError}</p>}
        </div>
      )}

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        historyType="nomikai"
        title={title}
        eventDate={date}
        payload={historyPayload}
        historyId={savedHistoryId}
      />
    </div>
  );
}
