import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSurveySlug } from "@/lib/surveys/slug";
import { validateOptionalQuestions } from "@/lib/surveys/validate";
import type { DateOption, OptionalQuestion, SurveyEventType } from "@/lib/surveys/types";

interface CreateSurveyBody {
  title: string;
  description?: string | null;
  eventType?: SurveyEventType | null;
  askDates?: boolean;
  askBudget?: boolean;
  askGenre?: boolean;
  askAttend?: boolean;
  dateOptions?: DateOption[];
  budgetOptions?: string[];
  genreOptions?: string[];
  optionalQuestions?: OptionalQuestion[];
  deadline?: string | null;
}

// GET: 自分の作ったアンケート一覧
export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("surveys")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ surveys: data });
}

// POST: 新規作成(ゲスト/匿名認証ユーザーは不可 — アンケートは実アカウントに
// 紐づけて集計・共有する前提の機能のため)
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const body: CreateSurveyBody = await req.json();
  if (!body.title?.trim()) {
    return NextResponse.json({ error: "タイトルは必須です。" }, { status: 400 });
  }

  const optionalQuestionsResult = validateOptionalQuestions(body.optionalQuestions);
  if (!optionalQuestionsResult.ok) {
    return NextResponse.json({ error: optionalQuestionsResult.error }, { status: 400 });
  }

  // 「聞く」をONにした項目には候補が最低1つ必要(クライアント側の
  // 入力し忘れガードと同じ条件をサーバー側でも強制する)。
  if (body.askDates && (body.dateOptions?.length ?? 0) === 0) {
    return NextResponse.json({ error: "日程候補を1つ以上追加してください。" }, { status: 400 });
  }
  if (body.askBudget && (body.budgetOptions?.length ?? 0) === 0) {
    return NextResponse.json({ error: "予算候補を1つ以上追加してください。" }, { status: 400 });
  }
  if (body.askGenre && (body.genreOptions?.length ?? 0) === 0) {
    return NextResponse.json({ error: "ジャンル候補を1つ以上追加してください。" }, { status: 400 });
  }

  const { data: survey, error } = await supabase
    .from("surveys")
    .insert({
      owner_id: user.id,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      event_type: body.eventType ?? null,
      ask_dates: body.askDates ?? true,
      ask_budget: body.askBudget ?? true,
      ask_genre: body.askGenre ?? true,
      ask_attend: body.askAttend ?? true,
      date_options: body.dateOptions ?? [],
      budget_options: body.budgetOptions ?? [],
      genre_options: body.genreOptions ?? [],
      optional_questions: optionalQuestionsResult.value,
      deadline: body.deadline || null,
      slug: generateSurveySlug(),
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ survey });
}
