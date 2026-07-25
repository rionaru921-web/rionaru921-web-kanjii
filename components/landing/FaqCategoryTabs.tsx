"use client";

import type { FaqCategory } from "@/lib/faq";

interface FaqCategoryTabsProps {
  categories: FaqCategory[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function FaqCategoryTabs({ categories, activeId, onSelect }: FaqCategoryTabsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = cat.id === activeId;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-serif text-sm transition-colors ${
              isActive
                ? "border-gold bg-gold-gradient text-white shadow-gold"
                : "border-gold/20 bg-surface-tertiary text-ink hover:border-gold/50"
            }`}
          >
            <Icon className="w-4 h-4" />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
