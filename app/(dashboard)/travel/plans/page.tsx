import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { searchTravelPlans } from "@/lib/api/travel";
import DestinationCard from "@/components/travel/DestinationCard";

export default async function TravelPlansPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const people = Number(searchParams.people) || 2;
  const budget = Number(searchParams.budget) || 60000;
  const destination =
    typeof searchParams.destination === "string" && searchParams.destination.trim()
      ? searchParams.destination
      : undefined;
  const travelType =
    typeof searchParams.travelType === "string" ? searchParams.travelType : undefined;
  const transport =
    typeof searchParams.transport === "string" ? searchParams.transport : undefined;
  const startDate =
    typeof searchParams.startDate === "string" ? searchParams.startDate : undefined;
  const endDate =
    typeof searchParams.endDate === "string" ? searchParams.endDate : undefined;

  const plans = await searchTravelPlans({
    destination,
    people,
    budget,
    travelType,
    transport,
    startDate,
    endDate,
  });

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <Link
        href="/travel"
        className="inline-flex items-center gap-1 text-sm text-ink-secondary hover:text-gold transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        検索条件を変更
      </Link>

      <h1 className="font-serif font-bold text-xl text-ink mb-1">提案プラン</h1>
      <p className="text-sm text-ink-secondary mb-6">
        {destination ?? "全国"}・{people}人・予算¥{budget.toLocaleString()}/人 で
        {plans.length}件見つかりました
      </p>

      {plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-3 rounded-3xl bg-surface-tertiary shadow-warm">
          <SearchX className="text-ink-muted" size={40} />
          <p className="text-ink-secondary">条件に合うプランが見つかりませんでした</p>
          <Link
            href="/travel"
            className="text-gold text-sm underline underline-offset-4"
          >
            条件を変更する
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {plans.map((plan) => (
            <DestinationCard key={plan.id} plan={plan} people={people} />
          ))}
        </div>
      )}
    </main>
  );
}
