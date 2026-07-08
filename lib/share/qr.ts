import QRCode from "qrcode";

export async function generateQRDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 200,
    margin: 1,
    color: { dark: "#131826", light: "#F5F1E8" },
  });
}
