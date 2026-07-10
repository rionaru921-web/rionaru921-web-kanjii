// Dynamic import instead of a static top-level import: this keeps the
// (fairly large) qrcode package out of every bundle that merely imports
// this module, and loads it only when a QR code is actually requested.
export async function generateQRDataUrl(text: string): Promise<string> {
  const { default: QRCode } = await import("qrcode");
  return QRCode.toDataURL(text, {
    width: 200,
    margin: 1,
    color: { dark: "#131826", light: "#F5F1E8" },
  });
}
