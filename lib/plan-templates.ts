// 「新しいプランを作成」フォームのテンプレクイックフィル用データ。
// 日時は選択した瞬間の実行環境ローカル時刻(日本のユーザー想定なのでJST)
// を基準に動的計算する — テンプレ自体に固定日付を持たせると去年の日付の
// まま埋まってしまうため。

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function atTime(date: Date, hour: number, minute: number): Date {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

// 今日から少なくとも minWeeksAhead 週間後になる、直近の targetWeekday
// (0=日曜〜6=土曜) を返す。「来週金曜」「翌週土曜」のような相対指定に使う。
function nextWeekdayAtLeast(targetWeekday: number, minWeeksAhead: number, hour: number, minute: number): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let d = addDays(today, minWeeksAhead * 7);
  while (d.getDay() !== targetWeekday) {
    d = addDays(d, 1);
  }
  return atTime(d, hour, minute);
}

// target の前後3日以内で targetWeekday に最も近い日を返す。
// 「12月中旬金曜」のような「月中旬の特定曜日」の指定に使う。
function nearestWeekdayTo(target: Date, targetWeekday: number, hour: number, minute: number): Date {
  let best = target;
  let bestDiff = Infinity;
  for (let offset = -3; offset <= 3; offset++) {
    const candidate = addDays(target, offset);
    if (candidate.getDay() === targetWeekday && Math.abs(offset) < bestDiff) {
      bestDiff = Math.abs(offset);
      best = candidate;
    }
  }
  return atTime(best, hour, minute);
}

function midMonthOfNextOccurrence(month: number, day: number): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thisYear = new Date(today.getFullYear(), month - 1, day);
  return thisYear.getTime() >= today.getTime() ? thisYear : new Date(today.getFullYear() + 1, month - 1, day);
}

export function formatLocalDateTimeInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export interface PlanTemplate {
  id: string;
  label: string;
  icon: string;
  title: string;
  getEventDate: () => Date | null;
  durationHours: number | null;
  feeAmount: string;
  venueHint?: string;
}

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: "welcome",
    label: "歓迎会",
    icon: "🎉",
    title: "〇〇さんの歓迎会",
    getEventDate: () => nextWeekdayAtLeast(5, 1, 19, 0),
    durationHours: 2,
    feeAmount: "4000",
  },
  {
    id: "farewell",
    label: "送別会",
    icon: "🌸",
    title: "〇〇さんの送別会",
    getEventDate: () => nextWeekdayAtLeast(5, 1, 19, 0),
    durationHours: 2,
    feeAmount: "4000",
  },
  {
    id: "bonenkai",
    label: "忘年会",
    icon: "🍶",
    title: "忘年会",
    getEventDate: () => nearestWeekdayTo(midMonthOfNextOccurrence(12, 15), 5, 19, 30),
    durationHours: 2.5,
    feeAmount: "5000",
  },
  {
    id: "shinnenkai",
    label: "新年会",
    icon: "🎍",
    title: "新年会",
    getEventDate: () => nearestWeekdayTo(midMonthOfNextOccurrence(1, 15), 5, 19, 0),
    durationHours: 2,
    feeAmount: "4500",
  },
  {
    id: "family-trip",
    label: "家族旅行",
    icon: "🚗",
    title: "家族旅行",
    getEventDate: () => nextWeekdayAtLeast(6, 1, 10, 0),
    durationHours: 6,
    feeAmount: "10000",
    venueHint: "宿泊を伴う場合は「宿泊施設を探す」から探せます。",
  },
  {
    id: "blank",
    label: "自由入力",
    icon: "✏️",
    title: "",
    getEventDate: () => null,
    durationHours: null,
    feeAmount: "",
  },
];
