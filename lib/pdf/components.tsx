import { View, Text, Svg, Path, Rect, Ellipse } from "@react-pdf/renderer";
import { COLORS, pdfStyles } from "./styles";

// Re-exported (not defined here) so client components can format currency
// without pulling @react-pdf/renderer into their bundle — see
// lib/format/currency.ts. Import from there directly in client code.
export { yen } from "@/lib/format/currency";

export interface PDFPaymentInfo {
  bankName?: string;
  bankBranch?: string;
  bankAccountType?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  paypayId?: string;
  linePayId?: string;
  memo?: string;
}

export function hasPaymentInfo(
  payment?: PDFPaymentInfo
): payment is PDFPaymentInfo {
  if (!payment) return false;
  return Boolean(
    payment.bankAccountNumber || payment.paypayId || payment.linePayId || payment.memo
  );
}

export function PaymentInfoCard({ payment }: { payment: PDFPaymentInfo }) {
  return (
    <View style={pdfStyles.card}>
      {payment.bankAccountNumber && (
        <Text style={{ fontSize: 10, marginBottom: 3 }}>
          {[payment.bankName, payment.bankBranch, payment.bankAccountType, payment.bankAccountNumber]
            .filter(Boolean)
            .join(" ")}
        </Text>
      )}
      {payment.bankAccountHolder && (
        <Text style={{ fontSize: 10, marginBottom: 3 }}>{payment.bankAccountHolder}</Text>
      )}
      {payment.paypayId && (
        <Text style={{ fontSize: 10, marginBottom: 3 }}>PayPay: {payment.paypayId}</Text>
      )}
      {payment.linePayId && (
        <Text style={{ fontSize: 10, marginBottom: 3 }}>LINE Pay: {payment.linePayId}</Text>
      )}
      {payment.memo && (
        <Text style={{ fontSize: 9, color: COLORS.inkSecondary }}>{payment.memo}</Text>
      )}
    </View>
  );
}

// components/shared/ChochinIcon.tsx (提灯)を react-pdf の Svg プリミティブで
// 簡略再現したもの。ブラウザSVGコンポーネントはそのまま埋め込めないため。
export function ChochinPdfIcon({ size = 12 }: { size?: number }) {
  return (
    <Svg width={size} height={size * 1.6} viewBox="0 0 24 38">
      <Path d="M12 0 V4" stroke={COLORS.goldDeep} strokeWidth={1} />
      <Rect x="8.5" y="3.5" width="7" height="2.5" rx="0.6" fill={COLORS.goldDeep} />
      <Ellipse cx="12" cy="19" rx="10" ry="12.5" fill={COLORS.vermilion} fillOpacity={0.85} />
      <Ellipse
        cx="12"
        cy="19"
        rx="10"
        ry="12.5"
        stroke={COLORS.goldDeep}
        strokeWidth={0.6}
        fillOpacity={0}
      />
      <Rect x="8.5" y="31.5" width="7" height="2.5" rx="0.6" fill={COLORS.goldDeep} />
      <Path d="M12 34 V37.5" stroke={COLORS.goldDeep} strokeWidth={1} />
    </Svg>
  );
}

export function MizuhikiRule() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 6 }}>
      <View
        style={{
          flex: 1,
          borderBottomWidth: 0.75,
          borderBottomColor: COLORS.gold,
          borderBottomStyle: "solid",
        }}
      />
      <Text style={{ marginHorizontal: 8, color: COLORS.gold, fontSize: 8 }}>◆</Text>
      <View
        style={{
          flex: 1,
          borderBottomWidth: 0.75,
          borderBottomColor: COLORS.gold,
          borderBottomStyle: "solid",
        }}
      />
    </View>
  );
}

