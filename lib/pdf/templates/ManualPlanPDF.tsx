import { Document, Page, View, Text, Image, Link } from "@react-pdf/renderer";
import { pdfStyles, COLORS } from "../styles";
import { MizuhikiRule, yen } from "../components";
import {
  STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  ATTENDANCE_LABELS,
  PAYMENT_STATUS_LABELS,
  formatDateRange,
} from "@/lib/manual-plans/format";
import type { ManualPlanStatus, AttendanceStatus, PaymentStatus } from "@/lib/manual-plans/types";

export interface ManualPlanPDFProps {
  title: string;
  status: ManualPlanStatus;
  eventDate: string | null;
  endDate: string | null;
  venueName: string | null;
  venueAddress: string | null;
  venueUrl: string | null;
  feeAmount: number | null;
  paymentMethods: string[];
  paymentDeadline: string | null;
  memo: string | null;
  dietaryNotes: string | null;
  members: Array<{ name: string; attendanceStatus: AttendanceStatus; paymentStatus: PaymentStatus }>;
  shareUrl: string;
  qrDataUrl: string;
}

export function ManualPlanPDF({
  title,
  status,
  eventDate,
  endDate,
  venueName,
  venueAddress,
  venueUrl,
  feeAmount,
  paymentMethods,
  paymentDeadline,
  memo,
  dietaryNotes,
  members,
  shareUrl,
  qrDataUrl,
}: ManualPlanPDFProps) {
  const dateLabel = formatDateRange(eventDate, endDate);

  return (
    <Document title={`Kanjii_${title}`}>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.headerRow}>
          <Text style={pdfStyles.brand}>Kanjii</Text>
          <Text style={pdfStyles.headerDate}>{STATUS_LABELS[status]}</Text>
        </View>

        <MizuhikiRule />
        <View style={pdfStyles.titleBlock}>
          <Text style={pdfStyles.title}>{title}</Text>
          <Text style={pdfStyles.subtitle}>{dateLabel}</Text>
        </View>
        <MizuhikiRule />

        {(venueName || venueAddress) && (
          <>
            <Text style={pdfStyles.sectionLabel}>【場所】</Text>
            <View style={pdfStyles.card}>
              {venueName && (
                <Text
                  style={{ fontFamily: "Noto Serif JP", fontWeight: 700, fontSize: 12, marginBottom: 4 }}
                >
                  {venueName}
                </Text>
              )}
              {venueAddress && (
                <Text style={{ fontSize: 9, color: COLORS.inkSecondary, marginBottom: 2 }}>
                  {venueAddress}
                </Text>
              )}
              {venueUrl && (
                <Link src={venueUrl} style={{ fontSize: 9, color: COLORS.gold }}>
                  {venueUrl}
                </Link>
              )}
            </View>
          </>
        )}

        {(feeAmount != null || paymentMethods.length > 0) && (
          <>
            <Text style={pdfStyles.sectionLabel}>【予算・集金】</Text>
            <View style={pdfStyles.card}>
              {feeAmount != null && (
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: "Noto Serif JP",
                    fontWeight: 700,
                    color: COLORS.goldDeep,
                    marginBottom: 4,
                  }}
                >
                  会費: {yen(feeAmount)}
                </Text>
              )}
              {paymentMethods.length > 0 && (
                <Text style={{ fontSize: 9, color: COLORS.inkSecondary, marginBottom: 2 }}>
                  支払い方法: {paymentMethods.map((m) => PAYMENT_METHOD_LABELS[m] ?? m).join(" / ")}
                </Text>
              )}
              {paymentDeadline && (
                <Text style={{ fontSize: 9, color: COLORS.inkSecondary }}>
                  支払い期限: {formatDateRange(paymentDeadline, null)}
                </Text>
              )}
            </View>
          </>
        )}

        {members.length > 0 && (
          <>
            <Text style={pdfStyles.sectionLabel}>【メンバー】</Text>
            <View style={pdfStyles.card}>
              {members.map((m, i) => (
                <View key={`${m.name}-${i}`} style={pdfStyles.tableRow}>
                  <Text style={{ fontSize: 10 }}>{m.name}</Text>
                  <Text style={{ fontSize: 9, color: COLORS.inkSecondary }}>
                    {ATTENDANCE_LABELS[m.attendanceStatus]} / {PAYMENT_STATUS_LABELS[m.paymentStatus]}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {(memo || dietaryNotes) && (
          <>
            <Text style={pdfStyles.sectionLabel}>【メモ】</Text>
            <View style={pdfStyles.card}>
              {memo && <Text style={{ fontSize: 9, marginBottom: dietaryNotes ? 6 : 0 }}>{memo}</Text>}
              {dietaryNotes && (
                <Text style={{ fontSize: 9, color: COLORS.inkSecondary }}>
                  アレルギー・苦手なもの: {dietaryNotes}
                </Text>
              )}
            </View>
          </>
        )}

        <Text style={pdfStyles.sectionLabel}>【共有】</Text>
        <View
          style={[
            pdfStyles.card,
            { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
          ]}
        >
          <Text style={{ fontSize: 8, color: COLORS.inkSecondary, flex: 1, paddingRight: 12 }}>
            {shareUrl}
          </Text>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={qrDataUrl} style={{ width: 56, height: 56 }} />
        </View>

        <View style={pdfStyles.footer} fixed>
          <Text style={pdfStyles.footerText}>Powered by Kanjii</Text>
          <Text style={pdfStyles.footerText}>https://kanjii.app</Text>
        </View>
      </Page>
    </Document>
  );
}
