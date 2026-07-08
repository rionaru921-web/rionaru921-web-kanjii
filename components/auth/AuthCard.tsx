import type { ReactNode } from "react";

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-surface-tertiary shadow-warm p-6 sm:p-8">
      <h1 className="font-serif font-bold text-xl text-ink mb-1">{title}</h1>
      {subtitle && <p className="text-sm text-ink-secondary mb-6">{subtitle}</p>}
      {children}
    </div>
  );
}
