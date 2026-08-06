"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function OptionListInput({
  values,
  onChange,
  placeholder,
  disabled,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState("");

  function addValue() {
    const trimmed = draft.trim();
    if (!trimmed || values.includes(trimmed)) return;
    onChange([...values, trimmed]);
    setDraft("");
  }

  function removeValue(value: string) {
    onChange(values.filter((v) => v !== value));
  }

  return (
    <div className="flex flex-col gap-2">
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="flex items-center gap-1.5 rounded-full border border-gold/20 bg-gold/5 px-3 py-1.5 text-sm text-ink"
            >
              {value}
              <button
                type="button"
                onClick={() => removeValue(value)}
                disabled={disabled}
                className="flex h-4 w-4 items-center justify-center text-ink-muted hover:text-vermilion-text"
                aria-label={`${value}を削除`}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addValue();
            }
          }}
          onBlur={addValue}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 min-w-0 rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50"
        />
        <button
          type="button"
          onClick={addValue}
          disabled={disabled || !draft.trim()}
          className="flex shrink-0 items-center justify-center min-h-[44px] min-w-[44px] rounded-xl border border-gold/20 text-gold hover:bg-gold/5 transition-colors disabled:opacity-40"
          aria-label="追加"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}
