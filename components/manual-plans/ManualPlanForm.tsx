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
import type { FeeBreakdownItem, ManualPlan, ManualPlanMember, MemberRole } from "@/lib/manual-plans/types";
import { ROLE_LABELS } from "@/lib/manual-plans/format";
import { toDateTimeLocalValue, fromDateTimeLocalValue } from "@/lib/date/kanjii-time";
import { PLAN_TEMPLATES, formatLocalDateTimeInput, type PlanTemplate } from "@/lib/plan-templates";
import { resolveMemberWeight } from "@/lib/manual-plans/calculate-split";
import {
  TIER_LEVELS,
  TIER_LABELS,
  ORGANIZER_DISCOUNTS,
  ORGANIZER_DISCOUNT_LABELS,
  DEFAULT_TIER_LEVEL,
  DEFAULT_ROUNDING_UNIT,
  type SplitMode,
  type RoundingUnit,
  type TierLevel,
  type OrganizerDiscount,
} from "@/lib/manual-plans/split-types";
import VenueInput, { type VenueValue } from "./VenueInput";
import FeeSection from "./FeeSection";
import TemplateChips from "@/components/plan-form/TemplateChips";
import MizuhikiDivider from "@/components/shared/MizuhikiDivider";
import NumberedSectionHeader from "@/components/plan-form/NumberedSectionHeader";
import SegmentedControl from "@/components/ui/SegmentedControl";
import PlanPreviewCard from "@/components/plan-form/PlanPreviewCard";
import CalendarPopover from "@/components/ui/calendar/CalendarPopover";
import { dateTimeLocalToDate, dateToDateTimeLocal } from "@/lib/calendar/local-datetime";

interface MemberInput {
  name: string;
  email: string;
  role: MemberRole;
  tierLevel: TierLevel;
  weightOverride: number | null;
  organizerDiscount: OrganizerDiscount | null;
}

interface ManualPlanFormProps {
  mode: "create" | "edit";
  planId?: string;
  initialData?: ManualPlan;
  initialMembers?: ManualPlanMember[];
}

const inputClass =
  "mt-1.5 w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50";
const labelClass = "block text-sm font-medium text-ink";

function FormSection({
  number,
  title,
  subtitle,
  icon: Icon,
  defaultOpen = true,
  complete = false,
  children,
}: {
  number: number;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  complete?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-3xl bg-surface-tertiary shadow-warm overflow-hidden">
      <div className="pt-4">
        <MizuhikiDivider />
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-6 py-4"
      >
        <NumberedSectionHeader number={number} icon={Icon} title={title} subtitle={subtitle} filled={complete} />
        <ChevronDown
          size={18}
          className={`shrink-0 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
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
  const [eventDate, setEventDate] = useState(toDateTimeLocalValue(initialData?.event_date));
  const [endDate, setEndDate] = useState(toDateTimeLocalValue(initialData?.end_date));

  const [venue, setVenue] = useState<VenueValue>({
    venueName: initialData?.venue_name ?? "",
    venueAddress: initialData?.venue_address ?? "",
    venueUrl: initialData?.venue_url ?? "",
    venueHotpepperId: initialData?.venue_hotpepper_id ?? "",
    venueLat: initialData?.venue_lat ?? null,
    venueLng: initialData?.venue_lng ?? null,
  });

  const [feeAmount, setFeeAmount] = useState(
    initialData?.fee_amount != null ? String(initialData.fee_amount) : ""
  );
  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdownItem[]>(
    (initialData?.fee_breakdown ?? []).map((item) => ({ ...item, amount: String(item.amount) }))
  );
  const [paymentMethods, setPaymentMethods] = useState<string[]>(initialData?.payment_methods ?? []);
  const [paymentDeadline, setPaymentDeadline] = useState(toDateTimeLocalValue(initialData?.payment_deadline));

  const [memo, setMemo] = useState(initialData?.memo ?? "");
  const [dietaryNotes, setDietaryNotes] = useState(initialData?.dietary_notes ?? "");

  const [splitMode, setSplitMode] = useState<SplitMode>(initialData?.split_mode ?? "equal");
  const [roundingUnit, setRoundingUnit] = useState<RoundingUnit>(
    initialData?.rounding_unit ?? DEFAULT_ROUNDING_UNIT
  );

  const [members, setMembers] = useState<MemberInput[]>(
    initialMembers && initialMembers.length > 0
      ? initialMembers.map((m) => ({
          name: m.name,
          email: m.email ?? "",
          role: m.role,
          tierLevel: m.tier_level,
          weightOverride: m.weight_override,
          organizerDiscount: m.organizer_discount,
        }))
      : [
          {
            name: "",
            email: "",
            role: "participant",
            tierLevel: DEFAULT_TIER_LEVEL,
            weightOverride: null,
            organizerDiscount: null,
          },
        ]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [venueHint, setVenueHint] = useState<string | null>(null);

  function handleTemplateSelect(template: PlanTemplate) {
    setSelectedTemplateId(template.id);
    setTitle(template.title);

    const start = template.getEventDate();
    setEventDate(start ? formatLocalDateTimeInput(start) : "");
    setEndDate(
      start && template.durationHours
        ? formatLocalDateTimeInput(new Date(start.getTime() + template.durationHours * 3600_000))
        : ""
    );
    setFeeAmount(template.feeAmount);
    setVenueHint(template.venueHint ?? null);
  }

  function handleVenueChange(next: VenueValue) {
    setVenue(next);
    setVenueHint(null);
  }

  function togglePaymentMethod(method: string) {
    setPaymentMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  }

  function updateMember(index: number, patch: Partial<MemberInput>) {
    setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  }

  function addMember() {
    setMembers((prev) => [
      ...prev,
      {
        name: "",
        email: "",
        role: "participant",
        tierLevel: DEFAULT_TIER_LEVEL,
        weightOverride: null,
        organizerDiscount: null,
      },
    ]);
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
        eventDate: fromDateTimeLocalValue(eventDate),
        endDate: fromDateTimeLocalValue(endDate),
        venueName: venue.venueName.trim() || null,
        venueAddress: venue.venueAddress.trim() || null,
        venueUrl: venue.venueUrl.trim() || null,
        venueHotpepperId: venue.venueHotpepperId.trim() || null,
        venueLat: venue.venueLat,
        venueLng: venue.venueLng,
        feeAmount: feeAmount.trim() ? Number(feeAmount) : null,
        feeBreakdown: feeBreakdown.filter((item) => item.label.trim()),
        paymentMethods,
        paymentDeadline: fromDateTimeLocalValue(paymentDeadline),
        memo: memo.trim() || null,
        dietaryNotes: dietaryNotes.trim() || null,
        splitMode,
        roundingUnit,
        members: members
          .filter((m) => m.name.trim())
          .map((m) => ({
            name: m.name.trim(),
            email: m.email.trim() || null,
            role: m.role,
            tierLevel: m.tierLevel,
            weightOverride: m.weightOverride,
            organizerDiscount: m.tierLevel === "organizer" ? m.organizerDiscount : null,
          })),
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
    <>
      {mode === "create" && (
        <TemplateChips
          templates={PLAN_TEMPLATES}
          selectedId={selectedTemplateId}
          onSelect={handleTemplateSelect}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <form onSubmit={handleSubmit} className="lg:col-span-7 flex flex-col gap-4 pb-44 sm:pb-0">
      <FormSection
        number={1}
        title="基本情報"
        subtitle="イベント名や日時など"
        icon={CalendarDays}
        complete={title.trim() !== ""}
      >
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
            <div className="mt-1.5">
              <CalendarPopover
                value={dateTimeLocalToDate(eventDate)}
                onChange={(d) => setEventDate(dateToDateTimeLocal(d))}
                disabled={saving}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>終了日時</label>
            <div className="mt-1.5">
              <CalendarPopover
                value={dateTimeLocalToDate(endDate)}
                onChange={(d) => setEndDate(dateToDateTimeLocal(d))}
                disabled={saving}
              />
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection
        number={2}
        title="場所"
        subtitle="会場やお店の情報"
        icon={MapPin}
        complete={venue.venueName.trim() !== ""}
      >
        <VenueInput value={venue} onChange={handleVenueChange} disabled={saving} />
        {venueHint && (
          <p className="rounded-xl bg-gold/5 border border-gold/15 px-4 py-2.5 text-xs text-ink-secondary">
            💡 {venueHint}
          </p>
        )}
      </FormSection>

      <FormSection
        number={3}
        title="予算・集金"
        subtitle="金額・割り勘・支払い方法"
        icon={Wallet}
        complete={feeAmount.trim() !== ""}
      >
        <FeeSection
          feeAmount={feeAmount}
          onFeeAmountChange={setFeeAmount}
          breakdown={feeBreakdown}
          onBreakdownChange={setFeeBreakdown}
          paymentMethods={paymentMethods}
          onTogglePaymentMethod={togglePaymentMethod}
          paymentDeadline={paymentDeadline}
          onPaymentDeadlineChange={setPaymentDeadline}
          splitMode={splitMode}
          onSplitModeChange={setSplitMode}
          roundingUnit={roundingUnit}
          onRoundingUnitChange={setRoundingUnit}
          members={members
            .filter((m) => m.name.trim())
            .map((m) => ({
              name: m.name,
              tierLevel: m.tierLevel,
              weightOverride: m.weightOverride,
              organizerDiscount: m.organizerDiscount,
            }))}
          disabled={saving}
        />
      </FormSection>

      <FormSection
        number={4}
        title="メンバー"
        subtitle="参加者の登録と傾斜設定"
        icon={UsersIcon}
        complete={members.some((m) => m.name.trim() !== "")}
      >
        <div className="flex flex-col gap-3">
          {members.map((member, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-xl border border-gold/10 p-3">
              <div className="flex items-start gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateMember(i, { name: e.target.value })}
                    disabled={saving}
                    className="w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50"
                    placeholder="名前"
                  />
                  <input
                    type="email"
                    value={member.email}
                    onChange={(e) => updateMember(i, { email: e.target.value })}
                    disabled={saving}
                    className="w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50"
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
              <div className="flex gap-2">
                {(["organizer", "participant"] as MemberRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => updateMember(i, { role })}
                    disabled={saving}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-colors disabled:opacity-50 ${
                      member.role === role
                        ? "bg-gold-gradient border-transparent text-white"
                        : "border-gold/15 text-ink-secondary hover:border-gold/30"
                    }`}
                  >
                    {ROLE_LABELS[role]}
                  </button>
                ))}
              </div>

              <AnimatePresence initial={false}>
                {splitMode === "tiered" && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden flex flex-col gap-2"
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {TIER_LEVELS.map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() =>
                            updateMember(i, {
                              tierLevel: tier,
                              ...(tier !== "organizer" ? { organizerDiscount: null } : {}),
                            })
                          }
                          disabled={saving}
                          className={`rounded-lg px-2 py-1 text-[11px] font-semibold border transition-colors disabled:opacity-50 ${
                            member.tierLevel === tier
                              ? "bg-gold-gradient border-transparent text-white"
                              : "border-gold/15 text-ink-secondary hover:border-gold/30"
                          }`}
                        >
                          {TIER_LABELS[tier]}
                        </button>
                      ))}
                    </div>

                    {member.tierLevel === "organizer" && (
                      <SegmentedControl
                        aria-label="幹事枠割引"
                        size="sm"
                        options={ORGANIZER_DISCOUNTS.map((discount) => ({
                          value: discount,
                          label: ORGANIZER_DISCOUNT_LABELS[discount],
                        }))}
                        value={member.organizerDiscount ?? "none"}
                        onChange={(discount) => updateMember(i, { organizerDiscount: discount })}
                        disabled={saving}
                      />
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-ink-muted shrink-0">重み調整</span>
                      <input
                        type="range"
                        min={0}
                        max={3}
                        step={0.1}
                        value={
                          member.weightOverride ??
                          resolveMemberWeight({
                            tierLevel: member.tierLevel,
                            weightOverride: null,
                            organizerDiscount: member.organizerDiscount,
                          })
                        }
                        onChange={(e) => updateMember(i, { weightOverride: Number(e.target.value) })}
                        disabled={saving}
                        className="flex-1 accent-gold h-1.5"
                      />
                      <span className="text-[11px] font-display-num text-gold w-8 text-right shrink-0">
                        {(
                          member.weightOverride ??
                          resolveMemberWeight({
                            tierLevel: member.tierLevel,
                            weightOverride: null,
                            organizerDiscount: member.organizerDiscount,
                          })
                        ).toFixed(1)}
                      </span>
                      {member.weightOverride != null && (
                        <button
                          type="button"
                          onClick={() => updateMember(i, { weightOverride: null })}
                          disabled={saving}
                          className="text-[11px] text-ink-muted underline shrink-0"
                        >
                          リセット
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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

      <FormSection
        number={5}
        title="メモ"
        subtitle="自由記入欄(任意)"
        icon={FileText}
        defaultOpen={false}
      >
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

      <div className="fixed sm:static inset-x-0 bottom-24 z-30 flex gap-3 border-t border-gold/10 bg-surface-tertiary/95 backdrop-blur-md px-4 py-3 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
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

      <aside className="hidden lg:block lg:col-span-5">
        <div className="sticky top-6">
          <PlanPreviewCard
            title={title}
            eventDate={eventDate}
            venueName={venue.venueName}
            feeAmount={feeAmount}
            splitMode={splitMode}
            roundingUnit={roundingUnit}
            members={members
              .filter((m) => m.name.trim())
              .map((m) => ({
                name: m.name,
                tierLevel: m.tierLevel,
                weightOverride: m.weightOverride,
                organizerDiscount: m.organizerDiscount,
              }))}
          />
        </div>
      </aside>
      </div>
    </>
  );
}
