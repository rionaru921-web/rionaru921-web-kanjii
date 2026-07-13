// Kanjii の手動プランは常に JST(日本標準時、UTC+09:00・DSTなし)を基準に
// 入力・表示する。DB(timestamptz)には正しい絶対時刻が保存されているが、
// これまで表示側が実行環境(ブラウザ or サーバープロセス)のローカルTZに
// 依存していたため、Vercel 等 UTC 環境での SSR 時に時刻がズレて見える
// バグがあった。ここで JST を明示的に固定することで、実行環境に左右され
// ない一貫した変換・表示を保証する。
const JST_TIME_ZONE = "Asia/Tokyo";
const JST_OFFSET = "+09:00";

function getJstParts(iso: string) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: JST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { year: get("year"), month: get("month"), day: get("day"), hour: get("hour"), minute: get("minute") };
}

// ISO(絶対時刻)→ <input type="datetime-local"> 用の "YYYY-MM-DDTHH:mm"(JST基準)
export function toDateTimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const { year, month, day, hour, minute } = getJstParts(iso);
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

// datetime-local の値("YYYY-MM-DDTHH:mm")を常に JST の壁時計時刻として
// 解釈し、ISO(UTC)文字列に変換する。JST は固定オフセットなので、
// タイムゾーン名を付けず明示的に "+09:00" を付与するだけで済む。
export function fromDateTimeLocalValue(value: string): string | null {
  if (!value) return null;
  return new Date(`${value}:00${JST_OFFSET}`).toISOString();
}

export function formatJstDateTime(iso: string | null): string {
  if (!iso) return "未定";
  return new Date(iso).toLocaleString("ja-JP", {
    timeZone: JST_TIME_ZONE,
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatJstTimeOnly(iso: string): string {
  return new Date(iso).toLocaleTimeString("ja-JP", {
    timeZone: JST_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatJstDateRange(start: string | null, end: string | null): string {
  if (!start) return "日時未定";
  const startLabel = formatJstDateTime(start);
  if (!end) return startLabel;

  const startParts = getJstParts(start);
  const endParts = getJstParts(end);
  const sameDay =
    startParts.year === endParts.year && startParts.month === endParts.month && startParts.day === endParts.day;
  const endLabel = sameDay ? formatJstTimeOnly(end) : formatJstDateTime(end);

  return `${startLabel} 〜 ${endLabel}`;
}
