import "server-only";
import { customAlphabet } from "nanoid";

// Same alphabet/length as lib/share/link.ts's history share tokens
// (33-char alphabet x 12 = ~60bit) — surveys are a public share link too,
// so they get the same unguessable strength rather than a shorter slug.
const nanoid = customAlphabet("0123456789ABCDEFGHJKLMNPQRSTUVWXYZ", 12);

export function generateSurveySlug() {
  return nanoid();
}
