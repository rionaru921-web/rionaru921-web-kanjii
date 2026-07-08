import { CalendarDays } from "lucide-react";
import type { TravelItineraryDay } from "@/lib/api/types";

export default function ItineraryView({
  itinerary,
}: {
  itinerary: TravelItineraryDay[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {itinerary.map((day) => (
        <div key={day.day} className="flex gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gold/10 text-gold shrink-0">
            <CalendarDays size={14} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gold mb-0.5">
              {day.day}日目
            </p>
            <p className="text-sm text-ink-secondary leading-relaxed">
              {day.summary}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
