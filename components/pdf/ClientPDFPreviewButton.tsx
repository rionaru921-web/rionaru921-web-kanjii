"use client";

import dynamic from "next/dynamic";

// next/dynamic's ssr:false option can only originate from a Client
// Component — Server Components (like app/share/[token]/page.tsx) can't
// call it directly, so this thin wrapper exists purely to hold that call.
// @react-pdf/renderer pulls in browser-only APIs that crash during SSR.
const PDFPreviewButton = dynamic(() => import("./PDFPreviewButton"), {
  ssr: false,
});

export default PDFPreviewButton;
