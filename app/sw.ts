import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// 実装ルール「Service Workerのキャッシュ戦略は保守的に(動的コンテンツは
// キャッシュしない)」を満たすため、個人データ・書き込みを伴うルートは
// defaultCache より先に NetworkOnly で捕まえて一切キャッシュさせない。
// オフライン時はここで network が落ちても /offline へフォールバックする
// (下の fallbacks 参照)ので、体験としては「白紙のエラー」にはならない。
// LP・/about・/pricing 等の静的ページはこの正規表現に一致しないため、
// defaultCache の通常のキャッシュ戦略(NetworkFirst等)がそのまま効く。
const UNCACHED_PATH_RE =
  /^\/(api|manual-plans|surveys|s|share|settings|dashboard|history|nomikai|travel|login|signup|forgot-password)(\/|$)/;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => UNCACHED_PATH_RE.test(url.pathname),
      handler: new NetworkOnly(),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.destination === "document",
      },
    ],
  },
});

serwist.addEventListeners();
