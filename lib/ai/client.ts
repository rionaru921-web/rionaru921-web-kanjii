import "server-only";
import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn("ANTHROPIC_API_KEY is not set. AI features will not work.");
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Fast, low-cost, and more than accurate enough for a structured
// recommendation task like this one.
export const AI_MODEL = "claude-haiku-4-5-20251001";
