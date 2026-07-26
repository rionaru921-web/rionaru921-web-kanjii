import type { DateOption } from "./types";

export function formatDateOptionLabel(opt: DateOption): string {
  const date = new Date(`${opt.date}T00:00:00`);
  const label = `${date.getMonth() + 1}/${date.getDate()}`;
  return opt.time_slot ? `${label} ${opt.time_slot}` : label;
}
