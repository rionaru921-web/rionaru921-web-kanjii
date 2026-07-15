export type CalendarMode = "single" | "range" | "multiple" | "display";

export type CalendarRange = { start: Date; end: Date };

export type CalendarValue = Date | Date[] | CalendarRange | null;

export interface HighlightedDate {
  date: Date;
  color?: string;
  badge?: string;
}

export type CalendarSize = "sm" | "md" | "lg";
