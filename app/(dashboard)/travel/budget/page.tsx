import BudgetSplitter from "@/components/travel/BudgetSplitter";
import { mockTravelPlans } from "@/lib/mock/travel";

export default function TravelBudgetPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const total = Number(searchParams.total) || undefined;
  const title = typeof searchParams.title === "string" ? searchParams.title : undefined;
  const planId = typeof searchParams.planId === "string" ? searchParams.planId : undefined;
  const plan = planId ? mockTravelPlans.find((p) => p.id === planId) : undefined;

  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <h1 className="font-serif font-bold text-xl text-ink mb-1">費用分担計算</h1>
      <p className="text-sm text-ink-secondary mb-6">
        {title ? `${title} の` : ""}費用と参加者を入力してください
      </p>
      <BudgetSplitter initialTotalHint={total} initialTitle={title} plan={plan} />
    </main>
  );
}
