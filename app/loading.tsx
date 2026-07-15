export default function GlobalLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-gold/20 border-t-gold animate-spin" />
        <p className="text-sm text-ink-muted">読み込み中...</p>
      </div>
    </div>
  );
}
