"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import {
  Users,
  Wallet,
  Calendar,
  MapPin,
  DoorClosed,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { HOTPEPPER_GENRES } from "@/lib/constants/genres";
import { STATIONS } from "@/lib/constants/locations";
import CalendarPopover from "@/components/ui/calendar/CalendarPopover";
import { dateTimeLocalToDate, dateToDateTimeLocal } from "@/lib/calendar/local-datetime";

const MEMBER_EXAMPLES = [
  "学生サークル、初対面が多い、盛り上げたい",
  "会社の上司・取引先、失礼のないお店",
  "大学のゼミ、少人数で落ち着いて話したい",
  "久しぶりに集まる同窓会、思い出話をゆっくり",
];

const SITUATION_EXAMPLES = [
  "歓迎会。新メンバーに好印象を残したい",
  "送別会。しっとりと感謝を伝えたい",
  "打ち上げ。とにかく楽しく盛り上がる",
  "デート後の食事。落ち着いた雰囲気で",
];

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
  const [stationFocused, setStationFocused] = useState(false);
  const [genre, setGenre] = useState(firstParam(initialParams?.genre) ?? "");
  const [privateRoom, setPrivateRoom] = useState(
    firstParam(initialParams?.privateRoom) === "true"
  );

  const [memberProfile, setMemberProfile] = useState(
    firstParam(initialParams?.memberProfile) ?? ""
  );
  const [situation, setSituation] = useState(firstParam(initialParams?.situation) ?? "");
  const [preferences, setPreferences] = useState(firstParam(initialParams?.preferences) ?? "");
  const [error, setError] = useState<string | null>(null);

  const stationSuggestions = useMemo(() => {
    if (!station.trim()) return [];
    return STATIONS.filter((s) => s.name.includes(station.trim())).slice(0, 6);
  }, [station]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!memberProfile.trim() || !situation.trim()) {
      setError("「参加者について」と「シチュエーション」は必須項目です。");
      return;
    }
    setError(null);

    const params = new URLSearchParams();
    params.set("people", String(people));
    params.set("budget", String(budget));
    if (datetime) params.set("datetime", datetime);
    if (station) params.set("station", station);
    if (genre) params.set("genre", genre);
    if (privateRoom) params.set("privateRoom", "true");
    params.set("memberProfile", memberProfile.trim());
    params.set("situation", situation.trim());
    if (preferences.trim()) params.set("preferences", preferences.trim());

    router.push(`/nomikai/suggest/result?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-1.5 text-sm text-ink-secondary">
            <Wallet size={16} />
            予算（お一人様）
          </label>
          <span className="text-lg font-serif font-bold text-gold">
            ¥{budget.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min={1000}
          max={10000}
          step={500}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full"
        />
      </div>

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

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4 relative">
        <label className="flex items-center gap-1.5 text-sm text-ink-secondary mb-2">
          <MapPin size={16} />
          場所（駅名）
        </label>
        <input
          type="text"
          value={station}
          onChange={(e) => setStation(e.target.value)}
          onFocus={() => setStationFocused(true)}
          onBlur={() => setTimeout(() => setStationFocused(false), 120)}
          placeholder="例: 名古屋、栄"
          autoComplete="off"
          className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted"
        />
        {stationFocused && stationSuggestions.length > 0 && (
          <ul className="absolute left-4 right-4 top-[4.6rem] z-10 rounded-xl border border-gold/15 bg-surface-tertiary shadow-gold-lg overflow-hidden">
            {stationSuggestions.map((s) => (
              <li key={s.name}>
                <button
                  type="button"
                  onClick={() => {
                    setStation(s.name);
                    setStationFocused(false);
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm text-ink-secondary hover:bg-gold/10 hover:text-gold transition-colors"
                >
                  {s.name}
                </button>
              </li>
            ))}
          </ul>
        )}
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
          参加者について <span className="text-vermilion">*</span>
        </label>
        <textarea
          value={memberProfile}
          onChange={(e) => setMemberProfile(e.target.value)}
          placeholder="例: 20代後半の会社の同期5人。全員お酒好き。〇〇さんは辛いものが苦手。"
          rows={3}
          className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted resize-none"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {MEMBER_EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setMemberProfile(ex)}
              className="text-[11px] rounded-full border border-gold/15 text-ink-muted px-2.5 py-1 hover:border-gold/40 hover:text-gold transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <label className="block text-sm text-ink-secondary mb-2">
          シチュエーション <span className="text-vermilion">*</span>
        </label>
        <textarea
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          placeholder="例: 送別会。○○さんが主役なので少し豪華に。二次会もあるので長時間にならない方がいい。"
          rows={3}
          className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted resize-none"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {SITUATION_EXAMPLES.map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => setSituation(ex)}
              className="text-[11px] rounded-full border border-gold/15 text-ink-muted px-2.5 py-1 hover:border-gold/40 hover:text-gold transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
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
