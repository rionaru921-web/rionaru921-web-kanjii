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
  deadline: string | null;
  status: SurveyStatus;
  slug: string;
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
  free_comment: string | null;
  created_at: string;
}
