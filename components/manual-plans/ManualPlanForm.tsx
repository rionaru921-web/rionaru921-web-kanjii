"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  CalendarDays,
  MapPin,
  Wallet,
  Users as UsersIcon,
  FileText,
  Plus,
  Trash2,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import type { ManualPlan, ManualPlanMember } from "@/lib/manual-plans/types";
import { PAYMENT_METHOD_LABELS } from "@/lib/manual-plans/format";

interface MemberInput {
  name: string;
  email: string;
}

interface ManualPlanFormProps {
  mode: "create" | "edit";
  planId?: string;
  initialData?: ManualPlan;
  initialMembers?: ManualPlanMember[];
}

const PAYMENT_METHOD_OPTIONS = ["cash", "paypay", "bank_transfer"];

function toLocalInputValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInputValue(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors focus:border-gold disabled:opacity-50";
const labelClass = "block text-sm font-medium text-ink";

function FormSection({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-3xl bg-surface-tertiary shadow-warm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-6 py-4"
      >
        <span className="flex items-center gap-2 font-serif font-bold text-ink">
          <Icon size={16} className="text-gold" />
          {title}
        </span>
        <ChevronDown
          size={18}
          className={`text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 flex flex-col gap-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ManualPlanForm({ mode, planId, initialData, initialMembers }: ManualPlanFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [eventDate, setEventDate] = useState(toLocalInputValue(initialData?.event_date));
  const [endDate, setEndDate] = useState(toLocalInputValue(initialData?.end_date));

  const [venueName, setVenueName] = useState(initialData?.venue_name ?? "");
  const [venueAddress, setVenueAddress] = useState(initialData?.venue_address ?? "");
  const [venueUrl, setVenueUrl] = useState(initialData?.venue_url ?? "");
  const [venueMapUrl, setVenueMapUrl] = useState(initialData?.venue_map_url ?? "");

  const [feeAmount, setFeeAmount] = useState(
    initialData?.fee_amount != null ? String(initialData.fee_amount) : ""
  );
  const [paymentMethods, setPaymentMethods] = useState<string[]>(initialData?.payment_methods ?? []);
  const [paymentDeadline, setPaymentDeadline] = useState(toLocalInputValue(initialData?.payment_deadline));

  const [memo, setMemo] = useState(initialData?.memo ?? "");
  const [dietaryNotes, setDietaryNotes] = useState(initialData?.dietary_notes ?? "");

  const [members, setMembers] = useState<MemberInput[]>(
    initialMembers && initialMembers.length > 0
      ? initialMembers.map((m) => ({ name: m.name, email: m.email ?? "" }))
      : [{ name: "", email: "" }]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function togglePaymentMethod(method: string) {
    setPaymentMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  }

  function updateMember(index: number, field: keyof MemberInput, value: string) {
    setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }

  function addMember() {
    setMembers((prev) => [...prev, { name: "", email: "" }]);
  }

  function removeMember(index: number) {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("タイトルは必須です。");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        title: title.trim(),
        eventDate: fromLocalInputValue(eventDate),
        endDate: fromLocalInputValue(endDate),
        venueName: venueName.trim() || null,
        venueAddress: venueAddress.trim() || null,
        venueUrl: venueUrl.trim() || null,
        venueMapUrl: venueMapUrl.trim() || null,
        feeAmount: feeAmount.trim() ? Number(feeAmount) : null,
        paymentMethods,
        paymentDeadline: fromLocalInputValue(paymentDeadline),
        memo: memo.trim() || null,
        dietaryNotes: dietaryNotes.trim() || null,
        members: members
          .filter((m) => m.name.trim())
          .map((m) => ({ name: m.name.trim(), email: m.email.trim() || null })),
      };

      const res = await fetch(
        mode === "create" ? "/api/manual-plans" : `/api/manual-plans/${planId}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "保存に失敗しました。");

      const targetId = data.id ?? planId;
      router.push(mode === "create" ? `/manual-plans/${targetId}?just_created=1` : `/manual-plans/${targetId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました。");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <FormSection title="基本情報" icon={CalendarDays}>
        <div>
          <label className={labelClass}>タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={saving}
            className={inputClass}
            placeholder="例: 部署の歓迎会"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>開始日時</label>
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              disabled={saving}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>終了日時</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={saving}
              className={inputClass}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="場所" icon={MapPin}>
        <div>
          <label className={labelClass}>店名・場所名</label>
          <input
            type="text"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            disabled={saving}
            className={inputClass}
            placeholder="例: 居酒屋 花月"
          />
        </div>
        <div>
          <label className={labelClass}>住所</label>
          <input
            type="text"
            value={venueAddress}
            onChange={(e) => setVenueAddress(e.target.value)}
            disabled={saving}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>お店のURL</label>
          <input
            type="url"
            value={venueUrl}
            onChange={(e) => setVenueUrl(e.target.value)}
            disabled={saving}
            className={inputClass}
            placeholder="https://..."
          />
        </div>
        <div>
          <label className={labelClass}>地図URL</label>
          <input
            type="url"
            value={venueMapUrl}
            onChange={(e) => setVenueMapUrl(e.target.value)}
            disabled={saving}
            className={inputClass}
            placeholder="https://maps.google.com/..."
          />
        </div>
      </FormSection>

      <FormSection title="予算・集金" icon={Wallet}>
        <div>
          <label className={labelClass}>会費(円)</label>
          <input
            type="number"
            min={0}
            value={feeAmount}
            onChange={(e) => setFeeAmount(e.target.value)}
            disabled={saving}
            className={inputClass}
            placeholder="4000"
          />
        </div>
        <div>
          <label className={labelClass}>支払い方法</label>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {PAYMENT_METHOD_OPTIONS.map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => togglePaymentMethod(method)}
                disabled={saving}
                className={`rounded-xl px-3 py-2 text-xs font-semibold border transition-colors disabled:opacity-50 ${
                  paymentMethods.includes(method)
                    ? "bg-gold-gradient border-transparent text-white"
                    : "border-gold/15 text-ink-secondary hover:border-gold/30"
                }`}
              >
                {PAYMENT_METHOD_LABELS[method]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>支払い期限</label>
          <input
            type="datetime-local"
            value={paymentDeadline}
            onChange={(e) => setPaymentDeadline(e.target.value)}
            disabled={saving}
            className={inputClass}
          />
        </div>
      </FormSection>

      <FormSection title="メンバー" icon={UsersIcon}>
        <div className="flex flex-col gap-3">
          {members.map((member, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateMember(i, "name", e.target.value)}
                  disabled={saving}
                  className={inputClass.replace("mt-1.5 ", "")}
                  placeholder="名前"
                />
                <input
                  type="email"
                  value={member.email}
                  onChange={(e) => updateMember(i, "email", e.target.value)}
                  disabled={saving}
                  className={inputClass.replace("mt-1.5 ", "")}
                  placeholder="メール(任意)"
                />
              </div>
              <button
                type="button"
                onClick={() => removeMember(i)}
                disabled={saving || members.length === 1}
                className="shrink-0 rounded-xl p-2.5 text-ink-muted hover:text-vermilion transition-colors disabled:opacity-30"
                aria-label="メンバーを削除"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addMember}
          disabled={saving}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 text-sm font-medium text-gold py-2.5 hover:bg-gold/5 transition-colors disabled:opacity-50"
        >
          <Plus size={16} />
          メンバーを追加
        </button>
      </FormSection>

      <FormSection title="メモ" icon={FileText} defaultOpen={false}>
        <div>
          <label className={labelClass}>自由メモ</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            disabled={saving}
            rows={3}
            className={inputClass}
            placeholder="集合場所や持ち物など"
          />
        </div>
        <div>
          <label className={labelClass}>アレルギー・苦手な食材</label>
          <textarea
            value={dietaryNotes}
            onChange={(e) => setDietaryNotes(e.target.value)}
            disabled={saving}
            rows={2}
            className={inputClass}
          />
        </div>
      </FormSection>

      {error && (
        <div className="rounded-xl border border-vermilion/20 bg-vermilion/10 px-3 py-2.5 text-sm text-vermilion">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={saving}
          className="flex-1 rounded-xl border border-gold/15 bg-surface-tertiary py-2.5 text-sm font-medium text-ink transition-colors hover:bg-gold/5 disabled:opacity-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold-gradient py-2.5 text-sm font-semibold text-white shadow-gold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? "作成する" : "保存する"}
        </button>
      </div>
    </form>
  );
}
