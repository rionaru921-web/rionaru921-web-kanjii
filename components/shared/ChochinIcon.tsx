export default function ChochinIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="chochin-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D97D79" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#B85450" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#9F4642" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <line x1="60" y1="4" x2="60" y2="24" stroke="#B85450" strokeWidth="1.5" strokeOpacity="0.6" />
      <rect x="46" y="20" width="28" height="12" rx="3" fill="#B85450" fillOpacity="0.5" />
      <ellipse cx="60" cy="88" rx="48" ry="58" fill="url(#chochin-body)" />
      <ellipse
        cx="60"
        cy="88"
        rx="48"
        ry="58"
        stroke="#B85450"
        strokeOpacity="0.5"
        strokeWidth="1.5"
      />
      {[42, 58, 74, 90, 106, 122, 134].map((y) => (
        <path
          key={y}
          d={`M ${12 + Math.sin((y / 160) * Math.PI) * 2} ${y} Q 60 ${y} ${
            108 - Math.sin((y / 160) * Math.PI) * 2
          } ${y}`}
          stroke="#B85450"
          strokeOpacity="0.25"
          strokeWidth="1"
        />
      ))}
      <rect x="46" y="128" width="28" height="12" rx="3" fill="#B85450" fillOpacity="0.5" />
      <line x1="60" y1="140" x2="60" y2="158" stroke="#B85450" strokeWidth="1.5" strokeOpacity="0.6" />
    </svg>
  );
}
