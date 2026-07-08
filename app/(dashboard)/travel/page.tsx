import TravelPlanForm from "@/components/travel/TravelPlanForm";

export default function TravelPage() {
  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif font-bold text-2xl text-ink mb-1">
          旅行プランを作成
        </h1>
        <p className="text-sm text-ink-secondary">
          目的地・日程・予算を入力すると、AIが最適なプランを提案します
        </p>
      </div>
      <TravelPlanForm />
    </main>
  );
}
