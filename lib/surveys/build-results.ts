import "server-only";
import {
  aggregateAttendanceDetail,
  aggregateBudgetSlider,
  aggregateDateRangeExtended,
  aggregateOptionalQuestion,
  aggregateResponses,
} from "./aggregate";
import type { PublicSurvey, SurveyResponse } from "./types";

// オーナー画面(app/(dashboard)/surveys/[id])と公開集計画面
// (app/s/[slug]/results)の両方が同じ集計を必要とするための共通ロジック。
// Wave 26 で後者を追加する際に重複させないよう切り出した。survey は
// owner_id を読まないので PublicSurvey で受ける(owner画面の Survey も
// 構造的にこれを満たすのでそのまま渡せる)。
export function buildSurveyResultsProps(survey: PublicSurvey, responses: SurveyResponse[]) {
  const { dateTally, budgetTally, genreTally, attendCounts, maxCount, totalResponses } = aggregateResponses(
    responses,
    survey.date_options
  );
  const attendanceDetailCounts = aggregateAttendanceDetail(responses);

  // date_range_extended / budget_slider は専用の集計・表示コンポーネントを
  // 持つため、汎用の aggregateOptionalQuestion(text/select/multi_select/
  // yes_no 用)の対象からは除く。
  const genericOptionalQuestions = survey.optional_questions.filter(
    (q) => q.type !== "date_range_extended" && q.type !== "budget_slider"
  );
  const optionalTallies = genericOptionalQuestions.map((question) => ({
    question,
    ...aggregateOptionalQuestion(question, responses),
  }));

  const dateRangeExtendedResults = survey.optional_questions
    .filter((q) => q.type === "date_range_extended")
    .map((question) => ({ question, scores: aggregateDateRangeExtended(question, responses) }));

  const budgetSliderResults = survey.optional_questions
    .filter((q) => q.type === "budget_slider")
    .map((question) => ({ question, stats: aggregateBudgetSlider(question, responses) }));

  return {
    dateTally,
    budgetTally,
    genreTally,
    attendCounts,
    attendanceDetailCounts,
    optionalTallies,
    dateRangeExtendedResults,
    budgetSliderResults,
    maxCount,
    totalResponses,
  };
}
