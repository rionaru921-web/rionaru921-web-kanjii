"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  Sparkles,
  Calendar,
  MapPin,
  Wallet,
  Users,
  MoreHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  EventType,
  FeeBreakdownItem,
  ManualPlan,
  ManualPlanMember,
  MemberRole,
} from "@/lib/manual-plans/types";
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
import SegmentedControl from "@/components/ui/SegmentedControl";
import CalendarPopover from "@/components/ui/calendar/CalendarPopover";
import { dateTimeLocalToDate, dateToDateTimeLocal } from "@/lib/calendar/local-datetime";
import ChapterHeading from "./sections/ChapterHeading";
import ChapterProgress from "./sections/ChapterProgress";
import EventTypeTiles from "./sections/EventTypeTiles";
import FacilityChips from "./sections/FacilityChips";
import NijikaiSection, { type NijikaiValue } from "./sections/NijikaiSection";
import { useScrollIntoViewOnFocus } from "@/lib/hooks/useScrollIntoViewOnFocus";
import PlanPreview from "./PlanPreview";
import MobilePreviewModal from "./MobilePreviewModal";
import CompletionCelebration from "./CompletionCelebration";

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

const CHAPTER_COUNT = 6;
const CHAPTER_ICONS: LucideIcon[] = [Sparkles, Calendar, MapPin, Wallet, Users, MoreHorizontal];

function Chapter({ chapterRef, children }: { chapterRef: React.RefObject<HTMLDivElement>; children: ReactNode }) {
  return (
    <div ref={chapterRef} className="scroll-mt-20">
      {children}
    </div>
  );
}

export default function ManualPlanForm({ mode, planId, initialData, initialMembers }: ManualPlanFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [eventType, setEventType] = useState<EventType | null>(initialData?.event_type ?? null);
  const [eventTypeCustomLabel, setEventTypeCustomLabel] = useState(
    initialData?.event_type_custom_label ?? ""
  );
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
  const [venuePhone, setVenuePhone] = useState(initialData?.venue_phone ?? "");
  const [venueFacilities, setVenueFacilities] = useState<string[]>(initialData?.venue_facilities ?? []);

  const [feeAmount, setFeeAmount] = useState(
    initialData?.fee_amount != null ? String(initialData.fee_amount) : ""
  );
  const [feeBreakdown, setFeeBreakdown] = useState<FeeBreakdownItem[]>(
    (initialData?.fee_breakdown ?? []).map((item) => ({ ...item, amount: String(item.amount) }))
  );
  const [paymentMethods, setPaymentMethods] = useState<string[]>(initialData?.payment_methods ?? []);
  const [paymentDeadline, setPaymentDeadline] = useState(toDateTimeLocalValue(initialData?.payment_deadline));

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

  const [moreOpen, setMoreOpen] = useState(false);
  const [eventNote, setEventNote] = useState(initialData?.event_note ?? "");
  const [dietaryNotes, setDietaryNotes] = useState(initialData?.dietary_notes ?? "");
  const [memo, setMemo] = useState(initialData?.memo ?? "");
  const [nijikai, setNijikai] = useState<NijikaiValue>({
    enabled: initialData?.nijikai_enabled ?? false,
    venue: initialData?.nijikai_venue ?? "",
    budget: initialData?.nijikai_budget != null ? String(initialData.nijikai_budget) : "",
    url: initialData?.nijikai_url ?? "",
    startTime: initialData?.nijikai_start_time ?? "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleFocusScroll = useScrollIntoViewOnFocus();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [venueHint, setVenueHint] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const redirectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingDestinationRef = useRef<string | null>(null);

  function goToCreatedPlan() {
    if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    if (pendingDestinationRef.current) {
      router.push(pendingDestinationRef.current);
      router.refresh();
    }
  }

  const chapterComplete = [
    title.trim() !== "",
    eventDate !== "",
    venue.venueName.trim() !== "",
    feeAmount.trim() !== "",
    members.some((m) => m.name.trim() !== ""),
    false,
  ];

  const chapterRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  function handleTemplateSelect(template: PlanTemplate) {
    setSelectedTemplateId(template.id);
    setEventType(template.eventType);
    if (template.eventType !== null) setEventTypeCustomLabel("");
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
        eventType,
        eventTypeCustomLabel: eventTypeCustomLabel.trim() || null,
        eventDate: fromDateTimeLocalValue(eventDate),
        endDate: fromDateTimeLocalValue(endDate),
        venueName: venue.venueName.trim() || null,
        venueAddress: venue.venueAddress.trim() || null,
        venueUrl: venue.venueUrl.trim() || null,
        venuePhone: venuePhone.trim() || null,
        venueHotpepperId: venue.venueHotpepperId.trim() || null,
        venueLat: venue.venueLat,
        venueLng: venue.venueLng,
        venueFacilities,
        feeAmount: feeAmount.trim() ? Number(feeAmount) : null,
        feeBreakdown: feeBreakdown.filter((item) => item.label.trim()),
        paymentMethods,
        paymentDeadline: fromDateTimeLocalValue(paymentDeadline),
        memo: memo.trim() || null,
        dietaryNotes: dietaryNotes.trim() || null,
        eventNote: eventNote.trim() || null,
        nijikaiEnabled: nijikai.enabled,
        nijikaiVenue: nijikai.venue.trim() || null,
        nijikaiBudget: nijikai.budget.trim() ? Number(nijikai.budget) : null,
        nijikaiUrl: nijikai.url.trim() || null,
        nijikaiStartTime: nijikai.startTime.trim() || null,
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
      // The query marker isn't just for the confirmation banner: it also
      // guarantees this exact URL was never visited/cached before, so the
      // client Router Cache can't serve stale (pre-save) data for a plan
      // detail page the user was just looking at seconds ago.
      const marker = mode === "create" ? "just_created" : "just_updated";
      const destination = `/manual-plans/${targetId}?${marker}=1`;

      if (mode === "create") {
        // The celebration screen owns the redirect for a new plan (auto or
        // skip-button triggered) — editing an existing plan isn't a
        // "completion" moment, so that path keeps the old immediate redirect.
        pendingDestinationRef.current = destination;
        setCelebrating(true);
        redirectTimeoutRef.current = setTimeout(goToCreatedPlan, 2500);
      } else {
        router.push(destination);
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました。");
      setSaving(false);
    }
  }

  const previewProps = {
    title,
    eventType,
    eventTypeCustomLabel,
    eventDate,
    endDate,
    venueName: venue.venueName,
    venueAddress: venue.venueAddress,
    venueFacilities,
    feeAmount,
    feeBreakdown,
    paymentMethods,
    splitMode,
    roundingUnit,
    members: members.map((m) => ({
      name: m.name,
      tierLevel: m.tierLevel,
      weightOverride: m.weightOverride,
      organizerDiscount: m.organizerDiscount,
    })),
    nijikai,
  };

  return (
    <div className="max-w-2xl lg:max-w-5xl mx-auto lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
      <div className="max-w-2xl lg:max-w-none mx-auto lg:mx-0 w-full">
      <ChapterProgress
        chapterRefs={chapterRefs}
        total={CHAPTER_COUNT}
        onPreviewClick={() => setPreviewOpen(true)}
      />

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          // Prevent Enter in any <input> from implicitly submitting the form
          // (native HTML behavior) — only the explicit "作成する"/"保存する"
          // button should submit. textarea is untouched so Enter still
          // inserts a newline there.
          if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
            e.preventDefault();
          }
        }}
        className="flex flex-col gap-28 md:gap-32 pb-52 sm:pb-36 pt-8"
      >
        {/* 第一章 はじまり */}
        <Chapter chapterRef={chapterRefs[0]}>
          <ChapterHeading
            number="第一章"
            title="はじまり"
            subtitle="どんな集まりですか？"
            icon={CHAPTER_ICONS[0]}
            complete={chapterComplete[0]}
          />
          <div className="flex flex-col gap-6">
            <EventTypeTiles
              templates={PLAN_TEMPLATES}
              selectedId={selectedTemplateId}
              onSelect={handleTemplateSelect}
            />
            {eventType === null && (
              <div>
                <label className={labelClass}>分類(自由入力・任意)</label>
                <input
                  type="text"
                  value={eventTypeCustomLabel}
                  onChange={(e) => setEventTypeCustomLabel(e.target.value)}
                  disabled={saving}
                  maxLength={30}
                  className={inputClass}
                  placeholder="例: ダーツ会、勉強会"
                />
              </div>
            )}
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
          </div>
        </Chapter>

        {/* 第二章 いつ */}
        <Chapter chapterRef={chapterRefs[1]}>
          <ChapterHeading
            number="第二章"
            title="いつ"
            subtitle="開催の日時を決めましょう"
            icon={CHAPTER_ICONS[1]}
            complete={chapterComplete[1]}
          />
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
        </Chapter>

        {/* 第三章 どこで */}
        <Chapter chapterRef={chapterRefs[2]}>
          <ChapterHeading
            number="第三章"
            title="どこで"
            subtitle="会場やお店の情報"
            icon={CHAPTER_ICONS[2]}
            complete={chapterComplete[2]}
          />
          <div className="flex flex-col gap-4">
            <VenueInput value={venue} onChange={handleVenueChange} disabled={saving} />
            {venueHint && (
              <p className="rounded-xl bg-gold/5 border border-gold/15 px-4 py-2.5 text-xs text-ink-secondary">
                💡 {venueHint}
              </p>
            )}
            <div>
              <label className={labelClass}>電話番号(任意)</label>
              <input
                type="tel"
                value={venuePhone}
                onChange={(e) => setVenuePhone(e.target.value)}
                disabled={saving}
                className={inputClass}
                placeholder="03-1234-5678"
              />
            </div>
            <FacilityChips value={venueFacilities} onChange={setVenueFacilities} disabled={saving} />
          </div>
        </Chapter>

        {/* 第四章 いくら */}
        <Chapter chapterRef={chapterRefs[3]}>
          <ChapterHeading
            number="第四章"
            title="いくら"
            subtitle="金額・割り勘・支払い方法"
            icon={CHAPTER_ICONS[3]}
            complete={chapterComplete[3]}
          />
          <div className="flex flex-col gap-4">
            <FeeSection
              feeAmount={feeAmount}
              onFeeAmountChange={setFeeAmount}
              breakdown={feeBreakdown}
              onBreakdownChange={setFeeBreakdown}
              paymentMethods={paymentMethods}
              onPaymentMethodsChange={setPaymentMethods}
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
          </div>
        </Chapter>

        {/* 第五章 だれと */}
        <Chapter chapterRef={chapterRefs[4]}>
          <ChapterHeading
            number="第五章"
            title="だれと"
            subtitle="参加者の登録と傾斜設定"
            icon={CHAPTER_ICONS[4]}
            complete={chapterComplete[4]}
          />
          <div className="flex flex-col gap-3">
            {members.map((member, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-xl border border-gold/10 p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateMember(i, { name: e.target.value })}
                      onFocus={handleFocusScroll}
                      disabled={saving}
                      className="w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50"
                      placeholder="名前"
                    />
                    <input
                      type="email"
                      value={member.email}
                      onChange={(e) => updateMember(i, { email: e.target.value })}
                      onFocus={handleFocusScroll}
                      disabled={saving}
                      className="w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50"
                      placeholder="メール(任意)"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMember(i)}
                    disabled={saving || members.length === 1}
                    className="flex shrink-0 items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-ink-muted hover:text-vermilion-text transition-colors disabled:opacity-30"
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
            <button
              type="button"
              onClick={addMember}
              disabled={saving}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 text-sm font-medium text-gold py-2.5 hover:bg-gold/5 transition-colors disabled:opacity-50"
            >
              <Plus size={16} />
              メンバーを追加
            </button>
          </div>
        </Chapter>

        {/* 第六章 もっと(オプション) */}
        <Chapter chapterRef={chapterRefs[5]}>
          <ChapterHeading
            number="第六章"
            title="もっと"
            subtitle="幹事だけのメモや、二次会の予定があれば"
            icon={CHAPTER_ICONS[5]}
            action={
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className="flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-hover transition-colors"
              >
                {moreOpen ? "閉じる" : "詳しく入力する(任意)"}
                <ChevronDown size={16} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
              </button>
            }
          />

          <AnimatePresence initial={false}>
            {moreOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-5">
                  <div>
                    <label className={labelClass}>幹事のメモ</label>
                    <p className="mb-1.5 text-xs text-ink-muted">
                      サプライズや連絡事項など。参加者には表示されません。
                    </p>
                    <textarea
                      value={eventNote}
                      onChange={(e) => setEventNote(e.target.value)}
                      disabled={saving}
                      rows={3}
                      className={inputClass}
                      placeholder="例: 主役には内緒でケーキを用意"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>参加者向けメモ</label>
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
                  <NijikaiSection value={nijikai} onChange={setNijikai} disabled={saving} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Chapter>

        {error && (
          <div className="rounded-xl border border-vermilion/20 bg-vermilion/10 px-3 py-2.5 text-sm text-vermilion-text">
            {error}
          </div>
        )}

        <div className="safe-area-bottom fixed sm:static inset-x-0 bottom-24 z-30 flex gap-3 border-t border-gold/10 bg-surface-tertiary/95 backdrop-blur-md px-4 py-3 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none sm:pb-0">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving}
            className="flex-1 sm:flex-none sm:px-6 rounded-xl border border-gold/15 bg-surface-tertiary py-3 text-sm font-medium text-ink transition-colors hover:bg-gold/5 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold-gradient py-3 font-serif font-semibold text-base text-white shadow-gold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "プランを完成させる" : "保存する"}
          </button>
        </div>
      </form>
      </div>

      <div className="hidden lg:block">
        {/* top-24 clears ChapterProgress's sticky header (which grew taller
            in Wave 16 with the chapter-indicator row); max-h + overflow-y
            keeps a tall preview (many members/facilities) from running off
            the bottom of the viewport instead of just growing forever. The
            parent grid cell needs to stretch to the left column's full
            height (no items-start above) for this sticky to have room to
            actually stick rather than scrolling away with its own short cell. */}
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <PlanPreview {...previewProps} />
          <p className="mt-3 text-center text-xs text-ink-muted">参加者に見える完成イメージです</p>
        </div>
      </div>

      {previewOpen && (
        <MobilePreviewModal onClose={() => setPreviewOpen(false)} previewProps={previewProps} />
      )}

      {celebrating && <CompletionCelebration onSkip={goToCreatedPlan} />}
    </div>
  );
}
