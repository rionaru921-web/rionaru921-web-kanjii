import SearchForm from "@/components/nomikai/SearchForm";

export default function NomikaiPage() {
  return (
    <main className="px-4 sm:px-8 py-8 sm:py-10 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif font-bold text-2xl text-ink mb-1">お店を探す</h1>
        <p className="text-sm text-ink-secondary">
          条件を入力して、幹事の悩みをスマートに解決
        </p>
      </div>
      <SearchForm />
    </main>
  );
}
