export interface ParsedFee {
  amount: number | null;
  raw: string;
  isUndetermined: boolean;
}

// Accepts free text ("未定", "相談" etc.) alongside numbers so organizers
// aren't forced to leave a fee-breakdown line blank when the amount isn't
// settled yet. Full-width digits are normalized since IME input commonly
// produces them.
export function parseFee(input: string): ParsedFee {
  // fee_breakdown is stored as JSONB; rows created before amount became a
  // string column (see 20260712000000_plan_enhancements.sql) still hold a
  // raw number here, so this must not assume `input` is actually a string.
  const trimmed = String(input).trim();
  if (!trimmed) return { amount: null, raw: trimmed, isUndetermined: false };

  const normalized = trimmed
    .replace(/[,，\s]/g, "")
    .replace(/[０-９]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0xfee0));
  const num = Number(normalized);

  return normalized !== "" && Number.isFinite(num)
    ? { amount: num, raw: trimmed, isUndetermined: false }
    : { amount: null, raw: trimmed, isUndetermined: true };
}

export function sumFees(inputs: string[]): { total: number; undeterminedCount: number } {
  return inputs.reduce(
    (acc, input) => {
      const { amount, isUndetermined } = parseFee(input);
      return isUndetermined
        ? { ...acc, undeterminedCount: acc.undeterminedCount + 1 }
        : { ...acc, total: acc.total + (amount ?? 0) };
    },
    { total: 0, undeterminedCount: 0 }
  );
}

export function formatFeeValue(raw: string): string {
  const { amount, isUndetermined } = parseFee(raw);
  return isUndetermined ? raw : `¥${(amount ?? 0).toLocaleString()}`;
}
