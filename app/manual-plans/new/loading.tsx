import { Skeleton } from "@/components/ui/Skeleton";

export default function NewManualPlanLoading() {
  return (
    <main className="px-4 sm:px-8 pt-8 sm:pt-10 pb-28 max-w-2xl lg:max-w-6xl mx-auto">
      <Skeleton className="h-7 w-56 mb-1" />
      <Skeleton className="h-4 w-80 max-w-full mb-6" />
      <Skeleton className="h-10 w-full mb-6" />
      <div className="space-y-4">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    </main>
  );
}
