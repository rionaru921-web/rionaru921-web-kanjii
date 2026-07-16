import "server-only";

// Converts a raw Rakuten Travel URL into a Rakuten Affiliate link at render
// time (not at API-fetch/storage time) so that setting or rotating
// RAKUTEN_AFFILIATE_ID applies immediately to every plan, old and new,
// instead of only ones fetched after the ID was configured.
export function toRakutenAffiliateUrl(originalUrl: string): string {
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  if (!affiliateId || !originalUrl) {
    return originalUrl;
  }
  const encoded = encodeURIComponent(originalUrl);
  return `https://hb.afl.rakuten.co.jp/hgc/${affiliateId}/?pc=${encoded}&m=${encoded}`;
}
