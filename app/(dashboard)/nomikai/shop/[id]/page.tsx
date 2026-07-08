import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { getShopById, HotpepperApiError } from "@/lib/api/hotpepper";
import ShopDetail from "@/components/nomikai/ShopDetail";
import HotpepperAttribution from "@/components/shared/HotpepperAttribution";

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const people = Number(searchParams.people) || 2;

  let shop = null;
  let errorMessage: string | null = null;

  try {
    shop = await getShopById(params.id);
  } catch (err) {
    errorMessage =
      err instanceof HotpepperApiError
        ? err.message
        : "店舗情報の取得に失敗しました。";
  }

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <Link
        href="/nomikai/results"
        className="inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-gold transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        検索結果に戻る
      </Link>

      {shop ? (
        <>
          <ShopDetail shop={shop} people={people} />
          <div className="mt-8">
            <HotpepperAttribution />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-3 rounded-3xl bg-surface-tertiary shadow-warm">
          <SearchX className="text-ink-muted" size={40} />
          <p className="text-ink-secondary">
            {errorMessage ?? "店舗情報が見つかりませんでした。"}
          </p>
          <Link
            href="/nomikai/results"
            className="text-gold text-sm underline underline-offset-4"
          >
            検索結果に戻る
          </Link>
        </div>
      )}
    </main>
  );
}
