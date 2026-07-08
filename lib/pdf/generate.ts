"use client";

import type { NomikaiPDFProps } from "./templates/NomikaiPDF";
import type { TravelPDFProps } from "./templates/TravelPDF";

type WorkerRequest =
  | { kind: "nomikai"; data: NomikaiPDFProps }
  | { kind: "travel"; data: TravelPDFProps };

// Parsing/subsetting the full-CJK-glyph Noto fonts can legitimately take
// 30-90s depending on the device, so this needs real headroom — it's just a
// safety net against a genuinely stuck worker, not a target duration.
const WORKER_TIMEOUT_MS = 120_000;

function generateInWorker(request: WorkerRequest): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./pdf.worker.ts", import.meta.url));

    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error("PDF生成がタイムアウトしました。時間をおいて再度お試しください。"));
    }, WORKER_TIMEOUT_MS);

    worker.onmessage = (event) => {
      clearTimeout(timeout);
      worker.terminate();
      if (event.data?.ok) {
        resolve(new Blob([event.data.buffer], { type: "application/pdf" }));
      } else {
        reject(new Error(event.data?.error ?? "PDFの生成に失敗しました。"));
      }
    };

    worker.onerror = (event) => {
      clearTimeout(timeout);
      worker.terminate();
      console.error("[pdf/generate] worker error:", event);
      reject(new Error(event.message || "PDFの生成に失敗しました。"));
    };

    worker.postMessage(request);
  });
}

export async function generateNomikaiPDF(data: NomikaiPDFProps): Promise<Blob> {
  return generateInWorker({ kind: "nomikai", data });
}

export async function generateTravelPDF(data: TravelPDFProps): Promise<Blob> {
  return generateInWorker({ kind: "travel", data });
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
