function LineIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.477 2 2 5.686 2 10.222c0 4.065 3.556 7.47 8.362 8.115.326.07.769.216.881.497.101.254.066.652.032.909l-.143.858c-.043.254-.203.994.87.542 1.074-.453 5.793-3.41 7.903-5.838C21.34 13.484 22 11.928 22 10.222 22 5.686 17.523 2 12 2Zm-3.577 10.89H6.978a.29.29 0 0 1-.29-.29v-4.06a.29.29 0 0 1 .58 0v3.77h1.155a.29.29 0 0 1 0 .58Zm1.87 0h-.58a.29.29 0 0 1-.29-.29v-4.06a.29.29 0 0 1 .58 0v4.06a.29.29 0 0 1-.29.29Zm5.148 0h-.58a.29.29 0 0 1-.235-.12l-2.02-2.73v2.56a.29.29 0 0 1-.58 0v-4.06a.29.29 0 0 1 .29-.29h.58a.29.29 0 0 1 .234.12l2.02 2.73V8.54a.29.29 0 0 1 .58 0v4.06a.29.29 0 0 1-.289.29Zm3.29-3.48h-1.155v.87h1.155a.29.29 0 0 1 0 .58h-1.155v.87h1.155a.29.29 0 0 1 0 .58h-1.445a.29.29 0 0 1-.29-.29v-4.06a.29.29 0 0 1 .29-.29h1.445a.29.29 0 0 1 0 .58Z" />
    </svg>
  );
}

export default function LineLoginButton({
  redirectTo = "/dashboard",
}: {
  redirectTo?: string;
}) {
  return (
    <a
      href={`/api/auth/line?redirectTo=${encodeURIComponent(redirectTo)}`}
      className="flex items-center justify-center gap-2 rounded-full bg-[#06C755] text-white font-semibold py-2.5 text-sm hover:brightness-105 transition-all"
    >
      <LineIcon />
      LINEでログイン
    </a>
  );
}
