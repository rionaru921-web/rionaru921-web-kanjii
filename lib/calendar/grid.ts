export interface MonthGridCell {
  date: Date;
  inCurrentMonth: boolean;
}

// 6週×7日=42マスの月グリッドを生成。weekStartsOn(0=日曜/1=月曜)に応じて
// 前月分の先頭パディングを入れ、42マスに満たない分は翌月分で埋める。
export function buildMonthGrid(
  year: number,
  month: number,
  weekStartsOn: 0 | 1 = 0
): MonthGridCell[] {
  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = firstOfMonth.getDay();
  const leadingOffset = (firstWeekday - weekStartsOn + 7) % 7;

  const start = new Date(year, month, 1 - leadingOffset);

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    return { date, inCurrentMonth: date.getMonth() === month };
  });
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
