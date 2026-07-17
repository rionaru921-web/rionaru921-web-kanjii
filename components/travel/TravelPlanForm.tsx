"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Users, Calendar, MapPin, Car, Compass } from "lucide-react";
import { DESTINATIONS } from "@/lib/api/types";
import { TRAVEL_BUDGET_PRESETS } from "@/lib/constants/budget";
import { TRAVEL_TYPES, TRAVEL_TYPE_CATEGORIES } from "@/lib/constants/travel-types";
import {
  TRANSPORTATION_OPTIONS,
  TRANSPORTATION_CATEGORIES,
} from "@/lib/constants/transportation";
import CalendarPopover from "@/components/ui/calendar/CalendarPopover";
import BudgetPicker from "@/components/plan-form/BudgetPicker";
import CategorizedSelect from "@/components/plan-form/CategorizedSelect";
import { dateOnlyToDate, dateToDateOnly } from "@/lib/calendar/local-datetime";

export default function TravelPlanForm() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [people, setPeople] = useState(4);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState(50000);
  const [travelTypes, setTravelTypes] = useState<string[]>(["sightseeing"]);
  const [transports, setTransports] = useState<string[]>(["train"]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set("destination", destination.trim());
    params.set("people", String(people));
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    params.set("budget", String(budget));
    if (travelTypes.length > 0) params.set("travelType", travelTypes.join(","));
    if (transports.length > 0) params.set("transport", transports.join(","));
    router.push(`/travel/plans?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <label className="flex items-center gap-1.5 text-sm text-ink-secondary mb-3">
          <MapPin size={16} />
          目的地
        </label>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {DESTINATIONS.map((dest) => (
            <button
              key={dest}
              type="button"
              onClick={() => setDestination(dest)}
              className={`rounded-full px-2 py-2.5 text-xs font-semibold border transition-colors ${
                destination === dest
                  ? "bg-gold-gradient border-transparent text-white"
                  : "border-gold/15 bg-surface-warm text-ink-secondary hover:border-gold/40 hover:bg-gold/5"
              }`}
            >
              {dest}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="その他の目的地を入力"
          className="w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted"
        />
      </div>

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
          min={1}
          max={20}
          value={people}
          onChange={(e) => setPeople(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-ink-muted mt-1">
          <span>1人</span>
          <span>20人</span>
        </div>
      </div>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <label className="flex items-center gap-1.5 text-sm text-ink-secondary mb-3">
          <Calendar size={16} />
          日程
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-xs text-ink-muted mb-1 block">開始日</span>
            <CalendarPopover
              value={dateOnlyToDate(startDate)}
              onChange={(d) => setStartDate(dateToDateOnly(d))}
              showTimeSelector={false}
              placeholder="日付を選択"
            />
          </div>
          <div>
            <span className="text-xs text-ink-muted mb-1 block">終了日</span>
            <CalendarPopover
              value={dateOnlyToDate(endDate)}
              onChange={(d) => setEndDate(dateToDateOnly(d))}
              showTimeSelector={false}
              placeholder="日付を選択"
            />
          </div>
        </div>
      </div>

      <BudgetPicker presets={TRAVEL_BUDGET_PRESETS} value={budget} onChange={setBudget} />

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <label className="flex items-center gap-1.5 text-sm text-ink-secondary mb-3">
          <Compass size={16} />
          旅行タイプ（複数選択可）
        </label>
        <CategorizedSelect
          categories={TRAVEL_TYPE_CATEGORIES}
          options={TRAVEL_TYPES}
          value={travelTypes}
          onChange={setTravelTypes}
          ariaLabel="旅行タイプ"
        />
      </div>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <label className="flex items-center gap-1.5 text-sm text-ink-secondary mb-3">
          <Car size={16} />
          交通手段（複数選択可）
        </label>
        <CategorizedSelect
          categories={TRANSPORTATION_CATEGORIES}
          options={TRANSPORTATION_OPTIONS}
          value={transports}
          onChange={setTransports}
          ariaLabel="交通手段"
        />
      </div>

      <button
        type="submit"
        className="flex items-center justify-center gap-2 rounded-full bg-gold-gradient text-white font-bold py-3.5 text-base hover:brightness-110 transition-all shadow-gold mt-2"
      >
        <Compass size={18} />
        プランを作成
      </button>
    </form>
  );
}
