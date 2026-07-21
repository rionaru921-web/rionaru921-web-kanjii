"use client";

import { useEffect, useMemo, useState } from "react";
import { STATIONS, type Station } from "@/lib/constants/locations";

interface StationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// The curated STATIONS list only covers ~25 major stations, so anything else
// (e.g. "東岡崎駅", "二川駅") had no way to be selected. This fills in from
// HeartRails (see lib/api/heartrails.ts) only when the static list doesn't
// already have enough matches — most common searches never hit the network.
export default function StationAutocomplete({
  value,
  onChange,
  placeholder,
  className,
}: StationAutocompleteProps) {
  const [focused, setFocused] = useState(false);
  const [remoteStations, setRemoteStations] = useState<Station[]>([]);

  const staticMatches = useMemo(() => {
    const q = value.trim();
    if (!q) return [];
    return STATIONS.filter((s) => s.name.includes(q)).slice(0, 6);
  }, [value]);

  useEffect(() => {
    const q = value.trim();
    if (q.length === 0 || staticMatches.length >= 5) {
      setRemoteStations([]);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/stations/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setRemoteStations(data.stations ?? []);
      } catch {
        // Network hiccup — the static matches (if any) still render below.
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, staticMatches.length]);

  const suggestions = useMemo(() => {
    const seen = new Set<string>();
    return [...staticMatches, ...remoteStations]
      .filter((s) => {
        const key = `${s.name}::${s.line ?? ""}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 8);
  }, [staticMatches, remoteStations]);

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        placeholder={placeholder}
        autoComplete="off"
        className={
          className ??
          "w-full rounded-xl bg-surface-warm border border-gold/15 px-3 py-2.5 text-sm text-ink outline-none focus:border-gold/50 placeholder:text-ink-muted"
        }
      />
      {focused && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-10 rounded-xl border border-gold/15 bg-surface-tertiary shadow-gold-lg overflow-hidden max-h-64 overflow-y-auto">
          {suggestions.map((s) => (
            <li key={`${s.name}::${s.line ?? `${s.lat},${s.lng}`}`}>
              <button
                type="button"
                onClick={() => {
                  onChange(s.name);
                  setFocused(false);
                }}
                className="w-full flex items-center justify-between gap-2 text-left px-3 py-2.5 text-sm text-ink-secondary hover:bg-gold/10 hover:text-gold transition-colors"
              >
                <span>{s.name}</span>
                {s.line && <span className="text-xs text-ink-muted shrink-0">{s.line}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
