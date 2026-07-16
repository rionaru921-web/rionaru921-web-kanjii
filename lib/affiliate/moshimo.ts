import "server-only";

// Converts a raw HotPepper Gourmet URL into a Moshimo Affiliate click-through
// link at render time. Applied wherever a HotPepper shop URL is turned into
// an href, not when the URL is first fetched from the API or saved to the
// DB, so rotating the Moshimo IDs takes effect immediately for every plan.
export function toMoshimoAffiliateUrl(originalUrl: string): string {
  const aId = process.env.MOSHIMO_AFFILIATE_A_ID;
  const pId = process.env.MOSHIMO_AFFILIATE_P_ID;
  const plId = process.env.MOSHIMO_AFFILIATE_PL_ID;

  if (!aId || !pId || !plId || !originalUrl) {
    return originalUrl;
  }

  const encoded = encodeURIComponent(originalUrl);
  return `https://af.moshimo.com/af/c/click?a_id=${aId}&p_id=${pId}&pl_id=${plId}&url=${encoded}`;
}
