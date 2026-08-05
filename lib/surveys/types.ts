export type SurveyEventType =
  | "nomikai"
  | "travel"
  | "kangeikai"
  | "sobetsukai"
  | "birthday"
  | "other";

export type SurveyStatus = "active" | "closed" | "archived";
export type WillAttend = "yes" | "no" | "maybe";

export interface DateOption {
  date: string; // 'YYYY-MM-DD'
  time_slot?: string; // '昼' | '夜' | 'その他'
  label?: string;
}

// Wave 11-A2: organizer-defined extra questions beyond the 4 fixed ones.
// Stored on surveys.optional_questions (jsonb array).
// Wave 25: added 'date_range_extended' (4-level ◎◯△× per date, optionally
// split into lunch/dinner) and 'budget_slider' (numeric range input) —
// deliberately additive on top of the fixed ask_dates/ask_budget flow so
// existing Wave 21 surveys keep working unchanged; organizers opt into the
// richer versions as extra questions instead.
export type OptionalQuestionType =
  | "text"
  | "select"
  | "multi_select"
  | "yes_no"
  | "date_range_extended"
  | "budget_slider";

export interface OptionalQuestion {
  id: string; // stable key, used to match against SurveyResponse.optional_answers
  label: string;
  description?: string;
  type: OptionalQuestionType;
  options?: string[]; // used by 'select' / 'multi_select'

  // 'date_range_extended' only
  dateCandidates?: string[]; // 'YYYY-MM-DD'
  useTimeSlots?: boolean; // true: ask lunch/dinner separately per date

  // 'budget_slider' only
  sliderMin?: number;
  sliderMax?: number;
  sliderStep?: number;
}

export type DateChoiceLevel = "certain" | "probably" | "maybe" | "no"; // ◎ ◯ △ ×

export const DATE_CHOICE_LEVELS: {
  value: DateChoiceLevel;
  label: string;
  symbol: string;
  colorClass: string;
}[] = [
  { value: "certain", label: "絶対いける", symbol: "◎", colorClass: "text-sage" },
  { value: "probably", label: "いける", symbol: "◯", colorClass: "text-gold" },
  { value: "maybe", label: "微妙", symbol: "△", colorClass: "text-ink-secondary" },
  { value: "no", label: "NG", symbol: "×", colorClass: "text-vermilion-text" },
];

// One date's answer for a 'date_range_extended' question: a single level
// when the question doesn't split by time slot, or per-slot levels when it
// does (either slot may be left unanswered).
export type DateRangeExtendedValue = DateChoiceLevel | { lunch?: DateChoiceLevel; dinner?: DateChoiceLevel };

// Keyed by 'YYYY-MM-DD' (matching OptionalQuestion.dateCandidates entries).
export type DateRangeExtendedAnswer = Record<string, DateRangeExtendedValue>;

// Keyed by OptionalQuestion.id. Value shape depends on the question's type:
// 'text' -> string, 'yes_no' -> 'yes'|'no', 'select' -> string,
// 'multi_select' -> string[], 'budget_slider' -> number,
// 'date_range_extended' -> DateRangeExtendedAnswer.
export type OptionalAnswers = Record<
  string,
  string | string[] | number | DateRangeExtendedAnswer | undefined
>;

// Wave 11-A2: richer attendance info layered on top of the existing
// will_attend 3-value column — deliberately additive so existing
// aggregation (lib/surveys/aggregate.ts) keeps working unchanged.
export type AttendanceKind = "full" | "late" | "leave_early" | "undecided";

export interface AttendanceDetail {
  kind: AttendanceKind;
  arrival_time?: string | null; // 'HH:mm', only meaningful for kind='late'
  leave_time?: string | null; // 'HH:mm', only meaningful for kind='leave_early'
  will_confirm_later?: boolean; // only meaningful for kind='undecided'
}

export interface Survey {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  event_type: SurveyEventType | null;
  ask_dates: boolean;
  ask_budget: boolean;
  ask_genre: boolean;
  ask_attend: boolean;
  date_options: DateOption[];
  budget_options: string[];
  genre_options: string[];
  optional_questions: OptionalQuestion[];
  deadline: string | null;
  status: SurveyStatus;
  slug: string;
  results_public: boolean;
  created_at: string;
  updated_at: string;
}

// Shape returned by the public, slug-based GET — deliberately omits
// owner_id since it's served to anonymous respondents.
export type PublicSurvey = Omit<Survey, "owner_id">;

export interface SurveyResponse {
  id: string;
  survey_id: string;
  respondent_user_id: string | null;
  respondent_name: string;
  respondent_email: string | null;
  selected_dates: string[];
  selected_budget: string | null;
  selected_genre: string | null;
  will_attend: WillAttend | null;
  attendance_detail: AttendanceDetail | null;
  optional_answers: OptionalAnswers;
  free_comment: string | null;
  created_at: string;
}
