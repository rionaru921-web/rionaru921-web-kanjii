export function yen(n: number): string {
  return `¥${n.toLocaleString()}`;
}

// For controlled `<input type="text" inputMode="numeric">` money fields backed
// by a numeric value: strips non-digits and collapses leading zeros (but
// keeps a single "0"). Needed because `<input type="number">` bound to a
// number state has a well-known React quirk on mobile — clearing the field
// forces the state back to 0, and typing further digits can land before that
// leftover "0" in the DOM without React repainting it away (the browser
// treats "01" and "1" as the same parsed number, so it skips the visual
// update) — leaving a stray leading zero. Plain text inputs don't have that
// special-cased DOM behavior, so this is the fix.
export function sanitizeNumericInput(raw: string): string {
  const digitsOnly = raw.replace(/[^0-9]/g, "");
  return digitsOnly.replace(/^0+(?=\d)/, "");
}
