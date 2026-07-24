import { Sparkles } from "lucide-react";
import SuggestForm from "@/components/ai/SuggestForm";

export default function SuggestPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif font-bold text-2xl text-gold-gradient mb-1 flex items-center gap-2">
          <Sparkles size={22} className="text-gold" />
          AI提案(補助)を受ける
        </h1>
        <p className="text-sm text-ink-secondary">
          参加者の情報を教えてください。最適な店を厳選します。
        </p>
      </div>
      <SuggestForm initialParams={searchParams} />
    </main>
  );
}
