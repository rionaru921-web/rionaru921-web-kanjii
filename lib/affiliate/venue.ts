import "server-only";
import { toMoshimoAffiliateUrl } from "./moshimo";
import { toRakutenAffiliateUrl } from "./rakuten";

// A manual plan's venue_url comes from one of two sources (see
// components/manual-plans/VenueInput.tsx): picking a HotPepper shop sets
// venue_hotpepper_id alongside it, picking a Rakuten hotel leaves it null.
// That's the only signal we have for which affiliate program the URL
// belongs to, so branch on it here rather than duplicating the branch at
// every render site.
export function toVenueAffiliateUrl(
  venueUrl: string | null,
  venueHotpepperId: string | null
): string | null {
  if (!venueUrl) return venueUrl;
  return venueHotpepperId
    ? toMoshimoAffiliateUrl(venueUrl)
    : toRakutenAffiliateUrl(venueUrl);
}
