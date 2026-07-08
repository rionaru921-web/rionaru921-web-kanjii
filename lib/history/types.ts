import type { NomikaiPDFProps } from "@/lib/pdf/templates/NomikaiPDF";
import type { TravelPDFProps } from "@/lib/pdf/templates/TravelPDF";

export type HistoryType = "nomikai" | "travel";

// The payload is (almost) exactly what the PDF templates need, so saving to
// history and regenerating a PDF later share one shape instead of two.
// qrDataUrl is deliberately excluded — it's a derived data: URI regenerated
// from shop.mapUrl at PDF-render time, not something worth persisting.
export interface NomikaiHistoryPayload {
  kind: "nomikai";
  pdf: Omit<NomikaiPDFProps, "qrDataUrl">;
}

export interface TravelHistoryPayload {
  kind: "travel";
  pdf: TravelPDFProps;
}

export type HistoryPayload = NomikaiHistoryPayload | TravelHistoryPayload;

export interface HistoryRecord {
  id: string;
  user_id: string;
  type: HistoryType;
  title: string;
  event_date: string | null;
  payload: HistoryPayload;
  created_at: string;
}
