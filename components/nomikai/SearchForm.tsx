"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  Users,
  Calendar,
  MapPin,
  DoorClosed,
  Search,
  Radar,
  FlaskConical,
} from "lucide-react";
import { HOTPEPPER_GENRES } from "@/lib/constants/genres";
import { DRINK_BUDGET_PRESETS } from "@/lib/constants/budget";
import BudgetPicker from "@/components/plan-form/BudgetPicker";
import CalendarPopover from "@/components/ui/calendar/CalendarPopover";
import StationAutocomplete from "@/components/shared/StationAutocomplete";
import { dateTimeLocalToDate, dateToDateTimeLocal } from "@/lib/calendar/local-datetime";

const RADIUS_STEPS: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 1, label: "300m" },
  { value: 2, label: "500m" },
  { value: 3, label: "1000m" },
  { value: 4, label: "2000m" },
  { value: 5, label: "3000m" },
];

export default function SearchForm() {
  const router = useRouter();
  const [people, setPeople] = useState(6);
  const [budget, setBudget] = useState(5000);
  const [datetime, setDatetime] = useState("");
  const [station, setStation] = useState("");
  const [genre, setGenre] = useState("");
  const [privateRoom, setPrivateRoom] = useState(false);
  const [radiusIndex, setRadiusIndex] = useState(2); // "1000m" default
  const [useMock, setUseMock] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("people", String(people));
    params.set("budget", String(budget));
    if (datetime) params.set("datetime", datetime);
    if (station) params.set("station", station);
    if (genre) params.set("genre", genre);
    if (privateRoom) params.set("privateRoom", "true");
    params.set("range", String(RADIUS_STEPS[radiusIndex].value));
    if (useMock) params.set("mock", "true");
    router.push(`/nomikai/results?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-5 sm:p-6">
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
        <div className="flex justify-between text-xs text-ink-muted mt-1">
          <span>2人</span>
          <span>50人</span>
        </div>
      </div>

      <BudgetPicker presets={DRINK_BUDGET_PRESETS} value={budget} onChange={setBudget} />

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-5 sm:p-6">
        <label className="flex items-center gap-1.5 text-sm text-ink-secondary mb-2">
          <Calendar size={16} />
          日時
        </label>
        <CalendarPopover
          value={dateTimeLocalToDate(datetime)}
          onChange={(d) => setDatetime(dateToDateTimeLocal(d))}
        />
      </div>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-5 sm:p-6">
        <label className="flex items-center gap-1.5 text-sm text-ink-secondary mb-2">
          <MapPin size={16} />
          場所（駅名）
        </label>
        <StationAutocomplete value={station} onChange={setStation} placeholder="例: 名古屋、栄" />
      </div>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center gap-1.5 text-sm text-ink-secondary">
            <Radar size={16} />
            検索範囲
          </label>
          <span className="text-lg font-serif font-bold text-gold">
            {RADIUS_STEPS[radiusIndex].label}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={4}
          value={radiusIndex}
          onChange={(e) => setRadiusIndex(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-ink-muted mt-1">
          <span>300m</span>
          <span>3000m</span>
        </div>
      </div>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-5 sm:p-6">
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

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-5 sm:p-6 flex items-center justify-between">
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

      {process.env.NODE_ENV !== "production" && (
        <div className="rounded-3xl border border-vermilion/20 bg-vermilion/5 p-5 sm:p-6 flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-sm text-ink-secondary">
            <FlaskConical size={16} />
            モック使用（開発用・API節約）
          </label>
          <button
            type="button"
            role="switch"
            aria-checked={useMock}
            onClick={() => setUseMock((v) => !v)}
            className={`relative w-12 h-7 rounded-full transition-colors ${
              useMock ? "bg-vermilion" : "bg-surface-warm border border-gold/15"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow-warm transition-transform ${
                useMock ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      )}

      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-full bg-gold-gradient text-white font-bold py-4 text-base hover:brightness-110 transition-all shadow-warm mt-2"
      >
        <Search size={18} />
        お店を探す
      </button>
    </form>
  );
}
