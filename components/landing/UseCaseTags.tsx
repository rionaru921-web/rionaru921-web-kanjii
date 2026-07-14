const USE_CASES = ["飲み会", "旅行", "歓迎会", "送別会", "忘年会", "新年会"];

export default function UseCaseTags() {
  return (
    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-4">
      {USE_CASES.map((label) => (
        <span
          key={label}
          className="inline-flex items-center rounded-full border border-gold/25 bg-surface-tertiary/70 px-3 py-1 text-xs text-ink-secondary"
        >
          {label}
        </span>
      ))}
    </div>
  );
}
