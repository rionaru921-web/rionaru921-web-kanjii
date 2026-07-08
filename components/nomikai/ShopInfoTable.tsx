import { DoorClosed, Wind, Wifi, CreditCard, UtensilsCrossed, Wine, Salad } from "lucide-react";
import type { HotpepperShop } from "@/lib/api/hotpepper";

export default function ShopInfoTable({ shop }: { shop: HotpepperShop }) {
  const rows = [
    { icon: DoorClosed, label: "個室", value: shop.privateRoom ? "あり" : "なし" },
    { icon: Wind, label: "禁煙・喫煙", value: shop.nonSmoking || "情報なし" },
    { icon: Wifi, label: "WiFi", value: shop.wifi || "情報なし" },
    { icon: CreditCard, label: "カード", value: shop.card || "情報なし" },
    { icon: UtensilsCrossed, label: "コース", value: shop.course || "情報なし" },
    { icon: Wine, label: "飲み放題", value: shop.freeDrink || "情報なし" },
    { icon: Salad, label: "食べ放題", value: shop.freeFood || "情報なし" },
  ];

  return (
    <div className="rounded-3xl bg-surface-tertiary shadow-warm overflow-hidden">
      {rows.map((row, idx) => {
        const Icon = row.icon;
        return (
          <div
            key={row.label}
            className={`flex items-center gap-3 px-4 py-3 text-sm ${
              idx !== rows.length - 1 ? "border-b border-gold/10" : ""
            }`}
          >
            <Icon size={16} className="text-gold shrink-0" />
            <span className="w-24 shrink-0 text-ink-secondary">{row.label}</span>
            <span className="text-ink">{row.value}</span>
          </div>
        );
      })}
    </div>
  );
}
