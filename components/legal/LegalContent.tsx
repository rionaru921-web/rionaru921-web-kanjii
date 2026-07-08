import type { ReactNode } from "react";

export interface LegalTocItem {
  id: string;
  label: string;
}

export default function LegalContent({
  title,
  lastUpdated,
  toc,
  children,
}: {
  title: string;
  lastUpdated: string;
  toc?: LegalTocItem[];
  children: ReactNode;
}) {
  return (
    <main className="px-4 sm:px-6 py-12 sm:py-16">
      <div className="max-w-[1000px] mx-auto grid lg:grid-cols-[1fr_220px] gap-12">
        <article className="max-w-[800px]">
          <p className="text-xs text-ink-muted mb-3">最終更新日: {lastUpdated}</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink mb-10 tracking-tight">
            {title}
          </h1>

          <div
            className="legal-prose text-ink-secondary text-[15px] leading-[1.8] tracking-wide
            [&>section]:mb-10
            [&_h2]:font-serif [&_h2]:font-bold [&_h2]:text-lg [&_h2]:text-gold [&_h2]:mb-3 [&_h2]:scroll-mt-24
            [&_h3]:font-serif [&_h3]:font-bold [&_h3]:text-base [&_h3]:text-ink [&_h3]:mt-5 [&_h3]:mb-2 [&_h3]:scroll-mt-24
            [&_p]:mb-3
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1.5
            [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2
            [&_table]:w-full [&_table]:border-collapse [&_table]:mb-3 [&_table]:text-sm
            [&_th]:text-left [&_th]:text-ink [&_th]:font-semibold [&_th]:border-b [&_th]:border-gold/15 [&_th]:py-2 [&_th]:pr-4 [&_th]:align-top [&_th]:whitespace-nowrap
            [&_td]:border-b [&_td]:border-gold/10 [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top"
          >
            {children}
          </div>
        </article>

        {toc && toc.length > 0 && (
          <nav className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-xs font-semibold text-ink mb-3 tracking-wide">目次</p>
              <ul className="flex flex-col gap-2 border-l border-gold/15 pl-4">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="text-xs text-ink-secondary hover:text-gold transition-colors leading-relaxed"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        )}
      </div>
    </main>
  );
}
