// Pure local-component <-> string conversions for wiring CalendarPopover up to
// the app's existing "YYYY-MM-DDTHH:mm" / "YYYY-MM-DD" string state. These
// never go through ISO/UTC, so they're a drop-in replacement for the raw
// values a native <input type="datetime-local"|"date"> produced — timezone
// conversion (JST-fixed) still happens only at the existing
// fromDateTimeLocalValue/toDateTimeLocalValue boundary in lib/date/kanjii-time.ts.

export function dateTimeLocalToDate(value: string): Date | null {
  if (!value) return null;
  const [datePart, timePart] = value.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh, mm] = (timePart ?? "00:00").split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm);
}

export function dateToDateTimeLocal(date: Date | null): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

export function dateOnlyToDate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function dateToDateOnly(date: Date | null): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
