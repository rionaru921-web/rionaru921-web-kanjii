// ブラウザ専用(qr-code-styling は DOM/canvas に依存する)。
// PDF埋め込み用の lib/share/qr.ts (qrcode パッケージ、server-safeで
// app/api/manual-plans/[id]/pdf/route.tsx から呼ばれる)とはあえて別ファイル
// に分離している — PDF側の56x56という小さい埋め込みサイズではロゴ入りQR
// は視認・スキャン性が悪化するだけなので、対象は画面表示/ダウンロード用の
// 大きいQR(ShareModal/ShareQrModal)のみ。

// components/shared/ChochinIcon.tsx のシルエットをQR中央ロゴ用に単純化した
// もの(グラデーション・罫線を省き、単色塗りのみ — 小さく縮小されるため)。
const CHOCHIN_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 160">
  <rect x="46" y="20" width="28" height="12" rx="3" fill="#9F4642"/>
  <ellipse cx="60" cy="88" rx="48" ry="58" fill="#B85450"/>
  <rect x="46" y="128" width="28" height="12" rx="3" fill="#9F4642"/>
</svg>`;

export async function generateStyledQRDataUrl(url: string, size = 240): Promise<string> {
  const { default: QRCodeStyling } = await import("qr-code-styling");

  const qr = new QRCodeStyling({
    width: size,
    height: size,
    data: url,
    margin: 8,
    qrOptions: { errorCorrectionLevel: "H" },
    image: `data:image/svg+xml;utf8,${encodeURIComponent(CHOCHIN_LOGO_SVG)}`,
    imageOptions: { crossOrigin: "anonymous", margin: 4, imageSize: 0.22 },
    dotsOptions: { color: "#131826", type: "rounded" },
    cornersSquareOptions: { color: "#131826", type: "extra-rounded" },
    cornersDotOptions: { color: "#131826" },
    backgroundOptions: { color: "#F5F1E8" },
  });

  const blob = await qr.getRawData("png");
  if (!blob || !(blob instanceof Blob)) {
    throw new Error("QRコードの生成に失敗しました。");
  }

  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
