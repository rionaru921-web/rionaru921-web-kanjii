// Shared Tailwind class strings for the manual-plan form family
// (ManualPlanForm, FeeSection, VenueInput, NijikaiSection) — previously
// each file redefined the identical string locally, so a shared tweak
// (e.g. the input focus/duration treatment) had to be replicated by hand
// in four places.
export const inputClass =
  "mt-1.5 w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors duration-200 focus:border-gold disabled:opacity-50";
export const labelClass = "block text-sm font-medium text-ink";
