import WarikanCalculator from "@/components/nomikai/WarikanCalculator";
import { getShopById } from "@/lib/api/hotpepper";

export default async function WarikanPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const total = Number(searchParams.total) || 0;
  const shopId = typeof searchParams.shopId === "string" ? searchParams.shopId : undefined;

  let shop = null;
  if (shopId) {
    try {
      const hpShop = await getShopById(shopId);
      if (hpShop) {
        shop = {
          name: hpShop.name,
          address: hpShop.address,
          openHours: hpShop.open,
          mapUrl: `https://www.google.com/maps?q=${hpShop.lat},${hpShop.lng}&z=16&output=embed`,
        };
      }
    } catch {
      // Shop lookup is best-effort here — the calculator works fine without it.
    }
  }

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <h1 className="font-serif font-bold text-xl text-ink mb-1">割り勘計算機</h1>
      <p className="text-sm text-ink-secondary mb-6">
        合計金額と参加者を入力してください
      </p>
      <WarikanCalculator initialTotal={total} shop={shop} />
    </main>
  );
}
