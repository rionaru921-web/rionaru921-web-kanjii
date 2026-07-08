// Runs PDF generation off the main thread. @react-pdf/renderer's font
// parsing/subsetting for full-CJK-glyph Noto fonts is CPU-heavy and was
// freezing the tab for 30-60s when run inline; Web Workers don't share a
// thread with the page, so the UI stays responsive while this runs.
import type { NomikaiPDFProps } from "./templates/NomikaiPDF";
import type { TravelPDFProps } from "./templates/TravelPDF";

type WorkerRequest =
  | { kind: "nomikai"; data: NomikaiPDFProps }
  | { kind: "travel"; data: TravelPDFProps };

type WorkerResponse = { ok: true; buffer: ArrayBuffer } | { ok: false; error: string };

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  try {
    const [{ pdf }, React] = await Promise.all([
      import("@react-pdf/renderer"),
      import("react"),
    ]);

    let element;
    if (event.data.kind === "nomikai") {
      const { NomikaiPDF } = await import("./templates/NomikaiPDF");
      element = React.createElement(NomikaiPDF, event.data.data);
    } else {
      const { TravelPDF } = await import("./templates/TravelPDF");
      element = React.createElement(TravelPDF, event.data.data);
    }

    const blob = await pdf(element).toBlob();
    const buffer = await blob.arrayBuffer();
    const response: WorkerResponse = { ok: true, buffer };
    // @ts-expect-error DedicatedWorkerGlobalScope.postMessage
    self.postMessage(response, [buffer]);
  } catch (err) {
    console.error("[pdf.worker] generation failed:", err);
    const response: WorkerResponse = {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
    self.postMessage(response);
  }
};

export {};
