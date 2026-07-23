import "server-only";
import { anthropic, AI_MODEL } from "@/lib/ai/client";
import type { PlanContext } from "@/lib/coaching/planContext";

export type QAPair = {
  step: number;
  key: string;
  question: string;
  answer: string;
  answered_at: string;
};

export type CoachFeedback = {
  summary: string;
  strengths: string[];
  improvements: string[];
};

export async function generateCoachFeedback(
  qaPairs: QAPair[],
  planContext: PlanContext
): Promise<CoachFeedback> {
  const contextText = [
    planContext.title && `イベント: ${planContext.title}`,
    planContext.venue && `会場: ${planContext.venue}`,
    planContext.memberCount != null && `参加人数: ${planContext.memberCount}名`,
    planContext.budget != null && `予算: 1人${planContext.budget}円`,
  ]
    .filter(Boolean)
    .join("\n");

  const qaText = qaPairs.map((p) => `Q: ${p.question}\nA: ${p.answer}`).join("\n\n");

  const systemPrompt = `あなたは経験豊富な幹事コーチです。
飲み会・旅行の幹事を務めたユーザーが、開催後に振り返りをします。
回答内容を分析し、次の3つを日本語で返してください。

【出力形式（JSONのみ、他は一切出力しない）】
{
  "summary": "全体の総評（100〜150字）。事実を踏まえて具体的に。",
  "strengths": ["良かった点1（30〜50字）", "良かった点2", "良かった点3"],
  "improvements": ["次回の改善提案1（30〜60字、具体的アクション）", "改善提案2"]
}

【重要ルール】
- summaryは具体的な数字や事実を引用する
- strengthsは最低2個、最大5個
- improvementsは最低1個、最大4個。改善提案は「〜すると◯◯できます」の形式
- ネガティブな評価もOKだが、必ず改善策とセットで書く
- 抽象的な精神論（「頑張って」等）は禁止
- 幹事の努力を認めるトーンで、上から目線にならない`;

  const userPrompt = `【プラン情報】
${contextText || "（詳細情報なし）"}

【振り返りQ&A】
${qaText}

上記を踏まえて、JSON形式でフィードバックを返してください。`;

  const response = await anthropic.messages.create({
    model: AI_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = response.content
    .filter((c) => c.type === "text")
    .map((c) => (c as { type: "text"; text: string }).text)
    .join("\n");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI response did not contain JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]);

  if (
    typeof parsed.summary !== "string" ||
    !Array.isArray(parsed.strengths) ||
    !Array.isArray(parsed.improvements)
  ) {
    throw new Error("AI response has invalid structure");
  }

  return {
    summary: parsed.summary,
    strengths: parsed.strengths.filter((s: unknown) => typeof s === "string"),
    improvements: parsed.improvements.filter((s: unknown) => typeof s === "string"),
  };
}
