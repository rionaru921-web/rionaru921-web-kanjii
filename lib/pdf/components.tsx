import { View, Text } from "@react-pdf/renderer";
import { COLORS, pdfStyles } from "./styles";

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

export function yen(n: number): string {
  return `¥${n.toLocaleString()}`;
}
