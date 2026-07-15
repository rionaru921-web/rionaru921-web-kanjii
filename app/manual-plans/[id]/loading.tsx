import { Skeleton } from "@/components/ui/Skeleton";

export default function ManualPlanDetailLoading() {
  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-64 max-w-full" />
        <Skeleton className="h-5 w-40" />
      </div>

      <Skeleton className="h-40 w-full rounded-3xl" />

      <div className="grid sm:grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>

      <Skeleton className="h-56 w-full rounded-3xl" />
    </main>
  );
}
