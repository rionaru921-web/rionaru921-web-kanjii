interface DemoProgressDotsProps {
  current: number; // 0-4
  total: number;
  onSelect?: (index: number) => void;
}

export default function DemoProgressDots({ current, total, onSelect }: DemoProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2" role="tablist" aria-label="デモの進行状況">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === current}
          aria-label={`ステップ ${i + 1}`}
          onClick={() => onSelect?.(i)}
          disabled={!onSelect}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === current ? "w-6 bg-gold-gradient" : "w-2 bg-surface-primary/30"
          } ${onSelect ? "cursor-pointer" : ""}`}
        />
      ))}
    </div>
  );
}
