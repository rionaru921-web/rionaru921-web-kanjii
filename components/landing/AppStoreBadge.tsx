const APP_STORE_URL = "https://apps.apple.com/jp/app/id6800397796";

export default function AppStoreBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-block transition-transform hover:scale-[1.03] ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/badges/app-store-ja.svg" alt="App Storeでダウンロード" className="h-11 w-auto" />
    </a>
  );
}
