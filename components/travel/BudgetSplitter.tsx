"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  Plus,
  Trash2,
  Copy,
  Check,
  Users,
  Wallet,
  ArrowRight,
  PartyPopper,
  CheckCircle2,
  BookmarkPlus,
} from "lucide-react";
import ShareModal from "@/components/share/ShareModal";
import type { HistoryPayload } from "@/lib/history/types";
import type { TravelPlan } from "@/lib/api/types";

// @react-pdf/renderer pulls in browser-only APIs; rendering it during SSR of
// this client component crashes the page. ssr:false defers it to the client.
const PDFPreviewButton = dynamic(() => import("@/components/pdf/PDFPreviewButton"), {
  ssr: false,
});

const CATEGORY_LABELS = ["宿泊", "交通", "食事", "観光", "その他"] as const;

interface Participant {
  id: string;
  name: string;
}

interface ExpenseItem {
  category: string;
  amount: string;
  paidBy: string | null;
}

let idCounter = 0;
function createId() {
  idCounter += 1;
  return `traveler-${idCounter}`;
}

export default function BudgetSplitter({
  initialTotalHint,
  initialTitle,
  plan,
}: {
  initialTotalHint?: number;
  initialTitle?: string;
  plan?: TravelPlan;
}) {
  const [participants, setParticipants] = useState<Participant[]>(() => [
    { id: createId(), name: "幹事" },
    { id: createId(), name: "参加者2" },
  ]);
  const [items, setItems] = useState<ExpenseItem[]>(() =>
    CATEGORY_LABELS.map((category) => ({ category, amount: "", paidBy: null }))
  );
  const [copied, setCopied] = useState(false);
  const [savedHistoryId, setSavedHistoryId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  function addParticipant() {
    setParticipants((prev) => [
      ...prev,
      { id: createId(), name: `参加者${prev.length + 1}` },
    ]);
  }

  function removeParticipant(id: string) {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
    setItems((prev) =>
      prev.map((item) => (item.paidBy === id ? { ...item, paidBy: null } : item))
    );
  }

  function updateParticipantName(id: string, name: string) {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name } : p))
    );
  }

  function updateItemAmount(category: string, amount: string) {
    setItems((prev) =>
      prev.map((item) => (item.category === category ? { ...item, amount } : item))
    );
  }

  function updateItemPayer(category: string, paidBy: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.category === category ? { ...item, paidBy: paidBy || null } : item
      )
    );
  }

  const result = useMemo(() => {
    const totalCost = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const fairShare = participants.length > 0 ? totalCost / participants.length : 0;

    const balances = participants.map((p) => {
      const paid = items
        .filter((item) => item.paidBy === p.id)
        .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
      return { id: p.id, name: p.name.trim() || "名無し", paid, balance: paid - fairShare };
    });

    const creditors = balances
      .filter((b) => b.balance > 0.5)
      .map((b) => ({ ...b }))
      .sort((a, b) => b.balance - a.balance);
    const debtors = balances
      .filter((b) => b.balance < -0.5)
      .map((b) => ({ ...b, balance: -b.balance }))
      .sort((a, b) => b.balance - a.balance);

    const transactions: { from: string; to: string; amount: number }[] = [];
    let i = 0;
    let j = 0;
    while (i < debtors.length && j < creditors.length) {
      const pay = Math.min(debtors[i].balance, creditors[j].balance);
      if (pay > 0.5) {
        transactions.push({
          from: debtors[i].name,
          to: creditors[j].name,
          amount: Math.round(pay),
        });
      }
      debtors[i].balance -= pay;
      creditors[j].balance -= pay;
      if (debtors[i].balance <= 0.5) i += 1;
      if (creditors[j].balance <= 0.5) j += 1;
    }

    return { totalCost, fairShare, balances, transactions };
  }, [items, participants]);

  const title = initialTitle || plan?.title || "旅行";
  const isComplete = result.totalCost > 0;

  const pdfData = {
    title,
    destination: plan?.destination ?? "",
    dateRange: "",
    days: plan?.days ?? 0,
    nights: plan?.nights ?? 0,
    hotelName: plan?.hotelName ?? "",
    participants: participants.map((p) => ({
      name: p.name.trim() || "名無し",
      amount: Math.round(result.fairShare),
    })),
    total: result.totalCost,
    itinerary: plan?.itinerary ?? [],
    costBreakdown: items
      .filter((item) => Number(item.amount) > 0)
      .map((item) => ({
        category: item.category,
        amount: Number(item.amount) || 0,
        paidBy: participants.find((p) => p.id === item.paidBy)?.name,
      })),
  };

  const historyPayload: HistoryPayload = { kind: "travel", pdf: pdfData };

  async function handleSaveHistory() {
    if (savedHistoryId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "travel", title, payload: historyPayload }),
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

  async function handleCopy() {
    const lines = [
      `【費用精算結果】${initialTitle ? `${initialTitle}` : ""}`,
      `合計: ¥${result.totalCost.toLocaleString()}`,
      `一人あたり: ¥${Math.round(result.fairShare).toLocaleString()}`,
      "",
      ...(result.transactions.length > 0
        ? result.transactions.map(
            (t) => `${t.from} → ${t.to}: ¥${t.amount.toLocaleString()}`
          )
        : ["すでに精算済みです"]),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — ignore
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {initialTotalHint ? (
        <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4 text-sm text-ink-secondary">
          このプランの想定総額: ¥{initialTotalHint.toLocaleString()}
        </div>
      ) : null}

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
                onChange={(e) => updateParticipantName(p.id, e.target.value)}
                placeholder={`参加者${idx + 1}`}
                className="flex-1 min-w-0 rounded-xl bg-surface-tertiary border border-gold/15 px-3 py-2 text-sm text-ink outline-none focus:border-gold/50"
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

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <label className="flex items-center gap-1.5 text-sm text-ink-secondary mb-3">
          <Wallet size={16} />
          費用項目
        </label>
        <div className="flex flex-col gap-2.5">
          {items.map((item) => (
            <div key={item.category} className="flex items-center gap-2">
              <span className="w-14 shrink-0 text-sm text-ink-secondary">
                {item.category}
              </span>
              <input
                type="number"
                inputMode="numeric"
                value={item.amount}
                onChange={(e) => updateItemAmount(item.category, e.target.value)}
                placeholder="0"
                className="w-24 shrink-0 rounded-xl bg-surface-tertiary border border-gold/15 px-3 py-2 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted"
              />
              <select
                value={item.paidBy ?? ""}
                onChange={(e) => updateItemPayer(item.category, e.target.value)}
                className="flex-1 min-w-0 rounded-xl bg-surface-tertiary border border-gold/15 px-3 py-2 text-sm text-ink outline-none focus:border-gold/50"
              >
                <option value="">先払いした人</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.trim() || "名無し"}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-gold/25 bg-surface-tertiary p-5 shadow-warm">
        <h2 className="text-sm font-semibold text-gold mb-3">精算結果</h2>
        <div className="flex items-center justify-between text-sm text-ink-secondary mb-1">
          <span>合計</span>
          <span className="font-bold text-ink">¥{result.totalCost.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-ink-secondary mb-3 pb-3 border-b border-gold/10">
          <span>一人あたり</span>
          <span className="font-bold text-ink">
            ¥{Math.round(result.fairShare).toLocaleString()}
          </span>
        </div>

        {result.transactions.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-ink-secondary py-2">
            <PartyPopper size={16} className="text-gold" />
            すでに精算済みです
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {result.transactions.map((t, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-sm py-1.5"
              >
                <span className="text-ink-secondary">{t.from}</span>
                <ArrowRight size={14} className="text-gold shrink-0" />
                <span className="text-ink-secondary">{t.to}</span>
                <span className="ml-auto font-bold text-ink">
                  ¥{t.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
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
              合計 ¥{result.totalCost.toLocaleString()} / {participants.length}名
            </span>
          </div>

          <div className="flex gap-2">
            <PDFPreviewButton
              kind="travel"
              data={pdfData}
              filename={`KanjiLabo_${title}_${new Date().toISOString().slice(0, 10)}.pdf`}
            />
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-full bg-gold-gradient text-white font-semibold text-sm py-2.5 hover:brightness-110 transition-all"
            >
              共有
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveHistory}
            disabled={saving || Boolean(savedHistoryId)}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 text-ink-secondary text-xs font-semibold py-2.5 hover:border-gold/40 transition-colors disabled:opacity-60"
          >
            <BookmarkPlus size={14} />
            {savedHistoryId ? "履歴に保存済み" : saving ? "保存中..." : "履歴に保存"}
          </button>
          {saveError && <p className="text-[11px] text-vermilion">{saveError}</p>}
        </div>
      )}

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        historyType="travel"
        title={title}
        payload={historyPayload}
        historyId={savedHistoryId}
      />
    </div>
  );
}
