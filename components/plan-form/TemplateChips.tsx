"use client";

import type { PlanTemplate } from "@/lib/plan-templates";
import MizuhikiDivider from "@/components/shared/MizuhikiDivider";

interface TemplateChipsProps {
  templates: PlanTemplate[];
  selectedId: string | null;
  onSelect: (template: PlanTemplate) => void;
}

export default function TemplateChips({ templates, selectedId, onSelect }: TemplateChipsProps) {
  return (
    <div className="mb-6">
      <h2 className="font-serif font-bold text-ink mb-3">よく使うプランから始める</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {templates.map((template) => {
          const selected = selectedId === template.id;
          return (
            <button
              key={template.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(template)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                selected
                  ? "border-gold bg-gold/15 text-ink"
                  : "border-gold/15 bg-gold/5 text-ink-secondary hover:border-gold/30 hover:bg-gold/10"
              }`}
            >
              <span aria-hidden>{template.icon}</span>
              {template.label}
            </button>
          );
        })}
      </div>
      <MizuhikiDivider className="mt-4" />
    </div>
  );
}
