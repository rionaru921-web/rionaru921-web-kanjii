const warekiFormatter = new Intl.DateTimeFormat("ja-JP-u-ca-japanese", {
  era: "long",
  year: "numeric",
});

// 例: "令和8年"
export function toWareki(date: Date): string {
  const parts = warekiFormatter.formatToParts(date);
  const era = parts.find((p) => p.type === "era")?.value ?? "";
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  return `${era}${year}年`;
}
