"use client";

import type { PlanTemplate } from "@/lib/plan-templates";

interface EventTypeTilesProps {
  templates: PlanTemplate[];
  selectedId: string | null;
  onSelect: (template: PlanTemplate) => void;
}

// Chapter 1's "イベントの種類" selection — the story-form's replacement for
// the old TemplateChips horizontal-scroll row. Selecting a tile both sets
// event_type (via template.eventType) and quick-fills title/date/fee, so
// the category picker and the quick-template feature stay a single choice
// instead of two overlapping ones.
export default function EventTypeTiles({ templates, selectedId, onSelect }: EventTypeTilesProps) {
  return (
    <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
      {templates.map((template) => {
        const selected = selectedId === template.id;
        return (
          <button
            key={template.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(template)}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border py-4 px-2 transition-colors ${
              selected
                ? "border-gold bg-gold/10 shadow-warm"
                : "border-gold/15 bg-surface-tertiary hover:border-gold/40"
            }`}
          >
            <span className="text-2xl" aria-hidden>
              {template.icon}
            </span>
            <span className={`text-xs font-medium ${selected ? "text-ink" : "text-ink-secondary"}`}>
              {template.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
