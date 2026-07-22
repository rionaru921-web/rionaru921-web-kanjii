export interface RawAIRecommendation {
  shopId: string;
  rank: number;
  matchScore: number;
  title: string;
  reason: string;
  highlights: string[];
  warnings: string;
}

export interface RawAIResponse {
  recommendations: RawAIRecommendation[];
  summary: string;
}

// Claude occasionally wraps the JSON in a code fence or adds stray text
// around it despite the prompt saying not to. Strip fences first, and if
// straight JSON.parse still fails, fall back to extracting the outermost
// {...} block before giving up.
export function parseAiResponse(rawText: string): RawAIResponse | null {
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  const direct = tryParse(cleaned);
  if (direct) return direct;

  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  return tryParse(match[0]);
}

function tryParse(text: string): RawAIResponse | null {
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed?.recommendations)) return null;
    return parsed as RawAIResponse;
  } catch {
    return null;
  }
}
