export interface IcsEvent {
  uid: string;
  title: string;
  description?: string;
  location?: string;
  startDate: string; // ISO 8601
  endDate?: string;
  url?: string;
}

export function generateIcs(event: IcsEvent): string {
  // Order matters: backslashes must be escaped first, or the backslash
  // inserted by the ";"/","/newline replacements below would itself get
  // re-escaped. Newlines become the two-character literal "\n" (not an
  // actual line break) — RFC 5545 requires each property on one logical
  // line, and an unescaped newline would produce an unindented, invalid
  // continuation line that breaks strict parsers (e.g. Outlook).
  const escapeText = (s: string) =>
    s
      .replace(/\\/g, "\\\\")
      .replace(/[;,]/g, "\\$&")
      .replace(/\r?\n/g, "\\n");
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  };

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KanjiLabo//JP",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${formatDate(new Date().toISOString())}`,
    `DTSTART:${formatDate(event.startDate)}`,
    event.endDate ? `DTEND:${formatDate(event.endDate)}` : "",
    `SUMMARY:${escapeText(event.title)}`,
    event.location ? `LOCATION:${escapeText(event.location)}` : "",
    event.description ? `DESCRIPTION:${escapeText(event.description)}` : "",
    event.url ? `URL:${event.url}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return lines.join("\r\n");
}
