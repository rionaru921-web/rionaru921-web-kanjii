"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  Users,
  Calendar,
  MapPin,
  DoorClosed,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { HOTPEPPER_GENRES } from "@/lib/constants/genres";
import { DRINK_BUDGET_PRESETS } from "@/lib/constants/budget";
import StationAutocomplete from "@/components/shared/StationAutocomplete";
import AiUsageBadge from "@/components/ai/AiUsageBadge";
import { MOOD_TAGS, MOOD_CATEGORIES } from "@/lib/constants/moods";
import {
  PARTICIPANT_TAGS,
  PARTICIPANT_CATEGORIES,
  composeMemberProfile,
} from "@/lib/constants/participant-tags";
import { SITUATION_TAGS, SITUATION_CATEGORIES, composeSituation } from "@/lib/constants/situation-tags";
import BudgetPicker from "@/components/plan-form/BudgetPicker";
import CalendarPopover from "@/components/ui/calendar/CalendarPopover";
import CategorizedSelect from "@/components/plan-form/CategorizedSelect";
import { dateTimeLocalToDate, dateToDateTimeLocal } from "@/lib/calendar/local-datetime";

function firstParam(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" ? v : undefined;
}

export default function SuggestForm({
  initialParams,
}: {
  initialParams?: { [key: string]: string | string[] | undefined };
}) {
  const router = useRouter();

  const [people, setPeople] = useState(Number(firstParam(initialParams?.people)) || 6);
  const [budget, setBudget] = useState(Number(firstParam(initialParams?.budget)) || 5000);
  const [datetime, setDatetime] = useState(firstParam(initialParams?.datetime) ?? "");
  const [station, setStation] = useState(firstParam(initialParams?.station) ?? "");
  const [genre, setGenre] = useState(firstParam(initialParams?.genre) ?? "");
  const [privateRoom, setPrivateRoom] = useState(
    firstParam(initialParams?.privateRoom) === "true"
  );

  // memberProfile/situation are structured (tags) + an optional supplementary
  // note, composed into the plain-text strings the AI prompt expects on
  // submit (see composeMemberProfile/composeSituation). When arriving from
  // the "条件を変更" retry link, the previously-composed string can't be
  // reliably split back into tags, so it's kept as-is in the note field and
  // tags start unselected.
  const [participantTags, setParticipantTags] = useState<string[]>([]);
  const [memberNote, setMemberNote] = useState(firstParam(initialParams?.memberProfile) ?? "");
  const [situationTags, setSituationTags] = useState<string[]>([]);
  const [situationNote, setSituationNote] = useState(firstParam(initialParams?.situation) ?? "");
  const [preferences, setPreferences] = useState(firstParam(initialParams?.preferences) ?? "");
  const [moodTags, setMoodTags] = useState<string[]>(() => {
    const raw = firstParam(initialParams?.moodTags);
    return raw ? raw.split(",").filter(Boolean) : [];
  });
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (participantTags.length === 0 || situationTags.length === 0) {
      setError("「参加者について」と「シチュエーション」はタグを1つ以上選んでください。");
      return;
    }
    setError(null);

    const memberProfile = composeMemberProfile(participantTags, memberNote);
    const situation = composeSituation(situationTags, situationNote);

    const params = new URLSearchParams();
    params.set("people", String(people));
    params.set("budget", String(budget));
    if (datetime) params.set("datetime", datetime);
    if (station) params.set("station", station);
    if (genre) params.set("genre", genre);
    if (privateRoom) params.set("privateRoom", "true");
    if (moodTags.length > 0) params.set("moodTags", moodTags.join(","));
    params.set("memberProfile", memberProfile);
    params.set("situation", situation);
    if (preferences.trim()) params.set("preferences", preferences.trim());

    router.push(`/nomikai/suggest/result?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <AiUsageBadge />
      <p className="text-xs font-semibold text-ink-muted tracking-wide">STEP 1・基本条件</p>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-1.5 text-sm text-ink-secondary">
            <Users size={16} />
            人数
          </label>
          <span className="text-lg font-serif font-bold text-gold">{people}人</span>
        </div>
        <input
          type="range"
          min={2}
          max={50}
          value={people}
          onChange={(e) => setPeople(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <BudgetPicker presets={DRINK_BUDGET_PRESETS} value={budget} onChange={setBudget} />

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <label className="flex items-center gap-1.5 text-sm text-ink-secondary mb-2">
          <Calendar size={16} />
          日時
        </label>
        <CalendarPopover
          value={dateTimeLocalToDate(datetime)}
          onChange={(d) => setDatetime(dateToDateTimeLocal(d))}
        />
      </div>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <label className="flex items-center gap-1.5 text-sm text-ink-secondary mb-2">
          <MapPin size={16} />
          場所（駅名）
        </label>
        <StationAutocomplete value={station} onChange={setStation} placeholder="例: 名古屋、栄" />
      </div>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <label className="block text-sm text-ink-secondary mb-3">料理ジャンル</label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setGenre("")}
            className={`rounded-full px-2 py-2.5 text-xs font-semibold border transition-colors ${
              genre === ""
                ? "bg-gold-gradient border-transparent text-white"
                : "border-gold/15 bg-surface-warm text-ink-secondary hover:border-gold/40 hover:bg-gold/5"
            }`}
          >
            指定なし
          </button>
          {HOTPEPPER_GENRES.map((g) => (
            <button
              key={g.code}
              type="button"
              onClick={() => setGenre(g.code)}
              className={`rounded-full px-2 py-2.5 text-xs font-semibold border transition-colors ${
                genre === g.code
                  ? "bg-gold-gradient border-transparent text-white"
                  : "border-gold/15 bg-surface-warm text-ink-secondary hover:border-gold/40 hover:bg-gold/5"
              }`}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4 flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-sm text-ink-secondary">
          <DoorClosed size={16} />
          個室希望
        </label>
        <button
          type="button"
          role="switch"
          aria-checked={privateRoom}
          onClick={() => setPrivateRoom((v) => !v)}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            privateRoom ? "bg-gold-gradient" : "bg-surface-warm border border-gold/15"
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-warm transition-transform ${
              privateRoom ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <p className="text-xs font-semibold text-ink-muted tracking-wide mt-3">
        STEP 2・AIに伝える情報
      </p>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <label className="block text-sm text-ink-secondary mb-2">
          雰囲気・シーン（任意、複数選択可）
        </label>
        <CategorizedSelect
          categories={MOOD_CATEGORIES}
          options={MOOD_TAGS}
          value={moodTags}
          onChange={setMoodTags}
          multiple
          ariaLabel="雰囲気・シーンタグ"
        />
      </div>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <label className="block text-sm text-ink-secondary mb-2">
          参加者について <span className="text-vermilion">*</span>
        </label>
        <CategorizedSelect
          categories={PARTICIPANT_CATEGORIES}
          options={PARTICIPANT_TAGS}
          value={participantTags}
          onChange={setParticipantTags}
          multiple
          ariaLabel="参加者について"
        />
        <textarea
          value={memberNote}
          onChange={(e) => setMemberNote(e.target.value)}
          placeholder="補足があれば（任意）例: 〇〇さんは辛いものが苦手"
          rows={2}
          className="w-full mt-3 rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted resize-none"
        />
      </div>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <label className="block text-sm text-ink-secondary mb-2">
          シチュエーション <span className="text-vermilion">*</span>
        </label>
        <CategorizedSelect
          categories={SITUATION_CATEGORIES}
          options={SITUATION_TAGS}
          value={situationTags}
          onChange={setSituationTags}
          multiple
          ariaLabel="シチュエーション"
        />
        <textarea
          value={situationNote}
          onChange={(e) => setSituationNote(e.target.value)}
          placeholder="補足があれば（任意）例: ○○さんが主役なので少し豪華に"
          rows={2}
          className="w-full mt-3 rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted resize-none"
        />
      </div>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <label className="block text-sm text-ink-secondary mb-2">追加の希望（任意）</label>
        <textarea
          value={preferences}
          onChange={(e) => setPreferences(e.target.value)}
          placeholder="例: 駅から近い、個室希望、写真映え、飲み放題必須"
          rows={2}
          className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted resize-none"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-vermilion bg-vermilion/10 border border-vermilion/20 rounded-xl px-3 py-2.5">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-full bg-gold-gradient text-white font-bold py-3.5 text-base hover:brightness-110 transition-all shadow-gold mt-2"
      >
        <Sparkles size={18} />
        AIに提案してもらう
      </button>
    </form>
  );
}
