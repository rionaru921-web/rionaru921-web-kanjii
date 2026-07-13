"use client";

import { Plus, Trash2 } from "lucide-react";
import { PAYMENT_METHOD_LABELS, perPersonFee } from "@/lib/manual-plans/format";
import { sumFees } from "@/lib/manual-plans/fee-parser";
import type { FeeBreakdownItem } from "@/lib/manual-plans/types";

interface FeeSectionProps {
  feeAmount: string;
  onFeeAmountChange: (value: string) => void;
  breakdown: FeeBreakdownItem[];
  onBreakdownChange: (items: FeeBreakdownItem[]) => void;
  paymentMethods: string[];
  onTogglePaymentMethod: (method: string) => void;
  paymentDeadline: string;
  onPaymentDeadlineChange: (value: string) => void;
  memberCount: number;
  disabled?: boolean;
}

const PAYMENT_METHOD_OPTIONS = ["cash", "paypay", "bank_transfer"];

const inputClass =
  "mt-1.5 w-full rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors focus:border-gold disabled:opacity-50";
const labelClass = "block text-sm font-medium text-ink";

export default function FeeSection({
  feeAmount,
  onFeeAmountChange,
  breakdown,
  onBreakdownChange,
  paymentMethods,
  onTogglePaymentMethod,
  paymentDeadline,
  onPaymentDeadlineChange,
  memberCount,
  disabled,
}: FeeSectionProps) {
  const totalAmount = feeAmount.trim() ? Number(feeAmount) : null;
  const { total: breakdownTotal, undeterminedCount } = sumFees(breakdown.map((item) => item.amount));
  const breakdownMismatch =
    breakdown.length > 0 &&
    totalAmount != null &&
    undeterminedCount === 0 &&
    breakdownTotal !== totalAmount;
  const perPerson = perPersonFee(totalAmount, memberCount);

  function updateItem(index: number, field: keyof FeeBreakdownItem, value: string) {
    onBreakdownChange(breakdown.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function addItem() {
    onBreakdownChange([...breakdown, { label: "", amount: "" }]);
  }

  function removeItem(index: number) {
    onBreakdownChange(breakdown.filter((_, i) => i !== index));
  }

  return (
    <>
      <div>
        <label className={labelClass}>合計金額(円)</label>
        <input
          type="text"
          inputMode="numeric"
          value={feeAmount}
          onChange={(e) => onFeeAmountChange(e.target.value)}
          disabled={disabled}
          className={inputClass}
          placeholder="4000"
        />
        <p className="mt-1 text-xs text-ink-muted">
          数字のみ集計されます。金額が未定の場合は下の内訳欄をご利用ください。
        </p>
      </div>

      <div>
        <label className={labelClass}>用途別内訳(オプション)</label>
        <div className="mt-1.5 flex flex-col gap-2">
          {breakdown.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem(i, "label", e.target.value)}
                disabled={disabled}
                className="flex-1 rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors focus:border-gold disabled:opacity-50"
                placeholder="例: 飲食代"
              />
              <input
                type="text"
                value={item.amount}
                onChange={(e) => updateItem(i, "amount", e.target.value)}
                disabled={disabled}
                className="w-28 rounded-xl border border-gold/20 bg-surface px-3 py-2.5 text-ink outline-none transition-colors focus:border-gold disabled:opacity-50"
                placeholder="30000 / 未定"
              />
              <button
                type="button"
                onClick={() => removeItem(i)}
                disabled={disabled}
                className="shrink-0 rounded-xl p-2.5 text-ink-muted hover:text-vermilion transition-colors disabled:opacity-30"
                aria-label="内訳を削除"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItem}
          disabled={disabled}
          className="mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 text-sm font-medium text-gold py-2 px-3 hover:bg-gold/5 transition-colors disabled:opacity-50"
        >
          <Plus size={14} />
          内訳を追加
        </button>
        {breakdownMismatch && (
          <p className="mt-2 text-xs text-orange-600">
            内訳の合計(¥{breakdownTotal.toLocaleString()})が合計金額と一致していません。
          </p>
        )}
      </div>

      {perPerson != null && (
        <div className="rounded-xl bg-gold/5 border border-gold/15 px-4 py-3">
          <p className="text-xs text-ink-muted">💡 参加人数: {memberCount}人</p>
          <p className="text-sm font-semibold text-ink mt-0.5">
            1人あたり: <span className="font-display-num text-gold">¥{perPerson.toLocaleString()}</span>
          </p>
        </div>
      )}

      <div>
        <label className={labelClass}>支払い方法</label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {PAYMENT_METHOD_OPTIONS.map((method) => (
            <button
              key={method}
              type="button"
              onClick={() => onTogglePaymentMethod(method)}
              disabled={disabled}
              className={`rounded-xl px-3 py-2 text-xs font-semibold border transition-colors disabled:opacity-50 ${
                paymentMethods.includes(method)
                  ? "bg-gold-gradient border-transparent text-white"
                  : "border-gold/15 text-ink-secondary hover:border-gold/30"
              }`}
            >
              {PAYMENT_METHOD_LABELS[method]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>支払い期限</label>
        <input
          type="datetime-local"
          step={300}
          value={paymentDeadline}
          onChange={(e) => onPaymentDeadlineChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.preventDefault();
          }}
          disabled={disabled}
          className={inputClass}
        />
      </div>
    </>
  );
}
