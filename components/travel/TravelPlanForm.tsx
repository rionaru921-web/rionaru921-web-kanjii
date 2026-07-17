"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Users, Wallet, Calendar, MapPin, Car, Compass } from "lucide-react";
import {
  DESTINATIONS,
  TRAVEL_TYPE_OPTIONS,
  TRANSPORT_OPTIONS,
} from "@/lib/api/types";
import CalendarPopover from "@/components/ui/calendar/CalendarPopover";
import { dateOnlyToDate, dateToDateOnly } from "@/lib/calendar/local-datetime";

export default function TravelPlanForm() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [people, setPeople] = useState(4);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState(60000);
  const [travelType, setTravelType] = useState("sightseeing");
  const [transport, setTransport] = useState("train");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination.trim()) params.set("destination", destination.trim());
    params.set("people", String(people));
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    params.set("budget", String(budget));
    params.set("travelType", travelType);
    params.set("transport", transport);
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
          min={10000}
          max={200000}
          step={5000}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-ink-muted mt-1">
          <span>¥10,000</span>
          <span>¥200,000</span>
        </div>
      </div>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <label className="flex items-center gap-1.5 text-sm text-ink-secondary mb-3">
          <Compass size={16} />
          旅行タイプ
        </label>
        <div className="grid grid-cols-2 gap-2">
          {TRAVEL_TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTravelType(opt.value)}
              className={`rounded-xl px-3 py-2.5 text-xs font-semibold border transition-colors ${
                travelType === opt.value
                  ? "bg-gold-gradient border-transparent text-white"
                  : "border-gold/15 bg-surface-warm text-ink-secondary hover:border-gold/40 hover:bg-gold/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-3xl bg-surface-tertiary shadow-warm p-4">
        <label className="flex items-center gap-1.5 text-sm text-ink-secondary mb-3">
          <Car size={16} />
          交通手段
        </label>
        <div className="grid grid-cols-3 gap-2">
          {TRANSPORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTransport(opt.value)}
              className={`rounded-xl px-3 py-2.5 text-xs font-semibold border transition-colors ${
                transport === opt.value
                  ? "bg-gold-gradient border-transparent text-white"
                  : "border-gold/15 bg-surface-warm text-ink-secondary hover:border-gold/40 hover:bg-gold/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
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
