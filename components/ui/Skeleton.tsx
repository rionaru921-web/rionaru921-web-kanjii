export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-gold/15 animate-pulse rounded-lg ${className}`}
      aria-label="読み込み中"
    />
  );
}
