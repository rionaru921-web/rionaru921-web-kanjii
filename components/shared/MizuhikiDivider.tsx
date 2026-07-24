export default function MizuhikiDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-gold/60" />
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 0.5L13.5 7L7 13.5L0.5 7L7 0.5Z"
          stroke="#B8935A"
          strokeWidth="1"
          fill="none"
        />
      </svg>
      <span className="h-px w-10 bg-gradient-to-l from-transparent to-gold/60" />
    </div>
  );
}
