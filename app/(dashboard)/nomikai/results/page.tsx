import Link from "next/link";
import { ArrowLeft, AlertTriangle, Sparkles } from "lucide-react";
import { buildHotpepperSearchParams, searchRestaurants } from "@/lib/api/restaurants";
import { HotpepperApiError } from "@/lib/api/hotpepper";
import { genreNameByCode } from "@/lib/constants/genres";
import ResultsList from "@/components/nomikai/ResultsList";
import HotpepperAttribution from "@/components/shared/HotpepperAttribution";
import type { RestaurantSearchResult, SearchParams } from "@/lib/api/types";

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const people = Number(searchParams.people) || 2;
  const budget = Number(searchParams.budget) || 5000;
  const datetime =
    typeof searchParams.datetime === "string" ? searchParams.datetime : undefined;
  const station =
    typeof searchParams.station === "string" ? searchParams.station : undefined;
  const genre =
    typeof searchParams.genre === "string" ? searchParams.genre : undefined;
  const privateRoom = searchParams.privateRoom === "true";
  const range = searchParams.range ? (Number(searchParams.range) as 1 | 2 | 3 | 4 | 5) : undefined;
  const forceMock = searchParams.mock === "true";

  const params: SearchParams = { people, budget, datetime, station, genre, privateRoom, range };

  let result: RestaurantSearchResult | null = null;
  let errorMessage: string | null = null;

  try {
    result = await searchRestaurants(params, { forceMock });
  } catch (err) {
    errorMessage =
      err instanceof HotpepperApiError
        ? err.message
        : "検索中にエラーが発生しました。しばらくしてから再度お試しください。";
  }

  const genreName = genre ? genreNameByCode(genre) : "お店";
  const areaName = station ? `${station}周辺の` : "";

  const aiEnabled = Boolean(process.env.ANTHROPIC_API_KEY);
  const suggestParams = new URLSearchParams();
  suggestParams.set("people", String(people));
  suggestParams.set("budget", String(budget));
  if (station) suggestParams.set("station", station);
  if (genre) suggestParams.set("genre", genre);
  if (privateRoom) suggestParams.set("privateRoom", "true");
  if (datetime) suggestParams.set("datetime", datetime);
  const suggestHref = `/nomikai/suggest?${suggestParams.toString()}`;

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <Link
        href="/nomikai"
        className="inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-gold transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        検索条件を変更
      </Link>

      {!result ? (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-3 rounded-2xl border border-vermilion/20 bg-vermilion/5">
          <AlertTriangle className="text-vermilion-text" size={40} />
          <p className="text-ink-secondary">{errorMessage}</p>
          <Link
            href="/nomikai"
            className="text-gold text-sm underline underline-offset-4"
          >
            検索条件を変更する
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-1">
            <h1 className="font-serif font-bold text-xl text-ink">
              {areaName}
              {genreName}
            </h1>
            {aiEnabled ? (
              <Link
                href={suggestHref}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-gold-gradient text-white text-xs font-bold px-3.5 py-2 hover:brightness-110 transition-all shadow-gold"
              >
                <Sparkles size={14} />
                AIに相談する
              </Link>
            ) : (
              <span
                title="ANTHROPIC_API_KEY を設定してください"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-surface-tertiary text-ink-muted text-xs font-bold px-3.5 py-2 cursor-not-allowed opacity-60"
              >
                <Sparkles size={14} />
                AIに相談する
              </span>
            )}
          </div>
          <p className="text-sm text-ink-secondary mb-6">
            {result.totalAvailable.toLocaleString()}件見つかりました（{people}人・予算¥
            {budget.toLocaleString()}/人）
            {result.source === "mock" && (
              <span className="ml-2 whitespace-nowrap text-[11px] rounded-full bg-vermilion/15 text-vermilion-text px-2 py-0.5 align-middle">
                モックデータ
              </span>
            )}
          </p>

          <ResultsList
            initialShops={result.shops}
            totalAvailable={result.totalAvailable}
            source={result.source}
            hotpepperBaseParams={
              result.source === "hotpepper" ? buildHotpepperSearchParams(params) : undefined
            }
            people={people}
          />

          {result.source === "hotpepper" && (
            <div className="mt-8">
              <HotpepperAttribution />
            </div>
          )}
        </>
      )}
    </main>
  );
}
